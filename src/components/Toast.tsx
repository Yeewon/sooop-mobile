import React, {useEffect} from 'react';
import {Text, StyleSheet, Pressable} from 'react-native';
import {Colors, Fonts, FontSizes, Spacing} from '../theme';

interface ToastProps {
  message: string;
  type?: 'error' | 'success' | 'info';
  onDismiss: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type = 'info',
  onDismiss,
  duration = 2500,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  const bgColor =
    type === 'success'
      ? Colors.nintendoGreen
      : type === 'error'
        ? Colors.foreground
        : Colors.foreground;

  return (
    <Pressable
      onPress={onDismiss}
      style={[styles.container, {backgroundColor: bgColor}]}>
      <Text style={styles.text}>{message}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    zIndex: 999,
  },
  text: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: '#FFFFFF',
  },
});
