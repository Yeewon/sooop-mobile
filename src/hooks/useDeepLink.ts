import {useEffect} from 'react';
import {Linking} from 'react-native';

type DeepLinkHandler = (inviteCode: string) => void;

export function useDeepLink(onInviteCode: DeepLinkHandler) {
  useEffect(() => {
    const handleUrl = (url: string) => {
      // sooop://invite/ABC123
      const match = url.match(/sooop:\/\/invite\/([A-Z0-9]+)/i);
      if (match?.[1]) {
        onInviteCode(match[1].toUpperCase());
      }
    };

    // 앱이 이미 열린 상태에서 딥링크
    const subscription = Linking.addEventListener('url', ({url}) => {
      handleUrl(url);
    });

    // 앱이 딥링크로 처음 열린 경우
    Linking.getInitialURL().then(url => {
      if (url) handleUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, [onInviteCode]);
}
