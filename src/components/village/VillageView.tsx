import React, {useMemo, useRef, useCallback, useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {useColors} from '../../contexts/ThemeContext';
import type {ColorScheme} from '../../theme/colors';
import {Fonts, FontSizes, Spacing} from '../../theme';
import type {FriendWithStatus, AvatarData} from '../../shared/types';
import {
  VILLAGE_WIDTH,
  VILLAGE_VISIBLE_HEIGHT,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  MY_CHARACTER_SIZE,
} from './villageConstants';
import {useVillagePositions} from './useVillagePositions';
import {useVillageRealtime} from './useVillageRealtime';
import VillageCharacter from './VillageCharacter';
import VillageBackground from './VillageBackground';
import SpeechBubble from './SpeechBubble';
import PixelAvatar from '../PixelAvatar';
import DPad from './DPad';

const MOVE_STEP = 4;
const MOVE_MARGIN = 20;

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

interface VillageViewProps {
  friends: FriendWithStatus[];
  myAvatar: AvatarData | null;
  myNickname: string;
  myUserId: string | undefined;
  onFriendPress: (friend: FriendWithStatus) => void;
}

export default function VillageView({
  friends,
  myAvatar,
  myNickname,
  myUserId,
  onFriendPress,
}: VillageViewProps) {
  const colors = useColors();
  const styles = useStyles(colors);
  const positions = useVillagePositions(friends);

  // Realtime multiplayer
  const {onlineUsers, livePositions, broadcastPosition} =
    useVillageRealtime({
      userId: myUserId,
      enabled: true,
    });

  // "me" position in world space
  const centerX = WORLD_WIDTH / 2 - MY_CHARACTER_SIZE / 2;
  const centerY = WORLD_HEIGHT / 2 - MY_CHARACTER_SIZE / 2;
  const myX = useSharedValue(centerX);
  const myY = useSharedValue(centerY);

  // Camera offset (world → viewport transform)
  const cameraX = useSharedValue(
    -clamp(centerX - VILLAGE_WIDTH / 2 + MY_CHARACTER_SIZE / 2, 0, WORLD_WIDTH - VILLAGE_WIDTH),
  );
  const cameraY = useSharedValue(
    -clamp(centerY - VILLAGE_VISIBLE_HEIGHT / 2 + MY_CHARACTER_SIZE / 2, 0, WORLD_HEIGHT - VILLAGE_VISIBLE_HEIGHT),
  );

  const moveRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const handleMoveStart = useCallback(
    (dx: number, dy: number) => {
      if (moveRef.current) {
        clearInterval(moveRef.current);
      }
      // Dismiss speech bubble on movement
      setSelectedFriend(null);

      const move = () => {
        myX.value = clamp(myX.value + dx * MOVE_STEP, MOVE_MARGIN, maxX);
        myY.value = clamp(myY.value + dy * MOVE_STEP, MOVE_MARGIN, maxY);
        // Camera follows "me" (centered)
        cameraX.value = clamp(
          -(myX.value - VILLAGE_WIDTH / 2 + MY_CHARACTER_SIZE / 2),
          minCamX,
          0,
        );
        cameraY.value = clamp(
          -(myY.value - VILLAGE_VISIBLE_HEIGHT / 2 + MY_CHARACTER_SIZE / 2),
          minCamY,
          0,
        );
        // Broadcast position to other players
        broadcastPosition(myX.value, myY.value);
      };
      move();
      moveRef.current = setInterval(move, 16);
    },
    [myX, myY, cameraX, cameraY, maxX, maxY, minCamX, minCamY, broadcastPosition],
  );

  const handleMoveEnd = useCallback(() => {
    if (moveRef.current) {
      clearInterval(moveRef.current);
      moveRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (moveRef.current) {
        clearInterval(moveRef.current);
      }
    };
  }, []);

  // Animated styles
  const worldStyle = useAnimatedStyle(() => ({
    width: WORLD_WIDTH,
    height: WORLD_HEIGHT,
    transform: [
      {translateX: cameraX.value},
      {translateY: cameraY.value},
    ],
  }));

  const meAnimStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: myX.value,
    top: myY.value,
    zIndex: 10,
  }));

  const myDisplayName =
    myNickname.length > 5 ? myNickname.slice(0, 5) + '..' : myNickname;

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
      setSelectedFriend(prev =>
        prev?.friend.friend_id === friend.friend_id
          ? null
          : {friend, x: pos.x, y: pos.y},
      );
    },
    [getEffectivePosition],
  );

  const handleKnock = useCallback(() => {
    if (selectedFriend) {
      onFriendPress(selectedFriend.friend);
      setSelectedFriend(null);
    }
  }, [selectedFriend, onFriendPress]);

  return (
    <View>
      <View style={styles.container}>
        {/* Viewport clips the world */}
        <View style={styles.viewport}>
          <Animated.View style={worldStyle}>
            {/* 잔디 배경 */}
            <View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: colors.villageGrass,
              }}
            />

            {/* 장식 (나무/꽃/돌) */}
            <VillageBackground />

            {/* 내 캐릭터 */}
            <Animated.View style={meAnimStyle}>
              <View style={styles.meWrap}>
                <View>
                  <PixelAvatar
                    avatarData={myAvatar}
                    size={MY_CHARACTER_SIZE}
                  />
                  <View
                    style={{
                      ...styles.statusDot,
                      backgroundColor: colors.nintendoGreen,
                    }}
                  />
                </View>
                <Text style={styles.myName}>{myDisplayName}</Text>
              </View>
            </Animated.View>

            {/* 친구 캐릭터 (온라인만 표시) */}
            {friends
              .filter(f => onlineUsers.has(f.friend_id))
              .map(friend => {
                const pos = getEffectivePosition(friend.friend_id);
                if (!pos) return null;
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
                }}>
                <Text style={styles.emptyText}>
                  아직 이웃이 없어{'\n'}초대장을 보내서 마을을 채워봐!
                </Text>
              </View>
            )}
          </Animated.View>
        </View>
      </View>

      {/* D-Pad 컨트롤러 */}
      <DPad onMoveStart={handleMoveStart} onMoveEnd={handleMoveEnd} />
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
          textShadowOffset: {width: 1, height: 1},
          textShadowRadius: 2,
        },
        emptyText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.white,
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.4)',
          textShadowOffset: {width: 1, height: 1},
          textShadowRadius: 2,
          lineHeight: 20,
        },
      }),
    [colors],
  );
}
