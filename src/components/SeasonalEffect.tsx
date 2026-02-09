import React, {useEffect, useMemo} from 'react';
import {Dimensions, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const {width: SCREEN_W, height: SCREEN_H} = Dimensions.get('window');
const PARTICLE_COUNT = 8;

interface SeasonalEffectProps {
  emoji: string;
}

function Particle({emoji, index}: {emoji: string; index: number}) {
  const startX = useMemo(() => Math.random() * SCREEN_W, []);
  const duration = useMemo(() => 4000 + Math.random() * 3000, []);
  const delay = useMemo(() => index * 600 + Math.random() * 1000, [index]);
  const drift = useMemo(() => (Math.random() - 0.5) * 80, []);

  const translateY = useSharedValue(-40);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0.7);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withTiming(SCREEN_H + 40, {duration, easing: Easing.linear}),
        -1,
        false,
      ),
    );
    translateX.value = withDelay(
      delay,
      withRepeat(
        withTiming(drift, {duration, easing: Easing.inOut(Easing.sin)}),
        -1,
        true,
      ),
    );
    rotate.value = withDelay(
      delay,
      withRepeat(
        withTiming(360, {duration: duration * 1.5, easing: Easing.linear}),
        -1,
        false,
      ),
    );
  }, [delay, duration, drift, translateY, translateX, rotate]);

  const style = useAnimatedStyle(() => ({
    transform: [
      {translateY: translateY.value},
      {translateX: translateX.value},
      {rotate: `${rotate.value}deg`},
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text
      style={[
        styles.particle,
        {left: startX},
        style,
      ]}
      pointerEvents="none">
      {emoji}
    </Animated.Text>
  );
}

export default function SeasonalEffect({emoji}: SeasonalEffectProps) {
  const particles = useMemo(
    () => Array.from({length: PARTICLE_COUNT}, (_, i) => i),
    [],
  );

  return (
    <>
      {particles.map(i => (
        <Particle key={i} emoji={emoji} index={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    top: -40,
    fontSize: 20,
    zIndex: 0,
    pointerEvents: 'none',
  },
});
