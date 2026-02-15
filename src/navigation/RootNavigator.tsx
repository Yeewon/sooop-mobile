import React, {useEffect} from 'react';
import {Linking} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useAuthContext} from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import EmailConfirmScreen from '../screens/EmailConfirmScreen';
import EulaScreen from '../screens/EulaScreen';
import DashboardScreen from '../screens/DashboardScreen';
import NpcChatScreen from '../screens/NpcChatScreen';
import BootSplash from 'react-native-bootsplash';

const PENDING_INVITE_KEY = 'sooop_pending_invite_code';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const {user, profile, loading} = useAuthContext();

  // 비로그인 상태에서 딥링크 초대 코드를 저장
  useEffect(() => {
    const saveInviteCode = (url: string) => {
      const match = url.match(/sooop:\/\/invite\/([A-Z0-9]+)/i);
      if (match?.[1]) {
        AsyncStorage.setItem(PENDING_INVITE_KEY, match[1].toUpperCase());
      }
    };

    const sub = Linking.addEventListener('url', ({url}) => saveInviteCode(url));
    Linking.getInitialURL().then(url => {
      if (url) {
        saveInviteCode(url);
      }
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    // user가 있으면 profile 로딩까지 대기 후 스플래시 숨김
    if (!loading && (!user || profile)) {
      BootSplash.hide({fade: true});
    }
  }, [loading, user, profile]);

  if (loading || (user && !profile)) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {user && profile?.eula_accepted_at ? (
        // 로그인 + EULA 동의 완료
        <Stack.Group>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen
            name="NpcChat"
            component={NpcChatScreen}
            options={{animation: 'slide_from_bottom'}}
          />
        </Stack.Group>
      ) : user ? (
        // 로그인했지만 EULA 미동의
        <Stack.Group>
          <Stack.Screen name="Eula" component={EulaScreen} />
        </Stack.Group>
      ) : (
        // 비로그인 상태
        <Stack.Group>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="EmailConfirm" component={EmailConfirmScreen} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}
