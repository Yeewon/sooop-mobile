import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {Fonts, FontSizes, Spacing} from '../../theme';
import {useColors} from '../../contexts/ThemeContext';
import NintendoCard from '../NintendoCard';
import NintendoButton from '../NintendoButton';
import PixelAvatar from '../PixelAvatar';
import type {AvatarData} from '../../shared/types';

interface KnockRequest {
  from_user_id: string;
  nickname: string;
  avatar_data: AvatarData | null;
}

interface KnockRequestCardProps {
  requests: KnockRequest[];
  onDismiss: (userId: string) => void;
  onAccept: (userId: string) => void;
}

export default function KnockRequestCard({
  requests,
  onDismiss,
  onAccept,
}: KnockRequestCardProps) {
  const colors = useColors();

  if (requests.length === 0) {
    return null;
  }

  return (
    <NintendoCard
      style={[styles.card, {backgroundColor: colors.knockReqBg}]}>
      <View style={styles.header}>
        <Image
          source={require('../../assets/icons/mail.png')}
          style={styles.icon}
        />
        <Text style={[styles.title, {color: colors.nintendoBlue}]}>
          인사 요청이 왔어!
        </Text>
      </View>
      {requests.map(req => (
        <View key={req.from_user_id} style={styles.row}>
          <PixelAvatar avatarData={req.avatar_data} size={28} />
          <Text
            style={[styles.nickname, {color: colors.foreground}]}
            numberOfLines={1}>
            {req.nickname}
          </Text>
          <NintendoButton
            title="괜찮아"
            variant="muted"
            small
            onPress={() => onDismiss(req.from_user_id)}
          />
          <NintendoButton
            title="수락"
            variant="accent"
            small
            onPress={() => onAccept(req.from_user_id)}
          />
        </View>
      ))}
    </NintendoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  icon: {
    width: 16,
    height: 16,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  nickname: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
  },
});