import {useEffect, useRef} from 'react';
import {Platform, AppState} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {supabase} from '../lib/supabase';

export function useNotifications(userId: string | undefined) {
  const tokenSaved = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const setup = async () => {
      // 권한 요청
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) return;

      // FCM 토큰 가져오기
      const token = await messaging().getToken();
      console.log('[FCM] Token:', token);
      if (token && !tokenSaved.current) {
        await saveToken(userId, token);
        tokenSaved.current = true;
      }
    };

    setup();

    // 토큰 갱신 리스너
    const unsubRefresh = messaging().onTokenRefresh(async newToken => {
      await saveToken(userId, newToken);
    });

    // 포그라운드 메시지 리스너
    const unsubMessage = messaging().onMessage(async remoteMessage => {
      // 포그라운드에서는 알림을 표시하지 않음 (앱 내 UI로 처리)
      console.log('[FCM] Foreground message:', remoteMessage.notification?.title);
    });

    // 설정에서 돌아왔을 때 권한이 부여됐으면 토큰 등록
    const appStateSub = AppState.addEventListener('change', async state => {
      if (state === 'active' && userId && !tokenSaved.current) {
        const authStatus = await messaging().hasPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (enabled) {
          const token = await messaging().getToken();
          if (token) {
            await saveToken(userId, token);
            tokenSaved.current = true;
          }
        }
      }
    });

    return () => {
      unsubRefresh();
      unsubMessage();
      appStateSub.remove();
    };
  }, [userId]);
}

async function saveToken(userId: string, token: string) {
  try {
    await supabase.from('device_tokens').upsert(
      {
        user_id: userId,
        token,
        platform: Platform.OS,
      },
      {onConflict: 'user_id,token'},
    );
  } catch (err) {
    console.warn('[FCM] Failed to save token:', err);
  }
}

export async function removeToken(userId: string) {
  try {
    const token = await messaging().getToken();
    if (token) {
      await supabase
        .from('device_tokens')
        .delete()
        .eq('user_id', userId)
        .eq('token', token);
    }
  } catch (err) {
    console.warn('[FCM] Failed to remove token:', err);
  }
}
