import { AppTheme, ThemeColors } from './theme.types';

const defaultSpacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
};

const defaultRadii = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

const defaultFonts = {
  sans: 'var(--font-sans, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif)',
  mono: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace)',
  music: '"Bravura", "Leland", "Gonville", "Emmentaler", serif',
};

export const darkThemeColors: ThemeColors = {
  background: '#0d0f12',
  surface: '#15181e',
  surfaceElevated: '#1c2028',
  surfaceHover: '#242a35',
  surfaceActive: '#2d3442',
  overlay: 'rgba(0, 0, 0, 0.75)',

  border: '#262c38',
  borderSubtle: '#1b202a',
  borderFocus: '#00e5ff',

  primary: '#00e5ff',
  primaryHover: '#33ebff',
  primaryGlow: 'rgba(0, 229, 255, 0.35)',
  secondary: '#8a2be2',
  secondaryHover: '#9d4edd',
  accentCyan: '#00e5ff',
  accentPurple: '#a855f7',
  accentAmber: '#f59e0b',
  accentRose: '#f43f5e',
  accentGreen: '#10b981',

  textPrimary: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textInverse: '#0f172a',

  sheetPaper: '#161920',
  sheetStaffLines: '#475569',
  sheetStaffLinesHover: '#64748b',
  sheetClef: '#94a3b8',
  sheetNote: '#00e5ff',
  sheetNoteHover: '#67e8f9',
  sheetNoteSelected: '#f43f5e',
  sheetPlayhead: '#f43f5e',
  sheetMeasureBar: '#334155',
  sheetLedgerLines: '#475569',

  pianoWhiteKey: '#ffffff',
  pianoWhiteKeyActive: '#38bdf8',
  pianoBlackKey: '#1e293b',
  pianoBlackKeyActive: '#0284c7',
  pianoBorder: '#0f172a',

  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
};

export const darkTheme: AppTheme = {
  name: 'dark',
  colors: darkThemeColors,
  spacing: defaultSpacing,
  radii: defaultRadii,
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.5)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.6), 0 4px 6px -4px rgba(0, 0, 0, 0.6)',
    glowCyan: '0 0 20px rgba(0, 229, 255, 0.45)',
    glowPurple: '0 0 20px rgba(168, 85, 247, 0.45)',
  },
  fonts: defaultFonts,
};

export const midnightTheme: AppTheme = {
  ...darkTheme,
  name: 'midnight',
  colors: {
    ...darkThemeColors,
    background: '#07080d',
    surface: '#0f111a',
    surfaceElevated: '#171a26',
    surfaceHover: '#202436',
    border: '#1f2438',
    primary: '#7c3aed',
    primaryHover: '#8b5cf6',
    primaryGlow: 'rgba(124, 58, 237, 0.45)',
    sheetNote: '#8b5cf6',
    sheetNoteHover: '#a78bfa',
    sheetPlayhead: '#06b6d4',
  },
};

export const parchmentTheme: AppTheme = {
  ...darkTheme,
  name: 'parchment',
  colors: {
    ...darkThemeColors,
    background: '#1a1917',
    surface: '#242320',
    surfaceElevated: '#302d28',
    surfaceHover: '#3d3a33',
    border: '#3d3932',
    primary: '#d97706',
    primaryHover: '#f59e0b',
    primaryGlow: 'rgba(217, 119, 6, 0.35)',
    sheetPaper: '#21201c',
    sheetStaffLines: '#575248',
    sheetClef: '#a8a29e',
    sheetNote: '#f59e0b',
    sheetNoteHover: '#fbbf24',
    sheetPlayhead: '#ef4444',
  },
};

export const THEMES: Record<string, AppTheme> = {
  dark: darkTheme,
  midnight: midnightTheme,
  parchment: parchmentTheme,
};
