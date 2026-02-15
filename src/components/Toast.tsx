import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useColors } from '../contexts/ThemeContext';
import type { ColorScheme } from '../theme/colors';
import { Fonts, FontSizes, Spacing } from '../theme';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onDismiss: () => void;
  duration?: number;
  bottomOffset?: number;
}

export default function Toast({
  message,
  type = 'info',
  onDismiss,
  duration = 2500,
  bottomOffset,
}: ToastProps) {
  const colors = useColors();
  const styles = useStyles(colors);

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const bgColor = type === 'success' ? colors.nintendoGreen : colors.foreground;
  const textColor = colors.background;

  return (
    <View
      style={[
        styles.wrapper,
        bottomOffset != null ? { bottom: bottomOffset } : {},
      ]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onDismiss}
        style={[
          styles.container,
          { backgroundColor: bgColor, borderColor: bgColor },
        ]}
      >
        <Text style={{ ...styles.text, color: textColor }}>{message}</Text>
      </Pressable>
    </View>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        wrapper: {
          position: 'absolute',
          bottom: 50,
          left: 0,
          right: 0,
          alignItems: 'center',
          zIndex: 999,
        },
        container: {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm + 2,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: colors.shadowColor,
        },
        text: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.shadowColor,
        },
      }),
    [colors],
  );
}
