import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  ScrollView,
  Pressable,
  Modal,
  Linking,
  AppState,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { useColors } from '../contexts/ThemeContext';
import type { ColorScheme } from '../theme/colors';
import { Fonts, FontSizes, Spacing } from '../theme';
import { useAuthContext } from '../contexts/AuthContext';
import { useCheckin } from '../hooks/useCheckin';
import { useFriends } from '../hooks/useFriends';
import { useNotifications } from '../hooks/useNotifications';
import { useDeepLink } from '../hooks/useDeepLink';
import {
  KNOCK_ICONS,
  DAILY_MESSAGES,
  VILLAGE_CHARACTERS,
  getDailyIndex,
} from '../shared/constants';
import { supabase } from '../lib/supabase';
import { FriendWithStatus } from '../shared/types';
import PixelAvatar from '../components/PixelAvatar';
import TypewriterText from '../components/TypewriterText';
import NintendoCard from '../components/NintendoCard';
import NintendoButton from '../components/NintendoButton';
import HeartbeatCard from '../components/HeartbeatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import AnimatedEntrance from '../components/AnimatedEntrance';
import InviteModal from '../modals/InviteModal';
import AvatarBuilderModal from '../modals/AvatarBuilderModal';
import PhotoFrameModal from '../modals/PhotoFrameModal';
import NicknameEditModal from '../modals/NicknameEditModal';
import PrivacyInfoModal from '../modals/PrivacyInfoModal';
import VillageView from '../components/village/VillageView';

export default function DashboardScreen() {
  const colors = useColors();
  const styles = useStyles(colors);
  const {
    user,
    profile,
    signOut,
    updateAllowKnocks,
    updateReminderHour,
    updateNickname,
    updateAvatar,
  } = useAuthContext();
  // 자동 체크인 + 푸시 알림
  useCheckin(user?.id);
  useNotifications(user?.id);

  // 딥링크로 초대 코드 받으면 자동 친구 추가
  useDeepLink(async (code: string) => {
    const { error } = await addFriend(code);
    if (error) {
      setKnockError(error);
    } else {
      setKnockToast('새 이웃이 생겼어!');
    }
  });

  const {
    friends,
    knockRequests,
    knockNotifications,
    loading: friendsLoading,
    sendKnock,
    markKnocksSeen,
    sendKnockRequest,
    acceptKnockRequest,
    dismissKnockRequest,
    markNotificationSeen,
    addFriend,
    removeFriend,
    reload,
  } = useFriends(user?.id);

  const [viewMode, setViewMode] = useState<'list' | 'village'>('list');
  const [refreshing, setRefreshing] = useState(false);
  const [msgIndex, setMsgIndex] = useState(() =>
    getDailyIndex(DAILY_MESSAGES.length),
  );
  const [charIndex, setCharIndex] = useState(() =>
    getDailyIndex(VILLAGE_CHARACTERS.length),
  );
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setMsgIndex(Math.floor(Math.random() * DAILY_MESSAGES.length));
    setCharIndex(Math.floor(Math.random() * VILLAGE_CHARACTERS.length));
    await reload();
    setRefreshing(false);
  }, [reload]);

  // 모달/토스트 상태
  const [knockError, setKnockError] = useState<string | null>(null);
  const [knockToast, setKnockToast] = useState<string | null>(null);
  const [showKnockPicker, setShowKnockPicker] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [acceptConfirm, setAcceptConfirm] = useState<string | null>(null);
  const [knockReqConfirm, setKnockReqConfirm] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const [showNicknameEdit, setShowNicknameEdit] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [photoFriend, setPhotoFriend] = useState<FriendWithStatus | null>(null);
  const [unfriendConfirm, setUnfriendConfirm] = useState<string | null>(null);
  const [tempReminderHour, setTempReminderHour] = useState<number | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showKnockToggleConfirm, setShowKnockToggleConfirm] = useState(false);
  const [menuFriend, setMenuFriend] = useState<FriendWithStatus | null>(null);
  const [knockHistoryFriend, setKnockHistoryFriend] =
    useState<FriendWithStatus | null>(null);
  const [knockHistory, setKnockHistory] = useState<
    { emoji: string | null; from_me: boolean; created_at: string }[]
  >([]);
  const knockHistoryScrollRef = useRef<ScrollView>(null);

  const dailyMessage = DAILY_MESSAGES[msgIndex];
  const isAdmin = profile?.role === 'admin';

  // 푸시 알림 권한 상태
  const [pushEnabled, setPushEnabled] = useState(false);
  const checkPushPermission = useCallback(async () => {
    const status = await messaging().hasPermission();
    setPushEnabled(
      status === messaging.AuthorizationStatus.AUTHORIZED ||
        status === messaging.AuthorizationStatus.PROVISIONAL,
    );
  }, []);

  useEffect(() => {
    checkPushPermission();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        checkPushPermission();
      }
    });
    return () => sub.remove();
  }, [checkPushPermission]);

  const handleTogglePush = async () => {
    if (pushEnabled) {
      // 이미 켜져 있으면 → 시스템 설정으로 안내 (iOS에서 앱 내 비활성화 불가)
      Linking.openSettings();
    } else {
      const status = await messaging().hasPermission();
      if (status === messaging.AuthorizationStatus.NOT_DETERMINED) {
        const result = await messaging().requestPermission();
        const granted =
          result === messaging.AuthorizationStatus.AUTHORIZED ||
          result === messaging.AuthorizationStatus.PROVISIONAL;
        setPushEnabled(granted);
      } else {
        // DENIED → 시스템 설정으로 안내
        Linking.openSettings();
      }
    }
  };

  const handleToggleAllowKnocks = () => {
    if (!profile) return;
    setShowKnockToggleConfirm(true);
  };

  const loadKnockHistory = async (friendId: string) => {
    if (!user) return;
    const [sentRes, receivedRes] = await Promise.all([
      supabase
        .from('knocks')
        .select('emoji, created_at')
        .eq('from_user_id', user.id)
        .eq('to_user_id', friendId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('knocks')
        .select('emoji, created_at')
        .eq('from_user_id', friendId)
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50),
    ]);
    const sent = (sentRes.data || []).map(k => ({
      emoji: k.emoji,
      from_me: true,
      created_at: k.created_at,
    }));
    const received = (receivedRes.data || []).map(k => ({
      emoji: k.emoji,
      from_me: false,
      created_at: k.created_at,
    }));
    const all = [...sent, ...received].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    setKnockHistory(all);
  };

  const handleKnock = async (friendId: string, emoji?: string) => {
    if (!emoji) {
      const friend = friends.find(f => f.friend_id === friendId);
      if (!isAdmin && friend?.my_last_knock_emoji) {
        setKnockToast('하루에 한 번만 보낼 수 있어!');
        return;
      }
      setShowKnockPicker(friendId);
      return;
    }
    setShowKnockPicker(null);
    const { error } = await sendKnock(friendId, emoji, isAdmin);
    if (error) {
      setKnockError(error);
      return;
    }
    // knock animation could go here
  };

  const handleKnockRequest = (friendId: string) => {
    const friend = friends.find(f => f.friend_id === friendId);
    if (friend?.has_knock_request_sent) {
      setKnockToast('이미 인사 요청을 보냈어!');
      return;
    }
    setKnockReqConfirm(friendId);
  };

  const confirmKnockRequest = async () => {
    if (!knockReqConfirm) return;
    const friendId = knockReqConfirm;
    setKnockReqConfirm(null);
    const { error } = await sendKnockRequest(friendId);
    if (error) {
      setKnockError(error);
    } else {
      setKnockToast('인사 요청을 보냈어!');
    }
  };

  const unseenFriends = friends.filter(f => f.unseen_knocks > 0);

  const renderFriendItem = ({
    item,
    index,
  }: {
    item: FriendWithStatus;
    index: number;
  }) => (
    <AnimatedEntrance delay={index * 80} style={styles.friendItem}>
      <HeartbeatCard
        friend={item}
        onKnock={(emoji: string) => handleKnock(item.friend_id, emoji)}
        onPress={() => setMenuFriend(item)}
        onKnockRequest={() => handleKnockRequest(item.friend_id)}
        onLongPress={() => setUnfriendConfirm(item.friend_id)}
      />
    </AnimatedEntrance>
  );

  const listHeader = (
    <>
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable onPress={() => setShowAvatarBuilder(true)}>
            {({ pressed }) => (
              <NintendoCard
                style={{
                  ...styles.avatarBox,
                  ...(pressed
                    ? {
                        transform: [{ translateY: 4 }],
                        shadowOffset: { width: 0, height: 0 },
                      }
                    : {}),
                }}
              >
                <PixelAvatar
                  avatarData={profile?.avatar_data ?? null}
                  size={40}
                />
              </NintendoCard>
            )}
          </Pressable>
          <Pressable
            onPress={() => setShowNicknameEdit(true)}
            style={({ pressed }) => pressed && { opacity: 0.6 }}
          >
            <Text style={styles.greeting}>
              어서 와, {profile?.nickname || '주민'}
            </Text>
            <Text style={styles.greetingSub}>이름이나 캐릭터를 눌러봐</Text>
          </Pressable>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => setShowInvite(true)}
            style={({ pressed }) => [
              styles.headerBtn,
              pressed && styles.headerBtnPressed,
            ]}
          >
            <Image
              source={require('../assets/icons/flag.png')}
              style={styles.headerBtnIcon}
            />
          </Pressable>
          <Pressable
            onPress={() => setShowSettings(true)}
            style={({ pressed }) => [
              styles.headerBtn,
              pressed && styles.headerBtnPressed,
            ]}
          >
            <Image
              source={require('../assets/icons/alarm.png')}
              style={styles.headerBtnIcon}
            />
          </Pressable>
          <Pressable
            onPress={() => setShowPrivacy(true)}
            style={({ pressed }) => [
              styles.headerBtn,
              pressed && styles.headerBtnPressed,
            ]}
          >
            <Image
              source={require('../assets/icons/computer.png')}
              style={styles.headerBtnIcon}
            />
          </Pressable>
        </View>
      </View>

      {/* 마을 방송 카드 */}

      <View style={styles.broadcastRow}>
        <NintendoCard
          style={{
            ...styles.checkinCard,
            backgroundColor: colors.cardBg,
            shadowOpacity: 0,
            elevation: 0,
            flex: 1,
            marginBottom: 0,
          }}
        >
          <TypewriterText
            text={`${dailyMessage}...`}
            style={styles.checkinText}
          />
        </NintendoCard>
        <PixelAvatar avatarData={profile?.avatar_data ?? null} size={48} />
      </View>

      {/* 받은 인사 요청 */}
      {knockRequests.length > 0 && (
        <NintendoCard style={styles.knockReqCard}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../assets/icons/mail.png')}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitleAccent}>인사 요청이 왔어!</Text>
          </View>
          {knockRequests.map(req => (
            <View key={req.from_user_id} style={styles.reqRow}>
              <PixelAvatar avatarData={req.avatar_data} size={28} />
              <Text style={styles.reqNickname} numberOfLines={1}>
                {req.nickname}
              </Text>
              <NintendoButton
                title="괜찮아"
                variant="muted"
                small
                onPress={() => dismissKnockRequest(req.from_user_id)}
              />
              <NintendoButton
                title="수락"
                variant="accent"
                small
                onPress={() => setAcceptConfirm(req.from_user_id)}
              />
            </View>
          ))}
        </NintendoCard>
      )}

      {/* 받은 인사 */}
      {unseenFriends.length > 0 && (
        <View style={styles.knockSection}>
          <View style={styles.sectionHeader}>
            <Image
              source={require('../assets/icons/thumb.png')}
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitleAccent}>인사가 왔어!</Text>
          </View>
          {unseenFriends.map(f => {
            const knockIcon = f.last_knock_emoji
              ? KNOCK_ICONS.find(k => k.id === f.last_knock_emoji)
              : null;
            return (
              <NintendoCard key={f.friend_id} style={styles.knockCard}>
                <View style={styles.knockRow}>
                  <PixelAvatar avatarData={f.avatar_data} size={28} />
                  <View style={styles.knockInfo}>
                    <Text style={styles.knockNickname} numberOfLines={1}>
                      {f.nickname}
                    </Text>
                    <View style={styles.knockLabelRow}>
                      {knockIcon && (
                        <Image
                          source={knockIcon.icon}
                          style={styles.knockLabelIcon}
                        />
                      )}
                      <Text style={styles.knockLabel}>
                        {knockIcon
                          ? knockIcon.label
                          : `인사를 ${f.unseen_knocks}번 보냈어`}
                      </Text>
                    </View>
                  </View>
                  <NintendoButton
                    title="확인"
                    variant="muted"
                    small
                    onPress={() => markKnocksSeen(f.friend_id)}
                  />
                </View>
              </NintendoCard>
            );
          })}
        </View>
      )}

      {/* 인사 요청 결과 알림 */}
      {knockNotifications.length > 0 && (
        <NintendoCard style={styles.notiCard}>
          {knockNotifications.map(n => (
            <View key={n.to_user_id} style={styles.notiRow}>
              <PixelAvatar avatarData={n.avatar_data} size={28} />
              <Text
                style={[
                  styles.notiText,
                  {
                    color:
                      n.status === 'accepted'
                        ? colors.nintendoGreen
                        : colors.muted,
                  },
                ]}
                numberOfLines={2}
              >
                {n.status === 'accepted'
                  ? `${n.nickname}님이 인사를 받기로 했어!`
                  : `${n.nickname}님이 조용히 쉬고 싶대`}
              </Text>
              <NintendoButton
                title="확인"
                variant="muted"
                small
                onPress={() => markNotificationSeen(n.to_user_id, n.status)}
              />
            </View>
          ))}
        </NintendoCard>
      )}

      {/* 마을 이웃 타이틀 + 뷰 토글 + 인사 수신 토글 */}
      <View style={styles.Title}>
        <Text style={styles.friendsTitle}>마을 이웃 ({friends.length})</Text>
        <View style={styles.viewToggleRow}>
          <Pressable
            onPress={() => setViewMode('list')}
            style={{
              ...styles.viewToggleBtn,
              backgroundColor:
                viewMode === 'list' ? colors.accent : colors.cardBg,
            }}
          >
            <Text
              style={{
                ...styles.viewToggleText,
                color: viewMode === 'list' ? colors.white : colors.muted,
              }}
            >
              목록
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('village')}
            style={{
              ...styles.viewToggleBtn,
              backgroundColor:
                viewMode === 'village' ? colors.accent : colors.cardBg,
            }}
          >
            <Text
              style={{
                ...styles.viewToggleText,
                color: viewMode === 'village' ? colors.white : colors.muted,
              }}
            >
              마을
            </Text>
          </Pressable>
        </View>
        <Pressable onPress={handleToggleAllowKnocks} style={styles.toggleRow}>
          {({ pressed }) => (
            <>
              <View
                style={[
                  styles.toggleTrack,
                  {
                    backgroundColor:
                      profile?.allow_knocks !== false
                        ? colors.nintendoGreen
                        : colors.muted,
                    opacity: profile?.allow_knocks !== false ? 1 : 0.4,
                  },
                  pressed && {
                    transform: [{ translateY: 2 }],
                    shadowOffset: { width: 0, height: 0 },
                  },
                ]}
              >
                <View
                  style={[
                    styles.toggleKnob,
                    profile?.allow_knocks !== false
                      ? styles.toggleKnobOn
                      : styles.toggleKnobOff,
                  ]}
                />
              </View>
              <Text style={styles.toggleText}>
                {profile?.allow_knocks !== false
                  ? '인사 받는 중'
                  : '인사 안 받는 중'}
              </Text>
            </>
          )}
        </Pressable>
      </View>

      {friendsLoading && (
        <View style={styles.loadingBox}>
          <LoadingSpinner />
          <Text style={styles.loadingText}>이웃 소식 확인 중...</Text>
        </View>
      )}

      {!friendsLoading && friends.length === 0 && (
        <NintendoCard style={styles.emptyCard}>
          <Image
            source={require('../assets/icons/tree.png')}
            style={styles.emptyIcon}
          />
          <Text style={styles.emptyTitle}>아직 마을에 이웃이 없어</Text>
          <Text style={styles.emptySub}>초대장을 보내서 이웃을 불러보자</Text>
          <NintendoButton
            title="초대장 보내기"
            variant="accent"
            icon={require('../assets/icons/mail.png')}
            onPress={() => setShowInvite(true)}
          />
        </NintendoCard>
      )}
    </>
  );

  const listFooter = (
    <>
      {viewMode === 'village' && !friendsLoading && (
        <VillageView
          friends={friends}
          myAvatar={profile?.avatar_data ?? null}
          myNickname={profile?.nickname || '나'}
          myUserId={user?.id}
          onFriendPress={friend => handleKnock(friend.friend_id)}
        />
      )}
      <View style={styles.footer}>
        <Image
          source={require('../assets/icons/shine.png')}
          style={styles.footerIcon}
        />
        <Text style={styles.footerText}>가끔 들르는 것만으로도 충분해요</Text>
        <Image
          source={require('../assets/icons/shine.png')}
          style={styles.footerIcon}
        />
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={viewMode === 'list' && !friendsLoading ? friends : []}
        renderItem={renderFriendItem}
        keyExtractor={item => item.friend_id}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      {/* 인사 아이콘 피커 */}
      {showKnockPicker && (
        <Pressable
          style={styles.overlay}
          onPress={() => setShowKnockPicker(null)}
        >
          <Pressable
            style={styles.pickerCard}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.pickerTitle}>
              {friends.find(f => f.friend_id === showKnockPicker)?.nickname}
              에게 어떤 인사?
            </Text>
            <View style={styles.pickerGrid}>
              {KNOCK_ICONS.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => handleKnock(showKnockPicker, item.id)}
                  style={({ pressed }) => [
                    styles.pickerItem,
                    pressed && styles.headerBtnPressed,
                  ]}
                >
                  <Image source={item.icon} style={styles.pickerIcon} />
                  <Text style={styles.pickerLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* 설정 모달 */}
      {showSettings && (
        <Pressable
          style={styles.overlay}
          onPress={() => {
            setShowSettings(false);
            setTempReminderHour(null);
          }}
        >
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>설정</Text>

            {/* 알림 시간 설정 */}
            <Text style={styles.settingsLabel}>알림 시간</Text>
            <View style={styles.hourPicker}>
              <Pressable
                onPress={() => {
                  const prev = tempReminderHour ?? profile?.reminder_hour ?? 10;
                  setTempReminderHour(prev <= 0 ? 23 : prev - 1);
                }}
                style={styles.hourBtn}
              >
                <Text style={styles.hourBtnText}>-</Text>
              </Pressable>
              <Text style={styles.hourText}>
                {(tempReminderHour ?? profile?.reminder_hour ?? 10)
                  .toString()
                  .padStart(2, '0')}
                :00
              </Text>
              <Pressable
                onPress={() => {
                  const prev = tempReminderHour ?? profile?.reminder_hour ?? 10;
                  setTempReminderHour(prev >= 23 ? 0 : prev + 1);
                }}
                style={styles.hourBtn}
              >
                <Text style={styles.hourBtnText}>+</Text>
              </Pressable>
            </View>
            <Text style={styles.settingsHint}>
              매일 이 시간에 응원 알림을 보내줘
            </Text>
            <NintendoButton
              title="확인"
              variant="muted"
              disabled={
                tempReminderHour === null ||
                tempReminderHour === (profile?.reminder_hour ?? 10)
              }
              onPress={async () => {
                if (tempReminderHour !== null) {
                  await updateReminderHour(tempReminderHour);
                  setTempReminderHour(null);
                }
              }}
              style={{ width: '100%', marginBottom: Spacing.xs }}
            />

            <View style={styles.settingsDivider} />

            {/* 푸시 알림 토글 */}
            <View style={styles.pushContainer}>
              <View style={styles.settingsLabelRow}>
                <Text style={{ ...styles.settingsLabel, marginBottom: 0 }}>
                  푸시 알림
                </Text>
                <Text style={styles.settingsLabelHint}>
                  {pushEnabled
                    ? '인사 알림과 응원 메시지를 받아'
                    : '설정에서 알림을 켜줘'}
                </Text>
              </View>
              <Pressable onPress={handleTogglePush} style={styles.toggleRow}>
                {({ pressed }) => (
                  <>
                    <View
                      style={[
                        styles.toggleTrack,
                        {
                          backgroundColor: pushEnabled
                            ? colors.nintendoGreen
                            : colors.muted,
                          opacity: pushEnabled ? 1 : 0.4,
                        },
                        pressed && {
                          transform: [{ translateY: 2 }],
                          shadowOffset: { width: 0, height: 0 },
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.toggleKnob,
                          pushEnabled
                            ? styles.toggleKnobOn
                            : styles.toggleKnobOff,
                        ]}
                      />
                    </View>
                    <Text style={styles.toggleText}>
                      {pushEnabled ? '알림 켜짐' : '알림 꺼짐'}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            <Pressable
              onPress={() => {
                setShowSettings(false);
                setTempReminderHour(null);
              }}
              style={styles.settingsClose}
            >
              <Text style={styles.settingsCloseText}>닫기</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}

      {/* 인사 요청 수락 확인 */}
      {acceptConfirm && (
        <Pressable
          style={styles.overlay}
          onPress={() => setAcceptConfirm(null)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}
          >
            <Image
              source={require('../assets/icons/heart.png')}
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>인사를 다시 받을까?</Text>
            <Text style={styles.modalSub}>
              수락하면 모든 이웃이{'\n'}다시 인사를 보낼 수 있어
            </Text>
            <View style={styles.modalBtns}>
              <NintendoButton
                title="취소"
                variant="muted"
                onPress={() => setAcceptConfirm(null)}
                style={styles.modalBtn}
              />
              <NintendoButton
                title="수락"
                variant="accent"
                onPress={async () => {
                  await acceptKnockRequest(acceptConfirm);
                  await updateAllowKnocks(true);
                  setAcceptConfirm(null);
                }}
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* 인사 요청 보내기 확인 */}
      {knockReqConfirm && (
        <Pressable
          style={styles.overlay}
          onPress={() => setKnockReqConfirm(null)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}
          >
            <Image
              source={require('../assets/icons/mail.png')}
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>
              {friends.find(f => f.friend_id === knockReqConfirm)?.nickname}
              님에게 인사 요청을 보낼까?
            </Text>
            <Text style={styles.modalSub}>
              지금 인사를 받지 않고 있어.{'\n'}요청을 수락하면 인사를 보낼 수
              있어
            </Text>
            <View style={styles.modalBtns}>
              <NintendoButton
                title="취소"
                variant="muted"
                onPress={() => setKnockReqConfirm(null)}
                style={styles.modalBtn}
              />
              <NintendoButton
                title="보내기"
                variant="accent"
                onPress={confirmKnockRequest}
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* 인사 수신 토글 확인 */}
      {showKnockToggleConfirm && (
        <Pressable
          style={styles.overlay}
          onPress={() => setShowKnockToggleConfirm(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}
          >
            <Image
              source={require('../assets/icons/thunder.png')}
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>
              {profile?.allow_knocks !== false
                ? '인사를 그만 받을까?'
                : '인사를 다시 받을까?'}
            </Text>
            <Text style={styles.modalSub}>
              {profile?.allow_knocks !== false
                ? '이웃들이 인사를 보낼 수 없게 돼'
                : '이웃들이 다시 인사를 보낼 수 있어'}
            </Text>
            <View style={styles.modalBtns}>
              <NintendoButton
                title="취소"
                variant="muted"
                onPress={() => setShowKnockToggleConfirm(false)}
                style={styles.modalBtn}
              />
              <NintendoButton
                title="확인"
                variant="accent"
                onPress={async () => {
                  setShowKnockToggleConfirm(false);
                  await updateAllowKnocks(!profile!.allow_knocks);
                }}
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* 연동 끊기 확인 */}
      {unfriendConfirm && (
        <Pressable
          style={styles.overlay}
          onPress={() => setUnfriendConfirm(null)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}
          >
            <Image
              source={require('../assets/icons/flag.png')}
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>
              {friends.find(f => f.friend_id === unfriendConfirm)?.nickname}
              님과 이웃을 끊을까?
            </Text>
            <Text style={styles.modalSub}>서로의 마을에서 사라지게 돼</Text>
            <View style={styles.modalBtns}>
              <NintendoButton
                title="취소"
                variant="muted"
                onPress={() => setUnfriendConfirm(null)}
                style={styles.modalBtn}
              />
              <NintendoButton
                title="끊기"
                variant="accent"
                onPress={async () => {
                  const friendId = unfriendConfirm;
                  setUnfriendConfirm(null);
                  const { error } = await removeFriend(friendId);
                  if (error) {
                    setKnockError(error);
                  } else {
                    setKnockToast('이웃 연동을 끊었어');
                  }
                }}
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* 로그아웃 확인 */}
      {showLogoutConfirm && (
        <Pressable
          style={styles.overlay}
          onPress={() => setShowLogoutConfirm(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}
          >
            <Image
              source={require('../assets/icons/thunder.png')}
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>정말 로그아웃할까?</Text>
            <Text style={styles.modalSub}>언제든 다시 돌아올 수 있어</Text>
            <View style={styles.modalBtns}>
              <NintendoButton
                title="취소"
                variant="muted"
                onPress={() => setShowLogoutConfirm(false)}
                style={styles.modalBtn}
              />
              <NintendoButton
                title="로그아웃"
                variant="accent"
                onPress={signOut}
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* 카드 액션 메뉴 */}
      {menuFriend && (
        <Pressable style={styles.overlay} onPress={() => setMenuFriend(null)}>
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}
          >
            <View style={styles.menuHeader}>
              <PixelAvatar avatarData={menuFriend.avatar_data} size={36} />
              <Text style={styles.modalTitle}>{menuFriend.nickname}</Text>
            </View>
            <View style={styles.menuBtns}>
              <NintendoButton
                title="사진 찍기"
                variant="blue"
                onPress={() => {
                  const friend = menuFriend;
                  setMenuFriend(null);
                  setPhotoFriend(friend);
                }}
              />
              <NintendoButton
                title="주고받은 인사"
                variant="green"
                onPress={() => {
                  const friend = menuFriend;
                  setMenuFriend(null);
                  setKnockHistoryFriend(friend);
                  loadKnockHistory(friend.friend_id);
                }}
              />
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* 주고받은 인사 기록 */}
      <Modal
        visible={!!knockHistoryFriend}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setKnockHistoryFriend(null);
          setKnockHistory([]);
        }}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              setKnockHistoryFriend(null);
              setKnockHistory([]);
            }}
          />
          <View style={{ ...styles.modalCard, maxHeight: '70%' }}>
            <Text style={styles.modalTitle}>
              {knockHistoryFriend?.nickname}님과의 인사
            </Text>
            {knockHistory.length > 0 && (
              <Text style={styles.modalSub}>
                총 {knockHistory.length}번의 인사를 나눴어
              </Text>
            )}
            <ScrollView
              ref={knockHistoryScrollRef}
              style={styles.knockHistoryScroll}
              contentContainerStyle={{ alignItems: 'center' }}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => {
                knockHistoryScrollRef.current?.scrollToEnd({ animated: false });
              }}
            >
              {knockHistory.length === 0 ? (
                <Text style={styles.knockHistoryEmpty}>
                  아직 주고받은 인사가 없어
                </Text>
              ) : (
                knockHistory.map((k, i) => {
                  const icon = KNOCK_ICONS.find(ki => ki.id === k.emoji);
                  const date = new Date(k.created_at);
                  const dateStr = date.toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short',
                  });
                  const timeStr = date.toLocaleTimeString('ko-KR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  });
                  return (
                    <View key={i} style={styles.knockHistoryItem}>
                      <Text style={styles.knockHistoryTime}>
                        {dateStr} {timeStr}
                      </Text>
                      <View
                        style={{
                          flexDirection: k.from_me ? 'row-reverse' : 'row',
                        }}
                      >
                        <View
                          style={{
                            ...styles.knockHistoryBubble,
                            backgroundColor: k.from_me
                              ? colors.nintendoGreen
                              : colors.background,
                          }}
                        >
                          {icon && (
                            <Image
                              source={icon.icon}
                              style={styles.knockHistoryIcon}
                            />
                          )}
                          <Text
                            style={{
                              ...styles.knockHistoryLabel,
                              color: k.from_me
                                ? colors.cardBg
                                : colors.foreground,
                            }}
                          >
                            {icon?.label || '인사'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
              {/* <Pressable
                onPress={() => {
                  setKnockHistoryFriend(null);
                  setKnockHistory([]);
                }}
                style={styles.settingsClose}
              >
                <Text style={styles.settingsCloseText}>닫기</Text>
              </Pressable> */}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 초대 모달 */}
      {showInvite && (
        <InviteModal
          myInviteCode={profile?.invite_code || ''}
          onAddFriend={addFriend}
          onClose={() => setShowInvite(false)}
        />
      )}

      {/* 아바타 빌더 모달 */}
      {showAvatarBuilder && (
        <AvatarBuilderModal
          currentAvatar={profile?.avatar_data ?? null}
          onSave={updateAvatar}
          onClose={() => setShowAvatarBuilder(false)}
        />
      )}

      {/* 닉네임 변경 모달 */}
      {showNicknameEdit && (
        <NicknameEditModal
          currentNickname={profile?.nickname || ''}
          onSave={updateNickname}
          onClose={() => setShowNicknameEdit(false)}
        />
      )}

      {/* 개인정보 모달 */}
      {showPrivacy && (
        <PrivacyInfoModal
          onClose={() => setShowPrivacy(false)}
          onLogout={() => {
            setShowPrivacy(false);
            setShowLogoutConfirm(true);
          }}
        />
      )}

      {/* 기념사진 모달 */}
      {photoFriend && (
        <PhotoFrameModal
          myAvatar={profile?.avatar_data ?? null}
          myName={profile?.nickname || '나'}
          friendAvatar={photoFriend.avatar_data}
          friendName={photoFriend.nickname}
          onClose={() => setPhotoFriend(null)}
        />
      )}

      {/* 토스트 */}
      {knockError && (
        <Toast
          message={knockError}
          type="error"
          onDismiss={() => setKnockError(null)}
        />
      )}
      {knockToast && (
        <Toast
          message={knockToast}
          type="success"
          onDismiss={() => setKnockToast(null)}
        />
      )}
    </View>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        listContent: {
          maxWidth: 512,
          alignSelf: 'center',
          width: '100%',
          paddingHorizontal: Spacing.lg,
          paddingTop: 60,
          paddingBottom: 40,
        },
        // 헤더
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: Spacing['2xl'],
        },
        headerLeft: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          flex: 1,
        },
        avatarBox: {
          padding: 6,
          backgroundColor: colors.background,
        },
        greeting: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xl,
          color: colors.foreground,
        },
        greetingSub: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.muted,
          marginTop: 2,
        },
        headerRight: {
          flexDirection: 'row',
          gap: Spacing.xs,
        },
        headerBtn: {
          width: 40,
          height: 40,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.shadowColor,
          backgroundColor: colors.nintendoBlue,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3,
        },
        headerBtnPressed: {
          transform: [{ translateY: 3 }],
          shadowOffset: { width: 0, height: 0 },
        },
        headerBtnIcon: {
          width: 18,
          height: 18,
          resizeMode: 'contain',
        },
        // 체크인 카드
        checkinCard: {
          padding: Spacing.xl,
          alignItems: 'center',
          marginBottom: Spacing.lg,
        },
        broadcastRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          marginBottom: Spacing.lg,
        },

        checkinText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.foreground,
          textAlign: 'center',
          lineHeight: 24,
        },
        toggleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
        },
        toggleTrack: {
          width: 36,
          height: 20,
          borderWidth: 2,
          borderColor: colors.shadowColor,
          borderRadius: 4,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 2,
          justifyContent: 'center',
        },
        toggleKnob: {
          width: 12,
          height: 12,
          borderWidth: 2,
          borderColor: colors.shadowColor,
          borderRadius: 2,
          backgroundColor: colors.white,
        },
        toggleKnobOn: {
          alignSelf: 'flex-end',
          marginRight: 2,
        },
        toggleKnobOff: {
          alignSelf: 'flex-start',
          marginLeft: 2,
        },
        toggleText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.muted,
        },
        // 인사 요청
        knockReqCard: {
          padding: Spacing.md,
          marginBottom: Spacing.lg,
          backgroundColor: colors.knockReqBg,
        },
        sectionHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginBottom: Spacing.md,
        },
        sectionIcon: {
          width: 16,
          height: 16,
        },
        sectionTitleAccent: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.accent,
        },
        reqRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          paddingVertical: Spacing.xs,
          marginBottom: Spacing.xs,
        },
        reqNickname: {
          flex: 1,
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.foreground,
        },
        // 받은 인사
        knockSection: {
          marginBottom: Spacing.lg,
        },
        knockCard: {
          padding: Spacing.md,
          marginBottom: Spacing.sm,
        },
        knockRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
        },
        knockInfo: {
          flex: 1,
          minWidth: 0,
        },
        knockNickname: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.foreground,
        },
        knockLabelRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
          marginTop: 2,
        },
        knockLabelIcon: {
          width: 14,
          height: 14,
        },
        knockLabel: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.muted,
        },
        // 알림
        notiCard: {
          padding: Spacing.md,
          marginBottom: Spacing.lg,
          backgroundColor: colors.cardBg,
        },
        notiRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          marginBottom: Spacing.xs,
        },
        notiText: {
          flex: 1,
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
        },
        Title: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: Spacing.md,
        },
        // 친구 리스트
        friendsTitle: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
          textTransform: 'uppercase',
          letterSpacing: 1,
        },
        viewToggleRow: {
          flexDirection: 'row',
          gap: 4,
        },
        viewToggleBtn: {
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: colors.border,
        },
        viewToggleText: {
          fontFamily: Fonts.bold,
          fontSize: 10,
        },
        friendItem: {
          marginBottom: Spacing.md,
        },
        loadingBox: {
          alignItems: 'center',
          paddingVertical: Spacing['3xl'],
        },
        loadingText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
          marginTop: Spacing.md,
        },
        emptyCard: {
          padding: Spacing['2xl'],
          alignItems: 'center',
        },
        emptyIcon: {
          width: 48,
          height: 48,
          marginBottom: Spacing.md,
        },
        emptyTitle: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.foreground,
          marginBottom: 4,
        },
        emptySub: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.xs,
          color: colors.muted,
          marginBottom: Spacing.xl,
        },
        // 하단
        footer: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          marginTop: Spacing['2xl'],
        },
        footerIcon: {
          width: 16,
          height: 16,
        },
        footerText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.muted,
        },
        // 오버레이/모달
        overlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 100,
          padding: Spacing.lg,
        },
        pickerCard: {
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          borderWidth: 3,
          borderColor: colors.border,
          padding: Spacing.lg,
          width: '100%',
          maxWidth: 320,
        },
        pickerTitle: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.muted,
          textAlign: 'center',
          marginBottom: Spacing.md,
        },
        pickerGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Spacing.sm,
        },
        pickerItem: {
          width: '30%',
          alignItems: 'center',
          paddingVertical: Spacing.sm + 2,
          backgroundColor: colors.background,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.border,
          gap: 6,
        },
        pickerIcon: {
          width: 28,
          height: 28,
          resizeMode: 'contain',
        },
        pickerLabel: {
          fontFamily: Fonts.bold,
          fontSize: 10,
          color: colors.muted,
        },
        modalCard: {
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          borderWidth: 3,
          borderColor: colors.border,
          padding: Spacing.xl,
          width: '100%',
          maxWidth: 320,
          alignItems: 'center',
        },
        modalIcon: {
          width: 40,
          height: 40,
          marginBottom: Spacing.md,
          resizeMode: 'contain',
        },
        modalTitle: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.foreground,
          textAlign: 'center',
          marginBottom: 8,
        },
        modalSub: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.nintendoBlue,
          textAlign: 'center',
          marginBottom: Spacing.xl,
        },
        modalBtns: {
          flexDirection: 'row',
          gap: Spacing.md,
          width: '100%',
        },
        modalBtn: {
          flex: 1,
        },
        settingsLabel: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
          marginBottom: Spacing.sm,
          alignSelf: 'flex-start',
        },
        settingsLabelRow: {
          alignItems: 'baseline',
          gap: Spacing.xs,
        },
        pushContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        },
        settingsLabelHint: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.xs,
          color: colors.muted,
        },
        hourPicker: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.lg,
          marginBottom: Spacing.xs,
        },
        hourBtn: {
          width: 40,
          height: 40,
          borderRadius: 12,
          borderWidth: 3,
          borderColor: colors.border,
          backgroundColor: colors.background,
          alignItems: 'center',
          justifyContent: 'center',
        },
        hourBtnText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.foreground,
        },
        hourText: {
          fontFamily: Fonts.bold,
          fontSize: 28,
          color: colors.foreground,
          minWidth: 80,
          textAlign: 'center',
        },
        settingsHint: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.xs,
          color: colors.muted,
          marginBottom: Spacing.md,
          marginTop: 12,
        },
        settingsDivider: {
          height: 2,
          backgroundColor: colors.border,
          width: '100%',
          marginVertical: Spacing.lg,
        },
        settingsClose: {
          alignItems: 'center',
          marginTop: Spacing['2xl'],
          paddingVertical: Spacing.sm,
        },
        settingsCloseText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
        },
        menuHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          marginBottom: Spacing.lg,
        },
        menuBtns: {
          width: '100%',
          gap: Spacing.sm,
        },
        knockHistoryScroll: {
          width: '100%',
        },
        knockHistoryEmpty: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.muted,
          textAlign: 'center',
          paddingVertical: Spacing.xl,
        },
        knockHistoryItem: {
          width: '100%',
          marginBottom: Spacing.md,
        },
        knockHistoryBubble: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          paddingHorizontal: Spacing.sm,
          paddingVertical: Spacing.sm,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.border,
          justifyContent: 'flex-end',
          marginBottom: Spacing.xs,
        },
        knockHistoryIcon: {
          width: 18,
          height: 18,
          resizeMode: 'contain',
        },
        knockHistoryLabel: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
        },
        knockHistoryTime: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.xs,
          color: colors.foreground,
          opacity: 0.6,
          textAlign: 'center',
          marginBottom: Spacing.xs,
        },
      }),
    [colors],
  );
}
