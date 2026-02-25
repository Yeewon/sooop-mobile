import {useEffect, useState} from 'react';
import {supabase} from '../lib/supabase';
import {signInWithKakao as signInWithKakaoLib} from '../lib/kakaoAuth';
import {AvatarData, Profile} from '../shared/types';
import {User} from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({data: {session}}) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // 인증 상태 변화 리스너
    const {data: {subscription}} = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // 프로필 조회 (없으면 invite_code 보정만)
  const loadProfile = async (userId: string) => {
    const {data} = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      // 기존 프로필에 invite_code가 없으면 생성
      if (!data.invite_code) {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        await supabase
          .from('profiles')
          .update({invite_code: code})
          .eq('id', userId);
        data.invite_code = code;
      }
      setProfile(data as Profile);
    } else {
      // 프로필이 없는 경우 (카카오 등 소셜 로그인 첫 진입)
      const {data: {user: currentUser}} = await supabase.auth.getUser();
      if (currentUser) {
        const nickname =
          (currentUser.user_metadata?.name as string) ||
          (currentUser.user_metadata?.preferred_username as string) ||
          '새 주민';
        await createProfile(userId, nickname);
        return; // createProfile에서 setLoading(false) 호출
      }
    }
    setLoading(false);
  };

  // 회원가입 시 프로필 생성 (닉네임 + invite_code 포함)
  const createProfile = async (userId: string, nickname: string, avatarData?: AvatarData | null) => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const {data: created} = await supabase
      .from('profiles')
      .insert({
        id: userId,
        nickname,
        invite_code: inviteCode,
        avatar_data: avatarData ?? null,
      })
      .select('*')
      .single();

    if (created) {
      setProfile(created as Profile);
    }
    setLoading(false);
  };

  const signUp = async (
    email: string,
    password: string,
    nickname: string,
    avatarData?: AvatarData,
  ) => {
    const {data, error} = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {nickname, avatar_data: avatarData ?? null},
      },
    });
    if (error) throw error;
    if (
      data.user &&
      (!data.user.identities || data.user.identities.length === 0)
    ) {
      throw {message: 'already_registered', status: 409};
    }
    // 회원가입 직후 프로필 생성 (invite_code 포함)
    if (data.user) {
      await createProfile(data.user.id, nickname, avatarData);
    }
    return data;
  };

  const signInWithKakao = async () => {
    const data = await signInWithKakaoLib();
    // onAuthStateChange가 발동 → loadProfile에서 프로필 자동 생성
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const {data, error} = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const updateNickname = async (nickname: string) => {
    if (!user) throw new Error('로그인이 필요합니다');
    const {error} = await supabase
      .from('profiles')
      .update({nickname})
      .eq('id', user.id);
    if (error) throw error;
    setProfile(prev => (prev ? {...prev, nickname} : prev));
  };

  const updateAvatar = async (avatarData: AvatarData) => {
    if (!user) throw new Error('로그인이 필요합니다');
    const {error} = await supabase
      .from('profiles')
      .update({avatar_data: avatarData})
      .eq('id', user.id);
    if (error) throw error;
    setProfile(prev => (prev ? {...prev, avatar_data: avatarData} : prev));
  };

  const updateAllowKnocks = async (allowKnocks: boolean) => {
    if (!user) throw new Error('로그인이 필요합니다');
    const {error} = await supabase
      .from('profiles')
      .update({allow_knocks: allowKnocks})
      .eq('id', user.id);
    if (error) throw error;
    setProfile(prev => (prev ? {...prev, allow_knocks: allowKnocks} : prev));
  };

  const acceptEula = async () => {
    if (!user) throw new Error('로그인이 필요합니다');
    const now = new Date().toISOString();
    const {error} = await supabase
      .from('profiles')
      .update({eula_accepted_at: now})
      .eq('id', user.id);
    if (error) throw error;
    setProfile(prev => (prev ? {...prev, eula_accepted_at: now} : prev));
  };

  const updateReminderHour = async (hour: number) => {
    if (!user) throw new Error('로그인이 필요합니다');
    const {error} = await supabase
      .from('profiles')
      .update({reminder_hour: hour})
      .eq('id', user.id);
    if (error) throw error;
    setProfile(prev => (prev ? {...prev, reminder_hour: hour} : prev));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signInWithKakao,
    signOut,
    updateNickname,
    updateAvatar,
    acceptEula,
    updateAllowKnocks,
    updateReminderHour,
  };
}
