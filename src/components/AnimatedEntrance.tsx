import React, {useEffect} from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import {ViewStyle} from 'react-native';

interface AnimatedEntranceProps {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export default function AnimatedEntrance({
  children,
  delay = 0,
  style,
}: AnimatedEntranceProps) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, {damping: 12, stiffness: 120}));
    opacity.value = withDelay(delay, withSpring(1, {damping: 20}));
  }, [delay, scale, opacity]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animStyle, style]}>
      {children}
    </Animated.View>
  );
}
