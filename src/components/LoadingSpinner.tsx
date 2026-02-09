import React, {useEffect} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export default function LoadingSpinner() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {duration: 1200, easing: Easing.linear}),
      -1,
    );
  }, [rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotateY: `${rotation.value}deg`}],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Image
        source={require('../assets/icons/coin.png')}
        style={styles.coin}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  coin: {
    width: 48,
    height: 48,
  },
});
