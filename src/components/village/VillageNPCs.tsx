import React, {useMemo, useEffect, useRef, useCallback} from 'react';
import {Pressable} from 'react-native';
import Svg, {Rect} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {WORLD_WIDTH, WORLD_HEIGHT} from './villageConstants';
import {generateNpcSpawns} from './npcDefinitions';
import type {NpcSpawn} from './npcDefinitions';
import {NPC_NAMES} from './npcResponses';
import {Text, StyleSheet} from 'react-native';
import {Fonts} from '../../theme';

const MARGIN = 50;

function clamp(val: number, min: number, max: number) {
  'worklet';
  return Math.max(min, Math.min(max, val));
}

// ── 개별 NPC 스프라이트 ──
function NpcSprite({
  spawn,
  onTap,
}: {
  spawn: NpcSpawn;
  onTap: (spawn: NpcSpawn) => void;
}) {
  const {def, startX, startY} = spawn;
  const posX = useSharedValue(startX);
  const posY = useSharedValue(startY);
  const currentPos = useRef({x: startX, y: startY});
  const npcName = NPC_NAMES[def.type];

  // 배회 AI
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let mounted = true;

    function scheduleNextMove() {
      if (!mounted) return;

      const [minInterval, maxInterval] = def.wanderInterval;
      const delay =
        minInterval + Math.random() * (maxInterval - minInterval);

      timeoutId = setTimeout(() => {
        if (!mounted) return;

        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * def.wanderRadius;
        const targetX = clamp(
          currentPos.current.x + Math.cos(angle) * distance,
          MARGIN,
          WORLD_WIDTH - def.renderWidth - MARGIN,
        );
        const targetY = clamp(
          currentPos.current.y + Math.sin(angle) * distance,
          MARGIN,
          WORLD_HEIGHT - def.renderHeight - MARGIN,
        );

        posX.value = withTiming(targetX, {duration: def.moveDuration});
        posY.value = withTiming(targetY, {duration: def.moveDuration});
        currentPos.current = {x: targetX, y: targetY};

        const [minPause, maxPause] = def.idlePause;
        const pause = minPause + Math.random() * (maxPause - minPause);

        timeoutId = setTimeout(() => {
          scheduleNextMove();
        }, def.moveDuration + pause);
      }, delay);
    }

    scheduleNextMove();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
    };
  }, [def, posX, posY]);

  const handleTap = useCallback(() => {
    onTap(spawn);
  }, [onTap, spawn]);

  const animStyle = useAnimatedStyle(() => ({
    position: 'absolute' as const,
    left: posX.value,
    top: posY.value,
  }));

  // SVG 픽셀아트
  const svgContent = useMemo(() => {
    const rects: React.ReactElement[] = [];
    def.art.grid.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (cell === 0) return;
        rects.push(
          <Rect
            key={`${ry}-${rx}`}
            x={rx * def.art.pixelSize}
            y={ry * def.art.pixelSize}
            width={def.art.pixelSize}
            height={def.art.pixelSize}
            fill={def.art.palette[cell]}
          />,
        );
      });
    });
    return rects;
  }, [def.art]);

  return (
    <Animated.View style={animStyle}>
      <Pressable onPress={handleTap} hitSlop={8} style={{alignItems: 'center'}}>
        <Svg width={def.renderWidth} height={def.renderHeight}>
          {svgContent}
        </Svg>
        <Text style={styles.npcLabel}>{npcName}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ── NPC 컨테이너 ──
interface VillageNPCsProps {
  onNpcTap: (spawn: NpcSpawn) => void;
}

const VillageNPCs = React.memo(function VillageNPCs({
  onNpcTap,
}: VillageNPCsProps) {
  const spawns = useMemo(() => generateNpcSpawns(), []);

  return (
    <>
      {spawns.map(spawn => (
        <NpcSprite key={spawn.id} spawn={spawn} onTap={onNpcTap} />
      ))}
    </>
  );
});

export default VillageNPCs;

const styles = StyleSheet.create({
  npcLabel: {
    fontFamily: Fonts.bold,
    fontSize: 8,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 1,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
  },
});
