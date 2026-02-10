import React, {useMemo} from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {useColors} from '../contexts/ThemeContext';
import type {ColorScheme} from '../theme/colors';

interface NintendoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function NintendoCard({children, style}: NintendoCardProps) {
  const colors = useColors();
  const styles = useStyles(colors);
  return <View style={[styles.card, style]}>{children}</View>;
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.cardBg,
          borderWidth: 3,
          borderColor: colors.shadowColor,
          borderRadius: 16,
          shadowColor: colors.shadowColor,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        },
      }),
    [colors],
  );
}
