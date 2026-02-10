import {useEffect, useRef, useCallback, useState} from 'react';
import {supabase} from '../../lib/supabase';
import {WORLD_WIDTH, WORLD_HEIGHT} from './villageConstants';

export interface LivePosition {
  x: number;
  y: number;
}

export interface ChatMessage {
  uid: string;
  nickname: string;
  message: string;
  id: number;
  isWhisper?: boolean;
}

interface UseVillageRealtimeOptions {
  userId: string | undefined;
  enabled: boolean;
}

let chatIdCounter = 0;

/**
 * Supabase Realtime 기반 마을 멀티플레이 훅
 * - Presence: 접속 상태 + 입장 감지
 * - Broadcast: 위치 동기화 + 실시간 채팅
 */
export function useVillageRealtime({
  userId,
  enabled,
}: UseVillageRealtimeOptions) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [livePositions, setLivePositions] = useState<
    Map<string, LivePosition>
  >(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [joinedUserId, setJoinedUserId] = useState<string | null>(null);
  const [leftUserId, setLeftUserId] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastBroadcastRef = useRef<number>(0);
  const hasInitialSync = useRef(false);

  useEffect(() => {
    if (!enabled || !userId) return;

    hasInitialSync.current = false;

    const channel = supabase.channel('village', {
      config: {presence: {key: userId}},
    });

    channel
      .on('presence', {event: 'sync'}, () => {
        const state = channel.presenceState();
        const online = new Set<string>();
        for (const key of Object.keys(state)) {
          if (key !== userId) {
            online.add(key);
          }
        }
        setOnlineUsers(online);
        hasInitialSync.current = true;
      })
      .on('presence', {event: 'join'}, ({key}) => {
        if (!hasInitialSync.current) return;
        if (key !== userId) {
          setJoinedUserId(key);
          setTimeout(() => setJoinedUserId(null), 3000);
        }
      })
      .on('presence', {event: 'leave'}, ({key}) => {
        if (!hasInitialSync.current) return;
        if (key !== userId) {
          setLeftUserId(key);
          setTimeout(() => setLeftUserId(null), 3000);
        }
      })
      .on('broadcast', {event: 'move'}, ({payload}) => {
        if (!payload || payload.uid === userId) return;
        setLivePositions(prev => {
          const next = new Map(prev);
          next.set(payload.uid, {
            x: payload.nx * WORLD_WIDTH,
            y: payload.ny * WORLD_HEIGHT,
          });
          return next;
        });
      })
      .on('broadcast', {event: 'chat'}, ({payload}) => {
        if (!payload || payload.uid === userId) return;
        // 귓속말: to가 있으면 내게 온 것만 수신
        if (payload.to && payload.to !== userId) return;
        const msg: ChatMessage = {
          uid: payload.uid,
          nickname: payload.nickname,
          message: payload.message,
          id: ++chatIdCounter,
          isWhisper: !!payload.to,
        };
        setChatMessages(prev => [...prev, msg]);
        setTimeout(() => {
          setChatMessages(prev => prev.filter(m => m.id !== msg.id));
        }, 5000);
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await channel.track({online: true});
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [userId, enabled]);

  const broadcastPosition = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      if (now - lastBroadcastRef.current < 100) return;
      lastBroadcastRef.current = now;

      channelRef.current?.send({
        type: 'broadcast',
        event: 'move',
        payload: {
          uid: userId,
          nx: x / WORLD_WIDTH,
          ny: y / WORLD_HEIGHT,
        },
      });
    },
    [userId],
  );

  const sendChat = useCallback(
    (message: string, nickname: string, to?: string) => {
      if (!message.trim()) return;

      channelRef.current?.send({
        type: 'broadcast',
        event: 'chat',
        payload: {uid: userId, nickname, message: message.trim(), ...(to ? {to} : {})},
      });

      const msg: ChatMessage = {
        uid: userId!,
        nickname,
        message: message.trim(),
        id: ++chatIdCounter,
        isWhisper: !!to,
      };
      setChatMessages(prev => [...prev, msg]);
      setTimeout(() => {
        setChatMessages(prev => prev.filter(m => m.id !== msg.id));
      }, 5000);
    },
    [userId],
  );

  return {
    onlineUsers,
    livePositions,
    chatMessages,
    joinedUserId,
    leftUserId,
    broadcastPosition,
    sendChat,
  };
}
