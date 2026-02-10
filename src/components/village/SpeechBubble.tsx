import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '../../contexts/ThemeContext';
import type { ColorScheme } from '../../theme/colors';
import { Fonts, FontSizes } from '../../theme';
import type { FriendWithStatus } from '../../shared/types';
import { CHARACTER_SIZE } from './villageConstants';

interface SpeechBubbleProps {
  friend: FriendWithStatus;
  x: number;
  y: number;
  onKnock: () => void;
  onClose: () => void;
}

function getTimeAgo(dateStr: string | null): string {
  if (!dateStr) return '기록 없음';
  const hours = (Date.now() - new Date(dateStr).getTime()) / 3600000;
  if (hours < 1) return '방금 전';
  if (hours < 24) return `${Math.floor(hours)}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

const BUBBLE_WIDTH = 130;
const BUBBLE_HEIGHT_APPROX = 85;

export default function SpeechBubble({
  friend,
  x,
  y,
  onKnock,
  onClose,
}: SpeechBubbleProps) {
  const colors = useColors();
  const styles = useStyles(colors);

  const bubbleX = x + CHARACTER_SIZE / 2 - BUBBLE_WIDTH / 2;
  const bubbleY = y - BUBBLE_HEIGHT_APPROX - 8;

  return (
    <View
      style={{
        position: 'absolute',
        left: bubbleX,
        top: bubbleY,
        width: BUBBLE_WIDTH,
        zIndex: 100,
      }}
    >
      <View style={styles.bubble} onStartShouldSetResponder={() => true}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {friend.nickname}
          </Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Text style={styles.closeBtn}>✕</Text>
          </Pressable>
        </View>
        <Text style={styles.time}>{getTimeAgo(friend.last_checkin)}</Text>
        <Pressable
          style={({ pressed }) => ({
            ...styles.knockBtn,
            opacity: pressed ? 0.7 : 1,
          })}
          onPress={onKnock}
        >
          <Text style={styles.knockText}>인사 보내기</Text>
        </Pressable>
      </View>
      {/* Triangle pointer */}
      <View style={styles.triangleWrap}>
        <View style={styles.triangle} />
      </View>
    </View>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        bubble: {
          backgroundColor: colors.cardBg,
          borderRadius: 10,
          padding: 8,
          borderWidth: 2,
          borderColor: colors.cardBorder,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
        },
        name: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.foreground,
          flex: 1,
        },
        closeBtn: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
          paddingLeft: 6,
        },
        time: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.xs,
          color: colors.muted,
          marginBottom: 6,
        },
        knockBtn: {
          backgroundColor: colors.accent,
          borderRadius: 6,
          paddingVertical: 5,
          paddingHorizontal: 10,
          alignItems: 'center',
        },
        knockText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.white,
        },
        triangleWrap: {
          alignItems: 'center',
        },
        triangle: {
          width: 0,
          height: 0,
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderTopWidth: 8,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderTopColor: colors.cardBorder,
        },
      }),
    [colors],
  );
}
