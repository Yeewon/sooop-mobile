import React, {useEffect} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthContext} from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import EmailConfirmScreen from '../screens/EmailConfirmScreen';
import EulaScreen from '../screens/EulaScreen';
import DashboardScreen from '../screens/DashboardScreen';
import NpcChatScreen from '../screens/NpcChatScreen';
import BootSplash from 'react-native-bootsplash';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const {user, profile, loading} = useAuthContext();

  useEffect(() => {
    if (!loading) {
      BootSplash.hide({fade: true});
    }
  }, [loading]);

  if (loading) {
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
