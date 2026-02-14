import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import { FriendWithStatus } from '../shared/types';

import { useColors } from '../contexts/ThemeContext';
import type { ColorScheme } from '../theme/colors';
import { Fonts, FontSizes, Spacing } from '../theme';
import PixelAvatar from './PixelAvatar';
import NintendoCard from './NintendoCard';
import NintendoButton from './NintendoButton';

interface HeartbeatCardProps {
  friend: FriendWithStatus;
  onKnock: (knockId: string) => void;
  onPress: () => void;
  onKnockRequest: () => void;
}

function getHeartbeatInfo(
  lastCheckin: string | null,
  colors: ColorScheme,
): {
  icon: ImageSourcePropType;
  label: string;
  color: string;
} {
  if (!lastCheckin) {
    return {
      icon: require('../assets/icons/computer.png'),
      label: '소식 없음',
      color: colors.muted,
    };
  }

  const now = new Date();
  const checkinDate = new Date(lastCheckin);
  const hoursAgo = (now.getTime() - checkinDate.getTime()) / (1000 * 60 * 60);

  if (hoursAgo < 12) {
    return {
      icon: require('../assets/icons/fish.png'),
      label: '산책 중',
      color: colors.nintendoYellow,
    };
  } else if (hoursAgo < 24) {
    return {
      icon: require('../assets/icons/ball.png'),
      label: '오늘 봤어',
      color: colors.accent,
    };
  } else if (hoursAgo < 48) {
    return {
      icon: require('../assets/icons/computer.png'),
      label: '어제 왔었어',
      color: colors.nintendoGreen,
    };
  } else {
    const days = Math.floor(hoursAgo / 24);
    return {
      icon: require('../assets/icons/computer.png'),
      label: `${days}일째 안 보여`,
      color: colors.muted,
    };
  }
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
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

export default function HeartbeatCard({
  friend,
  onKnock,
  onPress,
  onKnockRequest,
}: HeartbeatCardProps) {
  const colors = useColors();
  const styles = useStyles(colors);
  const heartbeat = getHeartbeatInfo(friend.last_checkin, colors);
  const isInactive = !friend.last_checkin;

  const knockCooldown = useMemo(() => {
    if (!friend.my_last_knock_at) return null;
    const elapsed = Date.now() - new Date(friend.my_last_knock_at).getTime();
    const remaining = 4 * 60 * 60 * 1000 - elapsed;
    if (remaining <= 0) return null;
    const hours = Math.ceil(remaining / (1000 * 60 * 60));
    return `${hours}시간 후`;
  }, [friend.my_last_knock_at]);

  return (
    <Pressable onPress={onPress}>
      {({ pressed }) => (
        <NintendoCard
          style={{
            ...styles.card,
            ...(pressed
              ? {
                  transform: [{ translateY: 4 }],
                  shadowOffset: { width: 0, height: 0 },
                }
              : {}),
          }}
        >
          {/* 아바타 + 상태 */}
          <View style={styles.avatarWrap}>
            <PixelAvatar avatarData={friend.avatar_data} size={44} />
            <Image source={heartbeat.icon} style={styles.statusIcon} />
          </View>

          {/* 정보 */}
          <View style={styles.info}>
            <Text style={styles.nickname} numberOfLines={1}>
              {friend.nickname}
            </Text>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: heartbeat.color }]}>
                {heartbeat.label}
              </Text>
              {friend.last_checkin && (
                <Text style={styles.timeText}>
                  {formatTime(friend.last_checkin)}
                </Text>
              )}
            </View>
          </View>

          {/* 인사 버튼 */}
          <View onStartShouldSetResponder={() => true}>
            {!friend.allow_knocks ? (
              <NintendoButton
                title={friend.has_knock_request_sent ? '요청함' : '인사 요청'}
                variant={friend.has_knock_request_sent ? 'muted' : 'accent'}
                small
                onPress={onKnockRequest}
              />
            ) : (
              <NintendoButton
                title={knockCooldown ?? '인사하기'}
                variant={
                  knockCooldown ? 'muted' : isInactive ? 'accent' : 'yellow'
                }
                small
                onPress={() => onKnock('')}
              />
            )}
          </View>
        </NintendoCard>
      )}
    </Pressable>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        card: {
          padding: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
        },
        avatarWrap: {
          position: 'relative',
        },
        statusIcon: {
          width: 16,
          height: 16,
          position: 'absolute',
          bottom: -2,
          right: -2,
          resizeMode: 'contain',
        },
        info: {
          flex: 1,
          minWidth: 0,
        },
        nickname: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.foreground,
        },
        statusRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs + 2,
          marginTop: 2,
        },
        statusLabel: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
        },
        timeText: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.xs,
          color: colors.muted,
        },
      }),
    [colors],
  );
}
