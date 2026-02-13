import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Colors, Fonts, FontSizes, Spacing } from '../../theme';
import { useColors } from '../../contexts/ThemeContext';
import { KNOCK_ICONS } from '../../shared/constants';
import { getTimeAgo } from '../../shared/utils';
import NintendoCard from '../NintendoCard';
import NintendoButton from '../NintendoButton';
import PixelAvatar from '../PixelAvatar';
import type { AvatarData, UnseenKnock } from '../../shared/types';

interface FriendKnock {
  friend_id: string;
  nickname: string;
  avatar_data: AvatarData | null;
  unseen_knocks: number;
  unseen_knock_list: UnseenKnock[];
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
  const [expanded, setExpanded] = useState(true);

  const totalCount = friends.reduce((sum, f) => sum + f.unseen_knocks, 0);

  if (friends.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded(prev => !prev)}
      >
        <View style={styles.labelContainer}>
          <Text style={[styles.title, { color: colors.nintendoBlue }]}>
            인사가 왔어!
          </Text>
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={styles.badgeText}>{totalCount}</Text>
          </View>
        </View>
        <Text style={[styles.chevron, { color: colors.muted }]}>
          {expanded ? '접기' : '펼치기'}
        </Text>
      </Pressable>
      {expanded &&
        friends.map(f => (
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
                {f.unseen_knock_list.length > 0 ? (
                  <View style={styles.knockList}>
                    {f.unseen_knock_list.map((knock, i) => {
                      const knockIcon = knock.emoji
                        ? KNOCK_ICONS.find(k => k.id === knock.emoji)
                        : null;
                      return (
                        <View key={i} style={styles.labelRow}>
                          {knockIcon && (
                            <Image
                              source={knockIcon.icon}
                              style={styles.labelIcon}
                            />
                          )}
                          <Text
                            style={[styles.label, { color: colors.foreground }]}
                          >
                            {knockIcon ? knockIcon.label : '인사'}
                          </Text>
                          <Text style={[styles.time, { color: colors.muted }]}>
                            · {getTimeAgo(knock.created_at)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.labelRow}>
                    <Text style={[styles.label, { color: colors.muted }]}>
                      인사를 {f.unseen_knocks}번 보냈어
                    </Text>
                  </View>
                )}
              </View>
              <NintendoButton
                title="확인"
                variant="white"
                small
                onPress={() => onMarkSeen(f.friend_id)}
              />
            </View>
          </NintendoCard>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  chevron: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    marginLeft: 2,
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
  knockList: {
    gap: 2,
    marginTop: 2,
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
    resizeMode: 'contain',
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
