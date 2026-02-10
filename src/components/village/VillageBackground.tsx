import React, {useMemo} from 'react';
import {View} from 'react-native';
import Svg, {Rect} from 'react-native-svg';
import {WORLD_WIDTH, WORLD_HEIGHT} from './villageConstants';

type DecorationDef = {
  width: number;
  height: number;
  pixelSize: number;
  grid: number[][];
  palette: Record<number, string>;
};

const PINE_TREE: DecorationDef = {
  width: 5,
  height: 7,
  pixelSize: 5,
  grid: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0],
  ],
  palette: {1: '#2D8B46', 2: '#8B5E3C'},
};

const ROUND_TREE: DecorationDef = {
  width: 5,
  height: 6,
  pixelSize: 5,
  grid: [
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 1, 1, 1, 0],
    [0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0],
  ],
  palette: {1: '#3DA854', 2: '#8B5E3C'},
};

const FLOWER_PINK: DecorationDef = {
  width: 3,
  height: 4,
  pixelSize: 4,
  grid: [
    [0, 1, 0],
    [1, 2, 1],
    [0, 1, 0],
    [0, 3, 0],
  ],
  palette: {1: '#FF6B9D', 2: '#FFD93D', 3: '#48C774'},
};

const FLOWER_BLUE: DecorationDef = {
  width: 3,
  height: 4,
  pixelSize: 4,
  grid: [
    [0, 1, 0],
    [1, 2, 1],
    [0, 1, 0],
    [0, 3, 0],
  ],
  palette: {1: '#6BB5FF', 2: '#FFD93D', 3: '#48C774'},
};

const ROCK: DecorationDef = {
  width: 4,
  height: 3,
  pixelSize: 5,
  grid: [
    [0, 1, 1, 0],
    [1, 1, 1, 1],
    [1, 2, 2, 1],
  ],
  palette: {1: '#9E9E9E', 2: '#757575'},
};

const BUSH: DecorationDef = {
  width: 5,
  height: 3,
  pixelSize: 4,
  grid: [
    [0, 1, 1, 1, 0],
    [1, 1, 2, 1, 1],
    [0, 1, 1, 1, 0],
  ],
  palette: {1: '#3DA854', 2: '#2D8B46'},
};

const BENCH: DecorationDef = {
  width: 7,
  height: 4,
  pixelSize: 4,
  grid: [
    [0, 1, 1, 1, 1, 1, 0],
    [0, 2, 2, 2, 2, 2, 0],
    [0, 2, 2, 2, 2, 2, 0],
    [3, 0, 0, 0, 0, 0, 3],
  ],
  palette: {1: '#A0522D', 2: '#C4813D', 3: '#6B3A1F'},
};

const DECORATION_TYPES = [
  PINE_TREE,
  ROUND_TREE,
  FLOWER_PINK,
  FLOWER_BLUE,
  ROCK,
  BUSH,
  BENCH,
];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function PixelDecoration({
  def,
  x,
  y,
}: {
  def: DecorationDef;
  x: number;
  y: number;
}) {
  const w = def.width * def.pixelSize;
  const h = def.height * def.pixelSize;

  return (
    <View style={{position: 'absolute', left: x, top: y}}>
      <Svg width={w} height={h}>
        {def.grid.map((row, ry) =>
          row.map((cell, rx) => {
            if (cell === 0) return null;
            return (
              <Rect
                key={`${ry}-${rx}`}
                x={rx * def.pixelSize}
                y={ry * def.pixelSize}
                width={def.pixelSize}
                height={def.pixelSize}
                fill={def.palette[cell]}
              />
            );
          }),
        )}
      </Svg>
    </View>
  );
}

const DECORATION_COUNT = 35;
const MARGIN = 30;

export default React.memo(function VillageBackground() {
  const decorations = useMemo(() => {
    const items: {def: DecorationDef; x: number; y: number; key: number}[] =
      [];
    for (let i = 0; i < DECORATION_COUNT; i++) {
      const typeIdx = Math.floor(
        seededRandom(i * 3) * DECORATION_TYPES.length,
      );
      const def = DECORATION_TYPES[typeIdx];
      const x =
        MARGIN +
        seededRandom(i * 3 + 1) *
          (WORLD_WIDTH - MARGIN * 2 - def.width * def.pixelSize);
      const y =
        MARGIN +
        seededRandom(i * 3 + 2) *
          (WORLD_HEIGHT - MARGIN * 2 - def.height * def.pixelSize);
      items.push({def, x, y, key: i});
    }
    return items;
  }, []);

  return (
    <>
      {decorations.map(item => (
        <PixelDecoration
          key={item.key}
          def={item.def}
          x={item.x}
          y={item.y}
        />
      ))}
    </>
  );
});
