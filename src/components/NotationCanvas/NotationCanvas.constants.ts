export const LINE_SPACING = 14;      // distance between staff lines
export const STEP_Y = LINE_SPACING / 2; // distance between line and space (7px)
export const NOTEHEAD_RX = 7.5;
export const NOTEHEAD_RY = 5.2;
export const STEM_HEIGHT = 40;
export const MEASURE_WIDTH = 260;     // default width per measure
export const CLEF_WIDTH = 110;        // width of clef + key signature + time signature area
export const STAFF_PADDING_TOP = 80;  // ample headroom above first staff line
export const LINE_HEIGHT = 180;       // vertical distance between single staff line systems
export const GRAND_LINE_HEIGHT = 300; // vertical distance between grand staff systems
export const GRAND_STAFF_GAP = 70;    // vertical gap between Treble bottom line and Bass top line
export const STAFF_HEIGHT = LINE_SPACING * 4; // 56px
export const STAFF_GAP = 90;

export interface KeySignatureDef {
  key: string;
  type: 'sharp' | 'flat' | 'none';
  count: number;
  alteredNotes: string[]; // Note letters that are altered, e.g. ['F', 'C']
  trebleSteps: number[];  // Diatonic steps from top line for each glyph in standard engraving order
  bassSteps: number[];    // Diatonic steps from top line for bass staff
}

export const KEY_SIGNATURE_MAP: Record<string, KeySignatureDef> = {
  C: { key: 'C', type: 'none', count: 0, alteredNotes: [], trebleSteps: [], bassSteps: [] },
  Am: { key: 'Am', type: 'none', count: 0, alteredNotes: [], trebleSteps: [], bassSteps: [] },
  G: { key: 'G', type: 'sharp', count: 1, alteredNotes: ['F'], trebleSteps: [0], bassSteps: [2] }, // F5 / F3
  D: { key: 'D', type: 'sharp', count: 2, alteredNotes: ['F', 'C'], trebleSteps: [0, 3], bassSteps: [2, 5] }, // F, C
  A: { key: 'A', type: 'sharp', count: 3, alteredNotes: ['F', 'C', 'G'], trebleSteps: [0, 3, -1], bassSteps: [2, 5, 1] }, // F, C, G
  E: { key: 'E', type: 'sharp', count: 4, alteredNotes: ['F', 'C', 'G', 'D'], trebleSteps: [0, 3, -1, 2], bassSteps: [2, 5, 1, 4] }, // F, C, G, D
  F: { key: 'F', type: 'flat', count: 1, alteredNotes: ['B'], trebleSteps: [4], bassSteps: [6] }, // Bb4 / Bb2
  Bb: { key: 'Bb', type: 'flat', count: 2, alteredNotes: ['B', 'E'], trebleSteps: [4, 1], bassSteps: [6, 3] }, // Bb, Eb
  Eb: { key: 'Eb', type: 'flat', count: 3, alteredNotes: ['B', 'E', 'A'], trebleSteps: [4, 1, 5], bassSteps: [6, 3, 7] }, // Bb, Eb, Ab
  Ab: { key: 'Ab', type: 'flat', count: 4, alteredNotes: ['B', 'E', 'A', 'D'], trebleSteps: [4, 1, 5, 2], bassSteps: [6, 3, 7, 4] }, // Bb, Eb, Ab, Db
};

export const TIME_SIGNATURES = [
  { num: 4, den: 4, label: '4/4' },
  { num: 3, den: 4, label: '3/4' },
  { num: 2, den: 4, label: '2/4' },
  { num: 6, den: 8, label: '6/8' },
  { num: 3, den: 8, label: '3/8' },
];

// Diatonic note indices for Treble staff
// Top line F5 = 0 steps from top of staff (Y = staffTop)
export const TREBLE_DIATONIC_STEPS: Record<number, string> = {
  '-8': 'G6',
  '-7': 'F6',
  '-6': 'E6',
  '-5': 'D6',
  '-4': 'C6',
  '-3': 'B5',
  '-2': 'A5',
  '-1': 'G5',
  '0': 'F5', // Top line
  '1': 'E5',
  '2': 'D5',
  '3': 'C5',
  '4': 'B4', // Middle line
  '5': 'A4',
  '6': 'G4',
  '7': 'F4',
  '8': 'E4', // Bottom line
  '9': 'D4',
  '10': 'C4', // Middle C (ledger line)
  '11': 'B3',
  '12': 'A3',
  '13': 'G3',
  '14': 'F3',
  '15': 'E3',
  '16': 'D3',
  '17': 'C3',
  '18': 'B2',
  '19': 'A2',
  '20': 'G2',
  '21': 'F2',
  '22': 'E2',
};

export const TREBLE_PITCH_TO_STEP: Record<string, number> = {
  'G6': -8,
  'F6': -7,
  'E6': -6,
  'D6': -5,
  'C6': -4,
  'B5': -3,
  'A5': -2,
  'G5': -1,
  'F5': 0,
  'E5': 1,
  'D5': 2,
  'C5': 3,
  'B4': 4,
  'A4': 5,
  'G4': 6,
  'F4': 7,
  'E4': 8,
  'D4': 9,
  'C4': 10,
  'B3': 11,
  'A3': 12,
  'G3': 13,
  'F3': 14,
  'E3': 15,
  'D3': 16,
  'C3': 17,
  'B2': 18,
  'A2': 19,
  'G2': 20,
  'F2': 21,
  'E2': 22,
};

// Diatonic note indices for Bass staff
// Top line A3 = step 0
export const BASS_DIATONIC_STEPS: Record<number, string> = {
  '-7': 'A4',
  '-6': 'G4',
  '-5': 'F4',
  '-4': 'E4',
  '-3': 'D4',
  '-2': 'C4', // Middle C (ledger line)
  '-1': 'B3',
  '0': 'A3', // Top line
  '1': 'G3',
  '2': 'F3',
  '3': 'E3',
  '4': 'D3', // Middle line
  '5': 'C3',
  '6': 'B2',
  '7': 'A2',
  '8': 'G2', // Bottom line
  '9': 'F2',
  '10': 'E2',
  '11': 'D2',
  '12': 'C2',
  '13': 'B1',
  '14': 'A1',
  '15': 'G1',
  '16': 'F1',
  '17': 'E1',
};

export const BASS_PITCH_TO_STEP: Record<string, number> = {
  'A4': -7,
  'G4': -6,
  'F4': -5,
  'E4': -4,
  'D4': -3,
  'C4': -2,
  'B3': -1,
  'A3': 0,
  'G3': 1,
  'F3': 2,
  'E3': 3,
  'D3': 4,
  'C3': 5,
  'B2': 6,
  'A2': 7,
  'G2': 8,
  'F2': 9,
  'E2': 10,
  'D2': 11,
  'C2': 12,
  'B1': 13,
  'A1': 14,
  'G1': 15,
  'F1': 16,
  'E1': 17,
};

const NOTE_LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LETTER_TO_VAL: Record<string, number> = {
  C: 0,
  D: 1,
  E: 2,
  F: 3,
  G: 4,
  A: 5,
  B: 6,
};

export function getDiatonicPitchFromStep(step: number, clef: 'treble' | 'bass' = 'treble'): string {
  const rounded = Math.round(step);
  // Treble top line is F5 (diatonic value 5 * 7 + 3 = 38)
  // Bass top line is A3 (diatonic value 3 * 7 + 5 = 26)
  const baseDiatonic = clef === 'bass' ? 26 : 38;
  const diatonicVal = baseDiatonic - rounded;
  const octave = Math.floor(diatonicVal / 7);
  const letterIdx = ((diatonicVal % 7) + 7) % 7;
  return `${NOTE_LETTERS[letterIdx]}${octave}`;
}

export function getStepFromPitch(pitch: string, clef: 'treble' | 'bass' = 'treble'): number {
  const natural = pitch.replace(/[#b]/g, '');
  const letter = natural[0]?.toUpperCase() || 'C';
  const octave = parseInt(natural.slice(1), 10);
  const letterVal = LETTER_TO_VAL[letter] ?? 0;
  const diatonicVal = (isNaN(octave) ? 4 : octave) * 7 + letterVal;

  const baseDiatonic = clef === 'bass' ? 26 : 38;
  return baseDiatonic - diatonicVal;
}
