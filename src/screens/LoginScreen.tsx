import React, {useState, useEffect, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useColors} from '../contexts/ThemeContext';
import type {ColorScheme} from '../theme/colors';
import {Fonts, FontSizes, Spacing} from '../theme';
import NintendoButton from '../components/NintendoButton';
import NintendoInput from '../components/NintendoInput';
import NintendoCard from '../components/NintendoCard';
import {useAuthContext} from '../contexts/AuthContext';
import {supabase} from '../lib/supabase';

function toKoreanError(message: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': '이메일이나 비밀번호가 다른 것 같아',
    'Email not confirmed': '아직 이메일 인증이 안 됐어',
    'User already registered': '이미 입주한 주민이야. 로그인해줘!',
    already_registered: '이미 입주한 주민이야. 로그인해줘!',
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

export default function LoginScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviterName, setInviterName] = useState<string | null>(null);
  const {signIn} = useAuthContext();
  const colors = useColors();
  const styles = useStyles(colors);

  useEffect(() => {
    const checkPendingInvite = async () => {
      const code = await AsyncStorage.getItem('sooop_pending_invite_code');
      if (!code) return;
      const {data} = await supabase
        .from('profiles')
        .select('nickname')
        .eq('invite_code', code)
        .single();
      if (data?.nickname) {
        setInviterName(data.nickname);
      }
    };
    checkPendingInvite();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해줘');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(toKoreanError(err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.logoBox}>
          <NintendoCard style={styles.logoCard}>
            <Image
              source={require('../assets/icons/tree.png')}
              style={styles.logoIcon}
            />
          </NintendoCard>
          {inviterName ? (
            <>
              <Text style={styles.inviteTitle}>
                {inviterName}님이 마을로 초대했어!
              </Text>
              <Text style={styles.subtitle}>
                같이 이웃이 되자
              </Text>
            </>
          ) : (
            <Text style={styles.subtitle}>
              우리 마을의 작은{'\n'}안부 게시판
            </Text>
          )}
        </View>

        <NintendoCard style={styles.formCard}>
          <NintendoInput
            placeholder="이메일"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            autoComplete="email"
          />
          <View style={styles.passwordWrap}>
            <NintendoInput
              placeholder="비밀번호"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
              autoComplete="password"
              style={styles.passwordInput}
            />
            <Pressable
              onPress={() => setShowPassword(prev => !prev)}
              style={styles.eyeBtn}>
              <Text style={styles.eyeText}>
                {showPassword ? '숨김' : '보기'}
              </Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <NintendoButton
            title={loading ? '...' : '마을 들어가기'}
            onPress={handleLogin}
            disabled={loading}
            style={styles.submitButton}
          />
        </NintendoCard>

        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.switchText}>처음 왔어? 입주 신청</Text>
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
          justifyContent: 'center',
          padding: Spacing['2xl'],
        },
        logoBox: {
          alignItems: 'center',
          marginBottom: Spacing['3xl'],
        },
        logoCard: {
          paddingHorizontal: Spacing['2xl'],
          paddingVertical: Spacing.xl,
          alignItems: 'center',
          marginBottom: Spacing.lg,
        },
        logoIcon: {
          width: 56,
          height: 56,
        },
        subtitle: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
          textAlign: 'center',
          lineHeight: 22,
        },
        inviteTitle: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.foreground,
          textAlign: 'center',
          marginBottom: 4,
        },
        formCard: {
          padding: Spacing.xl,
          gap: Spacing.md,
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
        },
      }),
    [colors],
  );
}
