import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  Share,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {Fonts, FontSizes, Spacing} from '../theme';
import {useColors} from '../contexts/ThemeContext';
import type {ColorScheme} from '../theme/colors';
import NintendoButton from '../components/NintendoButton';
import NintendoCard from '../components/NintendoCard';

interface InviteModalProps {
  myInviteCode: string;
  onAddFriend: (code: string) => Promise<{error: string | null}>;
  onClose: () => void;
}

export default function InviteModal({
  myInviteCode,
  onAddFriend,
  onClose,
}: InviteModalProps) {
  const colors = useColors();
  const styles = useStyles(colors);
  const [friendCode, setFriendCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const inviteLink = `https://sooop-hi.vercel.app/invite/${myInviteCode}`;

  const handleCopy = () => {
    Clipboard.setString(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `우리 마을에 놀러 와! 이 링크로 바로 이웃이 될 수 있어.\n${inviteLink}`,
      });
    } catch {}
  };

  const handleAdd = async () => {
    if (!friendCode.trim()) return;
    setError('');
    setLoading(true);
    const result = await onAddFriend(friendCode.trim());
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
    setLoading(false);
  };

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
        <View style={styles.titleRow}>
          <Image
            source={require('../assets/icons/flag.png')}
            style={styles.titleIcon}
          />
          <Text style={styles.title}>이웃 초대</Text>
        </View>

        {/* 초대 링크 */}
        <Text style={styles.label}>내 초대장</Text>
        <NintendoCard style={styles.codeBox}>
          <Text style={styles.codeText}>{inviteLink}</Text>
        </NintendoCard>
        <View style={styles.btnRow}>
          <NintendoButton
            title={copied ? '복사했어!' : '복사하기'}
            variant="blue"
            onPress={handleCopy}
            style={styles.flex1}
          />
          <NintendoButton
            title="공유하기"
            variant="accent"
            onPress={handleShare}
            style={styles.flex1}
          />
        </View>
        <Text style={styles.hint}>이 초대장을 보내면 바로 이웃이 돼</Text>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 코드 입력 */}
        <Text style={styles.label}>이웃 초대 코드 입력</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="코드 입력"
            placeholderTextColor={colors.muted}
            value={friendCode}
            onChangeText={t => setFriendCode(t.toUpperCase())}
            maxLength={6}
            autoCapitalize="characters"
          />
          <NintendoButton
            title={loading ? '...' : '연결'}
            variant="accent"
            small
            onPress={handleAdd}
            disabled={loading || !friendCode.trim()}
          />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>닫기</Text>
        </Pressable>
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
          maxWidth: 360,
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          marginBottom: Spacing.xl,
        },
        titleIcon: {width: 24, height: 24},
        title: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.foreground,
        },
        label: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
          marginBottom: Spacing.sm,
        },
        codeBox: {
          padding: Spacing.md,
          alignItems: 'center',
          marginBottom: Spacing.sm,
        },
        codeText: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.accent,
        },
        btnRow: {
          flexDirection: 'row',
          gap: Spacing.sm,
          marginBottom: Spacing.xs,
        },
        flex1: {flex: 1},
        hint: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.muted,
          marginTop: Spacing.sm,
        },
        divider: {
          height: 2,
          backgroundColor: colors.border,
          marginVertical: Spacing.xl,
        },
        inputRow: {
          flexDirection: 'row',
          gap: Spacing.sm,
          alignItems: 'center',
        },
        input: {
          flex: 1,
          borderWidth: 3,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.foreground,
          backgroundColor: colors.background,
          textAlign: 'center',
          letterSpacing: 4,
        },
        error: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.accent,
          marginTop: Spacing.sm,
        },
        closeBtn: {
          alignItems: 'center',
          marginTop: Spacing.lg,
          paddingVertical: Spacing.sm,
        },
        closeBtnText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
        },
      }),
    [colors],
  );
}
