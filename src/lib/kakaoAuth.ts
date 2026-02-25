import {login as kakaoLogin} from '@react-native-seoul/kakao-login';
import {supabase} from './supabase';

export async function signInWithKakao() {
  const result = await kakaoLogin();

  if (!result.idToken) {
    throw new Error('카카오 인증에 실패했어. 다시 시도해줘');
  }

  const {data, error} = await supabase.auth.signInWithIdToken({
    provider: 'kakao',
    token: result.idToken,
  });

  if (error) throw error;
  return data;
}
