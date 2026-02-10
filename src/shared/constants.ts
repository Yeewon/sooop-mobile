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

// 매일 바뀌는 응원 메시지
export const DAILY_MESSAGES = [
  '재능이 꽃을 피울 테니 초조해하지 말고 한걸음 한걸음 나아가길!',
  '남이랑 비교하지 마. 너는 너만의 속도로 가면 되는 거야',
  '어제의 너보다 오늘의 너가 조금 더 단단해졌을 거야',
  '완벽하지 않아도 충분히 잘하고 있어. 스스로한테 너무 엄격하지 마',
  '힘들면 잠깐 쉬어가도 돼. 멈추는 건 포기가 아니니까',
  '매일 하는 작은 습관 하나가 나중에 큰 변화를 만들어줄 거야',
  '지금 고민하고 있다는 건 그만큼 성장하고 있다는 뜻이야',
  '오늘 하루를 무사히 보낸 것만으로도 이미 충분히 잘한 거야',
  '못하는 게 아니라 아직 안 해본 거야. 해보면 할 수 있어',
  '지금 힘든 건 네가 뭔가에 도전하고 있기 때문이야. 멋진 일이야',
  '남들 눈치 보지 말고 네가 하고 싶은 대로 해. 네 인생이니까',
  '매일 조금씩이면 돼. 그게 쌓이면 나중에 엄청 대단해져 있을 거야',
  '잘 안 풀리는 날도 있어. 원래 그래, 그냥 그런 날인 거야',
  '어려운 일은 지금 당장 안 해도 돼. 나중에 천천히 생각해도 돼',
  '작은 일에도 기뻐할 줄 아는 거, 그게 진짜 멋진 거야',
  '할 수 있을까 고민될 때는 일단 시작해봐. 생각보다 할 만할 거야',
  '정답은 없어. 네가 고민해서 선택한 거면 그게 가장 좋은 답이야',
  '오늘도 하루 수고했어. 내일은 오늘보다 조금 더 편할 거야',
  '잘하고 싶은 마음이 있다면 이미 반은 한 거나 다름없어',
  '조급해하지 마. 좋은 건 원래 천천히 오는 법이야',
  '지금 이 순간의 너는 충분히 괜찮아. 그대로도 멋져',
  '지치면 잠깐 멈춰도 돼. 다시 걸으면 그게 계속 가는 거야',
  '어제 못한 건 오늘 하면 돼. 그게 안 되면 내일 해도 되고',
  '네가 고른 길이 맞는 길이야. 확신이 없어도 괜찮아',
  '지금 쉬고 있는 거라면 잘하고 있는 거야. 쉬는 것도 해야 할 일이니까',
  '잘 안 되는 날엔 그냥 좋아하는 거 하나 해. 그것만으로 충분해',
  '완벽한 하루는 없어. 그냥 나쁘지 않은 하루면 잘 산 거야',
  '네가 여기 있다는 거, 그것만으로도 오늘은 좋은 날이야',
  '네가 좋아하는 걸 하는 시간, 그게 제일 멋진 순간이야',
  '오늘 날씨가 어떻든, 네 하루는 네가 만드는 거야',
  '바쁜 하루였다면 오늘은 일찍 자도 돼. 내일이 기다리고 있으니까',
  '뭔가를 시작하기 딱 좋은 날이야. 아니면 내일도 괜찮고',
  '가끔은 아무 계획 없이 보내는 하루가 최고의 하루일 때도 있어',
  '오늘 하늘 봤어? 안 봤으면 잠깐 올려다봐. 꽤 괜찮을 거야',
  '오늘 못 웃었으면 내일은 한번쯤 웃을 일이 생길 거야',
  '굳이 대단한 일 안 해도 돼. 평범한 하루도 소중한 하루야',
  '고민이 많은 날엔 산책이 답일 때가 있어. 한번 걸어봐',
  '내일의 너는 오늘의 너한테 고마워할 거야. 아마도',
  '지금 하고 있는 거, 나중에 분명 도움이 될 거야. 믿어봐',
  '나중에 후회하지 않게 진짜 신나는 추억을 만들자!',
  '외적으로 보이는 모습보다 더 소중한 것이 있음을 잊지 마세요!',
  '기록에는 남지 않더라도 기억에 남는 존재가 되고 싶어',
  '지금 네 옆에 있는 사람들을 소중히 여겨줘. 그게 가장 큰 행복이야',
  '바빠서 잊고 지냈던 것들을 오늘은 천천히 떠올려봐',
  '누군가에게 따뜻한 한마디를 건넨 날은 특별한 날이 되는 법이야',
  '지금 이 순간을 즐기는 것, 그게 가장 현명한 거야',
  '네가 웃으면 주변 사람들도 따라 웃게 돼. 그런 힘이 있어',
  '소중한 건 항상 가까이에 있어. 멀리서 찾지 않아도 돼',
  '오늘 하루가 평범했다면, 그건 감사할 만큼 평화로운 거야',
  '지나고 보면 다 추억이 돼. 지금 이 순간도 언젠가 그리워질 거야',
  '있는 그대로의 너를 좋아해주는 사람이 분명 있을 거야',
  '가끔은 멀리 돌아가는 길이 더 좋은 풍경을 보여줄 때가 있어',
];

// 마을 NPC 캐릭터 (9x9 픽셀아트)
export const VILLAGE_CHARACTERS: {
  name: string;
  pixels: string[];
  colors: Record<string, string>;
}[] = [
  {
    name: '너구리 이장',
    pixels: [
      '..ooooo..',
      '.obbbbbo.',
      '.obbbbbo.',
      'omwwbwwmo',
      'omkkbkkmo',
      'obbbbbbbo',
      '.obbobbo.',
      '..obbbo..',
      '...ooo...',
    ],
    colors: {
      o: '#3E2723',
      b: '#A1887F',
      m: '#5D4037',
      w: '#FFFFFF',
      k: '#212121',
    },
  },
  {
    name: '부엉이 박사',
    pixels: [
      'o..ooo..o',
      '.ogggggo.',
      '.ogggggo.',
      'ogwwgwwgo',
      'ogkwgwkgo',
      'ogggggggo',
      '.oggyggo.',
      '..ogggo..',
      '...ooo...',
    ],
    colors: {
      o: '#4E342E',
      g: '#8D6E63',
      w: '#FFFFFF',
      k: '#212121',
      y: '#FFD54F',
    },
  },
  {
    name: '다람쥐',
    pixels: [
      '.o.ooo.o.',
      '.orrrrro.',
      'orrrrrrro',
      'orrrrrrro',
      'orkrrrkro',
      'orwrrrwro',
      '.orrorro.',
      '..orrro..',
      '...ooo...',
    ],
    colors: {
      o: '#4E342E',
      r: '#E65100',
      k: '#212121',
      w: '#FFF8E1',
    },
  },
  {
    name: '토끼',
    pixels: [
      '..oo.oo..',
      '..op.po..',
      '..op.po..',
      '.ooooooo.',
      'owwwwwwwo',
      'owkwwwkwo',
      'owpwwwpwo',
      '.owwwwwo.',
      '..ooooo..',
    ],
    colors: {
      o: '#795548',
      w: '#FAFAFA',
      p: '#F48FB1',
      k: '#212121',
    },
  },
];

export function getDailyIndex(arrayLength: number): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return dayOfYear % arrayLength;
}
