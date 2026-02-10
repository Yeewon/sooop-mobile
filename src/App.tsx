import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {AuthProvider} from './contexts/AuthContext';
import {ThemeProvider, useTheme} from './contexts/ThemeContext';
import {LightColors, DarkColors} from './theme/colors';
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

const navLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: LightColors.background,
    card: LightColors.cardBg,
    text: LightColors.foreground,
    border: LightColors.border,
  },
};

const navDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: DarkColors.background,
    card: DarkColors.cardBg,
    text: DarkColors.foreground,
    border: DarkColors.border,
  },
};

function AppContent() {
  const {isDark} = useTheme();

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <NavigationContainer
        linking={linking}
        theme={isDark ? navDarkTheme : navLightTheme}>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
