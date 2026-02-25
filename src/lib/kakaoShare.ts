import {NativeModules, Share} from 'react-native';

const {KakaoShareBridge} = NativeModules;

export async function shareViaKakao(inviteCode: string, inviteLink: string) {
  try {
    await KakaoShareBridge.sendFeed(
      '안녕하숲에 놀러 와!',
      '우리 마을에서 같이 놀자 🌲',
      'https://sooop-hi.vercel.app/og-image.png',
      inviteLink,
      '마을 구경하기',
    );
  } catch (err: any) {
    if (err.code === 'KAKAO_NOT_INSTALLED') {
      // 카카오톡 미설치 시 일반 공유로 폴백
      await Share.share({
        message: `우리 마을에 놀러 와! 이 링크로 바로 이웃이 될 수 있어.\n${inviteLink}`,
      });
    } else {
      throw err;
    }
  }
}
