import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  type GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useColors } from '../../contexts/ThemeContext';
import type { ColorScheme } from '../../theme/colors';
import { Fonts, FontSizes, Spacing } from '../../theme';
import type { FriendWithStatus, AvatarData } from '../../shared/types';
import {
  VILLAGE_WIDTH,
  VILLAGE_VISIBLE_HEIGHT,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  MY_CHARACTER_SIZE,
} from './villageConstants';
import { useVillagePositions } from './useVillagePositions';
import { useVillageRealtime } from './useVillageRealtime';
import VillageCharacter from './VillageCharacter';
import VillageBackground from './VillageBackground';
import SpeechBubble from './SpeechBubble';
import PixelAvatar from '../PixelAvatar';
import WeatherParticles, { WeatherGround } from './WeatherParticles';
import { getVillageAmbience } from './villageAmbience';
import type { TimeOfDay, WeatherType } from './villageAmbience';
import type { WeatherData } from '../../hooks/useWeather';

const TIME_OPTIONS: (TimeOfDay | 'auto')[] = [
  'auto',
  'morning',
  'day',
  'evening',
  'night',
];
const TIME_LABELS: Record<string, string> = {
  auto: '자동',
  morning: '아침',
  day: '낮',
  evening: '저녁',
  night: '밤',
};
const WEATHER_OPTIONS: (WeatherType | 'auto')[] = [
  'auto',
  'clear',
  'clouds',
  'rain',
  'snow',
  'fog',
];
const WEATHER_LABELS: Record<string, string> = {
  auto: '자동',
  clear: '맑음',
  clouds: '흐림',
  rain: '비',
  snow: '눈',
  fog: '안개',
};

const MOVE_MARGIN = 20;
const TAP_MOVE_DISTANCE = 60;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

interface VillageViewProps {
  friends: FriendWithStatus[];
  myAvatar: AvatarData | null;
  myNickname: string;
  myUserId: string | undefined;
  onFriendPress: (friend: FriendWithStatus) => void;
  weather?: WeatherData | null;
  isAdmin?: boolean;
}

export default function VillageView({
  friends,
  myAvatar,
  myNickname,
  myUserId,
  onFriendPress,
  weather,
  isAdmin,
}: VillageViewProps) {
  const colors = useColors();
  const styles = useStyles(colors);
  const positions = useVillagePositions(friends);

  // 테스트 패널 상태
  const [debugTime, setDebugTime] = useState<TimeOfDay | 'auto'>('auto');
  const [debugWeather, setDebugWeather] = useState<WeatherType | 'auto'>(
    'auto',
  );

  const ambience = useMemo(
    () =>
      getVillageAmbience(
        weather?.icon,
        debugTime === 'auto' ? undefined : debugTime,
        debugWeather === 'auto' ? undefined : debugWeather,
      ),
    [weather?.icon, debugTime, debugWeather],
  );

  // Realtime multiplayer + chat
  const {
    onlineUsers,
    livePositions,
    chatMessages,
    joinedUserId,
    leftUserId,
    broadcastPosition,
    sendChat,
  } = useVillageRealtime({
    userId: myUserId,
    enabled: true,
  });

  // 입장/퇴장 토스트
  const presenceToast = useMemo(() => {
    if (joinedUserId) {
      const name = friends.find(f => f.friend_id === joinedUserId)?.nickname;
      return name ? `${name}님이 마을에 들어왔어!` : null;
    }
    if (leftUserId) {
      const name = friends.find(f => f.friend_id === leftUserId)?.nickname;
      return name ? `${name}님이 마을을 떠났어` : null;
    }
    return null;
  }, [joinedUserId, leftUserId, friends]);

  // 귓속말 수신 토스트
  const [whisperToast, setWhisperToast] = useState<{
    nickname: string;
    message: string;
  } | null>(null);
  const prevWhisperCountRef = useRef(0);

  useEffect(() => {
    const incomingWhispers = chatMessages.filter(
      m => m.isWhisper && m.uid !== myUserId,
    );
    if (
      incomingWhispers.length > prevWhisperCountRef.current &&
      incomingWhispers.length > 0
    ) {
      const latest = incomingWhispers[incomingWhispers.length - 1];
      setWhisperToast({ nickname: latest.nickname, message: latest.message });
      setTimeout(() => setWhisperToast(null), 10000);
    }
    prevWhisperCountRef.current = incomingWhispers.length;
  }, [chatMessages, myUserId]);

  // Chat input + 귓속말
  const [chatInput, setChatInput] = useState('');
  const [whisperTarget, setWhisperTarget] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const whisperFriend = useMemo(
    () =>
      whisperTarget ? friends.find(f => f.friend_id === whisperTarget) : null,
    [whisperTarget, friends],
  );

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    sendChat(chatInput, myNickname, whisperTarget ?? undefined);
    setChatInput('');
  }, [chatInput, sendChat, myNickname, whisperTarget]);

  // "me" position in world space
  const centerX = WORLD_WIDTH / 2 - MY_CHARACTER_SIZE / 2;
  const centerY = WORLD_HEIGHT / 2 - MY_CHARACTER_SIZE / 2;
  const myX = useSharedValue(centerX);
  const myY = useSharedValue(centerY);

  // Camera offset (world → viewport transform)
  const cameraX = useSharedValue(
    -clamp(
      centerX - VILLAGE_WIDTH / 2 + MY_CHARACTER_SIZE / 2,
      0,
      WORLD_WIDTH - VILLAGE_WIDTH,
    ),
  );
  const cameraY = useSharedValue(
    -clamp(
      centerY - VILLAGE_VISIBLE_HEIGHT / 2 + MY_CHARACTER_SIZE / 2,
      0,
      WORLD_HEIGHT - VILLAGE_VISIBLE_HEIGHT,
    ),
  );

  // World boundaries for "me"
  const maxX = WORLD_WIDTH - MY_CHARACTER_SIZE - MOVE_MARGIN;
  const maxY = WORLD_HEIGHT - MY_CHARACTER_SIZE - MOVE_MARGIN;
  const minCamX = -(WORLD_WIDTH - VILLAGE_WIDTH);
  const minCamY = -(WORLD_HEIGHT - VILLAGE_VISIBLE_HEIGHT);

  // Speech bubble
  const [selectedFriend, setSelectedFriend] = useState<{
    friend: FriendWithStatus;
    x: number;
    y: number;
  } | null>(null);

  // 빈 땅 탭 → 이동
  const handleBackgroundTap = useCallback(
    (e: GestureResponderEvent) => {
      const { locationX, locationY } = e.nativeEvent;

      // 탭 방향으로 고정 거리만큼 이동 (D-pad 느낌)
      const dx = locationX - (myX.value + MY_CHARACTER_SIZE / 2);
      const dy = locationY - (myY.value + MY_CHARACTER_SIZE / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) return;

      const ratio = Math.min(TAP_MOVE_DISTANCE / dist, 1);
      const targetX = clamp(myX.value + dx * ratio, MOVE_MARGIN, maxX);
      const targetY = clamp(myY.value + dy * ratio, MOVE_MARGIN, maxY);

      myX.value = withTiming(targetX, { duration: 400 });
      myY.value = withTiming(targetY, { duration: 400 });
      cameraX.value = withTiming(
        clamp(
          -(targetX - VILLAGE_WIDTH / 2 + MY_CHARACTER_SIZE / 2),
          minCamX,
          0,
        ),
        { duration: 400 },
      );
      cameraY.value = withTiming(
        clamp(
          -(targetY - VILLAGE_VISIBLE_HEIGHT / 2 + MY_CHARACTER_SIZE / 2),
          minCamY,
          0,
        ),
        { duration: 400 },
      );

      broadcastPosition(targetX, targetY);
      // setSelectedFriend(null);
    },
    [
      myX,
      myY,
      cameraX,
      cameraY,
      maxX,
      maxY,
      minCamX,
      minCamY,
      broadcastPosition,
    ],
  );

  // Animated styles
  const worldStyle = useAnimatedStyle(() => ({
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    transform: [{ translateX: cameraX.value }, { translateY: cameraY.value }],
  }));

  const meAnimStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: myX.value,
    top: myY.value,
    zIndex: 10,
  }));

  const myDisplayName =
    myNickname.length > 5 ? myNickname.slice(0, 5) + '..' : myNickname;

  // 내 최신 채팅 메시지
  const myLastChat = chatMessages.filter(m => m.uid === myUserId).at(-1);
  const myChatMsg = myLastChat?.message;
  const myChatIsWhisper = myLastChat?.isWhisper;

  // Get effective position for a friend (live if online, seeded otherwise)
  const getEffectivePosition = useCallback(
    (friendId: string) => {
      const live = livePositions.get(friendId);
      if (live && onlineUsers.has(friendId)) {
        return live;
      }
      return positions.get(friendId) ?? null;
    },
    [livePositions, onlineUsers, positions],
  );

  const handleFriendTap = useCallback(
    (friend: FriendWithStatus) => {
      const pos = getEffectivePosition(friend.friend_id);
      if (!pos) return;
      // setSelectedFriend(prev =>
      //   prev?.friend.friend_id === friend.friend_id
      //     ? null
      //     : { friend, x: pos.x, y: pos.y },
      // );
      // 귓속말 대상 설정
      setWhisperTarget(prev =>
        prev === friend.friend_id ? null : friend.friend_id,
      );
    },
    [getEffectivePosition],
  );

  const handleKnock = useCallback(() => {
    if (selectedFriend) {
      onFriendPress(selectedFriend.friend);
      // setSelectedFriend(null);
    }
  }, [selectedFriend, onFriendPress]);

  return (
    <View>
      <View style={styles.noticeBanner}>
        <Text style={styles.noticeBannerText}>
          메시지는 10초 후 사라지며 어디에도 저장되지 않아
        </Text>
      </View>

      {/* 접속 중인 유저 */}
      <View style={styles.onlineRow}>
        <Text style={styles.onlineLabel}>접속 중</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.onlineList}
        >
          <View style={styles.onlineItem}>
            <View style={styles.onlineAvatarWrap}>
              <PixelAvatar avatarData={myAvatar} size={24} />
              <View
                style={{
                  ...styles.onlineIndicator,
                  backgroundColor: colors.nintendoGreen,
                }}
              />
            </View>
            <Text style={styles.onlineNickname} numberOfLines={1}>
              나
            </Text>
          </View>
          {friends
            .filter(f => onlineUsers.has(f.friend_id))
            .map(f => (
              <View key={f.friend_id} style={styles.onlineItem}>
                <View style={styles.onlineAvatarWrap}>
                  <PixelAvatar avatarData={f.avatar_data} size={24} />
                  <View
                    style={{
                      ...styles.onlineIndicator,
                      backgroundColor: colors.nintendoGreen,
                    }}
                  />
                </View>
                <Text style={styles.onlineNickname} numberOfLines={1}>
                  {f.nickname.length > 4
                    ? f.nickname.slice(0, 4) + '..'
                    : f.nickname}
                </Text>
              </View>
            ))}
        </ScrollView>
      </View>

      <View
        style={{ ...styles.container, backgroundColor: ambience.grassColor }}
      >
        {/* Viewport clips the world */}
        <View
          style={{ ...styles.viewport, backgroundColor: ambience.skyColor }}
        >
          {/* 귓속말 수신 토스트 */}
          {whisperToast && (
            <View style={styles.whisperToast}>
              <Text style={styles.whisperToastText}>
                {whisperToast.nickname}님의 귓속말: {whisperToast.message}
              </Text>
            </View>
          )}

          {/* 입장/퇴장 토스트 */}
          {presenceToast && (
            <View
              style={{
                ...styles.presenceToast,
                borderColor: joinedUserId ? colors.nintendoGreen : colors.muted,
              }}
            >
              <Text
                style={{
                  ...styles.presenceToastText,
                  color: joinedUserId ? colors.nintendoGreen : colors.muted,
                }}
              >
                {presenceToast}
              </Text>
            </View>
          )}
          <Animated.View style={worldStyle}>
            {/* 잔디 배경 (탭하면 이동) */}
            <Pressable
              onPress={handleBackgroundTap}
              style={{
                ...StyleSheet.absoluteFill,
                backgroundColor: ambience.grassColor,
              }}
            >
              <VillageBackground />
            </Pressable>

            {/* 날씨 쌓임 효과 (월드에 고정) */}
            {(ambience.particleType === 'rain' ||
              ambience.particleType === 'snow') && (
              <WeatherGround type={ambience.particleType} />
            )}

            {/* 내 캐릭터 */}
            <Animated.View style={meAnimStyle}>
              <View style={styles.meWrap}>
                <View>
                  <PixelAvatar avatarData={myAvatar} size={MY_CHARACTER_SIZE} />
                  <View
                    style={{
                      ...styles.statusDot,
                      backgroundColor: colors.nintendoGreen,
                      borderColor: ambience.grassColor,
                    }}
                  />
                </View>
                <Text style={styles.myName}>{myDisplayName}</Text>
                {/* 내 채팅 말풍선 — absolute로 캐릭터 위에 띄움 */}
                {myChatMsg && (
                  <View
                    style={{
                      ...styles.meChatBubble,
                      position: 'absolute',
                      bottom: '100%',
                      ...(myChatIsWhisper
                        ? { borderColor: colors.nintendoBlue }
                        : {}),
                    }}
                  >
                    {myChatIsWhisper && (
                      <Text style={styles.whisperLabel}>귓속말</Text>
                    )}
                    <Text style={styles.meChatText} numberOfLines={3}>
                      {myChatMsg}
                    </Text>
                    <View
                      style={{
                        ...styles.meChatTriangle,
                        ...(myChatIsWhisper
                          ? { borderTopColor: colors.nintendoBlue }
                          : {}),
                      }}
                    />
                  </View>
                )}
              </View>
            </Animated.View>

            {/* 친구 캐릭터 (온라인만 표시) */}
            {friends
              .filter(f => onlineUsers.has(f.friend_id))
              .map(friend => {
                const pos = getEffectivePosition(friend.friend_id);
                if (!pos) return null;
                const lastChat = chatMessages
                  .filter(m => m.uid === friend.friend_id)
                  .at(-1);
                return (
                  <VillageCharacter
                    key={friend.friend_id}
                    avatarData={friend.avatar_data}
                    nickname={friend.nickname}
                    lastCheckin={friend.last_checkin}
                    targetX={pos.x}
                    targetY={pos.y}
                    size={48}
                    isOnline
                    chatMessage={lastChat?.message}
                    isChatWhisper={lastChat?.isWhisper}
                    onPress={() => handleFriendTap(friend)}
                  />
                );
              })}

            {/* 말풍선 */}
            {selectedFriend && (
              <SpeechBubble
                friend={selectedFriend.friend}
                x={selectedFriend.x}
                y={selectedFriend.y}
                onKnock={handleKnock}
                onClose={() => setSelectedFriend(null)}
              />
            )}

            {/* 빈 마을 안내 */}
            {friends.length === 0 && (
              <View
                style={{
                  position: 'absolute',
                  left: WORLD_WIDTH / 2 - 100,
                  top: WORLD_HEIGHT / 2 + 50,
                  width: 200,
                }}
              >
                <Text style={styles.emptyText}>
                  아직 이웃이 없어{'\n'}초대장을 보내서 마을을 채워봐!
                </Text>
              </View>
            )}
          </Animated.View>

          {/* 날씨 파티클 (비/눈/안개) */}
          {ambience.particleType !== 'none' && (
            <WeatherParticles type={ambience.particleType} />
          )}

          {/* 시간대 분위기 오버레이 */}
          <View
            style={{
              ...StyleSheet.absoluteFill,
              backgroundColor: ambience.ambientOverlay,
              zIndex: 30,
            }}
            pointerEvents="none"
          />
        </View>
      </View>

      {/* 귓속말 안내 */}
      <Text style={styles.whisperHint}>
        캐릭터를 탭하면 귓속말을 보낼 수 있어
      </Text>

      {/* 귓속말 표시 */}
      {whisperFriend && (
        <View style={styles.whisperTag}>
          <Text style={styles.whisperTagText}>
            {whisperFriend.nickname}에게 귓속말
          </Text>
          <Pressable onPress={() => setWhisperTarget(null)} hitSlop={8}>
            <Text style={styles.whisperTagClose}>✕</Text>
          </Pressable>
        </View>
      )}

      {/* 채팅 입력 */}
      <View style={styles.chatRow}>
        <TextInput
          ref={inputRef}
          style={{
            ...styles.chatInput,
            ...(whisperTarget ? { borderColor: colors.nintendoBlue } : {}),
          }}
          value={chatInput}
          onChangeText={setChatInput}
          placeholder={
            whisperFriend
              ? `${whisperFriend.nickname}에게 귓속말...`
              : '메시지 보내기...'
          }
          placeholderTextColor={
            whisperTarget ? colors.nintendoBlue : colors.muted
          }
          maxLength={50}
          returnKeyType="send"
          onSubmitEditing={handleSendChat}
          submitBehavior="submit"
        />
        <Pressable
          onPress={handleSendChat}
          style={({ pressed }) => ({
            ...styles.chatSendBtn,
            backgroundColor: chatInput.trim()
              ? whisperTarget
                ? colors.nintendoBlue
                : colors.accent
              : colors.muted,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={styles.chatSendText}>
            {whisperTarget ? '귓속말' : '전송'}
          </Text>
        </Pressable>
      </View>

      {/* 테스트 패널 (admin only) */}
      {isAdmin && (
        <View style={styles.debugPanel}>
          <Text style={styles.debugTitle}>관리자 테스트</Text>
          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>시간</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.debugChips}
            >
              {TIME_OPTIONS.map(t => (
                <Pressable
                  key={t}
                  onPress={() => setDebugTime(t)}
                  style={{
                    ...styles.debugChip,
                    backgroundColor:
                      debugTime === t ? colors.nintendoBlue : colors.cardBg,
                  }}
                >
                  <Text
                    style={{
                      ...styles.debugChipText,
                      color: debugTime === t ? colors.white : colors.muted,
                    }}
                  >
                    {TIME_LABELS[t]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <View style={styles.debugRow}>
            <Text style={styles.debugLabel}>날씨</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.debugChips}
            >
              {WEATHER_OPTIONS.map(w => (
                <Pressable
                  key={w}
                  onPress={() => setDebugWeather(w)}
                  style={{
                    ...styles.debugChip,
                    backgroundColor:
                      debugWeather === w ? colors.nintendoBlue : colors.cardBg,
                  }}
                >
                  <Text
                    style={{
                      ...styles.debugChipText,
                      color: debugWeather === w ? colors.white : colors.muted,
                    }}
                  >
                    {WEATHER_LABELS[w]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          marginTop: Spacing.md,
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 3,
          borderColor: colors.shadowColor,
          backgroundColor: colors.villageGrass,
        },
        viewport: {
          width: '100%',
          height: VILLAGE_VISIBLE_HEIGHT,
          overflow: 'hidden',
        },
        meWrap: {
          alignItems: 'center',
        },
        statusDot: {
          position: 'absolute',
          bottom: 0,
          right: -2,
          width: 10,
          height: 10,
          borderRadius: 5,
          borderWidth: 2,
          borderColor: colors.villageGrass,
        },
        myName: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.nintendoYellow,
          textAlign: 'center',
          marginTop: 2,
          textShadowColor: 'rgba(0,0,0,0.6)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
        },
        emptyText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.white,
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.4)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 2,
          lineHeight: 20,
        },
        // 내 캐릭터 채팅 말풍선
        meChatBubble: {
          backgroundColor: colors.cardBg,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: colors.nintendoYellow,
          paddingHorizontal: 6,
          paddingVertical: 3,
          maxWidth: 200,
          marginBottom: 4,
          alignItems: 'center',
        },
        meChatText: {
          fontFamily: Fonts.bold,
          fontSize: 9,
          color: colors.foreground,
          textAlign: 'center',
        },
        meChatTriangle: {
          position: 'absolute',
          bottom: -6,
          width: 0,
          height: 0,
          borderLeftWidth: 4,
          borderRightWidth: 4,
          borderTopWidth: 5,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: colors.nintendoYellow,
        },
        // 채팅 입력
        chatRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginTop: Spacing.sm,
          marginBottom: 16,
        },
        chatInput: {
          flex: 1,
          height: 36,
          backgroundColor: colors.cardBg,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: colors.border,
          paddingHorizontal: 10,
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.foreground,
        },
        chatSendBtn: {
          height: 36,
          paddingHorizontal: 14,
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
        },
        chatSendText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.white,
        },
        // 입장/퇴장 토스트
        presenceToast: {
          position: 'absolute',
          top: 8,
          alignSelf: 'center',
          zIndex: 50,
          backgroundColor: colors.cardBg,
          borderRadius: 8,
          borderWidth: 2,
          paddingHorizontal: 12,
          paddingVertical: 6,
        },
        presenceToastText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          textAlign: 'center',
        },
        noticeBanner: {
          marginTop: Spacing.sm,
          backgroundColor: colors.shadowColor,
          borderRadius: 10,
          paddingVertical: 8,
          paddingHorizontal: 14,
        },
        noticeBannerText: {
          fontFamily: Fonts.regular,
          fontSize: 10,
          color: colors.white,
          textAlign: 'center',
          lineHeight: 16,
        },
        // 귓속말
        whisperTag: {
          flexDirection: 'row',
          alignItems: 'center',
          alignSelf: 'flex-start',
          gap: 6,
          marginTop: Spacing.sm,
          backgroundColor: colors.nintendoBlue,
          borderRadius: 6,
          paddingHorizontal: 8,
          paddingVertical: 4,
        },
        whisperTagText: {
          fontFamily: Fonts.bold,
          fontSize: 10,
          color: colors.white,
        },
        whisperTagClose: {
          fontFamily: Fonts.bold,
          fontSize: 12,
          color: colors.white,
          opacity: 0.7,
        },
        whisperHint: {
          fontFamily: Fonts.bold,
          fontSize: 10,
          color: colors.muted,
          textAlign: 'center',
          marginTop: Spacing.sm,
        },
        whisperLabel: {
          fontFamily: Fonts.bold,
          fontSize: 7,
          color: colors.nintendoBlue,
          marginBottom: 1,
        },
        whisperToast: {
          position: 'absolute',
          bottom: 8,
          alignSelf: 'center',
          zIndex: 50,
          backgroundColor: colors.nintendoBlue,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 6,
          maxWidth: '80%',
        },
        whisperToastText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.white,
          textAlign: 'center',
        },
        // 접속 중 유저 리스트
        onlineRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: Spacing.sm,
          gap: Spacing.sm,
        },
        onlineLabel: {
          fontFamily: Fonts.bold,
          fontSize: 10,
          color: colors.muted,
        },
        onlineList: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
        },
        onlineItem: {
          alignItems: 'center',
          gap: 2,
        },
        onlineAvatarWrap: {
          position: 'relative',
        },
        onlineIndicator: {
          position: 'absolute',
          bottom: -1,
          right: -1,
          width: 8,
          height: 8,
          borderRadius: 4,
          borderWidth: 1.5,
          borderColor: colors.background,
        },
        onlineNickname: {
          fontFamily: Fonts.bold,
          fontSize: 9,
          color: colors.foreground,
          maxWidth: 44,
          textAlign: 'center',
        },
        // 테스트 패널
        debugPanel: {
          marginTop: Spacing.sm,
          backgroundColor: colors.cardBg,
          borderRadius: 10,
          padding: Spacing.sm,
          borderWidth: 2,
          borderColor: colors.border,
        },
        debugTitle: {
          fontFamily: Fonts.bold,
          fontSize: 10,
          color: colors.muted,
          marginBottom: 6,
        },
        debugRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          marginBottom: 4,
        },
        debugLabel: {
          fontFamily: Fonts.bold,
          fontSize: 10,
          color: colors.foreground,
          width: 28,
        },
        debugChips: {
          flexDirection: 'row',
          gap: 4,
        },
        debugChip: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          borderWidth: 1.5,
          borderColor: colors.border,
        },
        debugChipText: {
          fontFamily: Fonts.bold,
          fontSize: 10,
        },
      }),
    [colors],
  );
}
