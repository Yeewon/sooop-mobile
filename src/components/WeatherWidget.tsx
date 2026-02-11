import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Modal,
} from 'react-native';
import { useColors } from '../contexts/ThemeContext';
import type { ColorScheme } from '../theme/colors';
import { Fonts, FontSizes, Spacing } from '../theme';
import type { WeatherData } from '../hooks/useWeather';
import NintendoButton from './NintendoButton';
import NintendoCard from './NintendoCard';
import TypewriterText from './TypewriterText';
import PixelAvatar from './PixelAvatar';
import { useAuthContext } from '../contexts/AuthContext';

// 배경색 매핑 [라이트, 다크]
const WEATHER_BG: Record<string, [string, string]> = {
  '01d': ['#FFE082', '#5C4A00'], // 맑음 낮 — 따뜻한 노랑
  '01n': ['#B3C6E7', '#1A1A3E'], // 맑음 밤 — 차분한 파랑
  '02d': ['#C8E6C9', '#2A4A2A'], // 구름 조금 낮 — 연두
  '02n': ['#B0BEC5', '#2A2A40'], // 구름 조금 밤
  '03d': ['#B0BEC5', '#303050'], // 구름 많음
  '03n': ['#B0BEC5', '#303050'],
  '04d': ['#9E9E9E', '#383850'], // 흐림
  '04n': ['#9E9E9E', '#383850'],
  '09d': ['#81D4FA', '#1A3050'], // 소나기
  '09n': ['#81D4FA', '#1A3050'],
  '10d': ['#64B5F6', '#1A2A50'], // 비
  '10n': ['#64B5F6', '#1A2A50'],
  '11d': ['#CE93D8', '#3A1A50'], // 천둥
  '11n': ['#CE93D8', '#3A1A50'],
  '13d': ['#B3E5FC', '#1A3540'], // 눈
  '13n': ['#B3E5FC', '#1A3540'],
  '50d': ['#BDBDBD', '#35354A'], // 안개
  '50n': ['#BDBDBD', '#35354A'],
};

const DEFAULT_BG: [string, string] = ['#FFE082', '#5C4A00'];

// ── 날씨 픽셀 아트 ──
const PX = 4;

type PixelGrid = number[][];

const PIXEL_ART: Record<string, { grid: PixelGrid; color: [string, string] }> =
  {
    cloud: {
      grid: [
        [0, 0, 0, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
      ],
      color: ['#FFFFFF', '#7888A0'],
    },
    rain: {
      grid: [
        [0, 0, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
      ],
      color: ['#2266AA', '#7CB8FF'],
    },
    thunder: {
      grid: [
        [0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0],
        [1, 1, 1, 1, 0],
        [0, 0, 1, 1, 0],
        [0, 1, 1, 0, 0],
        [0, 1, 0, 0, 0],
      ],
      color: ['#CC9900', '#FFD740'],
    },
    snow: {
      grid: [
        [0, 0, 1, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0],
        [0, 1, 0, 0, 0, 0, 0],
      ],
      color: ['#FFFFFF', '#D0E0F0'],
    },
    fog: {
      grid: [
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1],
      ],
      color: ['#777777', '#8899AA'],
    },
  };

function getPixelType(icon: string): string | null {
  const code = icon.replace(/[dn]$/, '');
  if (code === '03' || code === '04') return 'cloud';
  if (code === '09' || code === '10') return 'rain';
  if (code === '11') return 'thunder';
  if (code === '13') return 'snow';
  if (code === '50') return 'fog';
  return null;
}

function WeatherPixels({ icon, isDark }: { icon: string; isDark: boolean }) {
  const type = getPixelType(icon);

  const pixels = useMemo(() => {
    if (!type) return null;

    const { grid, color } = PIXEL_ART[type];
    const fill = isDark ? color[1] : color[0];
    const tileW = grid[0].length * PX;
    const tileH = grid.length * PX;
    const spacingX = tileW + 44;
    const spacingY = tileH + 32;
    const cols = Math.ceil(420 / spacingX);
    const rows = Math.ceil(220 / spacingY);

    const nodes: React.ReactNode[] = [];

    for (let ty = 0; ty < rows; ty++) {
      for (let tx = 0; tx < cols; tx++) {
        const ox = tx * spacingX + (ty % 2 ? spacingX * 0.5 : 0);
        const oy = ty * spacingY;

        grid.forEach((row, y) => {
          row.forEach((cell, x) => {
            if (cell) {
              nodes.push(
                <View
                  key={`${tx}-${ty}-${x}-${y}`}
                  style={{
                    position: 'absolute',
                    left: ox + x * PX,
                    top: oy + y * PX,
                    width: PX,
                    height: PX,
                    backgroundColor: fill,
                  }}
                />,
              );
            }
          });
        });
      }
    }

    return nodes;
  }, [type, isDark]);

  if (!pixels) return null;

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        opacity: 0.18,
      }}
      pointerEvents="none"
    >
      {pixels}
    </View>
  );
}

// 날씨 + 온도에 따른 한마디
function getWeatherMessage(icon: string, temp: number): string {
  const code = icon.replace(/[dn]$/, '');

  if (code === '11') return '천둥번개야, 실내에 있어!';
  if (code === '09' || code === '10') {
    if (temp <= 5) return '비도 오고 춥다! 따뜻하게 입어';
    return '우산 꼭 챙겨!';
  }
  if (code === '13') {
    if (temp <= -5) return '폭설이야! 밖에 나가지 마';
    return '눈 온다! 미끄럼 조심해';
  }
  if (code === '50') return '안개가 짙어, 조심히 다녀';

  if (temp <= -5) return '완전 꽁꽁! 따뜻하게 입어';
  if (temp <= 5) return '많이 춥다! 겹겹이 입고 나가';
  if (temp <= 10) return '쌀쌀해, 겉옷 챙겨!';
  if (temp <= 18) return '산책하기 딱 좋은 날씨야';
  if (temp <= 25) return '오늘 날씨 완전 좋다!';
  if (temp <= 30) return '더워! 물 많이 마셔';
  return '폭염 주의! 시원한 곳에 있어';
}

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading: boolean;
  locationGranted: boolean;
  dailyMessage: string;
}

export default function WeatherWidget({
  weather,
  loading,
  locationGranted,
  dailyMessage,
}: WeatherWidgetProps) {
  const colors = useColors();
  const { profile } = useAuthContext();
  const isDark = colors.background === '#1A1A2E';
  const styles = useStyles(colors);
  const [showConfirm, setShowConfirm] = useState(false);
  if (loading || !weather) {
    return null;
  }

  const bg = WEATHER_BG[weather.icon] || DEFAULT_BG;
  const bgColor = isDark ? bg[1] : bg[0];
  const textColor = isDark ? '#F0EDE8' : '#1A1000';
  const mutedColor = isDark ? '#A09888' : '#5A4A30';
  const weatherMsg = getWeatherMessage(weather.icon, weather.temp);

  return (
    <>
      <View style={{ ...styles.container, backgroundColor: bgColor }}>
        <WeatherPixels icon={weather.icon} isDark={isDark} />
        <View style={styles.weatherRow}>
          <View style={styles.info}>
            <Text style={{ ...styles.temp, color: textColor }}>
              {weather.temp}°
            </Text>
            <Text style={{ ...styles.desc, color: textColor }}>
              {weather.description}
            </Text>
          </View>
          <Text style={{ ...styles.city, color: mutedColor }}>
            {weather.city}
          </Text>
        </View>
        <View
          style={{
            ...styles.weatherMsgBg,
            backgroundColor: isDark
              ? 'rgba(0,0,0,0.25)'
              : 'rgba(255,255,255,0.45)',
          }}
        >
          <Text style={{ ...styles.weatherMsg, color: textColor }}>
            {weatherMsg}
          </Text>
        </View>

        {/* 마을 방송 카드 */}

        <View style={styles.broadcastRow}>
          <NintendoCard
            style={{
              ...styles.checkinCard,
              backgroundColor: colors.cardBg,
              shadowOpacity: 0,
              elevation: 0,
              flex: 1,
              marginBottom: 0,
            }}
          >
            <TypewriterText
              text={`${dailyMessage}...`}
              style={styles.checkinText}
            />
          </NintendoCard>
          <PixelAvatar avatarData={profile?.avatar_data ?? null} size={48} />
        </View>
        {!locationGranted && (
          <Pressable
            onPress={() => setShowConfirm(true)}
            style={({ pressed }) => ({
              ...styles.locationBtn,
              ...(pressed
                ? {
                    transform: [{ translateY: 2 }],
                    shadowOffset: { width: 0, height: 0 },
                  }
                : {}),
            })}
          >
            <Text style={styles.locationBtnText}>현재 위치의 날씨 보기</Text>
          </Pressable>
        )}
      </View>

      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowConfirm(false)}>
          <Pressable
            style={styles.modalCard}
            onPress={e => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>우산 챙길까 말까?</Text>
            <Text style={styles.modalSub}>
              내 동네 날씨를 알려줄게.{'\n'}
              위치는 날씨 확인용으로만 쓰고 저장하지 않아!
            </Text>
            <View style={styles.modalBtns}>
              <NintendoButton
                title="취소"
                variant="muted"
                onPress={() => setShowConfirm(false)}
                style={styles.modalBtn}
              />
              <NintendoButton
                title="설정으로 이동"
                variant="blue"
                onPress={() => {
                  setShowConfirm(false);
                  Linking.openSettings();
                }}
                style={styles.modalBtn}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function useStyles(colors: ColorScheme) {
  return useMemo(
    () =>
      StyleSheet.create({
        weatherMsgBg: {
          alignSelf: 'flex-start',
          borderRadius: 6,
          paddingHorizontal: Spacing.sm,
          paddingVertical: 4,
          marginHorizontal: Spacing.xs,
          marginBottom: Spacing.sm,
        },
        weatherMsg: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
        },
        broadcastRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          marginBottom: Spacing.lg,
        },
        // 체크인 카드
        checkinCard: {
          padding: Spacing.xl,
          alignItems: 'center',
          marginBottom: Spacing.lg,
        },
        checkinText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.foreground,
          textAlign: 'center',
          lineHeight: 24,
        },
        container: {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.cardBorder,
          marginBottom: Spacing.md,
          overflow: 'hidden',
        },
        weatherRow: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: Spacing.sm,
        },
        info: {
          flexDirection: 'row',
          alignItems: 'baseline',
          gap: 4,
        },
        temp: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
        },
        desc: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.base,
          opacity: 0.8,
        },
        city: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.xs,
          marginLeft: 'auto',
        },
        locationBtn: {
          marginTop: Spacing.sm,
          paddingVertical: 8,
          paddingHorizontal: Spacing.md,
          borderRadius: 8,
          borderWidth: 2,
          borderColor: colors.shadowColor,
          backgroundColor: colors.nintendoBlue,
          alignItems: 'center',
          shadowColor: colors.shadowColor,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 0,
          elevation: 3,
        },
        locationBtnText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.white,
        },
        overlay: {
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: Spacing.lg,
        },
        modalCard: {
          backgroundColor: colors.cardBg,
          borderRadius: 16,
          borderWidth: 3,
          borderColor: colors.border,
          padding: Spacing.xl,
          width: '100%',
          maxWidth: 320,
          alignItems: 'center',
        },
        modalTitle: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.foreground,
          textAlign: 'center',
          marginBottom: 8,
        },
        modalSub: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.nintendoBlue,
          textAlign: 'center',
          marginBottom: Spacing.xl,
          lineHeight: 22,
        },
        modalBtns: {
          flexDirection: 'row',
          gap: Spacing.md,
          width: '100%',
        },
        modalBtn: {
          flex: 1,
        },
      }),
    [colors],
  );
}
