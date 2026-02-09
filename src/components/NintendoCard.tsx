import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {Colors} from '../theme';

interface NintendoCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function NintendoCard({children, style}: NintendoCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderWidth: 3,
    borderColor: Colors.shadowColor,
    borderRadius: 16,
    shadowColor: Colors.shadowColor,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
});
