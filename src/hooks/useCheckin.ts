import {useEffect, useRef} from 'react';
import {supabase} from '../lib/supabase';

export function useCheckin(userId: string | undefined) {
  const hasCheckedIn = useRef(false);

  useEffect(() => {
    if (!userId || hasCheckedIn.current) return;

    const checkin = async () => {
      const today = new Date().toISOString().split('T')[0];
      const {data: existing} = await supabase
        .from('checkins')
        .select('id')
        .eq('user_id', userId)
        .gte('checked_at', `${today}T00:00:00`)
        .lte('checked_at', `${today}T23:59:59`)
        .limit(1);

      if (!existing || existing.length === 0) {
        await supabase.from('checkins').insert({user_id: userId});
      } else {
        await supabase
          .from('checkins')
          .update({checked_at: new Date().toISOString()})
          .eq('id', existing[0].id);
      }

      hasCheckedIn.current = true;
    };

    checkin();
  }, [userId]);
}
