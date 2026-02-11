import React, {useMemo, useEffect} from 'react';
import {Text, Pressable, StyleSheet, View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import PixelAvatar from '../PixelAvatar';
import {useColors} from '../../contexts/ThemeContext';
import type {ColorScheme} from '../../theme/colors';
import {Fonts, FontSizes} from '../../theme';
import type {AvatarData} from '../../shared/types';

interface VillageCharacterProps {
  avatarData: AvatarData | null;
  nickname: string;
  lastCheckin: string | null;
  targetX: number;
  targetY: number;
  size: number;
  isMe?: boolean;
  isOnline?: boolean;
  chatMessage?: string;
  isChatWhisper?: boolean;
  onPress?: () => void;
}

function formatTime(lastCheckin: string | null): string {
  if (!lastCheckin) return '';
  const date = new Date(lastCheckin);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return '방금 전';
  if (diffHours < 24) return `${diffHours}시간 전`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}일 전`;
  return date.toLocaleDateString('ko-KR', {month: 'short', day: 'numeric'});
}

export default function VillageCharacter({
  avatarData,
  nickname,
  lastCheckin,
  targetX,
  targetY,
  size,
  isMe = false,
  isOnline,
  chatMessage,
  isChatWhisper,
  onPress,
}: VillageCharacterProps) {
  const colors = useColors();
  const styles = useStyles(colors);

  const checkinLabel = formatTime(lastCheckin);
  const displayName =
    nickname.length > 5 ? nickname.slice(0, 5) + '..' : nickname;

  // Smooth position animation for realtime movement
  const posX = useSharedValue(targetX);
  const posY = useSharedValue(targetY);

  useEffect(() => {
    posX.value = withTiming(targetX, {duration: 150});
  }, [targetX, posX]);

  useEffect(() => {
    posY.value = withTiming(targetY, {duration: 150});
  }, [targetY, posY]);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: posX.value,
    top: posY.value,
  }));

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={onPress}
        style={({pressed}) => ({
          alignItems: 'center',
          transform: [{scale: pressed ? 0.9 : 1}],
        })}>
        <View>
          <PixelAvatar avatarData={avatarData} size={size} />
          {isOnline !== undefined && (
            <View
              style={{
                ...styles.onlineDot,
                backgroundColor: isOnline
                  ? colors.nintendoGreen
                  : colors.muted,
              }}
            />
          )}
        </View>
        <Text style={isMe ? styles.myName : styles.name}>{displayName}</Text>
        {/* 채팅 말풍선 — absolute로 캐릭터 위에 띄움 */}
        {chatMessage && (
          <View style={{
            ...styles.chatBubble,
            position: 'absolute',
            bottom: '100%',
            ...(isChatWhisper ? {borderColor: colors.nintendoBlue} : {}),
          }}>
            {isChatWhisper && (
              <Text style={styles.whisperLabel}>귓속말</Text>
            )}
            <Text style={styles.chatText} numberOfLines={2}>
              {chatMessage}
            </Text>
            <View style={{
              ...styles.chatTriangle,
              ...(isChatWhisper ? {borderTopColor: colors.nintendoBlue} : {}),
            }} />
          </View>
        )}
        {/* 체크인 시간 — absolute로 캐릭터 위에 띄움 */}
        {!chatMessage && checkinLabel !== '' && (
          <Text style={{...styles.checkinLabel, position: 'absolute', bottom: '100%'}}>
            {checkinLabel}
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        checkinLabel: {
          fontFamily: Fonts.bold,
          fontSize: 8,
          color: colors.white,
          textAlign: 'center' as const,
          textShadowColor: 'rgba(0,0,0,0.6)',
          textShadowOffset: {width: 1, height: 1},
          textShadowRadius: 2,
          marginBottom: 1,
        },
        name: {
          fontFamily: Fonts.bold,
          fontSize: 10,
          color: colors.white,
          textAlign: 'center',
          marginTop: 2,
          textShadowColor: 'rgba(0,0,0,0.6)',
          textShadowOffset: {width: 1, height: 1},
          textShadowRadius: 2,
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
        onlineDot: {
          position: 'absolute',
          bottom: 0,
          right: -2,
          width: 10,
          height: 10,
          borderRadius: 5,
          borderWidth: 2,
          borderColor: colors.villageGrass,
        },
        chatBubble: {
          backgroundColor: colors.cardBg,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: colors.cardBorder,
          paddingHorizontal: 6,
          paddingVertical: 3,
          maxWidth: 120,
          marginBottom: 4,
          alignItems: 'center',
        },
        chatText: {
          fontFamily: Fonts.bold,
          fontSize: 9,
          color: colors.foreground,
          textAlign: 'center',
        },
        chatTriangle: {
          position: 'absolute',
          bottom: -6,
          width: 0,
          height: 0,
          borderLeftWidth: 4,
          borderRightWidth: 4,
          borderTopWidth: 5,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: colors.cardBorder,
        },
        whisperLabel: {
          fontFamily: Fonts.bold,
          fontSize: 7,
          color: colors.nintendoBlue,
          marginBottom: 1,
        },
      }),
    [colors],
  );
}
