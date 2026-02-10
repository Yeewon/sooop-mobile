import {useEffect, useRef, useCallback, useState} from 'react';
import {supabase} from '../../lib/supabase';
import {WORLD_WIDTH, WORLD_HEIGHT} from './villageConstants';

export interface LivePosition {
  x: number;
  y: number;
}

interface UseVillageRealtimeOptions {
  userId: string | undefined;
  enabled: boolean;
}

/**
 * Supabase Realtime 기반 마을 멀티플레이 훅
 * - Presence: 접속 상태 (누가 마을에 있는지)
 * - Broadcast: 위치 동기화 (D-pad 이동 시 좌표 전송)
 * 좌표는 0~1 정규화해서 전송 (기기별 화면 크기 차이 대응)
 */
export function useVillageRealtime({
  userId,
  enabled,
}: UseVillageRealtimeOptions) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [livePositions, setLivePositions] = useState<
    Map<string, LivePosition>
  >(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastBroadcastRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !userId) return;

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
      if (now - lastBroadcastRef.current < 100) return; // 100ms 쓰로틀
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

  return {onlineUsers, livePositions, broadcastPosition};
}
