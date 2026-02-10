import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useColors } from '../contexts/ThemeContext';
import type { ColorScheme } from '../theme/colors';
import { Fonts, FontSizes, Spacing } from '../theme';
import NintendoButton from '../components/NintendoButton';
import NintendoInput from '../components/NintendoInput';
import NintendoCard from '../components/NintendoCard';
import PixelAvatar from '../components/PixelAvatar';
import { useAuthContext } from '../contexts/AuthContext';
import { AvatarData } from '../shared/types';
import {
  SKIN_COLORS,
  HAIR_COLORS,
  CLOTHES_COLORS,
  DEFAULT_AVATAR,
  HAIR_STYLES,
  EYE_STYLES,
  MOUTH_STYLES,
  CLOTHES_STYLES,
} from '../shared/avatar-parts';

function toKoreanError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': '이메일이나 비밀번호가 다른 것 같아',
    already_registered: '이미 입주한 주민이야. 로그인해줘!',
    'User already registered': '이미 입주한 주민이야. 로그인해줘!',
    'Password should be at least 6 characters':
      '비밀번호는 6자 이상으로 정해줘',
    'Unable to validate email address: invalid format':
      '이메일 형식을 다시 확인해줘',
    'Signup requires a valid password': '비밀번호를 적어줘',
    'To signup, please provide your email': '이메일을 적어줘',
    'Email rate limit exceeded': '너무 자주 시도했어. 잠깐 쉬었다 와',
    'Request rate limit reached': '너무 자주 시도했어. 잠깐 쉬었다 와',
  };
  for (const [key, val] of Object.entries(map)) {
    if (message.includes(key)) return val;
  }
  return '뭔가 잘못됐어. 다시 해볼래?';
}

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<AvatarData>(DEFAULT_AVATAR);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuthContext();
  const colors = useColors();
  const styles = useStyles(colors);

  const cycleOption = (
    key: 'hair' | 'eyes' | 'mouth' | 'clothes',
    max: number,
    dir: number,
  ) => {
    setAvatar(prev => ({
      ...prev,
      [key]: (prev[key] + dir + max) % max,
    }));
  };

  const handleSignUp = async () => {
    if (!nickname.trim()) {
      setError('마을에서 부를 이름을 적어줘');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않아');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signUp(email, password, nickname, avatar);
      navigation.navigate('EmailConfirm');
    } catch (err: any) {
      setError(toKoreanError(err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>입주 신청</Text>
        <Text style={styles.subtitle}>마을에 살 캐릭터를 만들어봐</Text>

        {/* 아바타 미리보기 */}
        <NintendoCard style={styles.avatarCard}>
          <View style={styles.avatarPreview}>
            <PixelAvatar avatarData={avatar} size={80} />
          </View>

          {/* 간단한 커스터마이징 */}
          <View style={styles.optionRow}>
            <Pressable
              onPress={() => cycleOption('hair', HAIR_STYLES.length, -1)}
            >
              <Text style={styles.arrow}>◀</Text>
            </Pressable>
            <Text style={styles.optionLabel}>머리</Text>
            <Pressable
              onPress={() => cycleOption('hair', HAIR_STYLES.length, 1)}
            >
              <Text style={styles.arrow}>▶</Text>
            </Pressable>
          </View>
          <View style={styles.optionRow}>
            <Pressable
              onPress={() => cycleOption('eyes', EYE_STYLES.length, -1)}
            >
              <Text style={styles.arrow}>◀</Text>
            </Pressable>
            <Text style={styles.optionLabel}>눈</Text>
            <Pressable
              onPress={() => cycleOption('eyes', EYE_STYLES.length, 1)}
            >
              <Text style={styles.arrow}>▶</Text>
            </Pressable>
          </View>
          <View style={styles.optionRow}>
            <Pressable
              onPress={() => cycleOption('mouth', MOUTH_STYLES.length, -1)}
            >
              <Text style={styles.arrow}>◀</Text>
            </Pressable>
            <Text style={styles.optionLabel}>입</Text>
            <Pressable
              onPress={() => cycleOption('mouth', MOUTH_STYLES.length, 1)}
            >
              <Text style={styles.arrow}>▶</Text>
            </Pressable>
          </View>
          <View style={styles.optionRow}>
            <Pressable
              onPress={() => cycleOption('clothes', CLOTHES_STYLES.length, -1)}
            >
              <Text style={styles.arrow}>◀</Text>
            </Pressable>
            <Text style={styles.optionLabel}>옷</Text>
            <Pressable
              onPress={() => cycleOption('clothes', CLOTHES_STYLES.length, 1)}
            >
              <Text style={styles.arrow}>▶</Text>
            </Pressable>
          </View>

          {/* 색상 선택 */}
          <View style={styles.colorSection}>
            <Text style={styles.colorLabel}>피부</Text>
            <View style={styles.colorRow}>
              {SKIN_COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setAvatar(prev => ({ ...prev, skinColor: c }))}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    avatar.skinColor === c && styles.colorDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
          <View style={styles.colorSection}>
            <Text style={styles.colorLabel}>머리색</Text>
            <View style={styles.colorRow}>
              {HAIR_COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setAvatar(prev => ({ ...prev, hairColor: c }))}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    avatar.hairColor === c && styles.colorDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
          <View style={styles.colorSection}>
            <Text style={styles.colorLabel}>옷 색</Text>
            <View style={styles.colorRow}>
              {CLOTHES_COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() =>
                    setAvatar(prev => ({ ...prev, clothesColor: c }))
                  }
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    avatar.clothesColor === c && styles.colorDotActive,
                  ]}
                />
              ))}
            </View>
          </View>
        </NintendoCard>

        {/* 입력 폼 */}
        <NintendoCard style={styles.formCard}>
          <View>
            <NintendoInput
              placeholder="마을에서 부를 이름"
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
            />
            <Text style={styles.inputHint}>
              친구들이 알아볼 수 있는 이름으로 정해줘
            </Text>
          </View>
          <NintendoInput
            placeholder="이메일"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordWrap}>
            <NintendoInput
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="newPassword"
              autoComplete="new-password"
              style={styles.passwordInput}
            />
            <Pressable
              onPress={() => setShowPassword(prev => !prev)}
              style={styles.eyeBtn}
            >
              <Text style={styles.eyeText}>
                {showPassword ? '숨김' : '보기'}
              </Text>
            </Pressable>
          </View>
          <NintendoInput
            placeholder="비밀번호 확인"
            value={passwordConfirm}
            onChangeText={setPasswordConfirm}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            autoComplete="new-password"
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <NintendoButton
            title={loading ? '...' : '입주하기'}
            onPress={handleSignUp}
            disabled={loading}
            style={styles.submitButton}
          />
        </NintendoCard>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.switchText}>이미 마을 주민이야? 로그인</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        scrollContent: {
          flexGrow: 1,
          padding: Spacing['2xl'],
          paddingTop: 60,
        },
        title: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xl,
          color: colors.foreground,
          textAlign: 'center',
        },
        subtitle: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.muted,
          textAlign: 'center',
          marginTop: Spacing.xs,
          marginBottom: Spacing.xl,
        },
        avatarCard: {
          padding: Spacing.lg,
          marginBottom: Spacing.lg,
        },
        avatarPreview: {
          alignItems: 'center',
          marginBottom: Spacing.md,
        },
        optionRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.lg,
          marginVertical: 4,
        },
        arrow: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.muted,
          padding: Spacing.sm,
        },
        optionLabel: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.foreground,
          width: 40,
          textAlign: 'center',
        },
        colorSection: {
          marginTop: Spacing.sm,
        },
        colorLabel: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.muted,
          marginBottom: 4,
        },
        colorRow: {
          flexDirection: 'row',
          gap: Spacing.sm,
        },
        colorDot: {
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: 'transparent',
        },
        colorDotActive: {
          borderColor: colors.foreground,
        },
        formCard: {
          padding: Spacing.xl,
          gap: Spacing.md,
        },
        inputHint: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.muted,
          marginTop: Spacing.xs,
          paddingHorizontal: 4,
        },
        passwordWrap: {
          position: 'relative',
        },
        passwordInput: {
          paddingRight: 56,
        },
        eyeBtn: {
          position: 'absolute',
          right: 12,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
        },
        eyeText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.muted,
        },
        errorText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.accent,
          textAlign: 'center',
        },
        submitButton: {
          marginTop: Spacing.sm,
        },
        switchText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
          textAlign: 'center',
          marginTop: Spacing.xl,
          marginBottom: Spacing['3xl'],
        },
      }),
    [colors],
  );
}
