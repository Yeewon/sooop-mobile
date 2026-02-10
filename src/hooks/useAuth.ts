import {useEffect, useState} from 'react';
import {supabase} from '../lib/supabase';
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

  const loadProfile = async (userId: string) => {
    const {data} = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setProfile(data as Profile);
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
    signOut,
    updateNickname,
    updateAvatar,
    updateAllowKnocks,
    updateReminderHour,
  };
}
