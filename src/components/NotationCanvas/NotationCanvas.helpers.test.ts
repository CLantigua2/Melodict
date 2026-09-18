import {
  calculateNoteY,
  getLedgerLines,
  getStemDirection,
  groupMeasureChordsAndBeams,
  getTiePath,
  getPianoBracePath,
} from './NotationCanvas.helpers';
import { STAFF_PADDING_TOP, STEP_Y } from './NotationCanvas.constants';
import { ScoreNote } from '@/types/score.types';

describe('NotationCanvas helpers', () => {
  it('calculates correct note Y coordinates on treble staff', () => {
    // F5 is top line (step 0)
    expect(calculateNoteY('F5', STAFF_PADDING_TOP, 'treble')).toBe(STAFF_PADDING_TOP);
    // E5 is step 1
    expect(calculateNoteY('E5', STAFF_PADDING_TOP, 'treble')).toBe(STAFF_PADDING_TOP + STEP_Y);
    // C4 is middle C (step 10)
    expect(calculateNoteY('C4', STAFF_PADDING_TOP, 'treble')).toBe(STAFF_PADDING_TOP + 10 * STEP_Y);
  });

  it('determines ledger lines for middle C (C4) and above staff (A5)', () => {
    const c4Ledgers = getLedgerLines('C4', STAFF_PADDING_TOP, 'treble');
    expect(c4Ledgers.length).toBe(1);
    expect(c4Ledgers[0]).toBe(STAFF_PADDING_TOP + 10 * STEP_Y);

    const a5Ledgers = getLedgerLines('A5', STAFF_PADDING_TOP, 'treble');
    expect(a5Ledgers.length).toBe(1);

    const g4Ledgers = getLedgerLines('G4', STAFF_PADDING_TOP, 'treble');
    expect(g4Ledgers.length).toBe(0); // Inside staff, no ledgers needed
  });

  it('calculates stem directions based on middle line rule', () => {
    // Below middle line (B4): stems point UP
    expect(getStemDirection('C4', 'treble')).toBe('up');
    expect(getStemDirection('E4', 'treble')).toBe('up');
    expect(getStemDirection('A4', 'treble')).toBe('up');

    // On or above middle line (B4): stems point DOWN
    expect(getStemDirection('B4', 'treble')).toBe('down');
    expect(getStemDirection('C5', 'treble')).toBe('down');
    expect(getStemDirection('G5', 'treble')).toBe('down');
  });

  it('correctly groups polyphonic chord notes sharing the same beat', () => {
    const chordNotes: ScoreNote[] = [
      { id: 'c1', pitch: 'C4', duration: 'quarter', clef: 'treble', measureIndex: 0, beatPosition: 0 },
      { id: 'c2', pitch: 'E4', duration: 'quarter', clef: 'treble', measureIndex: 0, beatPosition: 0 },
      { id: 'c3', pitch: 'G4', duration: 'quarter', clef: 'treble', measureIndex: 0, beatPosition: 0 },
    ];

    const { chordGroups, beamGroups } = groupMeasureChordsAndBeams(
      chordNotes,
      80,
      260,
      4,
      80,
      'treble'
    );

    expect(chordGroups.length).toBe(1);
    expect(chordGroups[0].notes.length).toBe(3);
    expect(beamGroups.length).toBe(0); // Quarters are not beamed
  });

  it('beams consecutive eighth notes within the same metric beat', () => {
    const eighthNotes: ScoreNote[] = [
      { id: 'e1', pitch: 'F4', duration: 'eighth', clef: 'treble', measureIndex: 0, beatPosition: 1.0 },
      { id: 'e2', pitch: 'E4', duration: 'eighth', clef: 'treble', measureIndex: 0, beatPosition: 1.5 },
    ];

    const { chordGroups, beamGroups } = groupMeasureChordsAndBeams(
      eighthNotes,
      80,
      260,
      4,
      80,
      'treble'
    );

    expect(chordGroups.length).toBe(2);
    expect(chordGroups[0].isBeamed).toBe(true);
    expect(chordGroups[1].isBeamed).toBe(true);
    expect(beamGroups.length).toBe(1);
    expect(beamGroups[0].duration).toBe('eighth');
  });

  it('generates curved SVG path for musical ties', () => {
    const tiePath = getTiePath(100, 80, 150, 80, 'up');
    expect(tiePath).toContain('M ');
    expect(tiePath).toContain('Q ');
  });

  it('calculates note Y and ledger lines correctly for bass clef', () => {
    // A3 is top line of bass clef (step 0)
    expect(calculateNoteY('A3', STAFF_PADDING_TOP, 'bass')).toBe(STAFF_PADDING_TOP);
    // Middle C (C4) on bass clef is step -2 (1 ledger line above staff)
    expect(calculateNoteY('C4', STAFF_PADDING_TOP, 'bass')).toBe(STAFF_PADDING_TOP - 2 * STEP_Y);
    const c4BassLedgers = getLedgerLines('C4', STAFF_PADDING_TOP, 'bass');
    expect(c4BassLedgers.length).toBe(1);
    expect(c4BassLedgers[0]).toBe(STAFF_PADDING_TOP - 2 * STEP_Y);

    // Stem directions on bass clef (middle line is D3, step 4)
    expect(getStemDirection('C3', 'bass')).toBe('up');
    expect(getStemDirection('D3', 'bass')).toBe('down');
    expect(getStemDirection('F3', 'bass')).toBe('down');
  });

  it('calculates note Y and ledger lines correctly for pitches below E4/E3 on treble clef', () => {
    // E3 on treble staff is step 15 (3 ledger lines: steps 10, 12, 14, note in space below)
    expect(calculateNoteY('E3', STAFF_PADDING_TOP, 'treble')).toBe(STAFF_PADDING_TOP + 15 * STEP_Y);
    const e3Ledgers = getLedgerLines('E3', STAFF_PADDING_TOP, 'treble');
    expect(e3Ledgers.length).toBe(3);
    expect(e3Ledgers).toEqual([
      STAFF_PADDING_TOP + 10 * STEP_Y,
      STAFF_PADDING_TOP + 12 * STEP_Y,
      STAFF_PADDING_TOP + 14 * STEP_Y,
    ]);

    // C3 on treble staff is step 17 (4 ledger lines: 10, 12, 14, 16)
    expect(calculateNoteY('C3', STAFF_PADDING_TOP, 'treble')).toBe(STAFF_PADDING_TOP + 17 * STEP_Y);
    const c3Ledgers = getLedgerLines('C3', STAFF_PADDING_TOP, 'treble');
    expect(c3Ledgers.length).toBe(4);
  });

  it('generates an authentic curly bracket path for Grand Staff piano brace', () => {
    const bracePath = getPianoBracePath(80, 260, 15);
    expect(bracePath).toContain('M 15 80');
    expect(bracePath).toContain('Z');
    expect(bracePath).toContain('C ');
  });
});
