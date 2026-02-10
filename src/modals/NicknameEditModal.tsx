import React, {useState, useMemo} from 'react';
import {View, Text, TextInput, StyleSheet, Pressable, Image} from 'react-native';
import {Fonts, FontSizes, Spacing} from '../theme';
import {useColors} from '../contexts/ThemeContext';
import type {ColorScheme} from '../theme/colors';
import NintendoButton from '../components/NintendoButton';

interface NicknameEditModalProps {
  currentNickname: string;
  onSave: (nickname: string) => Promise<void>;
  onClose: () => void;
}

export default function NicknameEditModal({
  currentNickname,
  onSave,
  onClose,
}: NicknameEditModalProps) {
  const colors = useColors();
  const styles = useStyles(colors);
  const [nickname, setNickname] = useState(currentNickname);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!nickname.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onSave(nickname.trim());
      onClose();
    } catch {
      setError('이름 변경에 실패했어. 다시 해볼래?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
        <View style={styles.titleRow}>
          <Image
            source={require('../assets/icons/star.png')}
            style={styles.titleIcon}
          />
          <Text style={styles.title}>이름 변경</Text>
        </View>

        <TextInput
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          placeholder="새로운 이름"
          placeholderTextColor={colors.muted}
          maxLength={20}
        />
        <Text style={styles.hint}>마을에서 이웃들이 부를 이름이야</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.btnRow}>
          <NintendoButton
            title="취소"
            variant="muted"
            onPress={onClose}
            style={styles.flex1}
          />
          <NintendoButton
            title={loading ? '...' : '변경'}
            variant="accent"
            onPress={handleSave}
            disabled={loading || !nickname.trim()}
            style={styles.flex1}
          />
        </View>
      </Pressable>
    </Pressable>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        overlay: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 200,
          padding: Spacing.lg,
        },
        card: {
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          borderWidth: 3,
          borderColor: colors.border,
          padding: Spacing.xl,
          width: '100%',
          maxWidth: 320,
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          marginBottom: Spacing.lg,
        },
        titleIcon: {width: 24, height: 24},
        title: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.foreground,
        },
        input: {
          borderWidth: 3,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm + 2,
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.foreground,
          backgroundColor: colors.background,
          marginBottom: Spacing.xs,
        },
        hint: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.muted,
          marginBottom: Spacing.lg,
          paddingHorizontal: 4,
        },
        error: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.accent,
          marginBottom: Spacing.md,
        },
        btnRow: {
          flexDirection: 'row',
          gap: Spacing.md,
        },
        flex1: {flex: 1},
      }),
    [colors],
  );
}
