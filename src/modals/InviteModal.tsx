import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Image,
  Share,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Fonts, FontSizes, Spacing } from '../theme';
import { useColors } from '../contexts/ThemeContext';
import type { ColorScheme } from '../theme/colors';
import NintendoButton from '../components/NintendoButton';
import NintendoCard from '../components/NintendoCard';
import { shareViaKakao } from '../lib/kakaoShare';
import {
  getKakaoFriends,
  sendKakaoInviteMessage,
  KakaoFriend,
} from '../lib/kakaoFriends';
import { useAuthContext } from '../contexts/AuthContext';

interface InviteModalProps {
  myInviteCode: string;
  onAddFriend: (code: string) => Promise<{ error: string | null }>;
  onClose: () => void;
}

export default function InviteModal({
  myInviteCode,
  onAddFriend,
  onClose,
}: InviteModalProps) {
  const colors = useColors();
  const styles = useStyles(colors);
  const { user } = useAuthContext();
  const [friendCode, setFriendCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // 카카오 친구 관련
  const isKakaoUser = user?.app_metadata?.provider === 'kakao';
  const [kakaoFriends, setKakaoFriends] = useState<KakaoFriend[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [sentUuids, setSentUuids] = useState<Set<string>>(new Set());

  const inviteLink = `https://sooop-hi.vercel.app/invite/${myInviteCode}`;

  useEffect(() => {
    if (isKakaoUser) {
      loadKakaoFriends();
    }
  }, [isKakaoUser]);

  const loadKakaoFriends = async () => {
    setFriendsLoading(true);
    try {
      const friends = await getKakaoFriends();
      setKakaoFriends(friends);
    } catch {
      // 친구 목록 조회 실패 시 조용히 무시 (권한 없을 수 있음)
    }
    setFriendsLoading(false);
  };

  const handleSendToFriend = async (friend: KakaoFriend) => {
    try {
      await sendKakaoInviteMessage([friend.uuid], inviteLink);
      setSentUuids(prev => new Set([...prev, friend.uuid]));
    } catch {}
  };

  const handleCopy = () => {
    Clipboard.setString(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleKakaoShare = async () => {
    try {
      await shareViaKakao(myInviteCode, inviteLink);
    } catch {}
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `우리 마을에 놀러 와! 이 링크로 바로 이웃이 될 수 있어.\n${inviteLink}`,
      });
    } catch {}
  };

  const handleAdd = async () => {
    if (!friendCode.trim()) return;
    setError('');
    setLoading(true);
    const result = await onAddFriend(friendCode.trim());
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
    setLoading(false);
  };

  return (
    <Pressable style={styles.overlay} onPress={onClose}>
      <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>이웃 초대</Text>
          </View>

          {/* 카카오톡 친구 목록 */}
          {isKakaoUser && (
            <>
              <Text style={styles.label}>카카오톡 친구 초대</Text>
              {friendsLoading ? (
                <ActivityIndicator
                  color={colors.muted}
                  style={{marginVertical: Spacing.md}}
                />
              ) : kakaoFriends.length > 0 ? (
                <ScrollView
                  style={styles.friendsScroll}
                  contentContainerStyle={styles.friendsList}
                  nestedScrollEnabled>
                  {kakaoFriends.map(friend => (
                    <View key={friend.uuid} style={styles.friendRow}>
                      {friend.profile_thumbnail_image ? (
                        <Image
                          source={{uri: friend.profile_thumbnail_image}}
                          style={styles.friendAvatar}
                        />
                      ) : (
                        <View
                          style={{
                            ...styles.friendAvatar,
                            backgroundColor: colors.border,
                          }}
                        />
                      )}
                      <Text style={styles.friendName} numberOfLines={1}>
                        {friend.profile_nickname}
                      </Text>
                      {sentUuids.has(friend.uuid) ? (
                        <Text style={styles.sentText}>보냄</Text>
                      ) : (
                        <NintendoButton
                          title="초대"
                          variant="accent"
                          small
                          onPress={() => handleSendToFriend(friend)}
                        />
                      )}
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.hint}>
                  앱을 사용 중인 카카오톡 친구가 없어
                </Text>
              )}
              <View style={styles.divider} />
            </>
          )}

          {/* 초대 링크 */}
          <Text style={styles.label}>초대장 보내기</Text>
          <NintendoCard style={styles.codeBox}>
            <Text style={styles.codeText}>{inviteLink}</Text>
          </NintendoCard>
          <Pressable onPress={handleKakaoShare} style={styles.kakaoButton}>
            <Text style={styles.kakaoButtonText}>카카오톡으로 초대하기</Text>
          </Pressable>
          <View style={styles.btnRow}>
            <NintendoButton
              title={copied ? '복사했어!' : '복사하기'}
              variant="blue"
              onPress={handleCopy}
              style={styles.flex1}
            />
            <NintendoButton
              title="다른 앱으로 공유"
              variant="accent"
              onPress={handleShare}
              style={styles.flex1}
            />
          </View>
          <Text style={styles.hint}>이 초대장을 보내면 바로 이웃이 돼</Text>

          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 코드 입력 */}
          <Text style={styles.label}>이웃 초대 코드 입력</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="코드 입력"
              placeholderTextColor={colors.muted}
              value={friendCode}
              onChangeText={t => setFriendCode(t.toUpperCase())}
              maxLength={6}
              autoCapitalize="characters"
            />
            <NintendoButton
              title={loading ? '...' : '연결'}
              variant="accent"
              small
              onPress={handleAdd}
              disabled={loading || !friendCode.trim()}
            />
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>닫기</Text>
          </Pressable>
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
          maxHeight: '85%',
        },
        titleRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
          marginBottom: Spacing.xl,
        },
        titleIcon: { width: 24, height: 24 },
        title: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.lg,
          color: colors.foreground,
        },
        label: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
          marginBottom: Spacing.sm,
        },
        friendsScroll: {
          maxHeight: 200,
        },
        friendsList: {
          gap: Spacing.sm,
        },
        friendRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.sm,
        },
        friendAvatar: {
          width: 36,
          height: 36,
          borderRadius: 18,
        },
        friendName: {
          flex: 1,
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.foreground,
        },
        sentText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.xs,
          color: colors.muted,
        },
        codeBox: {
          padding: Spacing.md,
          alignItems: 'center',
          marginBottom: Spacing.sm,
        },
        codeText: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.accent,
        },
        btnRow: {
          flexDirection: 'row',
          gap: Spacing.sm,
          marginBottom: Spacing.xs,
        },
        flex1: { flex: 1 },
        hint: {
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.muted,
          marginTop: Spacing.sm,
        },
        divider: {
          height: 2,
          backgroundColor: colors.border,
          marginVertical: Spacing.xl,
        },
        inputRow: {
          flexDirection: 'row',
          gap: Spacing.sm,
          alignItems: 'center',
        },
        input: {
          flex: 1,
          borderWidth: 3,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          fontFamily: Fonts.regular,
          fontSize: FontSizes.sm,
          color: colors.foreground,
          backgroundColor: colors.background,
          textAlign: 'center',
          letterSpacing: 4,
        },
        error: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.accent,
          marginTop: Spacing.sm,
        },
        kakaoButton: {
          backgroundColor: '#FEE500',
          borderRadius: 12,
          paddingVertical: Spacing.md,
          alignItems: 'center' as const,
          borderWidth: 2,
          borderColor: '#E5CF00',
          marginBottom: Spacing.sm,
        },
        kakaoButtonText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: '#191919',
        },
        closeBtn: {
          alignItems: 'center',
          marginTop: Spacing.lg,
          paddingVertical: Spacing.sm,
        },
        closeBtnText: {
          fontFamily: Fonts.bold,
          fontSize: FontSizes.sm,
          color: colors.muted,
        },
      }),
    [colors],
  );
}
