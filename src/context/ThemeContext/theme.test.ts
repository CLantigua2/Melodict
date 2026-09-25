import { THEMES, darkTheme, midnightTheme, parchmentTheme } from './theme.constants';

describe('Centralized Theme Library', () => {
  it('contains dark, midnight, and parchment themes', () => {
    expect(THEMES.dark).toBeDefined();
    expect(THEMES.midnight).toBeDefined();
    expect(THEMES.parchment).toBeDefined();
  });

  it('provides all mandatory palette color keys', () => {
    const requiredKeys = [
      'background',
      'surface',
      'surfaceElevated',
      'primary',
      'secondary',
      'border',
      'textPrimary',
      'sheetPaper',
      'sheetStaffLines',
      'sheetNote',
      'sheetPlayhead',
      'pianoWhiteKey',
      'pianoBlackKey',
    ];

    Object.values(THEMES).forEach((theme) => {
      requiredKeys.forEach((key) => {
        expect((theme.colors as any)[key]).toBeDefined();
      });
    });
  });
});
