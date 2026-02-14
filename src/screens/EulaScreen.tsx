import React, {useState} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useColors} from '../contexts/ThemeContext';
import {useAuthContext} from '../contexts/AuthContext';
import {Fonts, FontSizes, Spacing} from '../theme';
import NintendoButton from '../components/NintendoButton';
import NintendoCard from '../components/NintendoCard';

const EULA_TEXT = `숲(sooop) 이용약관

1. 서비스 이용 규칙
- 다른 이웃에게 불쾌감을 주는 행위(욕설, 비방, 혐오 표현, 성적 콘텐츠 등)는 금지됩니다.
- 부적절한 닉네임이나 메시지를 사용할 수 없습니다.
- 스팸, 광고, 사기 행위는 금지됩니다.

2. 제재 조치
- 위 규칙을 위반할 경우 경고 없이 계정이 정지될 수 있습니다.
- 신고된 콘텐츠는 24시간 이내에 검토 후 조치됩니다.

3. 안전 기능
- 불쾌한 이웃은 차단할 수 있으며, 차단 시 해당 이웃과의 모든 소통이 중단됩니다.
- 부적절한 행위를 하는 이웃을 신고할 수 있습니다.
- 신고 접수 시 운영팀이 확인 후 적절한 조치를 취합니다.

4. 개인정보
- 귓속말 메시지는 10초 후 자동 삭제되며 서버에 저장되지 않습니다.
- 인사(이모지)와 체크인 기록만 서버에 저장됩니다.

5. 면책
- NPC 대화는 AI가 생성한 응답이며, 전문적인 상담이 아닙니다.
- 의학적, 법률적 조언을 대체하지 않습니다.`;

export default function EulaScreen() {
  const colors = useColors();
  const {acceptEula} = useAuthContext();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await acceptEula();
    } catch {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
      <Text style={[styles.header, {color: colors.foreground}]}>
        이용약관
      </Text>
      <Text style={[styles.subheader, {color: colors.muted}]}>
        숲 마을에 들어가기 전에 읽어줘!
      </Text>

      <NintendoCard style={styles.card}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.eulaText, {color: colors.foreground}]}>
            {EULA_TEXT}
          </Text>
        </ScrollView>
      </NintendoCard>

      <NintendoButton
        title={loading ? '처리 중...' : '동의하고 시작하기'}
        variant="accent"
        onPress={handleAccept}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.lg,
    paddingTop: 60,
  },
  header: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xl,
    textAlign: 'center',
    marginBottom: 4,
  },
  subheader: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  card: {
    flex: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  scroll: {
    flex: 1,
  },
  eulaText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    lineHeight: 22,
  },
});
