import React, {useMemo} from 'react';
import Svg, {Rect} from 'react-native-svg';

const NPC_GRID = 9;

interface NpcAvatarProps {
  pixels: string[];
  colors: Record<string, string>;
  size: number;
}

function NpcAvatar({pixels, colors, size}: NpcAvatarProps) {
  const rects = useMemo(() => {
    const result: {x: number; y: number; fill: string}[] = [];
    pixels.forEach((row, r) => {
      row.split('').forEach((ch, c) => {
        const color = colors[ch];
        if (color) {
          result.push({x: c, y: r, fill: color});
        }
      });
    });
    return result;
  }, [pixels, colors]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${NPC_GRID} ${NPC_GRID}`}>
      {rects.map((r, i) => (
        <Rect key={i} x={r.x} y={r.y} width={1} height={1} fill={r.fill} />
      ))}
    </Svg>
  );
}

export default React.memo(NpcAvatar);
