import React, { useEffect, useMemo } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
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

  return (
    <Pressable
      onPress={onDismiss}
      style={[
        styles.container,
        { backgroundColor: bgColor },
        bottomOffset != null ? { bottom: bottomOffset } : {},
      ]}
    >
      <Text style={styles.text}>{message}</Text>
    </Pressable>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          position: 'absolute',
          bottom: 50,
          alignSelf: 'center',
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm + 2,
          borderRadius: 20,
          borderWidth: 2,
          borderColor: colors.shadowColor,
          zIndex: 999,
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
