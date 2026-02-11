import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import {
  VILLAGE_WIDTH,
  VILLAGE_VISIBLE_HEIGHT,
  WORLD_WIDTH,
  WORLD_HEIGHT,
} from './villageConstants';

interface Props {
  type: 'rain' | 'snow' | 'fog';
}

const RAIN_COUNT = 30;
const SNOW_COUNT = 20;

function RainDrop({ delay, x }: { delay: number; x: number }) {
  const translateY = useSharedValue(-10);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(VILLAGE_VISIBLE_HEIGHT + 10, {
          duration: 600 + Math.random() * 400,
          easing: Easing.linear,
        }),
        -1,
      ),
    );
  }, [delay, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[styles.rain, { left: x }, style]} />;
}

function SnowFlake({ delay, x }: { delay: number; x: number }) {
  const translateY = useSharedValue(-8);
  const opacity = useSharedValue(0.6 + Math.random() * 0.4);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(VILLAGE_VISIBLE_HEIGHT + 8, {
          duration: 3000 + Math.random() * 2000,
          easing: Easing.linear,
        }),
        -1,
      ),
    );
  }, [delay, translateY]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const size = 3 + Math.floor(Math.random() * 3);

  return (
    <Animated.View
      style={[
        styles.snow,
        { left: x, width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

/** 월드 배경에 고정되는 쌓임 효과 (VillageView의 world 안에 렌더) */
export function WeatherGround({ type }: { type: 'rain' | 'snow' }) {
  const items = useMemo(() => {
    const count = type === 'rain' ? 20 : 25;
    return Array.from({ length: count }, (_, i) => ({
      key: i,
      x: Math.random() * (WORLD_WIDTH - 24),
      y: 40 + Math.random() * (WORLD_HEIGHT - 60),
      width: type === 'rain' ? 10 + Math.random() * 16 : 6 + Math.random() * 14,
      height: type === 'rain' ? 0 : 4 + Math.random() * 6,
      opacity:
        type === 'rain'
          ? 0.5 + Math.random() * 0.1
          : 0.18 + Math.random() * 0.12,
    }));
  }, [type]);

  return (
    <>
      {items.map(p => (
        <View
          key={p.key}
          style={{
            position: 'absolute',
            top: p.y,
            left: p.x,
            width: p.width,
            height: type === 'rain' ? p.width * 0.3 : p.height,
            borderRadius:
              type === 'rain'
                ? p.width * 0.15
                : Math.min(p.width, p.height) * 0.4,
            backgroundColor:
              type === 'rain'
                ? `rgba(100, 170, 230, ${p.opacity})`
                : `rgba(255, 255, 255, ${p.opacity})`,
          }}
        />
      ))}
    </>
  );
}

function FogOverlay() {
  const opacity = useSharedValue(0.15);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.fog, style]} pointerEvents="none" />;
}

export default function WeatherParticles({ type }: Props) {
  const rainDrops = useMemo(
    () =>
      Array.from({ length: RAIN_COUNT }, (_, i) => ({
        key: i,
        x: Math.random() * VILLAGE_WIDTH,
        delay: Math.random() * 800,
      })),
    [],
  );

  const snowFlakes = useMemo(
    () =>
      Array.from({ length: SNOW_COUNT }, (_, i) => ({
        key: i,
        x: Math.random() * VILLAGE_WIDTH,
        delay: Math.random() * 3000,
      })),
    [],
  );

  if (type === 'fog') {
    return <FogOverlay />;
  }

  if (type === 'rain') {
    return (
      <View style={styles.container} pointerEvents="none">
        {rainDrops.map(d => (
          <RainDrop key={d.key} delay={d.delay} x={d.x} />
        ))}
      </View>
    );
  }

  if (type === 'snow') {
    return (
      <View style={styles.container} pointerEvents="none">
        {snowFlakes.map(s => (
          <SnowFlake key={s.key} delay={s.delay} x={s.x} />
        ))}
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
    overflow: 'hidden',
  },
  rain: {
    position: 'absolute',
    width: 1.5,
    height: 12,
    backgroundColor: 'rgba(150, 200, 255, 0.1)',
    borderRadius: 1,
  },
  snow: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  fog: {
    ...StyleSheet.absoluteFill,
    zIndex: 40,
    backgroundColor: 'rgba(200, 200, 210, 1)',
  },
});
