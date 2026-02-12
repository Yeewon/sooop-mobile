import {useState, useEffect, useRef, useCallback} from 'react';
import Sound from 'react-native-sound';

export type SoundType = 'crickets' | 'rain' | 'fireplace' | 'waves';

const SOUND_FILES: Record<SoundType, string> = {
  crickets: 'crickets.mp3',
  rain: 'rain.mp3',
  fireplace: 'fireplace.mp3',
  waves: 'waves.mp3',
};

export const SOUND_LABELS: Record<SoundType, string> = {
  crickets: '귀뚜라미',
  rain: '빗소리',
  fireplace: '모닥불',
  waves: '파도',
};

const CYCLE_ORDER: (SoundType | null)[] = [null, 'crickets', 'rain', 'fireplace', 'waves'];

interface UseAmbientSoundReturn {
  currentSound: SoundType | null;
  setSound: (type: SoundType | null) => void;
  cycleSound: () => void;
}

// iOS 번들에서 재생
Sound.setCategory('Playback', true);

export function useAmbientSound(): UseAmbientSoundReturn {
  const [currentSound, setCurrentSound] = useState<SoundType | null>(null);
  const soundRef = useRef<Sound | null>(null);

  const stopCurrent = useCallback(() => {
    if (soundRef.current) {
      soundRef.current.stop();
      soundRef.current.release();
      soundRef.current = null;
    }
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      stopCurrent();
      const file = SOUND_FILES[type];
      const sound = new Sound(file, Sound.MAIN_BUNDLE, (err) => {
        if (err) {
          console.warn('[AmbientSound] load error:', file, err);
          return;
        }
        sound.setNumberOfLoops(-1);
        sound.setVolume(0.3);
        sound.play();
      });
      soundRef.current = sound;
    },
    [stopCurrent],
  );

  const setSound = useCallback(
    (type: SoundType | null) => {
      setCurrentSound(type);
      if (type) {
        playSound(type);
      } else {
        stopCurrent();
      }
    },
    [playSound, stopCurrent],
  );

  const cycleSound = useCallback(() => {
    setCurrentSound((prev) => {
      const idx = CYCLE_ORDER.indexOf(prev);
      const next = CYCLE_ORDER[(idx + 1) % CYCLE_ORDER.length];
      if (next) {
        playSound(next);
      } else {
        stopCurrent();
      }
      return next;
    });
  }, [playSound, stopCurrent]);

  // unmount 시 정리
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
        soundRef.current = null;
      }
    };
  }, []);

  return {currentSound, setSound, cycleSound};
}
