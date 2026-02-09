import React from 'react';
import {View, Text, StyleSheet, Image, ScrollView, Pressable} from 'react-native';
import {Colors, Fonts, FontSizes, Spacing} from '../theme';
import NintendoButton from '../components/NintendoButton';
import NintendoCard from '../components/NintendoCard';

interface PrivacyInfoModalProps {
  onClose: () => void;
}

function InfoRow({
  icon,
  title,
  sub,
}: {
  icon: any;
  title: string;
  sub?: string;
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

export default function PrivacyInfoModal({onClose}: PrivacyInfoModalProps) {
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
          />
          <InfoRow
            icon={require('../assets/icons/check.png')}
            title="마을 방문 여부"
          />
          <InfoRow
            icon={require('../assets/icons/check.png')}
            title="인사"
            sub="어떤 인사를 보냈는지만 상대에게 보여"
          />

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>이웃이 볼 수 없는 것</Text>
          <InfoRow
            icon={require('../assets/icons/flag.png')}
            title="정확한 방문 시각"
          />
          <InfoRow
            icon={require('../assets/icons/flag.png')}
            title="이메일 / 비밀번호"
          />
          <InfoRow
            icon={require('../assets/icons/flag.png')}
            title="위치 / 기기 정보"
          />

          <NintendoCard style={styles.noteCard}>
            <Text style={styles.noteText}>
              마을에 얼굴 비추는 것만 전해질 뿐,{'\n'}그 이상은 아무것도
              공유되지 않아
            </Text>
          </NintendoCard>

          <NintendoButton
            title="알겠어!"
            variant="accent"
            onPress={onClose}
          />
        </ScrollView>
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
    color: Colors.foreground,
  },
  sectionLabel: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: Colors.muted,
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
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    color: Colors.foreground,
  },
  infoSub: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.border,
    marginVertical: Spacing.xl,
  },
  noteCard: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  noteText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
