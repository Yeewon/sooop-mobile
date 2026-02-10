import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Pressable,
} from 'react-native';
import {Colors, Fonts, FontSizes, Spacing} from '../theme';
import {useAuthContext} from '../contexts/AuthContext';
import {useCheckin} from '../hooks/useCheckin';
import {useFriends} from '../hooks/useFriends';
import {useNotifications} from '../hooks/useNotifications';
import {useDeepLink} from '../hooks/useDeepLink';
import {KNOCK_ICONS, DAILY_MESSAGES, VILLAGE_CHARACTERS, getDailyIndex} from '../shared/constants';
import {FriendWithStatus} from '../shared/types';
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

export default function DashboardScreen() {
  const {user, profile, signOut, updateAllowKnocks, updateNickname, updateAvatar} = useAuthContext();
  // 자동 체크인 + 푸시 알림
  useCheckin(user?.id);
  useNotifications(user?.id);

  // 딥링크로 초대 코드 받으면 자동 친구 추가
  useDeepLink(async (code: string) => {
    const {error} = await addFriend(code);
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

  const [refreshing, setRefreshing] = useState(false);
  const [msgIndex, setMsgIndex] = useState(() => getDailyIndex(DAILY_MESSAGES.length));
  const [charIndex, setCharIndex] = useState(() => getDailyIndex(VILLAGE_CHARACTERS.length));
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
  const [showLogout, setShowLogout] = useState(false);
  const [acceptConfirm, setAcceptConfirm] = useState<string | null>(null);
  const [knockReqConfirm, setKnockReqConfirm] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
  const [showNicknameEdit, setShowNicknameEdit] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [photoFriend, setPhotoFriend] = useState<FriendWithStatus | null>(null);
  const [unfriendConfirm, setUnfriendConfirm] = useState<string | null>(null);

  const dailyMessage = DAILY_MESSAGES[msgIndex];
  const isAdmin = profile?.role === 'admin';

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
    const {error} = await sendKnock(friendId, emoji, isAdmin);
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
    const {error} = await sendKnockRequest(friendId);
    if (error) {
      setKnockError(error);
    } else {
      setKnockToast('인사 요청을 보냈어!');
    }
  };

  const unseenFriends = friends.filter(f => f.unseen_knocks > 0);

  const renderFriendItem = ({item, index}: {item: FriendWithStatus; index: number}) => (
    <AnimatedEntrance delay={index * 80} style={styles.friendItem}>
      <HeartbeatCard
        friend={item}
        onKnock={(emoji: string) => handleKnock(item.friend_id, emoji)}
        onPhoto={() => setPhotoFriend(item)}
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
            {({pressed}) => (
              <NintendoCard
                style={{
                  ...styles.avatarBox,
                  ...(pressed
                    ? {
                        transform: [{translateY: 4}],
                        shadowOffset: {width: 0, height: 0},
                      }
                    : {}),
                }}>
                <PixelAvatar
                  avatarData={profile?.avatar_data ?? null}
                  size={40}
                />
              </NintendoCard>
            )}
          </Pressable>
          <Pressable
            onPress={() => setShowNicknameEdit(true)}
            style={({pressed}) => pressed && {opacity: 0.6}}>
            <Text style={styles.greeting}>
              어서 와, {profile?.nickname || '주민'}
            </Text>
            <Text style={styles.greetingSub}>이름이나 캐릭터를 눌러봐</Text>
          </Pressable>
        </View>
        <View style={styles.headerRight}>
          <Pressable
            onPress={() => setShowInvite(true)}
            style={({pressed}) => [
              styles.headerBtn,
              pressed && styles.headerBtnPressed,
            ]}>
            <Image
              source={require('../assets/icons/flag.png')}
              style={styles.headerBtnIcon}
            />
          </Pressable>
          <Pressable
            onPress={() => setShowPrivacy(true)}
            style={({pressed}) => [
              styles.headerBtn,
              pressed && styles.headerBtnPressed,
            ]}>
            <Image
              source={require('../assets/icons/computer.png')}
              style={styles.headerBtnIcon}
            />
          </Pressable>
          <Pressable
            onPress={() => setShowLogout(true)}
            style={({pressed}) => [
              styles.headerBtn,
              pressed && styles.headerBtnPressed,
            ]}>
            <Image
              source={require('../assets/icons/thunder.png')}
              style={styles.headerBtnIcon}
            />
          </Pressable>
        </View>
      </View>

      {/* 마을 방송 카드 */}


      <View style={styles.broadcastRow}>
        <NintendoCard
          style={{...styles.checkinCard, backgroundColor: Colors.white, shadowOpacity: 0, elevation: 0, flex: 1, marginBottom: 0}}>
          <TypewriterText text={`${dailyMessage}...`} style={styles.checkinText} />
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
                        ? Colors.nintendoGreen
                        : Colors.muted,
                  },
                ]}
                numberOfLines={2}>
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

      {/* 마을 이웃 타이틀 + 인사 수신 토글 */}
      <View style={styles.Title}>
        <Text style={styles.friendsTitle}>마을 이웃 ({friends.length})</Text>
        <Pressable
          onPress={async () => {
            if (profile) {
              await updateAllowKnocks(!profile.allow_knocks);
            }
          }}
          style={styles.toggleRow}>
          {({pressed}) => (
            <>
              <View
                style={[
                  styles.toggleTrack,
                  {
                    backgroundColor:
                      profile?.allow_knocks !== false
                        ? Colors.nintendoGreen
                        : Colors.muted,
                    opacity: profile?.allow_knocks !== false ? 1 : 0.4,
                  },
                  pressed && {
                    transform: [{translateY: 2}],
                    shadowOffset: {width: 0, height: 0},
                  },
                ]}>
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
          <Text style={styles.emptySub}>
            초대장을 보내서 이웃을 불러보자
          </Text>
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
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={!friendsLoading ? friends : []}
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
          onPress={() => setShowKnockPicker(null)}>
          <Pressable
            style={styles.pickerCard}
            onPress={e => e.stopPropagation()}>
            <Text style={styles.pickerTitle}>
              {friends.find(f => f.friend_id === showKnockPicker)?.nickname}
              에게 어떤 인사?
            </Text>
            <View style={styles.pickerGrid}>
              {KNOCK_ICONS.map(item => (
                <Pressable
                  key={item.id}
                  onPress={() => handleKnock(showKnockPicker, item.id)}
                  style={({pressed}) => [
                    styles.pickerItem,
                    pressed && styles.headerBtnPressed,
                  ]}>
                  <Image source={item.icon} style={styles.pickerIcon} />
                  <Text style={styles.pickerLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      )}

      {/* 로그아웃 확인 */}
      {showLogout && (
        <Pressable
          style={styles.overlay}
          onPress={() => setShowLogout(false)}>
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}>
            <Image
              source={require('../assets/icons/thunder.png')}
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>마을을 떠날 거야?</Text>
            <Text style={styles.modalSub}>
              다음에 오면 이웃들이 반가워할 거야
            </Text>
            <View style={styles.modalBtns}>
              <NintendoButton
                title="취소"
                variant="muted"
                onPress={() => setShowLogout(false)}
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

      {/* 인사 요청 수락 확인 */}
      {acceptConfirm && (
        <Pressable
          style={styles.overlay}
          onPress={() => setAcceptConfirm(null)}>
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}>
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
          onPress={() => setKnockReqConfirm(null)}>
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}>
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

      {/* 연동 끊기 확인 */}
      {unfriendConfirm && (
        <Pressable
          style={styles.overlay}
          onPress={() => setUnfriendConfirm(null)}>
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}>
            <Image
              source={require('../assets/icons/flag.png')}
              style={styles.modalIcon}
            />
            <Text style={styles.modalTitle}>
              {friends.find(f => f.friend_id === unfriendConfirm)?.nickname}
              님과 이웃을 끊을까?
            </Text>
            <Text style={styles.modalSub}>
              서로의 마을에서 사라지게 돼
            </Text>
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
                  const {error} = await removeFriend(friendId);
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
        <PrivacyInfoModal onClose={() => setShowPrivacy(false)} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    backgroundColor: Colors.background,
  },
  greeting: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xl,
    color: Colors.foreground,
  },
  greetingSub: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: Colors.muted,
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
    borderColor: Colors.shadowColor,
    backgroundColor: Colors.nintendoBlue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadowColor,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  headerBtnPressed: {
    transform: [{translateY: 3}],
    shadowOffset: {width: 0, height: 0},
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
    color: Colors.foreground,
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
    borderColor: Colors.shadowColor,
    borderRadius: 4,
    shadowColor: Colors.shadowColor,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: Colors.shadowColor,
    borderRadius: 2,
    backgroundColor: Colors.white,
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
    color: Colors.muted,
  },
  // 인사 요청
  knockReqCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: '#FFF2F3',
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
    color: Colors.accent,
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
    color: Colors.foreground,
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
    color: Colors.foreground,
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
    color: Colors.muted,
  },
  // 알림
  notiCard: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.cardBg,
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
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    color: Colors.muted,
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
    color: Colors.foreground,
    marginBottom: 4,
  },
  emptySub: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.muted,
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
    color: Colors.muted,
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
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.border,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 320,
  },
  pickerTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: Colors.muted,
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
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: 6,
  },
  pickerIcon: {
    width: 28,
    height: 28,
  },
  pickerLabel: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: Colors.muted,
  },
  modalCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.border,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  modalIcon: {
    width: 40,
    height: 40,
    marginBottom: Spacing.md,
    resizeMode: 'contain'
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    color: Colors.foreground,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.muted,
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
});
