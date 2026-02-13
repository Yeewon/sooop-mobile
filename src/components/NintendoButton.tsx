import React, { useMemo } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useColors } from '../contexts/ThemeContext';
import type { ColorScheme } from '../theme/colors';
import { Fonts } from '../theme';

interface NintendoButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'accent' | 'muted' | 'blue' | 'yellow' | 'green' | 'white';
  icon?: ImageSourcePropType;
  iconSize?: number;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  small?: boolean;
}

export default function NintendoButton({
  title,
  onPress,
  variant = 'accent',
  icon,
  iconSize = 18,
  style,
  textStyle,
  disabled = false,
  small = false,
}: NintendoButtonProps) {
  const colors = useColors();
  const styles = useStyles(colors);

  const bgColor =
    variant === 'accent'
      ? colors.accent
      : variant === 'blue'
      ? colors.nintendoBlue
      : variant === 'yellow'
      ? colors.nintendoYellow
      : variant === 'green'
      ? colors.nintendoGreen
      : variant === 'white'
      ? colors.white
      : colors.cardBg;

  const txtColor =
    variant === 'muted'
      ? colors.muted
      : variant === 'white' || variant === 'yellow'
      ? colors.shadowColor
      : colors.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        small ? styles.buttonSm : styles.button,
        { backgroundColor: bgColor },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon && (
        <Image
          source={icon}
          style={{ width: iconSize, height: iconSize, marginRight: 6 }}
        />
      )}
      <Text
        style={[
          small ? styles.textSm : styles.text,
          { color: txtColor },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        button: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 12,
          paddingHorizontal: 20,
          borderWidth: 3,
          borderColor: colors.shadowColor,
          borderRadius: 12,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 4,
        },
        buttonSm: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderWidth: 2,
          borderColor: colors.shadowColor,
          borderRadius: 10,
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3,
        },
        pressed: {
          transform: [{ translateY: 4 }],
          shadowOffset: { width: 0, height: 0 },
        },
        disabled: {
          opacity: 0.5,
        },
        text: {
          fontFamily: Fonts.bold,
          fontSize: 14,
        },
        textSm: {
          fontFamily: Fonts.bold,
          fontSize: 12,
        },
      }),
    [colors],
  );
}
