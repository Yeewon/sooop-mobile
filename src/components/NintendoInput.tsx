import React from 'react';
import {TextInput, StyleSheet, TextInputProps} from 'react-native';
import {Colors, Fonts} from '../theme';

interface NintendoInputProps extends TextInputProps {}

export default function NintendoInput(props: NintendoInputProps) {
  return (
    <TextInput
      placeholderTextColor={Colors.muted}
      {...props}
      style={[styles.input, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: Colors.cardBg,
    borderWidth: 3,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.foreground,
  },
});
