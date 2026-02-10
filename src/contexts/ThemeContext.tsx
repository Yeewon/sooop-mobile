import React, {createContext, useContext, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {LightColors, DarkColors} from '../theme/colors';
import type {ColorScheme} from '../theme/colors';

type ThemeContextType = {
  colors: ColorScheme;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  colors: LightColors,
  isDark: false,
});

export function ThemeProvider({children}: {children: React.ReactNode}) {
  const scheme = useColorScheme();
  const value = useMemo(
    () => ({
      colors: scheme === 'dark' ? DarkColors : LightColors,
      isDark: scheme === 'dark',
    }),
    [scheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useColors(): ColorScheme {
  return useContext(ThemeContext).colors;
}

export function useTheme(): ThemeContextType {
  return useContext(ThemeContext);
}
