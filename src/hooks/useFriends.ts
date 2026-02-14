import {useEffect, useState, useCallback} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {supabase} from '../lib/supabase';
import {
  FriendWithStatus,
  IncomingKnockRequest,
  KnockRequestNotification,
  BlockedUser,
  AvatarData,
} from '../shared/types';

export function useFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<FriendWithStatus[]>([]);
  const [knockRequests, setKnockRequests] = useState<IncomingKnockRequest[]>(
    [],
  );
  const [knockNotifications, setKnockNotifications] = useState<
    KnockRequestNotification[]
  >([]);
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFriends = useCallback(async () => {
    if (!userId) return;

    // 차단 목록 조회 (프로필 정보 포함)
    const {data: blockRows} = await supabase
      .from('blocks')
      .select('blocked_user_id')
      .eq('user_id', userId);
    const blockedUserIds = (blockRows || []).map(
      (b: {blocked_user_id: string}) => b.blocked_user_id,
    );
    const blocked = new Set<string>(blockedUserIds);
    setBlockedIds(blocked);

    if (blockedUserIds.length > 0) {
      const {data: blockedProfiles} = await supabase
        .from('profiles')
        .select('id, nickname, avatar_data')
        .in('id', blockedUserIds);
      setBlockedUsers(
        (blockedProfiles || []).map((p: {id: string; nickname: string; avatar_data: AvatarData | null}) => ({
          id: p.id,
          nickname: p.nickname,
          avatar_data: p.avatar_data as AvatarData | null,
        })),
      );
    } else {
      setBlockedUsers([]);
    }

    const {data: friendRows} = await supabase
      .from('friends')
      .select('friend_id')
      .eq('user_id', userId);

    if (!friendRows || friendRows.length === 0) {
      setFriends([]);
      setKnockRequests([]);
      setLoading(false);
      return;
    }

    const friendIds = friendRows
      .map((f: {friend_id: string}) => f.friend_id)
      .filter((id: string) => !blocked.has(id));

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      profilesRes,
      checkinsRes,
      knocksReceivedRes,
      knocksSentRes,
      knockReqReceivedRes,
      knockReqSentRes,
      knockReqNotificationsRes,
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, nickname, avatar_data, allow_knocks')
        .in('id', friendIds),
      supabase
        .from('checkins')
        .select('user_id, checked_at')
        .in('user_id', friendIds)
        .order('checked_at', {ascending: false}),
      supabase
        .from('knocks')
        .select('from_user_id, emoji, seen, created_at')
        .eq('to_user_id', userId)
        .in('from_user_id', friendIds)
        .order('created_at', {ascending: false}),
      supabase
        .from('knocks')
        .select('to_user_id, emoji, created_at')
        .eq('from_user_id', userId)
        .in('to_user_id', friendIds)
        .gte('created_at', todayStart.toISOString())
        .order('created_at', {ascending: false}),
      supabase
        .from('knock_requests')
        .select('from_user_id, created_at')
        .eq('to_user_id', userId)
        .eq('status', 'pending')
        .order('created_at', {ascending: false}),
      supabase
        .from('knock_requests')
        .select('to_user_id, created_at')
        .eq('from_user_id', userId)
        .eq('status', 'pending'),
      supabase
        .from('knock_requests')
        .select('to_user_id, status, created_at')
        .eq('from_user_id', userId)
        .in('status', ['dismissed', 'accepted'])
        .eq('sender_seen', false)
        .order('created_at', {ascending: false}),
    ]);

    const profiles = profilesRes.data || [];
    const allCheckins = checkinsRes.data || [];
    const knocksReceived = knocksReceivedRes.data || [];
    const knocksSent = knocksSentRes.data || [];
    const knockReqReceived = knockReqReceivedRes.data || [];
    const knockReqSent = knockReqSentRes.data || [];
    const knockReqNotifs = knockReqNotificationsRes.data || [];

    // 체크인: 친구별 가장 최근 것만
    const lastCheckinMap = new Map<string, string>();
    for (const c of allCheckins) {
      if (!lastCheckinMap.has(c.user_id)) {
        lastCheckinMap.set(c.user_id, c.checked_at);
      }
    }

    // 받은 노크 집계
    const unseenKnocksMap = new Map<string, number>();
    const totalKnocksMap = new Map<string, number>();
    const lastKnockEmojiMap = new Map<string, string>();
    const lastKnockAtMap = new Map<string, string>();
    const unseenKnockListMap = new Map<string, {emoji: string | null; created_at: string}[]>();
    for (const k of knocksReceived) {
      totalKnocksMap.set(
        k.from_user_id,
        (totalKnocksMap.get(k.from_user_id) || 0) + 1,
      );
      if (!k.seen) {
        unseenKnocksMap.set(
          k.from_user_id,
          (unseenKnocksMap.get(k.from_user_id) || 0) + 1,
        );
        if (!lastKnockEmojiMap.has(k.from_user_id) && k.emoji) {
          lastKnockEmojiMap.set(k.from_user_id, k.emoji);
        }
        if (!lastKnockAtMap.has(k.from_user_id)) {
          lastKnockAtMap.set(k.from_user_id, k.created_at);
        }
        const list = unseenKnockListMap.get(k.from_user_id) || [];
        list.push({emoji: k.emoji ?? null, created_at: k.created_at});
        unseenKnockListMap.set(k.from_user_id, list);
      }
    }

    // 보낸 노크: 오늘 마지막 이모지 + 시간
    const myKnockEmojiMap = new Map<string, string>();
    const myKnockAtMap = new Map<string, string>();
    for (const k of knocksSent) {
      if (!myKnockEmojiMap.has(k.to_user_id) && k.emoji) {
        myKnockEmojiMap.set(k.to_user_id, k.emoji);
      }
      if (!myKnockAtMap.has(k.to_user_id)) {
        myKnockAtMap.set(k.to_user_id, k.created_at);
      }
    }

    // 보낸 요청: pending 여부
    const sentKnockReqSet = new Set<string>();
    for (const r of knockReqSent) {
      sentKnockReqSet.add(r.to_user_id);
    }

    // 조합
    const friendsWithStatus: FriendWithStatus[] = profiles.map(
      (profile: {
        id: string;
        nickname: string;
        avatar_data: unknown;
        allow_knocks?: boolean;
      }) => ({
        friend_id: profile.id,
        nickname: profile.nickname,
        last_checkin: lastCheckinMap.get(profile.id) ?? null,
        unseen_knocks: unseenKnocksMap.get(profile.id) ?? 0,
        unseen_knock_list: unseenKnockListMap.get(profile.id) ?? [],
        total_knocks: totalKnocksMap.get(profile.id) ?? 0,
        last_knock_emoji: lastKnockEmojiMap.get(profile.id) ?? null,
        last_knock_at: lastKnockAtMap.get(profile.id) ?? null,
        my_last_knock_emoji: myKnockEmojiMap.get(profile.id) ?? null,
        my_last_knock_at: myKnockAtMap.get(profile.id) ?? null,
        avatar_data: (profile.avatar_data as FriendWithStatus['avatar_data']) ?? null,
        allow_knocks: profile.allow_knocks !== false,
        has_knock_request_sent: sentKnockReqSet.has(profile.id),
      }),
    );

    friendsWithStatus.sort((a, b) => {
      if (!a.last_checkin) return 1;
      if (!b.last_checkin) return -1;
      return (
        new Date(b.last_checkin).getTime() -
        new Date(a.last_checkin).getTime()
      );
    });

    // 받은 노크 요청
    const profileMap = new Map(
      profiles.map(
        (p: {id: string; nickname: string; avatar_data: unknown}) => [
          p.id,
          p,
        ],
      ),
    );
    const incomingReqSeen = new Set<string>();
    const incomingRequests: IncomingKnockRequest[] = knockReqReceived
      .filter((r: {from_user_id: string}) => {
        if (incomingReqSeen.has(r.from_user_id)) return false;
        incomingReqSeen.add(r.from_user_id);
        return true;
      })
      .map((r: {from_user_id: string; created_at: string}) => {
        const p = profileMap.get(r.from_user_id) as
          | {id: string; nickname: string; avatar_data: unknown}
          | undefined;
        if (!p) return null;
        return {
          from_user_id: r.from_user_id,
          nickname: p.nickname,
          avatar_data: p.avatar_data ?? null,
          created_at: r.created_at,
        };
      })
      .filter(Boolean) as IncomingKnockRequest[];

    // 알림
    const notiSeen = new Set<string>();
    const notifications: KnockRequestNotification[] = knockReqNotifs
      .filter((r: {to_user_id: string}) => {
        if (notiSeen.has(r.to_user_id)) return false;
        notiSeen.add(r.to_user_id);
        return true;
      })
      .map((r: {to_user_id: string; status: string; created_at: string}) => {
        const p = profileMap.get(r.to_user_id) as
          | {id: string; nickname: string; avatar_data: unknown}
          | undefined;
        if (!p) return null;
        return {
          to_user_id: r.to_user_id,
          nickname: p.nickname,
          avatar_data: p.avatar_data ?? null,
          status: r.status as 'accepted' | 'dismissed',
          created_at: r.created_at,
        };
      })
      .filter(Boolean) as KnockRequestNotification[];

    setFriends(friendsWithStatus);
    setKnockRequests(incomingRequests);
    setKnockNotifications(notifications);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    loadFriends();
  }, [loadFriends]);

  // AppState로 포그라운드 복귀 시 새로고침 (웹의 visibilitychange 대체)
  useEffect(() => {
    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        loadFriends();
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [loadFriends]);

  const sendKnock = async (
    toUserId: string,
    emoji?: string,
    isAdmin?: boolean,
  ): Promise<{error: string | null}> => {
    if (!userId) return {error: null};

    const friend = friends.find(f => f.friend_id === toUserId);
    if (friend && !friend.allow_knocks) {
      return {error: '이 이웃은 지금 인사를 받지 않고 있어'};
    }

    if (!isAdmin) {
      const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

      const {count} = await supabase
        .from('knocks')
        .select('*', {count: 'exact', head: true})
        .eq('from_user_id', userId)
        .eq('to_user_id', toUserId)
        .gte('created_at', fourHoursAgo.toISOString());

      if (count && count > 0) {
        return {error: '아직은 다시 인사할 수 없어. 4시간마다 한 번!'};
      }
    }

    await supabase.from('knocks').insert({
      from_user_id: userId,
      to_user_id: toUserId,
      emoji: emoji || null,
    });
    await loadFriends();
    return {error: null};
  };

  const markKnocksSeen = async (fromUserId: string) => {
    if (!userId) return;
    await supabase
      .from('knocks')
      .update({seen: true})
      .eq('from_user_id', fromUserId)
      .eq('to_user_id', userId)
      .eq('seen', false);
    await loadFriends();
  };

  const sendKnockRequest = async (
    toUserId: string,
  ): Promise<{error: string | null}> => {
    if (!userId) return {error: null};

    const {count} = await supabase
      .from('knock_requests')
      .select('*', {count: 'exact', head: true})
      .eq('from_user_id', userId)
      .eq('to_user_id', toUserId)
      .eq('status', 'pending');

    if (count && count > 0) {
      return {error: '이미 요청을 보냈어'};
    }

    await supabase.from('knock_requests').insert({
      from_user_id: userId,
      to_user_id: toUserId,
    });
    await loadFriends();
    return {error: null};
  };

  const acceptKnockRequest = async (fromUserId: string) => {
    if (!userId) return;
    await supabase
      .from('knock_requests')
      .update({seen: true, status: 'accepted', sender_seen: false})
      .eq('from_user_id', fromUserId)
      .eq('to_user_id', userId)
      .eq('status', 'pending');
    await supabase
      .from('profiles')
      .update({allow_knocks: true})
      .eq('id', userId);
    await loadFriends();
  };

  const dismissKnockRequest = async (fromUserId: string) => {
    if (!userId) return;
    await supabase
      .from('knock_requests')
      .update({seen: true, status: 'dismissed', sender_seen: false})
      .eq('from_user_id', fromUserId)
      .eq('to_user_id', userId)
      .eq('status', 'pending');
    await loadFriends();
  };

  const markNotificationSeen = async (
    toUserId: string,
    status: 'accepted' | 'dismissed',
  ) => {
    if (!userId) return;
    await supabase
      .from('knock_requests')
      .update({sender_seen: true})
      .eq('from_user_id', userId)
      .eq('to_user_id', toUserId)
      .eq('status', status)
      .eq('sender_seen', false);
    await loadFriends();
  };

  const removeFriend = async (
    friendId: string,
  ): Promise<{error: string | null}> => {
    if (!userId) return {error: null};

    // 내 쪽만 삭제 (카톡/인스타 방식 — 상대 목록에는 남아있음)
    const {error: err1} = await supabase
      .from('friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId);

    if (err1) return {error: '연동 끊기에 실패했어'};

    await loadFriends();
    return {error: null};
  };

  const addFriend = async (inviteCode: string) => {
    if (!userId) return {error: '로그인이 필요합니다'};

    const {data: friendProfile} = await supabase
      .from('profiles')
      .select('id')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (!friendProfile) return {error: '존재하지 않는 초대 코드입니다'};
    if (friendProfile.id === userId) return {error: '자신은 추가할 수 없습니다'};
    if (blockedIds.has(friendProfile.id)) return {error: '추가할 수 없는 유저입니다'};

    const {data: existing} = await supabase
      .from('friends')
      .select('id')
      .eq('user_id', userId)
      .eq('friend_id', friendProfile.id)
      .limit(1);

    if (existing && existing.length > 0)
      return {error: '이미 연결된 친구입니다'};

    // 개별 insert — 역방향이 이미 존재할 수 있으므로 batch 실패 방지
    const {error: insertErr} = await supabase
      .from('friends')
      .insert({user_id: userId, friend_id: friendProfile.id});

    if (insertErr) return {error: '친구 추가에 실패했어'};

    // 역방향 (이미 존재하면 무시)
    await supabase
      .from('friends')
      .insert({user_id: friendProfile.id, friend_id: userId});

    await loadFriends();
    return {error: null};
  };

  const blockUser = async (
    blockedUserId: string,
  ): Promise<{error: string | null}> => {
    if (!userId) return {error: null};
    // RPC로 차단 + 양방향 친구 삭제 (SECURITY DEFINER로 RLS 우회)
    const {error} = await supabase.rpc('block_user', {
      blocked_id: blockedUserId,
    });
    if (error) return {error: '차단에 실패했어'};
    await loadFriends();
    return {error: null};
  };

  const unblockUser = async (blockedUserId: string) => {
    if (!userId) return;
    await supabase
      .from('blocks')
      .delete()
      .eq('user_id', userId)
      .eq('blocked_user_id', blockedUserId);
    await loadFriends();
  };

  const reportUser = async (
    reportedUserId: string,
    reason: string,
  ): Promise<{error: string | null}> => {
    if (!userId) return {error: null};
    const {error} = await supabase.from('reports').insert({
      reporter_id: userId,
      reported_user_id: reportedUserId,
      reason,
    });
    if (error) return {error: '신고 접수에 실패했어'};
    return {error: null};
  };

  return {
    friends,
    knockRequests,
    knockNotifications,
    blockedIds,
    blockedUsers,
    loading,
    sendKnock,
    markKnocksSeen,
    sendKnockRequest,
    acceptKnockRequest,
    dismissKnockRequest,
    markNotificationSeen,
    addFriend,
    removeFriend,
    blockUser,
    unblockUser,
    reportUser,
    reload: loadFriends,
  };
}
