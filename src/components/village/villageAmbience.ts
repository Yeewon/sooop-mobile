/**
 * 시간대 + 날씨에 따른 마을 분위기 색상
 */

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';
export type WeatherType = 'clear' | 'clouds' | 'rain' | 'thunder' | 'snow' | 'fog';

export function getTimeOfDay(hour?: number): TimeOfDay {
  const h = hour ?? new Date().getHours();
  if (h >= 6 && h < 10) return 'morning';
  if (h >= 10 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'evening';
  return 'night';
}

export function getWeatherType(icon?: string): WeatherType {
  if (!icon) return 'clear';
  const code = icon.slice(0, 2);
  switch (code) {
    case '01': return 'clear';
    case '02': case '03': case '04': return 'clouds';
    case '09': case '10': return 'rain';
    case '11': return 'thunder';
    case '13': return 'snow';
    case '50': return 'fog';
    default: return 'clear';
  }
}

export interface VillageAmbience {
  skyColor: string;
  grassColor: string;
  ambientOverlay: string;
  particleType: 'none' | 'rain' | 'snow' | 'fog';
}

const SKY: Record<TimeOfDay, { clear: string; cloudy: string }> = {
  morning: { clear: '#FFD4A8', cloudy: '#D4C4B0' },
  day:     { clear: '#87CEEB', cloudy: '#B0BEC5' },
  evening: { clear: '#FF8A65', cloudy: '#8D6E63' },
  night:   { clear: '#1A237B', cloudy: '#263238' },
};

const GRASS: Record<TimeOfDay, string> = {
  morning: '#8BD06A',
  day:     '#7EC850',
  evening: '#5E9E3A',
  night:   '#2D5A1E',
};

const AMBIENT: Record<TimeOfDay, string> = {
  morning: 'rgba(255, 200, 100, 0.08)',
  day:     'rgba(0, 0, 0, 0)',
  evening: 'rgba(255, 100, 50, 0.12)',
  night:   'rgba(0, 0, 40, 0.3)',
};

const PARTICLE_MAP: Record<WeatherType, VillageAmbience['particleType']> = {
  clear:   'none',
  clouds:  'none',
  rain:    'rain',
  thunder: 'rain',
  snow:    'snow',
  fog:     'fog',
};

export function getVillageAmbience(
  weatherIcon?: string,
  overrideTime?: TimeOfDay,
  overrideWeather?: WeatherType,
): VillageAmbience {
  const time = overrideTime ?? getTimeOfDay();
  const weather = overrideWeather ?? getWeatherType(weatherIcon);
  const isCloudy = weather !== 'clear';

  return {
    skyColor: isCloudy ? SKY[time].cloudy : SKY[time].clear,
    grassColor: GRASS[time],
    ambientOverlay: AMBIENT[time],
    particleType: PARTICLE_MAP[weather],
  };
}