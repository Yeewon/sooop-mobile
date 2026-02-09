import React, {useRef, useState} from 'react';
import {View, Text, StyleSheet, Pressable, Image, ScrollView} from 'react-native';
import {AvatarData} from '../shared/types';
import {FRAME_BACKGROUNDS} from '../shared/constants';
import PixelAvatar from '../components/PixelAvatar';
import NintendoButton from '../components/NintendoButton';
import NintendoCard from '../components/NintendoCard';
import {Colors, Fonts, FontSizes, Spacing} from '../theme';

interface PhotoFrameModalProps {
  myAvatar: AvatarData | null;
  myName: string;
  friendAvatar: AvatarData | null;
  friendName: string;
  onClose: () => void;
}

export default function PhotoFrameModal({
  myAvatar,
  myName,
  friendAvatar,
  friendName,
  onClose,
}: PhotoFrameModalProps) {
  const [bgIndex, setBgIndex] = useState(0);
  const selectedBg = FRAME_BACKGROUNDS[bgIndex];

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const textColor = selectedBg.dark ? '#FFFFFF' : '#2D2D2D';
  const mutedColor = selectedBg.dark ? '#CCCCCC' : '#5A5A5A';

  // TODO: react-native-view-shot + react-native-share for save/share

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
        <View style={styles.titleRow}>
          <Image
            source={require('../assets/icons/shine.png')}
            style={styles.titleIcon}
          />
          <Text style={styles.title}>기념사진</Text>
          <Image
            source={require('../assets/icons/shine.png')}
            style={styles.titleIcon}
          />
        </View>

        {/* 배경 선택 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.bgPicker}
          contentContainerStyle={styles.bgPickerContent}>
          {FRAME_BACKGROUNDS.map((bg, i) => (
            <Pressable
              key={bg.name}
              onPress={() => setBgIndex(i)}
              style={[
                styles.bgBtn,
                bgIndex === i ? styles.bgBtnActive : styles.bgBtnInactive,
              ]}>
              <Text
                style={[
                  styles.bgBtnText,
                  {color: bgIndex === i ? '#FFF' : Colors.muted},
                ]}>
                {bg.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 포토 프레임 */}
        <View
          style={[
            styles.frame,
            {backgroundColor: selectedBg.colors[0]},
          ]}>
          <Text style={[styles.frameHeader, {color: mutedColor}]}>
            - Forest Memory -
          </Text>

          <View style={styles.avatarRow}>
            <View style={styles.avatarCol}>
              <NintendoCard style={styles.avatarFrame}>
                <PixelAvatar avatarData={myAvatar} size={80} />
              </NintendoCard>
              <Text style={[styles.avatarName, {color: textColor}]}>
                {myName}
              </Text>
            </View>
            <View style={styles.avatarCol}>
              <NintendoCard style={styles.avatarFrame}>
                <PixelAvatar avatarData={friendAvatar} size={80} />
              </NintendoCard>
              <Text style={[styles.avatarName, {color: textColor}]}>
                {friendName}
              </Text>
            </View>
          </View>

          <View style={[styles.frameDivider, {backgroundColor: mutedColor + '40'}]} />
          <Text style={[styles.frameDate, {color: mutedColor}]}>{today}</Text>
        </View>

        {/* 버튼 */}
        <View style={styles.btnRow}>
          <NintendoButton
            title="닫기"
            variant="muted"
            onPress={onClose}
            style={styles.flex1}
          />
          <NintendoButton
            title="저장하기"
            variant="accent"
            onPress={() => {
              // TODO: view-shot capture + share
              onClose();
            }}
            style={styles.flex1}
          />
        </View>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 200,
    padding: Spacing.lg,
  },
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: Colors.border,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 360,
    maxHeight: '90%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  titleIcon: {width: 24, height: 24},
  title: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: Colors.foreground,
  },
  bgPicker: {
    marginBottom: Spacing.md,
  },
  bgPickerContent: {
    gap: Spacing.sm,
  },
  bgBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  bgBtnActive: {backgroundColor: Colors.accent},
  bgBtnInactive: {backgroundColor: Colors.cardBg},
  bgBtnText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
  },
  frame: {
    borderWidth: 4,
    borderColor: Colors.foreground,
    borderRadius: 16,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  frameHeader: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.md,
  },
  avatarCol: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarFrame: {
    padding: Spacing.sm,
    backgroundColor: Colors.cardBg,
  },
  avatarName: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
  },
  frameDivider: {
    height: 2,
    marginBottom: Spacing.md,
  },
  frameDate: {
    fontFamily: Fonts.bold,
    fontSize: 10,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  flex1: {flex: 1},
});
