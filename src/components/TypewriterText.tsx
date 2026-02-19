import React, {useState, useEffect} from 'react';
import {Text, TextStyle, View, StyleSheet} from 'react-native';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  style?: TextStyle;
}

export default function TypewriterText({text, speed = 45, style}: TypewriterTextProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(0);
    const interval = setInterval(() => {
      setCount(prev => {
        if (prev >= text.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  const done = count >= text.length;

  return (
    <View>
      {/* 보이지 않는 전체 텍스트로 높이 확보 */}
      <Text style={[style, styles.hidden]}>{text}</Text>
      {/* 타이핑 중인 텍스트 */}
      <Text selectable={done} style={[style, styles.visible]}>{text.slice(0, count)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hidden: {
    opacity: 0,
  },
  visible: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
