import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Colors, Fonts, FontSizes, Spacing} from '../theme';
import NintendoButton from '../components/NintendoButton';
import NintendoCard from '../components/NintendoCard';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function EmailConfirmScreen({navigation}: Props) {
  return (
    <View style={styles.container}>
      <NintendoCard style={styles.card}>
        <Image
          source={require('../assets/icons/mail.png')}
          style={styles.icon}
        />
        <Text style={styles.title}>입주 신청서를 보냈어!</Text>
        <Text style={styles.description}>
          이메일에서 인증 링크를 눌러줘.{'\n'}
          확인 후 돌아와서 로그인하면 돼!
        </Text>
        <NintendoButton
          title="로그인하기"
          onPress={() => navigation.popToTop()}
          style={styles.button}
        />
      </NintendoCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  card: {
    padding: Spacing['3xl'],
    alignItems: 'center',
  },
  icon: {
    width: 48,
    height: 48,
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.foreground,
    marginBottom: Spacing.sm,
  },
  description: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  button: {
    alignSelf: 'stretch',
  },
});
