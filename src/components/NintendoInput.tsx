import React, {useMemo} from 'react';
import {TextInput, StyleSheet, TextInputProps} from 'react-native';
import {useColors} from '../contexts/ThemeContext';
import type {ColorScheme} from '../theme/colors';
import {Fonts} from '../theme';

interface NintendoInputProps extends TextInputProps {}

export default function NintendoInput(props: NintendoInputProps) {
  const colors = useColors();
  const styles = useStyles(colors);
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        input: {
          backgroundColor: colors.cardBg,
          borderWidth: 3,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 12,
          fontFamily: Fonts.regular,
          fontSize: 14,
          color: colors.foreground,
        },
      }),
    [colors],
  );
}
