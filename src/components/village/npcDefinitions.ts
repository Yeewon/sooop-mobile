import {WORLD_WIDTH, WORLD_HEIGHT} from './villageConstants';

export type PixelArtDef = {
  width: number;
  height: number;
  pixelSize: number;
  grid: number[][];
  palette: Record<number, string>;
};

export type NpcType = 'cat' | 'dog' | 'bird' | 'butterfly';

export interface NpcDef {
  type: NpcType;
  art: PixelArtDef;
  renderWidth: number;
  renderHeight: number;
  wanderRadius: number;
  wanderInterval: [number, number];
  reactions: string[];
  moveDuration: number;
  idlePause: [number, number];
}

// ── 달래: 찻집 주인 여성 (8×12, pixelSize 5 = 40×60px) ──
const NPC_CAT: PixelArtDef = {
  width: 8,
  height: 12,
  pixelSize: 5,
  grid: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [0, 1, 2, 3, 3, 2, 1, 0],
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 0, 4, 4, 4, 4, 0, 0],
    [0, 4, 5, 5, 5, 5, 4, 0],
    [0, 2, 5, 6, 6, 5, 2, 0],
    [0, 0, 4, 4, 4, 4, 0, 0],
    [0, 0, 4, 4, 4, 4, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 7, 0, 0, 7, 0, 0],
  ],
  palette: {
    1: '#5C3317', // 긴 갈색 머리
    2: '#FFD5A8', // 피부
    3: '#2D2D2D', // 눈
    4: '#8B5E3C', // 갈색 원피스
    5: '#FFF8F0', // 흰 앞치마
    6: '#E8C8A0', // 앞치마 주머니
    7: '#4A3728', // 신발
  },
};

// ── 땡구: 우체부 (8×11, pixelSize 5 = 40×55px) ──
const NPC_DOG: PixelArtDef = {
  width: 8,
  height: 11,
  pixelSize: 5,
  grid: [
    [0, 0, 4, 4, 4, 4, 0, 0],
    [0, 4, 4, 4, 4, 4, 4, 0],
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 0, 2, 3, 3, 2, 0, 0],
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 4, 4, 4, 4, 4, 4, 0],
    [0, 4, 4, 5, 5, 4, 4, 0],
    [0, 2, 4, 4, 4, 4, 2, 0],
    [0, 0, 4, 4, 4, 4, 0, 0],
    [0, 0, 4, 0, 0, 4, 0, 0],
    [0, 0, 6, 0, 0, 6, 0, 0],
  ],
  palette: {
    1: '#1A1A1A', // 머리 (모자에 가림)
    2: '#FFD5A8', // 피부
    3: '#2D2D2D', // 눈
    4: '#4A6FB5', // 파란 제복
    5: '#FFD93D', // 노란 배지
    6: '#2D2D2D', // 신발
  },
};

// ── 훈이: 촌장 (8×11, pixelSize 5 = 40×55px) ──
const NPC_BIRD: PixelArtDef = {
  width: 8,
  height: 11,
  pixelSize: 5,
  grid: [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [0, 0, 2, 3, 3, 2, 0, 0],
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 4, 4, 4, 4, 4, 4, 0],
    [0, 4, 5, 4, 4, 5, 4, 0],
    [0, 2, 4, 4, 4, 4, 2, 0],
    [0, 0, 4, 4, 4, 4, 0, 0],
    [0, 0, 4, 0, 0, 4, 0, 0],
    [0, 0, 6, 0, 0, 6, 0, 0],
  ],
  palette: {
    1: '#A0A0A0', // 회색 머리
    2: '#FFD5A8', // 피부
    3: '#2D2D2D', // 눈
    4: '#2D5A2D', // 녹색 정장
    5: '#FFD93D', // 금색 훈장
    6: '#3A2A1A', // 신발
  },
};

// ── 나울: 정원사 (8×11, pixelSize 5 = 40×55px) ──
const NPC_BUTTERFLY: PixelArtDef = {
  width: 8,
  height: 11,
  pixelSize: 5,
  grid: [
    [0, 4, 4, 4, 4, 4, 4, 0],
    [4, 4, 4, 4, 4, 4, 4, 4],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 2, 3, 3, 2, 0, 0],
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 5, 5, 5, 5, 5, 5, 0],
    [0, 5, 5, 5, 5, 5, 5, 0],
    [0, 2, 5, 5, 5, 5, 2, 0],
    [0, 0, 5, 5, 5, 5, 0, 0],
    [0, 0, 5, 0, 0, 5, 0, 0],
    [0, 0, 6, 0, 0, 6, 0, 0],
  ],
  palette: {
    1: '#8B5E3C', // 갈색 머리
    2: '#FFD5A8', // 피부
    3: '#2D2D2D', // 눈
    4: '#F5D89A', // 밀짚모자
    5: '#48C774', // 녹색 작업복
    6: '#6B4226', // 갈색 장화
  },
};


// ── NPC 정의 ──
export const NPC_DEFS: NpcDef[] = [
  {
    type: 'cat',
    art: NPC_CAT,
    renderWidth: 8 * 5,
    renderHeight: 12 * 5,
    wanderRadius: 60,
    wanderInterval: [3000, 6000],
    reactions: ['차 한 잔 할래?', '오늘도 수고했어', '천천히 쉬어가~', '좋은 하루 보내'],
    moveDuration: 1200,
    idlePause: [2000, 5000],
  },
  {
    type: 'dog',
    art: NPC_DOG,
    renderWidth: 8 * 5,
    renderHeight: 11 * 5,
    wanderRadius: 80,
    wanderInterval: [2500, 5000],
    reactions: ['편지 왔어!', '항상 응원해!', '오늘도 배달 완료!', '같이 뛰자!'],
    moveDuration: 1000,
    idlePause: [1500, 4000],
  },
  {
    type: 'bird',
    art: NPC_BIRD,
    renderWidth: 8 * 5,
    renderHeight: 11 * 5,
    wanderRadius: 50,
    wanderInterval: [3500, 7000],
    reactions: ['마을이 평화롭군', '좋은 하루일세', '오늘도 고생했네', '산책 중이라네'],
    moveDuration: 1400,
    idlePause: [2500, 6000],
  },
  {
    type: 'butterfly',
    art: NPC_BUTTERFLY,
    renderWidth: 8 * 5,
    renderHeight: 11 * 5,
    wanderRadius: 70,
    wanderInterval: [2500, 5500],
    reactions: ['꽃이 예쁘게 폈어', '오늘 날씨 좋다~', '정원 구경 올래?', '천천히 가도 돼'],
    moveDuration: 1300,
    idlePause: [2000, 4500],
  },
];

// ── 스폰 설정 ──
export const NPC_SPAWN_COUNT = 4;
const MARGIN = 50;

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export interface NpcSpawn {
  id: number;
  def: NpcDef;
  startX: number;
  startY: number;
}

export function generateNpcSpawns(): NpcSpawn[] {
  const items: NpcSpawn[] = [];
  for (let i = 0; i < NPC_SPAWN_COUNT; i++) {
    const defIdx = Math.floor(seededRandom(i * 7 + 100) * NPC_DEFS.length);
    const def = NPC_DEFS[defIdx];
    const x =
      MARGIN +
      seededRandom(i * 7 + 101) *
        (WORLD_WIDTH - MARGIN * 2 - def.renderWidth);
    const y =
      MARGIN +
      seededRandom(i * 7 + 102) *
        (WORLD_HEIGHT - MARGIN * 2 - def.renderHeight);
    items.push({id: i, def, startX: x, startY: y});
  }
  return items;
}
