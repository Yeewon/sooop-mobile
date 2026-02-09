// 10x10 픽셀 아바타 파츠 시스템
// 각 파츠는 [row, col] 좌표 배열로 정의
// 레이어 순서: base(피부) → clothes(옷) → hair(머리) → eyes(눈) → mouth(입)

export const GRID_SIZE = 10;

// 색상 프리셋
export const SKIN_COLORS = ['#FFD5B8', '#F5C5A3', '#FFDBAC', '#C68642', '#8D5524'];
export const HAIR_COLORS = ['#2D2D2D', '#8B4513', '#F5C518', '#E60012', '#FF8C00', '#FFFFFF'];
export const CLOTHES_COLORS = ['#E60012', '#4A6FB5', '#48C774', '#F5C518', '#FF8C00', '#8B4513', '#2D2D2D'];

type Pixel = [number, number]; // [row, col]

// ===== 베이스 (피부) =====
export const BASE_PIXELS: Pixel[] = [
  [0,3],[0,4],[0,5],[0,6],
  [1,2],[1,3],[1,4],[1,5],[1,6],[1,7],
  [2,2],[2,3],[2,4],[2,5],[2,6],[2,7],
  [3,2],[3,3],[3,4],[3,5],[3,6],[3,7],
  [4,4],[4,5],
  [5,2],[5,7],
  [6,2],[6,7],
  [7,1],[7,8],
  [8,1],[8,8],
];

// ===== 옷 스타일 =====
export const CLOTHES_STYLES: { name: string; pixels: Pixel[] }[] = [
  {
    name: '티셔츠',
    pixels: [
      [5,3],[5,4],[5,5],[5,6],
      [6,3],[6,4],[6,5],[6,6],
      [7,2],[7,3],[7,4],[7,5],[7,6],[7,7],
      [8,2],[8,3],[8,4],[8,5],[8,6],[8,7],
      [9,2],[9,3],[9,4],[9,6],[9,7],[9,8],
    ],
  },
  {
    name: '원피스',
    pixels: [
      [5,3],[5,4],[5,5],[5,6],
      [6,3],[6,4],[6,5],[6,6],
      [7,2],[7,3],[7,4],[7,5],[7,6],[7,7],
      [8,2],[8,3],[8,4],[8,5],[8,6],[8,7],
      [9,2],[9,3],[9,4],[9,5],[9,6],[9,7],[9,8],
    ],
  },
  {
    name: '조끼',
    pixels: [
      [5,3],[5,6],
      [6,3],[6,6],
      [7,2],[7,3],[7,6],[7,7],
      [8,2],[8,3],[8,4],[8,5],[8,6],[8,7],
      [9,2],[9,3],[9,4],[9,6],[9,7],[9,8],
    ],
  },
  {
    name: '후드티',
    pixels: [
      [4,3],[4,6],
      [5,2],[5,3],[5,4],[5,5],[5,6],[5,7],
      [6,2],[6,3],[6,4],[6,5],[6,6],[6,7],
      [7,2],[7,3],[7,4],[7,5],[7,6],[7,7],
      [8,2],[8,3],[8,4],[8,5],[8,6],[8,7],
      [9,2],[9,3],[9,4],[9,6],[9,7],[9,8],
    ],
  },
  {
    name: '멜빵',
    pixels: [
      [5,3],[5,4],[5,5],[5,6],
      [6,3],[6,4],[6,5],[6,6],
      [7,2],[7,3],[7,4],[7,5],[7,6],[7,7],
      [8,2],[8,3],[8,4],[8,5],[8,6],[8,7],
      [9,2],[9,3],[9,4],[9,6],[9,7],[9,8],
      [4,3],[4,6],
    ],
  },
];

// ===== 헤어스타일 =====
export const HAIR_STYLES: { name: string; pixels: Pixel[] }[] = [
  {
    name: '짧은머리',
    pixels: [
      [0,2],[0,3],[0,4],[0,5],[0,6],[0,7],
      [1,1],[1,2],[1,7],[1,8],
    ],
  },
  {
    name: '긴머리',
    pixels: [
      [0,2],[0,3],[0,4],[0,5],[0,6],[0,7],
      [1,1],[1,2],[1,7],[1,8],
      [2,1],[2,8],
      [3,1],[3,8],
      [4,1],[4,2],[4,3],[4,6],[4,7],[4,8],
      [5,1],[5,8],
    ],
  },
  {
    name: '곱슬머리',
    pixels: [
      [0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[0,8],
      [1,1],[1,8],
      [2,1],[2,8],
      [3,1],[3,8],
    ],
  },
  {
    name: '모히칸',
    pixels: [
      [0,4],[0,5],
      [1,3],[1,4],[1,5],[1,6],
    ],
  },
  {
    name: '양갈래',
    pixels: [
      [0,2],[0,3],[0,4],[0,5],[0,6],[0,7],
      [1,1],[1,2],[1,7],[1,8],
      [2,1],[2,8],
      [3,1],[3,8],
      [4,0],[4,1],[4,8],[4,9],
      [5,0],[5,9],
    ],
  },
  {
    name: '대머리',
    pixels: [],
  },
];

// ===== 눈 =====
export const EYE_STYLES: { name: string; pixels: Pixel[]; color?: string }[] = [
  { name: '점눈', pixels: [[2,4],[2,6]], color: '#2D2D2D' },
  { name: '둥근눈', pixels: [[2,3],[2,4],[2,6],[2,7]], color: '#2D2D2D' },
  { name: '찡그린눈', pixels: [[2,3],[2,5],[2,6]], color: '#2D2D2D' },
  { name: '하트눈', pixels: [[2,3],[2,4],[2,6],[2,7],[3,4],[3,6]], color: '#E60012' },
  { name: '졸린눈', pixels: [[2,4],[2,6],[3,3],[3,4],[3,6],[3,7]], color: '#2D2D2D' },
];

// ===== 입 =====
export const MOUTH_STYLES: { name: string; pixels: Pixel[]; color?: string }[] = [
  { name: '미소', pixels: [[3,4],[3,5],[3,6]], color: '#E67388' },
  { name: '입벌린', pixels: [[3,4],[3,5],[3,6],[4,5]], color: '#E67388' },
  { name: '무표정', pixels: [[3,5]], color: '#C0836D' },
  { name: '삐죽', pixels: [[3,5],[3,6]], color: '#E67388' },
];

// ===== 그리드 합성 =====
export function buildAvatarGrid(
  hair: number,
  eyes: number,
  mouth: number,
  clothes: number,
  skinColor: string,
  hairColor: string,
  clothesColor: string,
): (string | null)[][] {
  const grid: (string | null)[][] = Array.from({length: GRID_SIZE}, () =>
    Array(GRID_SIZE).fill(null),
  );

  for (const [r, c] of BASE_PIXELS) {
    grid[r][c] = skinColor;
  }

  const clothesStyle = CLOTHES_STYLES[clothes] || CLOTHES_STYLES[0];
  for (const [r, c] of clothesStyle.pixels) {
    grid[r][c] = clothesColor;
  }

  const hairStyle = HAIR_STYLES[hair] || HAIR_STYLES[0];
  for (const [r, c] of hairStyle.pixels) {
    grid[r][c] = hairColor;
  }

  const eyeStyle = EYE_STYLES[eyes] || EYE_STYLES[0];
  for (const [r, c] of eyeStyle.pixels) {
    grid[r][c] = eyeStyle.color || '#2D2D2D';
  }

  const mouthStyle = MOUTH_STYLES[mouth] || MOUTH_STYLES[0];
  for (const [r, c] of mouthStyle.pixels) {
    grid[r][c] = mouthStyle.color || '#E67388';
  }

  return grid;
}

export const DEFAULT_AVATAR = {
  hair: 0,
  eyes: 0,
  mouth: 0,
  clothes: 0,
  skinColor: SKIN_COLORS[0],
  hairColor: HAIR_COLORS[0],
  clothesColor: CLOTHES_COLORS[0],
};
