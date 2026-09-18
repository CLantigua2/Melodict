import { generatePianoKeys } from './VirtualPiano.constants';

describe('VirtualPiano generator', () => {
  it('generates 37 keys for C3 to C6', () => {
    const keys = generatePianoKeys(48, 84);
    expect(keys.length).toBe(37);
    expect(keys[0].pitch).toBe('C3');
    expect(keys[0].isBlack).toBe(false);
    expect(keys[keys.length - 1].pitch).toBe('C6');
    expect(keys[keys.length - 1].isBlack).toBe(false);
  });

  it('correctly identifies sharps as black keys', () => {
    const keys = generatePianoKeys(60, 62);
    // C4 (60), C#4 (61), D4 (62)
    expect(keys[0].isBlack).toBe(false);
    expect(keys[1].isBlack).toBe(true);
    expect(keys[2].isBlack).toBe(false);
  });
});
