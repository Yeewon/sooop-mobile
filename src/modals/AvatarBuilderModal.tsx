import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import {AvatarData} from '../shared/types';
import {
  HAIR_STYLES,
  EYE_STYLES,
  MOUTH_STYLES,
  CLOTHES_STYLES,
  SKIN_COLORS,
  HAIR_COLORS,
  CLOTHES_COLORS,
  DEFAULT_AVATAR,
} from '../shared/avatar-parts';
import PixelAvatar from '../components/PixelAvatar';
import NintendoButton from '../components/NintendoButton';
import NintendoCard from '../components/NintendoCard';
import {Fonts, FontSizes, Spacing} from '../theme';
import {useColors} from '../contexts/ThemeContext';
import type {ColorScheme} from '../theme/colors';

interface AvatarBuilderModalProps {
  currentAvatar: AvatarData | null;
  onSave: (avatar: AvatarData) => Promise<void>;
  onClose: () => void;
}

type Tab = 'hair' | 'eyes' | 'mouth' | 'clothes' | 'colors';

export default function AvatarBuilderModal({
  currentAvatar,
  onSave,
  onClose,
}: AvatarBuilderModalProps) {
  const colors = useColors();
  const styles = useStyles(colors);
  const [avatar, setAvatar] = useState<AvatarData>(
    currentAvatar || DEFAULT_AVATAR,
  );
  const [tab, setTab] = useState<Tab>('hair');
  const [saving, setSaving] = useState(false);

  const update = (partial: Partial<AvatarData>) =>
    setAvatar(prev => ({...prev, ...partial}));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(avatar);
      onClose();
    } catch {
      setSaving(false);
    }
  };

  const tabs: {key: Tab; label: string}[] = [
    {key: 'hair', label: '머리'},
    {key: 'eyes', label: '눈'},
    {key: 'mouth', label: '입'},
    {key: 'clothes', label: '옷'},
    {key: 'colors', label: '색상'},
  ];

  const renderStylePicker = (
    styles_arr: {name: string}[],
    currentIdx: number,
    field: keyof AvatarData,
  ) => (
    <View style={styles.styleGrid}>
      {styles_arr.map((style, i) => (
        <Pressable
          key={i}
          onPress={() => update({[field]: i})}
          style={[
            styles.styleItem,
            currentIdx === i && styles.styleItemActive,
          ]}>
          <PixelAvatar avatarData={{...avatar, [field]: i}} size={48} />
          <Text style={styles.styleName}>{style.name}</Text>
        </Pressable>
      ))}
    </View>
  );

  const renderColorPicker = (
    colorList: readonly string[],
    currentColor: string,
    field: keyof AvatarData,
    label: string,
  ) => (
    <View style={styles.colorSection}>
      <Text style={styles.colorLabel}>{label}</Text>
      <View style={styles.colorRow}>
        {colorList.map(color => (
          <Pressable
            key={color}
            onPress={() => update({[field]: color})}
            style={[
              styles.colorDot,
              {backgroundColor: color},
              currentColor === color && styles.colorDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
        {/* 타이틀 */}
        <View style={styles.titleRow}>
          <Image
            source={require('../assets/icons/star.png')}
            style={styles.titleIcon}
          />
          <Text style={styles.title}>내 캐릭터 만들기</Text>
        </View>

        {/* 미리보기 */}
        <View style={styles.previewWrap}>
          <NintendoCard style={styles.previewCard}>
            <PixelAvatar avatarData={avatar} size={120} />
          </NintendoCard>
        </View>

        {/* 탭 */}
        <View style={styles.tabRow}>
          {tabs.map(t => (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                styles.tabBtn,
                tab === t.key ? styles.tabBtnActive : styles.tabBtnInactive,
              ]}>
              <Text
                style={[
                  styles.tabText,
                  {color: tab === t.key ? '#FFF' : colors.muted},
                ]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* 내용 */}
        <ScrollView
          style={styles.contentScroll}
          showsVerticalScrollIndicator={false}>
          {tab === 'hair' &&
            renderStylePicker(HAIR_STYLES, avatar.hair, 'hair')}
          {tab === 'eyes' &&
            renderStylePicker(EYE_STYLES, avatar.eyes, 'eyes')}
          {tab === 'mouth' &&
            renderStylePicker(MOUTH_STYLES, avatar.mouth, 'mouth')}
          {tab === 'clothes' &&
            renderStylePicker(CLOTHES_STYLES, avatar.clothes, 'clothes')}
          {tab === 'colors' && (
            <>
              {renderColorPicker(
                SKIN_COLORS,
                avatar.skinColor,
                'skinColor',
                '피부',
              )}
              {renderColorPicker(
                HAIR_COLORS,
                avatar.hairColor,
                'hairColor',
                '머리',
              )}
              {renderColorPicker(
                CLOTHES_COLORS,
                avatar.clothesColor,
                'clothesColor',
                '옷',
              )}
            </>
          )}
        </ScrollView>

        {/* 버튼 */}
        <View style={styles.btnRow}>
          <NintendoButton
            title="취소"
            variant="muted"
            onPress={onClose}
            style={styles.flex1}
          />
          <NintendoButton
            title={saving ? '...' : '완성!'}
            variant="accent"
            onPress={handleSave}
            disabled={saving}
            style={styles.flex1}
          />
        </View>
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
          padding: Spacing.lg,
          width: '100%',
          maxWidth: 360,
          maxHeight: '90%',
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          marginBottom: Spacing.md,
        },
        titleIcon: {width: 24, height: 24},
        title: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.foreground,
        },
        previewWrap: {
          alignItems: 'center',
          marginBottom: Spacing.lg,
        },
        previewCard: {
          padding: Spacing.md,
          backgroundColor: colors.background,
        },
        tabRow: {
          flexDirection: 'row',
          gap: Spacing.xs,
          marginBottom: Spacing.md,
        },
        tabBtn: {
          flex: 1,
          paddingVertical: 8,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: colors.border,
          alignItems: 'center',
        },
        tabBtnActive: {
          backgroundColor: colors.accent,
        },
        tabBtnInactive: {
          backgroundColor: colors.cardBg,
        },
        tabText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
        },
        contentScroll: {
          maxHeight: 200,
          marginBottom: Spacing.md,
        },
        styleGrid: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Spacing.md,
          justifyContent: 'center',
        },
        styleItem: {
          padding: Spacing.sm,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.border,
          backgroundColor: colors.cardBg,
          alignItems: 'center',
        },
        styleItemActive: {
          borderColor: colors.accent,
          backgroundColor: colors.background,
        },
        styleName: {
          fontFamily: Fonts.bold,
          fontSize: 10,
          color: colors.muted,
          marginTop: 4,
        },
        colorSection: {
          marginBottom: Spacing.lg,
        },
        colorLabel: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.muted,
          marginBottom: Spacing.sm,
        },
        colorRow: {
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: Spacing.sm,
        },
        colorDot: {
          width: 36,
          height: 36,
          borderRadius: 18,
          borderWidth: 3,
          borderColor: colors.border,
        },
        colorDotActive: {
          borderColor: colors.accent,
          shadowColor: colors.accent,
          shadowOffset: {width: 0, height: 0},
          shadowOpacity: 0.5,
          shadowRadius: 4,
        },
        btnRow: {
          flexDirection: 'row',
          gap: Spacing.md,
        },
        flex1: {flex: 1},
      }),
    [colors],
  );
}
