import {Dimensions} from 'react-native';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

export const VILLAGE_WIDTH = SCREEN_WIDTH - 48; // viewport width (padding 24 each side)
export const VILLAGE_VISIBLE_HEIGHT = 420; // viewport height
export const CHARACTER_SIZE = 48;
export const MY_CHARACTER_SIZE = 56;

// World dimensions (larger than viewport for panning)
export const WORLD_WIDTH = Math.round(VILLAGE_WIDTH * 2.5);
export const WORLD_HEIGHT = Math.round(VILLAGE_VISIBLE_HEIGHT * 2.5);
