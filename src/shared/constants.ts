import {ImageSourcePropType} from 'react-native';

// 인사 아이콘 프리셋
export const KNOCK_ICONS: {
  icon: ImageSourcePropType;
  id: string;
  label: string;
}[] = [
  {icon: require('../assets/icons/v.png'), id: 'v', label: '반가워'},
  {icon: require('../assets/icons/heart.png'), id: 'heart', label: '보고싶어'},
  {icon: require('../assets/icons/fire.png'), id: 'fire', label: '화이팅'},
  {icon: require('../assets/icons/burger.png'), id: 'burger', label: '밥 먹었어?'},
  {icon: require('../assets/icons/fish.png'), id: 'fish', label: '잘 자'},
  {icon: require('../assets/icons/thumb.png'), id: 'thumb', label: '좋은 하루'},
];

// 포토 프레임 배경 (react-native-linear-gradient 형태)
export const FRAME_BACKGROUNDS: {
  name: string;
  colors: string[];
  locations?: number[];
  dark?: boolean;
}[] = [
  {name: '기본', colors: ['#FFFDE8', '#FFFDE8']},
  {name: '숲', colors: ['#87CEEB', '#87CEEB', '#48C774', '#3BA55D'], locations: [0, 0.35, 0.35, 1]},
  {name: '바다', colors: ['#87CEEB', '#87CEEB', '#4A90D9', '#2E6CB5'], locations: [0, 0.4, 0.4, 1]},
  {name: '노을', colors: ['#FFB347', '#FF6B6B', '#C850C0']},
  {name: '밤하늘', colors: ['#0f0c29', '#302b63', '#24243e'], dark: true},
  {name: '벚꽃', colors: ['#FFDEE9', '#FFB6C1', '#FFC0CB']},
];

// 계절 설정
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export const SEASON_CONFIG: Record<
  Season,
  {
    name: string;
    emoji: string;
    cardBg: string;
    messages: string[];
  }
> = {
  spring: {
    name: '봄',
    emoji: '🌸',
    cardBg: '#FFF0F3',
    messages: [
      '벚꽃이 피는 마을',
      '꽃바람이 부는 날이야',
      '따뜻한 바람이 불어와',
      '봄이 왔어, 산책 어때?',
      '꽃이 피기 시작했어',
      '오늘도 포근한 하루',
      '나비가 날아다니는 날',
      '창문 열면 봄 냄새가 나',
      '새들이 노래하는 아침',
      '봄비가 내리면 꽃이 피겠지',
    ],
  },
  summer: {
    name: '여름',
    emoji: '🌊',
    cardBg: '#FFF0F3',
    messages: [
      '시원한 여름 마을',
      '아이스크림 먹고 싶은 날',
      '바다가 부르는 날이야',
      '매미가 우는 오후',
      '소나기가 올 수도 있어',
      '수박 한 조각 어때?',
      '선풍기 앞이 최고야',
      '물놀이 가고 싶다',
      '여름밤 산책도 좋지',
      '해가 길어서 좋은 날',
    ],
  },
  autumn: {
    name: '가을',
    emoji: '🍂',
    cardBg: '#FFF6EE',
    messages: [
      '단풍이 예쁜 마을',
      '고구마가 맛있는 계절',
      '낙엽 밟는 소리 좋아',
      '하늘이 높고 맑은 날',
      '은행나무가 노래졌어',
      '따뜻한 차 한 잔 어때?',
      '가을바람이 불어와',
      '독서하기 좋은 날이야',
      '코스모스가 피었어',
      '이불이 기분 좋은 아침',
    ],
  },
  winter: {
    name: '겨울',
    emoji: '❄️',
    cardBg: '#F0F7FF',
    messages: [
      '눈이 올지도 모르는 날',
      '핫초코가 딱인 날씨야',
      '따뜻하게 입고 다녀',
      '이불 밖은 위험해',
      '붕어빵 사 먹고 싶다',
      '손이 시려워, 장갑 챙겨',
      '눈사람 만들 수 있을까',
      '따뜻한 국물이 생각나',
      '겨울 햇살이 소중한 날',
      '오늘 하늘이 맑아서 다행이야',
    ],
  },
};

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

export function getDailyIndex(arrayLength: number): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return dayOfYear % arrayLength;
}
