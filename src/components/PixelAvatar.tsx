import React, {useMemo} from 'react';
import Svg, {Rect} from 'react-native-svg';
import {AvatarData} from '../shared/types';
import {
  buildAvatarGrid,
  GRID_SIZE,
  DEFAULT_AVATAR,
} from '../shared/avatar-parts';

interface PixelAvatarProps {
  avatarData: AvatarData | null;
  size: number;
}

function PixelAvatar({avatarData, size}: PixelAvatarProps) {
  const grid = useMemo(() => {
    const d = avatarData || DEFAULT_AVATAR;
    return buildAvatarGrid(
      d.hair,
      d.eyes,
      d.mouth,
      d.clothes,
      d.skinColor,
      d.hairColor,
      d.clothesColor,
    );
  }, [avatarData]);

  const cellSize = size / GRID_SIZE;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}>
      {grid.map((row, r) =>
        row.map((color, c) =>
          color ? (
            <Rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill={color}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
}

export default React.memo(PixelAvatar);
