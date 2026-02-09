import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useAuthContext} from '../contexts/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import EmailConfirmScreen from '../screens/EmailConfirmScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LoadingSpinner from '../components/LoadingSpinner';
import {View, StyleSheet} from 'react-native';
import {Colors} from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const {user, loading} = useAuthContext();

  if (loading) {
    return (
      <View style={styles.loading}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {user ? (
        // 로그인 상태
        <Stack.Group>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
