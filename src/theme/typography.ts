import {Platform} from 'react-native';

export const Fonts = {
  regular: Platform.select({
    ios: 'Galmuri11',
    default: 'Galmuri11',
  }),
  bold: Platform.select({
    ios: 'Galmuri11-Bold',
    default: 'Galmuri11-Bold',
  }),
} as const;

export const FontSizes = {
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
} as const;
