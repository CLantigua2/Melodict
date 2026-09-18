import {
  calculateNoteY,
  getLedgerLines,
  getStemDirection,
} from './NotationCanvas.helpers';
import { STAFF_PADDING_TOP, STEP_Y } from './NotationCanvas.constants';

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
});
