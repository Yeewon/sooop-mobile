import React from 'react';
import {View, Text, Image, Pressable, StyleSheet} from 'react-native';
import {Fonts, FontSizes, Spacing} from '../../theme';
import {useColors} from '../../contexts/ThemeContext';
import type {ColorScheme} from '../../theme/colors';
import NintendoCard from '../NintendoCard';
import PixelAvatar from '../PixelAvatar';
import type {AvatarData} from '../../shared/types';

interface DashboardHeaderProps {
  nickname: string;
  avatarData: AvatarData | null;
  onAvatarPress: () => void;
  onNicknamePress: () => void;
  onInvitePress: () => void;
  onSettingsPress: () => void;
  onPrivacyPress: () => void;
}

export default function DashboardHeader({
  nickname,
  avatarData,
  onAvatarPress,
  onNicknamePress,
  onInvitePress,
  onSettingsPress,
  onPrivacyPress,
}: DashboardHeaderProps) {
  const colors = useColors();
  const styles = useStyles(colors);

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Pressable onPress={onAvatarPress}>
          {({pressed}) => (
            <NintendoCard
              style={[
                styles.avatarBox,
                pressed && {
                  transform: [{translateY: 4}],
                  shadowOffset: {width: 0, height: 0},
                },
              ]}>
              <PixelAvatar avatarData={avatarData} size={40} />
            </NintendoCard>
          )}
        </Pressable>
        <Pressable
          onPress={onNicknamePress}
          style={({pressed}) => pressed && {opacity: 0.6}}>
          <Text style={styles.greeting}>어서 와, {nickname}</Text>
          <Text style={styles.greetingSub}>이름이나 캐릭터를 눌러봐</Text>
        </Pressable>
      </View>
      <View style={styles.headerRight}>
        <Pressable
          onPress={onInvitePress}
          style={({pressed}) => [
            styles.headerBtn,
            pressed && styles.headerBtnPressed,
          ]}>
          <Image
            source={require('../../assets/icons/flag.png')}
            style={styles.headerBtnIcon}
          />
        </Pressable>
        <Pressable
          onPress={onSettingsPress}
          style={({pressed}) => [
            styles.headerBtn,
            pressed && styles.headerBtnPressed,
          ]}>
          <Image
            source={require('../../assets/icons/alarm.png')}
            style={styles.headerBtnIcon}
          />
        </Pressable>
        <Pressable
          onPress={onPrivacyPress}
          style={({pressed}) => [
            styles.headerBtn,
            pressed && styles.headerBtnPressed,
          ]}>
          <Image
            source={require('../../assets/icons/computer.png')}
            style={styles.headerBtnIcon}
          />
        </Pressable>
      </View>
    </View>
  );
}

function useStyles(colors: ColorScheme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing['2xl'],
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      flex: 1,
    },
    avatarBox: {
      padding: 6,
      backgroundColor: colors.background,
    },
    greeting: {
      fontFamily: Fonts.bold,
      fontSize: FontSizes.xl,
      color: colors.foreground,
    },
    greetingSub: {
      fontFamily: Fonts.bold,
      fontSize: FontSizes.xs,
      color: colors.muted,
      marginTop: 2,
    },
    headerRight: {
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.shadowColor,
      backgroundColor: colors.nintendoBlue,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.shadowColor,
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 3,
    },
    headerBtnPressed: {
      transform: [{translateY: 3}],
      shadowOffset: {width: 0, height: 0},
    },
    headerBtnIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
    },
  });
}