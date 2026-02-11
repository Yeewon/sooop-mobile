import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import Config from 'react-native-config';

const SUPABASE_URL = Config.SUPABASE_URL || '';
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

// 서울시청 좌표 (위치 권한 거부 시 폴백)
const SEOUL_DEFAULT = { lat: 37.5665, lon: 126.978 };

export interface WeatherData {
  temp: number;
  description: string;
  icon: string;
  city: string;
}

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationGranted, setLocationGranted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchWeather = useCallback(async () => {
    try {
      let position = SEOUL_DEFAULT;
      let granted = false;

      try {
        // Request location permission on iOS (타임아웃 500ms — 이미 결정된 경우 콜백 안 올 수 있음)
        if (Platform.OS === 'ios') {
          await Promise.race([
            new Promise<void>((resolve, reject) => {
              Geolocation.requestAuthorization(
                () => resolve(),
                () => reject(new Error('Location permission denied')),
              );
            }),
            new Promise<void>(resolve => setTimeout(resolve, 500)),
          ]);
        }

        // Get current position
        position = await new Promise<{ lat: number; lon: number }>(
          (resolve, reject) => {
            Geolocation.getCurrentPosition(
              pos =>
                resolve({
                  lat: pos.coords.latitude,
                  lon: pos.coords.longitude,
                }),
              err => reject(err),
              { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
            );
          },
        );
        granted = true;
      } catch {
        // 위치 권한 거부 또는 GPS 실패 → 서울 폴백
      }

      setLocationGranted(granted);

      // Fetch weather from Edge Function
      const res = await fetch(`${SUPABASE_URL}/functions/v1/weather`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(position),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Weather API error: ${res.status} ${text}`);
      }

      const data: WeatherData = await res.json();
      setWeather(data);
    } catch (err) {
      console.warn('[Weather]', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();

    intervalRef.current = setInterval(fetchWeather, REFRESH_INTERVAL);

    // 설정에서 돌아왔을 때 위치 권한 변경 반영
    const appStateSub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        fetchWeather();
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      appStateSub.remove();
    };
  }, [fetchWeather]);

  return { weather, loading, locationGranted, reload: fetchWeather };
}
