import { useEffect, useRef } from 'react';
import { Linking } from 'react-native';

type DeepLinkHandler = (inviteCode: string) => void;

// 처리 완료된 초기 URL을 기억 (앱 전역)
let processedInitialUrl: string | null = null;

export function useDeepLink(onInviteCode: DeepLinkHandler) {
  const handlerRef = useRef(onInviteCode);
  handlerRef.current = onInviteCode;

  useEffect(() => {
    const handleUrl = (url: string) => {
      // sooop://invite/ABC123
      const match = url.match(/sooop:\/\/invite\/([A-Z0-9]+)/i);
      if (match?.[1]) {
        handlerRef.current(match[1].toUpperCase());
      }
    };

    // 앱이 이미 열린 상태에서 딥링크
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    // 앱이 딥링크로 처음 열린 경우 (같은 URL 중복 처리 방지)
    Linking.getInitialURL().then(url => {
      if (url && url !== processedInitialUrl) {
        processedInitialUrl = url;
        handleUrl(url);
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
