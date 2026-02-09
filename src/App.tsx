import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AuthProvider} from './contexts/AuthContext';
import RootNavigator from './navigation/RootNavigator';

const linking = {
  prefixes: ['sooop://'],
  config: {
    screens: {
      Dashboard: {
        path: 'invite/:code',
      },
    },
  },
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer linking={linking}>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
