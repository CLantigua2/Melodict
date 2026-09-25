export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHover: string;
  surfaceActive: string;
  overlay: string;

  // Borders
  border: string;
  borderSubtle: string;
  borderFocus: string;

  // Accents & Brand
  primary: string;
  primaryHover: string;
  primaryGlow: string;
  secondary: string;
  secondaryHover: string;
  accentCyan: string;
  accentPurple: string;
  accentAmber: string;
  accentRose: string;
  accentGreen: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Sheet Music Notation Canvas
  sheetPaper: string;
  sheetStaffLines: string;
  sheetStaffLinesHover: string;
  sheetClef: string;
  sheetNote: string;
  sheetNoteHover: string;
  sheetNoteSelected: string;
  sheetPlayhead: string;
  sheetMeasureBar: string;
  sheetLedgerLines: string;

  // Piano Roll / Keyboard
  pianoWhiteKey: string;
  pianoWhiteKeyActive: string;
  pianoBlackKey: string;
  pianoBlackKeyActive: string;
  pianoBorder: string;

  // Status & Feedback
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ThemeRadii {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  glowCyan: string;
  glowPurple: string;
}

export interface AppTheme {
  name: string;
  colors: ThemeColors;
  spacing: ThemeSpacing;
  radii: ThemeRadii;
  shadows: ThemeShadows;
  fonts: {
    sans: string;
    mono: string;
    music: string;
  };
}
