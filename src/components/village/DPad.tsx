import React, {useMemo} from 'react';
import {View, Pressable, Text, StyleSheet} from 'react-native';
import {useColors} from '../../contexts/ThemeContext';
import type {ColorScheme} from '../../theme/colors';
import {Fonts} from '../../theme';

const BTN_SIZE = 48;

interface DPadProps {
  onMoveStart: (dx: number, dy: number) => void;
  onMoveEnd: () => void;
}

function DPadBtn({
  label,
  dx,
  dy,
  radius,
  onMoveStart,
  onMoveEnd,
  colors,
}: {
  label: string;
  dx: number;
  dy: number;
  radius: object;
  onMoveStart: (dx: number, dy: number) => void;
  onMoveEnd: () => void;
  colors: ColorScheme;
}) {
  return (
    <Pressable
      onPressIn={() => onMoveStart(dx, dy)}
      onPressOut={onMoveEnd}
      style={({pressed}) => ({
        width: BTN_SIZE,
        height: BTN_SIZE,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        backgroundColor: pressed ? colors.accent : 'rgba(0,0,0,0.65)',
        ...radius,
      })}>
      <Text
        style={{
          color: colors.white,
          fontFamily: Fonts.bold,
          fontSize: 18,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function DPad({onMoveStart, onMoveEnd}: DPadProps) {
  const colors = useColors();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.empty} />
        <DPadBtn
          label="▲"
          dx={0}
          dy={-1}
          radius={{borderTopLeftRadius: 8, borderTopRightRadius: 8}}
          onMoveStart={onMoveStart}
          onMoveEnd={onMoveEnd}
          colors={colors}
        />
        <View style={styles.empty} />
      </View>
      <View style={styles.row}>
        <DPadBtn
          label="◀"
          dx={-1}
          dy={0}
          radius={{borderTopLeftRadius: 8, borderBottomLeftRadius: 8}}
          onMoveStart={onMoveStart}
          onMoveEnd={onMoveEnd}
          colors={colors}
        />
        <View
          style={{
            width: BTN_SIZE,
            height: BTN_SIZE,
            backgroundColor: 'rgba(0,0,0,0.65)',
          }}
        />
        <DPadBtn
          label="▶"
          dx={1}
          dy={0}
          radius={{borderTopRightRadius: 8, borderBottomRightRadius: 8}}
          onMoveStart={onMoveStart}
          onMoveEnd={onMoveEnd}
          colors={colors}
        />
      </View>
      <View style={styles.row}>
        <View style={styles.empty} />
        <DPadBtn
          label="▼"
          dx={0}
          dy={1}
          radius={{borderBottomLeftRadius: 8, borderBottomRightRadius: 8}}
          onMoveStart={onMoveStart}
          onMoveEnd={onMoveEnd}
          colors={colors}
        />
        <View style={styles.empty} />
      </View>
    </View>
  );
}

function useStyles() {
  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          alignItems: 'center',
          paddingVertical: 16,
        },
        row: {
          flexDirection: 'row',
        },
        empty: {
          width: BTN_SIZE,
          height: BTN_SIZE,
        },
      }),
    [],
  );
}
