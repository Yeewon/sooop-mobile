export type ColorScheme = {
  background: string;
  foreground: string;
  cardBg: string;
  cardBorder: string;
  accent: string;
  accentLight: string;
  accentDark: string;
  muted: string;
  nintendoBlue: string;
  nintendoYellow: string;
  nintendoGreen: string;
  border: string;
  shadowColor: string;
  white: string;
  black: string;
  knockReqBg: string;
  villageGrass: string;
};

export const LightColors: ColorScheme = {
  background: '#FFFDE8',
  foreground: '#2D2D2D',
  cardBg: '#FFFFFF',
  cardBorder: '#3D3D3D',
  accent: '#E60012',
  accentLight: '#FF1A2D',
  accentDark: '#C4000F',
  muted: '#8B8B8B',
  nintendoBlue: '#4A6FB5',
  nintendoYellow: '#F5C518',
  nintendoGreen: '#48C774',
  border: '#E5E5E5',
  shadowColor: '#2D2D2D',
  white: '#FFFFFF',
  black: '#000000',
  knockReqBg: '#FFF2F3',
  villageGrass: '#7EC850',
};

export const DarkColors: ColorScheme = {
  background: '#1A1A2E',
  foreground: '#E8E8E8',
  cardBg: '#252540',
  cardBorder: '#4A4A6A',
  accent: '#FF4D5A',
  accentLight: '#FF6B75',
  accentDark: '#CC0010',
  muted: '#7A7A9A',
  nintendoBlue: '#6B8FD4',
  nintendoYellow: '#FFD93D',
  nintendoGreen: '#5ADB8A',
  border: '#3A3A5A',
  shadowColor: '#000000',
  white: '#FFFFFF',
  black: '#000000',
  knockReqBg: '#3D2030',
  villageGrass: '#2D5A1E',
};

// 하위호환용
export const Colors = LightColors;
