import React, {useMemo} from 'react';
import {View, Text, StyleSheet, Image, ScrollView, Pressable} from 'react-native';
import {Fonts, FontSizes, Spacing} from '../theme';
import {useColors} from '../contexts/ThemeContext';
import type {ColorScheme} from '../theme/colors';
import NintendoButton from '../components/NintendoButton';
import NintendoCard from '../components/NintendoCard';

interface PrivacyInfoModalProps {
  onClose: () => void;
  onLogout: () => void;
}

function InfoRow({
  icon,
  title,
  sub,
  styles,
}: {
  icon: any;
  title: string;
  sub?: string;
  styles: any;
}) {
  return (
    <View style={styles.infoRow}>
      <Image source={icon} style={styles.infoIcon} />
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        {sub ? <Text style={styles.infoSub}>{sub}</Text> : null}
      </View>
    </View>
  );
}

export default function PrivacyInfoModal({onClose, onLogout}: PrivacyInfoModalProps) {
  const colors = useColors();
  const styles = useStyles(colors);

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}>
            <Image
              source={require('../assets/icons/computer.png')}
              style={styles.titleIcon}
            />
            <Text style={styles.title}>이웃에게 보이는 정보</Text>
          </View>

          <Text style={styles.sectionLabel}>이웃이 볼 수 있는 것</Text>
          <InfoRow
            icon={require('../assets/icons/check.png')}
            title="이름"
            styles={styles}
          />
          <InfoRow
            icon={require('../assets/icons/check.png')}
            title="마을 방문 여부"
            styles={styles}
          />
          <InfoRow
            icon={require('../assets/icons/check.png')}
            title="인사"
            sub="어떤 인사를 보냈는지만 상대에게 보여"
            styles={styles}
          />

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>이웃이 볼 수 없는 것</Text>
          <InfoRow
            icon={require('../assets/icons/ban.png')}
            title="정확한 방문 시각"
            styles={styles}
          />
          <InfoRow
            icon={require('../assets/icons/ban.png')}
            title="이메일 / 비밀번호"
            styles={styles}
          />
          <InfoRow
            icon={require('../assets/icons/ban.png')}
            title="위치 / 기기 정보"
            styles={styles}
          />

          <NintendoCard style={styles.noteCard}>
            <Text style={styles.noteText}>
              마을에 얼굴 비추는 것만 전해질 뿐,{'\n'}그 이상은 아무것도
              공유되지 않아
            </Text>
          </NintendoCard>


                 <NintendoButton
            title="로그아웃"
            variant="muted"
            onPress={onLogout}
          />

          <View style={styles.divider} />

          <NintendoButton
            title="알겠어!"
            variant="accent"
            onPress={onClose}
          />

          <View style={styles.voidContainer}/>




        </ScrollView>
      </Pressable>
    </Pressable>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
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
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          borderWidth: 3,
          borderColor: colors.border,
          padding: Spacing.xl,
          width: '100%',
          maxWidth: 360,
          maxHeight: '90%',
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          marginBottom: Spacing.xl,
        },
        titleIcon: {width: 24, height: 24},
        title: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.foreground,
        },
        sectionLabel: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.muted,
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: Spacing.md,
        },
        infoRow: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: Spacing.md,
          marginBottom: Spacing.md,
        },
        infoIcon: {width: 20, height: 20, marginTop: 2},
        infoContent: {flex: 1},
        infoTitle: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.lg,
          color: colors.foreground,
        },
        infoSub: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.muted,
          marginTop: 2,
        },
        divider: {
          height: 2,
          backgroundColor: colors.border,
          marginVertical: Spacing.xl,
        },
        voidContainer: {
          height: 10,
        },
        noteCard: {
          padding: Spacing.md,
          backgroundColor: colors.background,
          alignItems: 'center',
          marginVertical: Spacing.xl,
        },
        noteText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
          textAlign: 'center',
          lineHeight: 18,
        },
      }),
    [colors],
  );
}
