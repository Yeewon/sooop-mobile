import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Image,
  ImageSourcePropType,
} from 'react-native';
import {Colors, Fonts} from '../theme';

interface NintendoButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'accent' | 'muted' | 'blue' | 'yellow' | 'green';
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
  const bgColor =
    variant === 'accent'
      ? Colors.accent
      : variant === 'blue'
        ? Colors.nintendoBlue
        : variant === 'yellow'
          ? Colors.nintendoYellow
          : variant === 'green'
            ? Colors.nintendoGreen
            : Colors.cardBg;

  const txtColor =
    variant === 'muted' ? Colors.muted : Colors.white;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({pressed}) => [
        small ? styles.buttonSm : styles.button,
        {backgroundColor: bgColor},
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {icon && (
        <Image
          source={icon}
          style={{width: iconSize, height: iconSize, marginRight: 6}}
        />
      )}
      <Text
        style={[
          small ? styles.textSm : styles.text,
          {color: txtColor},
          textStyle,
        ]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 3,
    borderColor: Colors.shadowColor,
    borderRadius: 12,
    shadowColor: Colors.shadowColor,
    shadowOffset: {width: 0, height: 4},
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
    borderColor: Colors.shadowColor,
    borderRadius: 10,
    shadowColor: Colors.shadowColor,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  pressed: {
    transform: [{translateY: 4}],
    shadowOffset: {width: 0, height: 0},
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
});
