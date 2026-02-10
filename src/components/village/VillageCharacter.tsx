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
        {checkinLabel !== '' && (
          <Text style={styles.checkinLabel}>{checkinLabel}</Text>
        )}
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
      }),
    [colors],
  );
}
