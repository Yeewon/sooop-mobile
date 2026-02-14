import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Circle, RectProps } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const AnimatedRect = Animated.createAnimatedComponent(
  Rect as React.ComponentType<RectProps>,
);

function TwinklingStar({
  x,
  y,
  size,
  baseOpacity,
  delay,
}: {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  delay: number;
}) {
  const dimOpacity = Math.max(0.1, baseOpacity - 0.35);
  const animatedProps = useAnimatedProps(() => ({
    opacity: withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(dimOpacity, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(baseOpacity, {
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
          }),
        ),
        -1,
        true,
      ),
    ),
  }));

  return (
    <AnimatedRect
      x={x}
      y={y}
      width={size}
      height={size}
      fill={N.star}
      animatedProps={animatedProps}
    />
  );
}
import { Fonts, FontSizes, Spacing } from '../theme';
import NintendoButton from '../components/NintendoButton';
import PixelAvatar from '../components/PixelAvatar';
import { useAuthContext } from '../contexts/AuthContext';
import type { AvatarData } from '../shared/types';
import {
  NPC_NAMES,
  NPC_TITLES,
  NPC_PERSONALITIES,
  getRandomResponse,
} from '../components/village/npcResponses';
import { NPC_DEFS } from '../components/village/npcDefinitions';
import type { NpcType } from '../components/village/npcDefinitions';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAmbientSound, SOUND_LABELS } from '../hooks/useAmbientSound';
import TypewriterText from '../components/TypewriterText';
import { supabase, supabaseUrl } from '../lib/supabase';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

const DAILY_LIMIT = 30;
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCENE_HEIGHT = 200;

// ── 밤 테마 (이 화면은 항상 "밤") ──
const N = {
  sky: '#0F1A2E',
  ground: '#1A3D1A',
  groundEdge: '#2D5A2D',
  star: '#FFE8A0',
  moon: '#FFF8DC',
  treeDark: '#132A13',
  treeMed: '#1A351A',
  // UI
  cardBg: '#162238',
  text: '#E8E0D0',
  textMuted: '#6B7B8B',
  border: '#1E3048',
  bubbleNpc: '#1B2A40',
  bubbleUser: '#34C759',
  nameColor: '#C4956A',
  inputBg: '#0D1525',
  white: '#FFFFFF',
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

interface ChatMessage {
  role: 'user' | 'npc';
  text: string;
}

type Props = NativeStackScreenProps<any, 'NpcChat'>;

export default function NpcChatScreen({ route, navigation }: Props) {
  const { npcType } = route.params as { npcType: NpcType };
  const npcDef = NPC_DEFS.find(d => d.type === npcType) ?? NPC_DEFS[0];
  const { profile } = useAuthContext();
  const avatarData = (profile?.avatar_data as AvatarData | null) ?? null;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [remaining, setRemaining] = useState(DAILY_LIMIT);
  const [showWelcome, setShowWelcome] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const npcName = NPC_NAMES[npcDef.type];
  const limitReached = remaining <= 0;
  const { isListening, transcript, toggleListening } = useSpeechRecognition();
  const { currentSound, cycleSound } = useAmbientSound();

  // 음성 인식 결과를 입력창에 반영
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // 화면 진입 시 서버에서 남은 횟수 조회 + 환영 모달 표시
  useEffect(() => {
    (async () => {
      try {
        setTimeout(() => setShowWelcome(true), 500);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;
        const res = await fetch(`${supabaseUrl}/functions/v1/npc-chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.remaining === 'number') {
            setRemaining(data.remaining);
          }
        }
      } catch {
        // 실패 시 기본값 유지
      }
      // 환영 모달 표시
    })();
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || typing || limitReached) return;

    const userMsg: ChatMessage = { role: 'user', text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setTyping(true);
    scrollToBottom();

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const res = await fetch(`${supabaseUrl}/functions/v1/npc-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          npcType: npcDef.type,
          messages: updatedMessages,
        }),
      });

      const data = await res.json();

      if (typeof data.remaining === 'number') {
        setRemaining(data.remaining);
      }

      if (res.status === 429) {
        setRemaining(0);
        return;
      }

      if (!res.ok) throw new Error('API error');

      const reply = data.reply || getRandomResponse(npcDef.type);
      setMessages(prev => [...prev, { role: 'npc', text: reply }]);
    } catch {
      const fallback = getRandomResponse(npcDef.type);
      setMessages(prev => [...prev, { role: 'npc', text: fallback }]);
    } finally {
      setTyping(false);
      scrollToBottom();
    }
  }, [input, typing, limitReached, messages, npcDef.type, scrollToBottom]);

  // ── 별 생성 (seeded) ──
  const stars = useMemo(() => {
    const result: { x: number; y: number; size: number; opacity: number }[] =
      [];
    for (let i = 0; i < 25; i++) {
      result.push({
        x: seededRandom(i * 13 + 7) * (SCREEN_WIDTH - 4),
        y: seededRandom(i * 13 + 11) * (SCENE_HEIGHT - 60),
        size: seededRandom(i * 13 + 17) > 0.7 ? 3 : 2,
        opacity: 0.5 + seededRandom(i * 13 + 23) * 0.5,
      });
    }
    return result;
  }, []);

  // ── NPC 픽셀아트 ──
  const npcArt = useMemo(() => {
    const { art } = npcDef;
    const rects: React.ReactElement[] = [];
    art.grid.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell === 0) return;
        rects.push(
          <Rect
            key={`${ry}-${rx}`}
            x={rx * art.pixelSize}
            y={ry * art.pixelSize}
            width={art.pixelSize}
            height={art.pixelSize}
            fill={art.palette[cell]}
          />,
        );
      });
    });
    return (
      <Svg width={npcDef.renderWidth} height={npcDef.renderHeight}>
        {rects}
      </Svg>
    );
  }, [npcDef]);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* ── 밤 장면 ── */}
        <View style={styles.scene}>
          <Svg
            width={SCREEN_WIDTH}
            height={SCENE_HEIGHT}
            style={StyleSheet.absoluteFill}
          >
            {/* 하늘 */}
            <Rect
              x={0}
              y={0}
              width={SCREEN_WIDTH}
              height={SCENE_HEIGHT}
              fill={N.sky}
            />

            {/* 별 (반짝임) */}
            {stars.map((s, i) => (
              <TwinklingStar
                key={`star-${i}`}
                x={s.x}
                y={s.y}
                size={s.size}
                baseOpacity={s.opacity}
                delay={i * 200}
              />
            ))}

            {/* 초승달 */}
            <Circle
              cx={SCREEN_WIDTH - 45}
              cy={35}
              r={14}
              fill={N.moon}
              opacity={0.9}
            />
            <Circle cx={SCREEN_WIDTH - 38} cy={30} r={12} fill={N.sky} />

            {/* 잔디 */}
            <Rect
              x={0}
              y={SCENE_HEIGHT - 48}
              width={SCREEN_WIDTH}
              height={48}
              fill={N.ground}
            />
            <Rect
              x={0}
              y={SCENE_HEIGHT - 48}
              width={SCREEN_WIDTH}
              height={3}
              fill={N.groundEdge}
            />

            {/* 나무 실루엣 — 왼쪽 큰 나무 */}
            <Rect
              x={24}
              y={SCENE_HEIGHT - 85}
              width={8}
              height={37}
              fill="#3A2A1A"
            />
            <Circle cx={28} cy={SCENE_HEIGHT - 100} r={18} fill={N.treeDark} />
            <Circle cx={18} cy={SCENE_HEIGHT - 92} r={14} fill={N.treeDark} />
            <Circle cx={38} cy={SCENE_HEIGHT - 94} r={13} fill={N.treeDark} />
            <Circle cx={28} cy={SCENE_HEIGHT - 112} r={12} fill="#0F260F" />

            {/* 왼쪽 작은 나무 */}
            <Rect
              x={64}
              y={SCENE_HEIGHT - 68}
              width={5}
              height={20}
              fill="#3A2A1A"
            />
            <Circle cx={66} cy={SCENE_HEIGHT - 78} r={12} fill={N.treeDark} />
            <Circle cx={58} cy={SCENE_HEIGHT - 72} r={10} fill={N.treeDark} />
            <Circle cx={74} cy={SCENE_HEIGHT - 74} r={9} fill={N.treeDark} />

            {/* 오른쪽 큰 나무 */}
            <Rect
              x={SCREEN_WIDTH - 32}
              y={SCENE_HEIGHT - 82}
              width={7}
              height={34}
              fill="#3A2A1A"
            />
            <Circle
              cx={SCREEN_WIDTH - 28}
              cy={SCENE_HEIGHT - 96}
              r={17}
              fill={N.treeDark}
            />
            <Circle
              cx={SCREEN_WIDTH - 40}
              cy={SCENE_HEIGHT - 90}
              r={13}
              fill={N.treeDark}
            />
            <Circle
              cx={SCREEN_WIDTH - 18}
              cy={SCENE_HEIGHT - 88}
              r={12}
              fill={N.treeDark}
            />
            <Circle
              cx={SCREEN_WIDTH - 28}
              cy={SCENE_HEIGHT - 108}
              r={11}
              fill="#0F260F"
            />

            {/* 오른쪽 작은 나무 */}
            <Rect
              x={SCREEN_WIDTH - 78}
              y={SCENE_HEIGHT - 72}
              width={5}
              height={24}
              fill="#3A2A1A"
            />
            <Circle
              cx={SCREEN_WIDTH - 76}
              cy={SCENE_HEIGHT - 82}
              r={13}
              fill={N.treeDark}
            />
            <Circle
              cx={SCREEN_WIDTH - 84}
              cy={SCENE_HEIGHT - 76}
              r={10}
              fill={N.treeDark}
            />
            <Circle
              cx={SCREEN_WIDTH - 66}
              cy={SCENE_HEIGHT - 78}
              r={10}
              fill={N.treeDark}
            />
          </Svg>

          {/* 뒤로가기 */}
          <Pressable
            onPress={() => {
              if (messages.length > 0) {
                Alert.alert(
                  '대화 종료',
                  '마을로 돌아가면 대화 내용이 사라져.\n정말 나갈래?',
                  [
                    { text: '계속 대화하기', style: 'cancel' },
                    {
                      text: '나가기',
                      style: 'destructive',
                      onPress: () => navigation.goBack(),
                    },
                  ],
                );
              } else {
                navigation.goBack();
              }
            }}
            style={styles.backBtn}
            hitSlop={12}
          >
            <Text style={styles.backBtnText}>← 마을로 돌아가기</Text>
          </Pressable>

          {/* 사운드 토글 */}
          <Pressable onPress={cycleSound} style={styles.soundBtn} hitSlop={12}>
            <Svg width={14} height={14} viewBox="0 0 7 7">
              {currentSound ? (
                <>
                  {/* 스피커 ON */}
                  <Rect x={0} y={2} width={2} height={3} fill={N.text} />
                  <Rect x={2} y={1} width={1} height={5} fill={N.text} />
                  <Rect x={3} y={0} width={1} height={7} fill={N.text} />
                  <Rect x={5} y={1} width={1} height={1} fill={N.star} />
                  <Rect x={6} y={3} width={1} height={1} fill={N.star} />
                  <Rect x={5} y={5} width={1} height={1} fill={N.star} />
                </>
              ) : (
                <>
                  {/* 스피커 OFF */}
                  <Rect x={0} y={2} width={2} height={3} fill={N.textMuted} />
                  <Rect x={2} y={1} width={1} height={5} fill={N.textMuted} />
                  <Rect x={3} y={0} width={1} height={7} fill={N.textMuted} />
                  <Rect x={5} y={0} width={1} height={1} fill={N.textMuted} />
                  <Rect x={6} y={1} width={1} height={1} fill={N.textMuted} />
                  <Rect x={5} y={2} width={1} height={1} fill={N.textMuted} />
                  <Rect x={6} y={3} width={1} height={1} fill={N.textMuted} />
                  <Rect x={5} y={4} width={1} height={1} fill={N.textMuted} />
                  <Rect x={6} y={5} width={1} height={1} fill={N.textMuted} />
                  <Rect x={5} y={6} width={1} height={1} fill={N.textMuted} />
                </>
              )}
            </Svg>
            <Text style={styles.soundLabel}>
              {currentSound ? SOUND_LABELS[currentSound] : '소리 끔'}
            </Text>
          </Pressable>

          {/* 캐릭터 */}
          <View style={styles.characters}>
            <View style={styles.charWrap}>
              <PixelAvatar avatarData={avatarData} size={56} />
              <Text style={styles.charName}>나</Text>
            </View>
            <View style={styles.charWrap}>
              {npcArt}
              <Text style={styles.charName}>{npcName}</Text>
            </View>
          </View>
        </View>

        {/* ── 정보 바 ── */}
        <View style={styles.infoBar}>
          <View>
            <Text style={styles.npcTitle}>
              {npcName} · {NPC_TITLES[npcDef.type]}
            </Text>
            <Text style={styles.charPersonality}>
              {NPC_PERSONALITIES[npcDef.type]}
            </Text>
          </View>
          <Text style={styles.countText}>
            남은 대화 {Math.max(0, remaining)}/{DAILY_LIMIT}
          </Text>
        </View>

        {/* ── 대화 영역 ── */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 && !typing && (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                {npcName}에게 하고 싶은 말을 적어봐.{'\n'}
                아무도 모르는 비밀이야.
              </Text>
              <Text style={styles.emptySubtext}>
                대화는 어디에도 저장되지 않아.
              </Text>
            </View>
          )}
          {messages.map((msg, i) => {
            const isLastNpc =
              msg.role === 'npc' &&
              i ===
                messages.reduce(
                  (last, m, idx) => (m.role === 'npc' ? idx : last),
                  -1,
                );
            return (
              <View
                key={i}
                style={
                  msg.role === 'user' ? styles.userBubble : styles.npcBubble
                }
              >
                {msg.role === 'npc' && (
                  <Text style={styles.npcBubbleName}>{npcName}</Text>
                )}
                {msg.role === 'user' ? (
                  <Text style={styles.userText}>{msg.text}</Text>
                ) : isLastNpc ? (
                  <TypewriterText text={msg.text} style={styles.npcText} />
                ) : (
                  <Text style={styles.npcText}>{msg.text}</Text>
                )}
              </View>
            );
          })}
          {typing && (
            <View style={styles.npcBubble}>
              <Text style={styles.npcBubbleName}>{npcName}</Text>
              <Text style={styles.npcText}>...</Text>
            </View>
          )}
        </ScrollView>

        {/* ── 입력 영역 ── */}
        <View style={styles.inputArea}>
          {limitReached ? (
            <Text style={styles.limitText}>
              오늘 대화는 다 썼어. 내일 다시 만나자!
            </Text>
          ) : (
            <View style={styles.inputRow}>
              <Pressable
                onPress={toggleListening}
                hitSlop={8}
                style={{
                  ...styles.micBtn,
                  ...(isListening ? styles.micBtnActive : {}),
                }}
              >
                <Svg width={18} height={18} viewBox="0 0 9 9">
                  {isListening ? (
                    /* 정지 아이콘 (픽셀 ■) */
                    <Rect x={2} y={2} width={5} height={5} fill={N.white} />
                  ) : (
                    /* 픽셀 마이크 아이콘 */
                    <>
                      {/* 마이크 헤드 */}
                      <Rect x={3} y={0} width={3} height={1} fill={N.text} />
                      <Rect x={2} y={1} width={5} height={1} fill={N.text} />
                      <Rect x={2} y={2} width={5} height={1} fill={N.text} />
                      <Rect x={3} y={3} width={3} height={1} fill={N.text} />
                      {/* 스탠드 */}
                      <Rect x={4} y={4} width={1} height={1} fill={N.text} />
                      <Rect x={1} y={4} width={1} height={1} fill={N.text} />
                      <Rect x={7} y={4} width={1} height={1} fill={N.text} />
                      <Rect x={1} y={5} width={1} height={1} fill={N.text} />
                      <Rect x={7} y={5} width={1} height={1} fill={N.text} />
                      <Rect x={2} y={6} width={1} height={1} fill={N.text} />
                      <Rect x={6} y={6} width={1} height={1} fill={N.text} />
                      {/* 받침대 */}
                      <Rect x={4} y={6} width={1} height={1} fill={N.text} />
                      <Rect x={4} y={7} width={1} height={1} fill={N.text} />
                      <Rect x={3} y={8} width={3} height={1} fill={N.text} />
                    </>
                  )}
                </Svg>
              </Pressable>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder={isListening ? '듣고 있어...' : '여기에 적어봐...'}
                placeholderTextColor={isListening ? N.nameColor : N.textMuted}
                maxLength={100}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                submitBehavior="submit"
                editable={!typing}
              />
              <NintendoButton
                title="보내기"
                variant="accent"
                small
                onPress={handleSend}
                disabled={!input.trim() || typing}
              />
            </View>
          )}
        </View>

        {/* 환영 모달 */}
        <Modal
          visible={showWelcome}
          transparent
          animationType="fade"
          onRequestClose={() => setShowWelcome(false)}
        >
          <Pressable
            style={styles.welcomeOverlay}
            onPress={() => setShowWelcome(false)}
          >
            <Pressable
              style={styles.welcomeCard}
              onPress={e => e.stopPropagation()}
            >
              <Text style={styles.welcomeTitle}>{npcName}와의 속얘기</Text>
              <Text style={styles.welcomeText}>
                하루에 30번까지 이야기할 수 있어!{'\n'}
                여기서 나눈 이야기는 아무도 모르는{'\n'}
                우리만의 비밀이야. 편하게 말해줘!
              </Text>
              <View style={styles.welcomeNpcWrap}>{npcArt}</View>
              <View style={styles.welcomeFeature}>
                <Svg width={16} height={16} viewBox="0 0 7 7">
                  <Rect x={0} y={2} width={2} height={3} fill={N.nameColor} />
                  <Rect x={2} y={1} width={1} height={5} fill={N.nameColor} />
                  <Rect x={3} y={0} width={1} height={7} fill={N.nameColor} />
                  <Rect x={5} y={1} width={1} height={1} fill={N.star} />
                  <Rect x={6} y={3} width={1} height={1} fill={N.star} />
                  <Rect x={5} y={5} width={1} height={1} fill={N.star} />
                </Svg>
                <Text style={styles.welcomeFeatureText}>
                  배경음을 켜고 편안한 마음으로 이야기해봐!
                </Text>
              </View>
              <Pressable
                style={styles.welcomeBtn}
                onPress={() => setShowWelcome(false)}
              >
                <Text style={styles.welcomeBtnText}>대화 시작하기</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: N.sky,
  },
  flex: {
    flex: 1,
  },
  // ── 밤 장면 ──
  scene: {
    width: SCREEN_WIDTH,
    height: SCENE_HEIGHT,
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  backBtnText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    color: N.text,
  },
  soundBtn: {
    position: 'absolute' as const,
    bottom: Spacing.sm,
    right: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
  },
  soundLabel: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: N.text,
  },
  characters: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 32,
  },
  charWrap: {
    alignItems: 'center',
  },
  charName: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: N.text,
    marginTop: 4,
  },
  charPersonality: {
    fontFamily: Fonts.regular,
    fontSize: 9,
    color: N.textMuted,
    marginTop: 2,
  },
  // ── 정보 바 ──
  infoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: N.border,
  },
  npcTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    color: N.nameColor,
  },
  countText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: N.textMuted,
  },
  // ── 대화 영역 ──
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: N.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptySubtext: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: N.nameColor,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: N.bubbleUser,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: '80%',
  },
  userText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: N.white,
    lineHeight: 20,
  },
  npcBubble: {
    alignSelf: 'flex-start',
    backgroundColor: N.bubbleNpc,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: '80%',
    borderWidth: 1,
    borderColor: N.border,
  },
  npcBubbleName: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xs,
    color: N.nameColor,
    marginBottom: 2,
  },
  npcText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: N.text,
    lineHeight: 20,
  },
  // ── 입력 영역 ──
  inputArea: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: N.border,
    backgroundColor: N.cardBg,
  },
  limitText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    color: N.textMuted,
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    borderWidth: 2,
    borderColor: N.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: N.text,
    backgroundColor: N.inputBg,
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: N.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micBtnActive: {
    backgroundColor: N.bubbleUser,
  },
  // ── 환영 모달 ──
  welcomeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  welcomeCard: {
    backgroundColor: N.cardBg,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: N.border,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.lg,
    color: N.nameColor,
    marginBottom: Spacing.md,
  },
  welcomeText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.sm,
    color: N.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  welcomeNpcWrap: {
    marginBottom: Spacing.md,
  },
  welcomeFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: Spacing.lg,
  },
  welcomeFeatureText: {
    fontFamily: Fonts.regular,
    fontSize: FontSizes.xs,
    color: N.text,
    flex: 1,
  },
  welcomeBtn: {
    backgroundColor: N.bubbleUser,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 2,
    borderColor: N.border,
  },
  welcomeBtnText: {
    fontFamily: Fonts.bold,
    fontSize: FontSizes.sm,
    color: N.white,
  },
});
