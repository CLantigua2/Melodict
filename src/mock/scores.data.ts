import { Score, ScoreLine, Measure } from '../types/score.types';

// Lavender's Blue (Traditional English Folk Song - 3/4 Time, 4 Lines x 4 Measures)
const lavendersBlueLine1: Measure[] = [
  {
    index: 0,
    lineIndex: 0,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-1', pitch: 'C4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 0, beatPosition: 0, lyric: 'La -' },
      { id: 'lb-2', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 0, beatPosition: 1, lyric: 'ven-' },
      { id: 'lb-3', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 0, beatPosition: 2, lyric: "der's" },
    ],
  },
  {
    index: 1,
    lineIndex: 0,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-4', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 1, beatPosition: 0, lyric: 'blue,' },
      { id: 'lb-5', pitch: 'F4', duration: 'eighth', clef: 'treble', lineIndex: 0, measureIndex: 1, beatPosition: 1, lyric: 'dil-' },
      { id: 'lb-6', pitch: 'E4', duration: 'eighth', clef: 'treble', lineIndex: 0, measureIndex: 1, beatPosition: 1.5, lyric: 'ly,' },
      { id: 'lb-7', pitch: 'D4', duration: 'eighth', clef: 'treble', lineIndex: 0, measureIndex: 1, beatPosition: 2, lyric: 'dil-' },
      { id: 'lb-8', pitch: 'C4', duration: 'eighth', clef: 'treble', lineIndex: 0, measureIndex: 1, beatPosition: 2.5, lyric: 'ly,' },
    ],
  },
  {
    index: 2,
    lineIndex: 0,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-9', pitch: 'C4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 2, beatPosition: 0, lyric: 'la -' },
      { id: 'lb-10', pitch: 'A4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 2, beatPosition: 1, lyric: 'ven-' },
      { id: 'lb-11', pitch: 'A4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 2, beatPosition: 2, lyric: "der's" },
    ],
  },
  {
    index: 3,
    lineIndex: 0,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-12', pitch: 'A4', duration: 'half', dotted: true, clef: 'treble', lineIndex: 0, measureIndex: 3, beatPosition: 0, lyric: 'green,' },
    ],
  },
];

const lavendersBlueLine2: Measure[] = [
  {
    index: 4,
    lineIndex: 1,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-13', pitch: 'C4', duration: 'quarter', clef: 'treble', lineIndex: 1, measureIndex: 4, beatPosition: 0, lyric: 'when' },
      { id: 'lb-14', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 1, measureIndex: 4, beatPosition: 1, lyric: 'I' },
      { id: 'lb-15', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 1, measureIndex: 4, beatPosition: 2, lyric: 'am' },
    ],
  },
  {
    index: 5,
    lineIndex: 1,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-16', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 1, measureIndex: 5, beatPosition: 0, lyric: 'king,' },
      { id: 'lb-17', pitch: 'F4', duration: 'eighth', clef: 'treble', lineIndex: 1, measureIndex: 5, beatPosition: 1, lyric: 'dil-' },
      { id: 'lb-18', pitch: 'E4', duration: 'eighth', clef: 'treble', lineIndex: 1, measureIndex: 5, beatPosition: 1.5, lyric: 'ly,' },
      { id: 'lb-19', pitch: 'D4', duration: 'eighth', clef: 'treble', lineIndex: 1, measureIndex: 5, beatPosition: 2, lyric: 'dil-' },
      { id: 'lb-20', pitch: 'C4', duration: 'eighth', clef: 'treble', lineIndex: 1, measureIndex: 5, beatPosition: 2.5, lyric: 'ly,' },
    ],
  },
  {
    index: 6,
    lineIndex: 1,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-21', pitch: 'F4', duration: 'quarter', clef: 'treble', lineIndex: 1, measureIndex: 6, beatPosition: 0, lyric: 'you' },
      { id: 'lb-22', pitch: 'E4', duration: 'quarter', clef: 'treble', lineIndex: 1, measureIndex: 6, beatPosition: 1, lyric: 'shall' },
      { id: 'lb-23', pitch: 'D4', duration: 'quarter', clef: 'treble', lineIndex: 1, measureIndex: 6, beatPosition: 2, lyric: 'be' },
    ],
  },
  {
    index: 7,
    lineIndex: 1,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-24', pitch: 'C4', duration: 'half', dotted: true, clef: 'treble', lineIndex: 1, measureIndex: 7, beatPosition: 0, lyric: 'queen.' },
    ],
  },
];

const lavendersBlueLine3: Measure[] = [
  {
    index: 8,
    lineIndex: 2,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-25', pitch: 'C4', duration: 'quarter', clef: 'treble', lineIndex: 2, measureIndex: 8, beatPosition: 0, lyric: 'Who' },
      { id: 'lb-26', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 2, measureIndex: 8, beatPosition: 1, lyric: 'told' },
      { id: 'lb-27', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 2, measureIndex: 8, beatPosition: 2, lyric: 'you' },
    ],
  },
  {
    index: 9,
    lineIndex: 2,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-28', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 2, measureIndex: 9, beatPosition: 0, lyric: 'so,' },
      { id: 'lb-29', pitch: 'F4', duration: 'eighth', clef: 'treble', lineIndex: 2, measureIndex: 9, beatPosition: 1, lyric: 'dil-' },
      { id: 'lb-30', pitch: 'E4', duration: 'eighth', clef: 'treble', lineIndex: 2, measureIndex: 9, beatPosition: 1.5, lyric: 'ly,' },
      { id: 'lb-31', pitch: 'D4', duration: 'eighth', clef: 'treble', lineIndex: 2, measureIndex: 9, beatPosition: 2, lyric: 'dil-' },
      { id: 'lb-32', pitch: 'C4', duration: 'eighth', clef: 'treble', lineIndex: 2, measureIndex: 9, beatPosition: 2.5, lyric: 'ly,' },
    ],
  },
  {
    index: 10,
    lineIndex: 2,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-33', pitch: 'C4', duration: 'quarter', clef: 'treble', lineIndex: 2, measureIndex: 10, beatPosition: 0, lyric: 'who' },
      { id: 'lb-34', pitch: 'A4', duration: 'quarter', clef: 'treble', lineIndex: 2, measureIndex: 10, beatPosition: 1, lyric: 'told' },
      { id: 'lb-35', pitch: 'A4', duration: 'quarter', clef: 'treble', lineIndex: 2, measureIndex: 10, beatPosition: 2, lyric: 'you' },
    ],
  },
  {
    index: 11,
    lineIndex: 2,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-36', pitch: 'A4', duration: 'half', dotted: true, clef: 'treble', lineIndex: 2, measureIndex: 11, beatPosition: 0, lyric: 'so?' },
    ],
  },
];

const lavendersBlueLine4: Measure[] = [
  {
    index: 12,
    lineIndex: 3,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-37', pitch: 'C4', duration: 'quarter', clef: 'treble', lineIndex: 3, measureIndex: 12, beatPosition: 0, lyric: "'Twas" },
      { id: 'lb-38', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 3, measureIndex: 12, beatPosition: 1, lyric: 'my' },
      { id: 'lb-39', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 3, measureIndex: 12, beatPosition: 2, lyric: 'own' },
    ],
  },
  {
    index: 13,
    lineIndex: 3,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-40', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 3, measureIndex: 13, beatPosition: 0, lyric: 'heart,' },
      { id: 'lb-41', pitch: 'F4', duration: 'eighth', clef: 'treble', lineIndex: 3, measureIndex: 13, beatPosition: 1, lyric: 'dil-' },
      { id: 'lb-42', pitch: 'E4', duration: 'eighth', clef: 'treble', lineIndex: 3, measureIndex: 13, beatPosition: 1.5, lyric: 'ly,' },
      { id: 'lb-43', pitch: 'D4', duration: 'eighth', clef: 'treble', lineIndex: 3, measureIndex: 13, beatPosition: 2, lyric: 'dil-' },
      { id: 'lb-44', pitch: 'C4', duration: 'eighth', clef: 'treble', lineIndex: 3, measureIndex: 13, beatPosition: 2.5, lyric: 'ly,' },
    ],
  },
  {
    index: 14,
    lineIndex: 3,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-45', pitch: 'F4', duration: 'quarter', clef: 'treble', lineIndex: 3, measureIndex: 14, beatPosition: 0, lyric: 'that' },
      { id: 'lb-46', pitch: 'E4', duration: 'quarter', clef: 'treble', lineIndex: 3, measureIndex: 14, beatPosition: 1, lyric: 'told' },
      { id: 'lb-47', pitch: 'D4', duration: 'quarter', clef: 'treble', lineIndex: 3, measureIndex: 14, beatPosition: 2, lyric: 'me' },
    ],
  },
  {
    index: 15,
    lineIndex: 3,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'lb-48', pitch: 'C4', duration: 'half', dotted: true, clef: 'treble', lineIndex: 3, measureIndex: 15, beatPosition: 0, lyric: 'so.' },
    ],
  },
];

const lavendersBlueLines: ScoreLine[] = [
  {
    id: 'lb-line-1',
    lineIndex: 0,
    clef: 'treble',
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    measures: lavendersBlueLine1,
  },
  {
    id: 'lb-line-2',
    lineIndex: 1,
    clef: 'treble',
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    measures: lavendersBlueLine2,
  },
  {
    id: 'lb-line-3',
    lineIndex: 2,
    clef: 'treble',
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    measures: lavendersBlueLine3,
  },
  {
    id: 'lb-line-4',
    lineIndex: 3,
    clef: 'treble',
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    measures: lavendersBlueLine4,
  },
];

const odeToJoyMeasuresLine1: Measure[] = [
  {
    index: 0,
    lineIndex: 0,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'n1', pitch: 'E4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 0, beatPosition: 0 },
      { id: 'n2', pitch: 'E4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 0, beatPosition: 1 },
      { id: 'n3', pitch: 'F4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 0, beatPosition: 2 },
      { id: 'n4', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 0, beatPosition: 3 },
    ],
  },
  {
    index: 1,
    lineIndex: 0,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'n5', pitch: 'G4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 1, beatPosition: 0 },
      { id: 'n6', pitch: 'F4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 1, beatPosition: 1 },
      { id: 'n7', pitch: 'E4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 1, beatPosition: 2 },
      { id: 'n8', pitch: 'D4', duration: 'quarter', clef: 'treble', lineIndex: 0, measureIndex: 1, beatPosition: 3 },
    ],
  },
];

const odeToJoyMeasuresLine2: Measure[] = [
  {
    index: 2,
    lineIndex: 1,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'n9', pitch: 'C4', duration: 'quarter', clef: 'treble', lineIndex: 1, measureIndex: 2, beatPosition: 0 },
      { id: 'n10', pitch: 'C4', duration: 'quarter', clef: 'treble', lineIndex: 1, measureIndex: 2, beatPosition: 1 },
      { id: 'n11', pitch: 'D4', duration: 'quarter', clef: 'treble', lineIndex: 1, measureIndex: 2, beatPosition: 2 },
      { id: 'n12', pitch: 'E4', duration: 'quarter', clef: 'treble', lineIndex: 1, measureIndex: 2, beatPosition: 3 },
    ],
  },
  {
    index: 3,
    lineIndex: 1,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    notes: [
      { id: 'n13', pitch: 'E4', duration: 'quarter', dotted: true, clef: 'treble', lineIndex: 1, measureIndex: 3, beatPosition: 0 },
      { id: 'n14', pitch: 'D4', duration: 'eighth', clef: 'treble', lineIndex: 1, measureIndex: 3, beatPosition: 1.5 },
      { id: 'n15', pitch: 'D4', duration: 'half', clef: 'treble', lineIndex: 1, measureIndex: 3, beatPosition: 2 },
    ],
  },
];

const odeToJoyLines: ScoreLine[] = [
  {
    id: 'line-1',
    lineIndex: 0,
    clef: 'treble',
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    measures: odeToJoyMeasuresLine1,
  },
  {
    id: 'line-2',
    lineIndex: 1,
    clef: 'treble',
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    measures: odeToJoyMeasuresLine2,
  },
];

export const INITIAL_MOCK_SCORES: Score[] = [
  {
    id: 'score-1',
    title: "Lavender's Blue",
    composer: 'Traditional Folk Song',
    tempo: 96,
    timeSignatureNumerator: 3,
    timeSignatureDenominator: 4,
    keySignature: 'C',
    instrumentId: 'acoustic_grand_piano',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-18T12:00:00Z',
    lines: lavendersBlueLines,
    measures: [
      ...lavendersBlueLine1,
      ...lavendersBlueLine2,
      ...lavendersBlueLine3,
      ...lavendersBlueLine4,
    ],
  },
  {
    id: 'score-2',
    title: 'Ode to Joy',
    composer: 'L. v. Beethoven',
    tempo: 120,
    timeSignatureNumerator: 4,
    timeSignatureDenominator: 4,
    keySignature: 'C',
    instrumentId: 'acoustic_grand_piano',
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-18T12:00:00Z',
    lines: odeToJoyLines,
    measures: [...odeToJoyMeasuresLine1, ...odeToJoyMeasuresLine2],
  },
];
