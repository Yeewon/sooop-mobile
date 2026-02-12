import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Fonts, FontSizes, Spacing } from '../../theme';
import { useColors } from '../../contexts/ThemeContext';
import { KNOCK_ICONS } from '../../shared/constants';
import { getTimeAgo } from '../../shared/utils';
import NintendoCard from '../NintendoCard';
import NintendoButton from '../NintendoButton';
import PixelAvatar from '../PixelAvatar';
import type { AvatarData } from '../../shared/types';

interface FriendKnock {
  friend_id: string;
  nickname: string;
  avatar_data: AvatarData | null;
  unseen_knocks: number;
  last_knock_emoji: string | null;
  last_knock_at: string | null;
}

interface KnockNotificationListProps {
  friends: FriendKnock[];
  onMarkSeen: (friendId: string) => void;
}

export default function KnockNotificationList({
  friends,
  onMarkSeen,
}: KnockNotificationListProps) {
  const colors = useColors();

  if (friends.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.nintendoBlue }]}>
          인사가 왔어!
        </Text>
      </View>
      {friends.map(f => {
        const knockIcon = f.last_knock_emoji
          ? KNOCK_ICONS.find(k => k.id === f.last_knock_emoji)
          : null;
        return (
          <NintendoCard key={f.friend_id} style={styles.card}>
            <View style={styles.row}>
              <PixelAvatar avatarData={f.avatar_data} size={28} />
              <View style={styles.info}>
                <Text
                  style={[styles.nickname, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {f.nickname}
                </Text>
                <View style={styles.labelRow}>
                  {knockIcon && (
                    <Image source={knockIcon.icon} style={styles.labelIcon} />
                  )}
                  <Text style={[styles.label, { color: colors.muted }]}>
                    {knockIcon
                      ? knockIcon.label
                      : `인사를 ${f.unseen_knocks}번 보냈어`}
                  </Text>
                  <Text style={[styles.time, { color: colors.foreground }]}>
                    · {getTimeAgo(f.last_knock_at)}
                  </Text>
                </View>
              </View>
              <NintendoButton
                title="확인"
                variant="muted"
                small
                onPress={() => onMarkSeen(f.friend_id)}
              />
            </View>
          </NintendoCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
  },
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  nickname: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    color: Colors.white,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  labelIcon: {
    width: 14,
    height: 14,
  },
  label: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: Colors.white,
  },
  time: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    marginLeft: 4,
  },
});
