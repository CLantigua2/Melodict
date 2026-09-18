import { ClefType } from '@/types/score.types';
import {
  LINE_SPACING,
  STEP_Y,
  STAFF_PADDING_TOP,
  getStepFromPitch,
} from './NotationCanvas.constants';

/**
 * Calculates Y coordinate for a given pitch on staff.
 */
export function calculateNoteY(
  pitch: string,
  staffTop: number = STAFF_PADDING_TOP,
  clef: ClefType = 'treble'
): number {
  const step = getStepFromPitch(pitch, clef);
  return staffTop + step * STEP_Y;
}

/**
 * Determines ledger lines needed for notes outside staff boundaries.
 */
export function getLedgerLines(
  pitch: string,
  staffTop: number = STAFF_PADDING_TOP,
  clef: ClefType = 'treble'
): number[] {
  const step = getStepFromPitch(pitch, clef);
  const ledgerYPositions: number[] = [];

  // Below bottom line (step 8 is bottom line)
  if (step >= 10) {
    for (let s = 10; s <= step; s += 2) {
      ledgerYPositions.push(staffTop + s * STEP_Y);
    }
  }

  // Above top line (step 0 is top line)
  if (step <= -2) {
    for (let s = -2; s >= step; s -= 2) {
      ledgerYPositions.push(staffTop + s * STEP_Y);
    }
  }

  return ledgerYPositions;
}

/**
 * Standard rule for note stem direction:
 * Middle line is step 4.
 */
export function getStemDirection(pitch: string, clef: ClefType = 'treble'): 'up' | 'down' {
  const step = getStepFromPitch(pitch, clef);
  return step >= 5 ? 'up' : 'down';
}
