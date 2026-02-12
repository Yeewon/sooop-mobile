import {useState, useEffect, useCallback, useRef} from 'react';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from '@react-native-voice/voice';

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => Promise<void>;
  stopListening: () => Promise<void>;
  toggleListening: () => Promise<void>;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    // 말하는 도중 실시간 결과
    const onPartialResults = (e: SpeechResultsEvent) => {
      if (!mountedRef.current) return;
      const text = e.value?.[0] ?? '';
      if (text) setTranscript(text);
    };

    // 말 끝난 뒤 최종 결과
    const onResults = (e: SpeechResultsEvent) => {
      if (!mountedRef.current) return;
      const text = e.value?.[0] ?? '';
      if (text) setTranscript(text);
    };

    const onError = (e: SpeechErrorEvent) => {
      if (!mountedRef.current) return;
      console.warn('[Speech] error:', e.error);
      setIsListening(false);
    };

    const onEnd = () => {
      if (!mountedRef.current) return;
      setIsListening(false);
    };

    Voice.onSpeechPartialResults = onPartialResults;
    Voice.onSpeechResults = onResults;
    Voice.onSpeechError = onError;
    Voice.onSpeechEnd = onEnd;

    return () => {
      mountedRef.current = false;
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = useCallback(async () => {
    setTranscript('');
    setIsListening(true);
    try {
      await Voice.start('ko-KR');
    } catch (e) {
      console.warn('[Speech] start failed:', e);
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
    } catch {
      // ignore
    }
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {isListening, transcript, startListening, stopListening, toggleListening};
}
