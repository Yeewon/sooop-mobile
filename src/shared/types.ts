export interface AvatarData {
  hair: number;
  eyes: number;
  mouth: number;
  clothes: number;
  skinColor: string;
  hairColor: string;
  clothesColor: string;
}

export interface Profile {
  id: string;
  nickname: string;
  invite_code: string;
  created_at: string;
  avatar_data: AvatarData | null;
  allow_knocks: boolean;
  reminder_hour: number;
  role: 'user' | 'admin';
}

export interface Checkin {
  id: string;
  user_id: string;
  checked_at: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
}

export interface Knock {
  id: string;
  from_user_id: string;
  to_user_id: string;
  created_at: string;
  seen: boolean;
  emoji: string | null;
}

export interface UnseenKnock {
  emoji: string | null;
  created_at: string;
}

export interface FriendWithStatus {
  friend_id: string;
  nickname: string;
  last_checkin: string | null;
  unseen_knocks: number;
  unseen_knock_list: UnseenKnock[];
  total_knocks: number;
  last_knock_emoji: string | null;
  last_knock_at: string | null;
  my_last_knock_emoji: string | null;
  my_last_knock_at: string | null;
  avatar_data: AvatarData | null;
  allow_knocks: boolean;
  has_knock_request_sent: boolean;
}

export interface IncomingKnockRequest {
  from_user_id: string;
  nickname: string;
  avatar_data: AvatarData | null;
  created_at: string;
}

export interface KnockRequestNotification {
  to_user_id: string;
  nickname: string;
  avatar_data: AvatarData | null;
  status: 'accepted' | 'dismissed';
  created_at: string;
}
