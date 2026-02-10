import {useMemo} from 'react';
import type {FriendWithStatus} from '../../shared/types';
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  CHARACTER_SIZE,
  MY_CHARACTER_SIZE,
} from './villageConstants';

function seededRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

export interface VillagePosition {
  x: number;
  y: number;
}

export function useVillagePositions(
  friends: FriendWithStatus[],
): Map<string, VillagePosition> {
  return useMemo(() => {
    const positions = new Map<string, VillagePosition>();

    const centerX = WORLD_WIDTH / 2 - MY_CHARACTER_SIZE / 2;
    const centerY = WORLD_HEIGHT / 2 - MY_CHARACTER_SIZE / 2;
    positions.set('me', {x: centerX, y: centerY});

    const margin = 40;
    const count = friends.length;
    if (count === 0) return positions;

    const maxRadius =
      Math.min(WORLD_WIDTH, WORLD_HEIGHT) / 2 - margin - CHARACTER_SIZE;
    const minRadius = 80;

    friends.forEach((friend, i) => {
      const rand1 = seededRandom(friend.friend_id);
      const rand2 = seededRandom(friend.friend_id + '_y');

      const baseAngle = (2 * Math.PI * i) / count;
      const angleJitter = (rand1 - 0.5) * (Math.PI / 6);
      const angle = baseAngle + angleJitter;

      const radius = minRadius + rand2 * (maxRadius - minRadius);

      let x = centerX + Math.cos(angle) * radius;
      let y = centerY + Math.sin(angle) * radius;

      x = Math.max(
        margin,
        Math.min(WORLD_WIDTH - CHARACTER_SIZE - margin, x),
      );
      y = Math.max(
        margin,
        Math.min(WORLD_HEIGHT - CHARACTER_SIZE - margin, y),
      );

      positions.set(friend.friend_id, {x, y});
    });

    return positions;
  }, [friends]);
}
