import React from 'react';
import {View, Text, Image, Pressable, StyleSheet} from 'react-native';
import {Fonts, FontSizes, Spacing} from '../../theme';
import {useColors} from '../../contexts/ThemeContext';
import type {ColorScheme} from '../../theme/colors';
import {KNOCK_ICONS} from '../../shared/constants';

interface KnockPickerModalProps {
  visible: boolean;
  friendName: string;
  onSelect: (emojiId: string) => void;
  onClose: () => void;
}

export default function KnockPickerModal({
  visible,
  friendName,
  onSelect,
  onClose,
}: KnockPickerModalProps) {
  const colors = useColors();
  const styles = useStyles(colors);

  if (!visible) {
    return null;
  }

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
        <Text style={styles.title}>{friendName}에게 어떤 인사?</Text>
        <View style={styles.grid}>
          {KNOCK_ICONS.map(item => (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={({pressed}) => [
                styles.item,
                pressed && {
                  transform: [{translateY: 3}],
                  shadowOffset: {width: 0, height: 0},
                },
              ]}>
              <Image source={item.icon} style={styles.icon} />
              <Text style={styles.label}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Pressable>
  );
}

function useStyles(colors: ColorScheme) {
  return StyleSheet.create({
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
    card: {
      backgroundColor: colors.cardBg,
      borderRadius: 16,
      borderWidth: 3,
      borderColor: colors.border,
      padding: Spacing.lg,
      width: '100%',
      maxWidth: 320,
    },
    title: {
      fontFamily: Fonts.bold,
      fontSize: FontSizes.xs,
      color: colors.muted,
      textAlign: 'center',
      marginBottom: Spacing.md,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    item: {
      width: '30%',
      alignItems: 'center',
      paddingVertical: Spacing.sm + 2,
      backgroundColor: colors.background,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      gap: 6,
    },
    icon: {
      width: 28,
      height: 28,
      resizeMode: 'contain',
    },
    label: {
      fontFamily: Fonts.bold,
      fontSize: 10,
      color: colors.muted,
    },
  });
}