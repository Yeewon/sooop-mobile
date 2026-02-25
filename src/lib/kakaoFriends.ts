import {getAccessToken} from '@react-native-seoul/kakao-login';

export interface KakaoFriend {
  id: number;
  uuid: string;
  profile_nickname: string;
  profile_thumbnail_image: string;
  favorite: boolean;
}

interface FriendsResponse {
  elements: KakaoFriend[];
  total_count: number;
}

/** 카카오톡 친구 목록 조회 (앱을 사용하는 친구만) */
export async function getKakaoFriends(): Promise<KakaoFriend[]> {
  const tokenInfo = await getAccessToken();
  const accessToken = tokenInfo.accessToken;

  const res = await fetch(
    'https://kapi.kakao.com/v1/api/talk/friends?limit=100',
    {
      headers: {Authorization: `Bearer ${accessToken}`},
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.msg || `친구 목록 조회 실패 (${res.status})`);
  }

  const data: FriendsResponse = await res.json();
  return data.elements || [];
}

/** 카카오톡 친구에게 초대 메시지 보내기 */
export async function sendKakaoInviteMessage(
  friendUuids: string[],
  inviteLink: string,
): Promise<void> {
  const tokenInfo = await getAccessToken();
  const accessToken = tokenInfo.accessToken;

  const templateObject = {
    object_type: 'feed',
    content: {
      title: '안녕하숲에 놀러 와!',
      description: '우리 마을에서 같이 놀자 🌲',
      image_url: 'https://sooop-hi.vercel.app/og-image.png',
      link: {
        web_url: inviteLink,
        mobile_web_url: inviteLink,
      },
    },
    buttons: [
      {
        title: '마을 구경하기',
        link: {
          web_url: inviteLink,
          mobile_web_url: inviteLink,
        },
      },
    ],
  };

  const body = new URLSearchParams();
  body.append('receiver_uuids', JSON.stringify(friendUuids));
  body.append('template_object', JSON.stringify(templateObject));

  const res = await fetch(
    'https://kapi.kakao.com/v1/api/talk/friends/message/default/send',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.msg || `메시지 전송 실패 (${res.status})`);
  }
}
