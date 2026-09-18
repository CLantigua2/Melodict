import { ClefType, ScoreNote, DynamicMarking, Score } from '@/types/score.types';
import {
  LINE_SPACING,
  STEP_Y,
  STAFF_PADDING_TOP,
  LINE_HEIGHT,
  GRAND_LINE_HEIGHT,
  GRAND_STAFF_GAP,
  STAFF_HEIGHT,
  CLEF_WIDTH,
  MEASURE_WIDTH,
  NOTEHEAD_RX,
  STEM_HEIGHT,
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

export interface ChordGroupData {
  beatPosition: number;
  notes: ScoreNote[];
  stemDirection: 'up' | 'down';
  minY: number; // topmost notehead Y
  maxY: number; // bottommost notehead Y
  x: number;
  stemX: number;
  stemTipY: number;
  stemStartY: number;
  isBeamed?: boolean;
}

export interface BeamGroupData {
  chordGroups: ChordGroupData[];
  duration: 'eighth' | 'sixteenth';
  stemDirection: 'up' | 'down';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/**
 * Groups a measure's notes into polyphonic chords and calculates beam groups.
 */
export function groupMeasureChordsAndBeams(
  notes: ScoreNote[],
  measureLeft: number,
  measureWidth: number,
  beatsPerMeasure: number,
  staffTop: number,
  clef: ClefType
): { chordGroups: ChordGroupData[]; beamGroups: BeamGroupData[] } {
  // 1. Group notes by beatPosition
  const beatMap = new Map<number, ScoreNote[]>();
  notes.forEach((n) => {
    const list = beatMap.get(n.beatPosition) || [];
    list.push(n);
    beatMap.set(n.beatPosition, list);
  });

  const sortedBeats = Array.from(beatMap.keys()).sort((a, b) => a - b);
  const chordGroups: ChordGroupData[] = [];

  sortedBeats.forEach((beat) => {
    const chordNotes = beatMap.get(beat) || [];
    const noteX = measureLeft + (beat / beatsPerMeasure) * (measureWidth - 30) + 15;

    const yList = chordNotes.map((n) => calculateNoteY(n.pitch, staffTop, clef));
    const minY = Math.min(...yList);
    const maxY = Math.max(...yList);

    // Determine stem direction: if average step is below middle line, stem up
    const averageY = (minY + maxY) / 2;
    const middleLineY = staffTop + 4 * STEP_Y;
    const stemDirection: 'up' | 'down' = averageY >= middleLineY ? 'up' : 'down';

    const stemX = stemDirection === 'up' ? noteX + NOTEHEAD_RX - 1 : noteX - NOTEHEAD_RX + 1;
    const stemStartY = stemDirection === 'up' ? maxY : minY;
    const stemTipY = stemDirection === 'up' ? minY - STEM_HEIGHT : maxY + STEM_HEIGHT;

    chordGroups.push({
      beatPosition: beat,
      notes: chordNotes,
      stemDirection,
      minY,
      maxY,
      x: noteX,
      stemX,
      stemStartY,
      stemTipY,
      isBeamed: false,
    });
  });

  // 2. Compute beam groups for eighth and sixteenth notes within the same metric beat
  const beamGroups: BeamGroupData[] = [];

  // Group chord groups by integer beat
  const beatBuckets = new Map<number, ChordGroupData[]>();
  chordGroups.forEach((cg) => {
    const isEighthOrSixteenth = cg.notes.some(
      (n) => (n.duration === 'eighth' || n.duration === 'sixteenth') && !n.isRest
    );
    if (isEighthOrSixteenth) {
      const bucketKey = Math.floor(cg.beatPosition);
      const list = beatBuckets.get(bucketKey) || [];
      list.push(cg);
      beatBuckets.set(bucketKey, list);
    }
  });

  beatBuckets.forEach((bucket) => {
    if (bucket.length >= 2) {
      // Consistent stem direction across the beam
      const upCount = bucket.filter((b) => b.stemDirection === 'up').length;
      const beamStemDir: 'up' | 'down' = upCount >= bucket.length / 2 ? 'up' : 'down';

      // Mark all chords in this group as beamed and unify their stem direction
      bucket.forEach((cg) => {
        cg.isBeamed = true;
        cg.stemDirection = beamStemDir;
        cg.stemX = beamStemDir === 'up' ? cg.x + NOTEHEAD_RX - 1 : cg.x - NOTEHEAD_RX + 1;
        cg.stemStartY = beamStemDir === 'up' ? cg.maxY : cg.minY;
      });

      // Align stem tips to a smooth beam line
      const first = bucket[0];
      const last = bucket[bucket.length - 1];

      const duration: 'eighth' | 'sixteenth' = bucket.some((cg) =>
        cg.notes.some((n) => n.duration === 'sixteenth')
      )
        ? 'sixteenth'
        : 'eighth';

      const avgTipY =
        beamStemDir === 'up'
          ? Math.min(...bucket.map((cg) => cg.minY)) - STEM_HEIGHT
          : Math.max(...bucket.map((cg) => cg.maxY)) + STEM_HEIGHT;

      bucket.forEach((cg) => {
        cg.stemTipY = avgTipY;
      });

      beamGroups.push({
        chordGroups: bucket,
        duration,
        stemDirection: beamStemDir,
        x1: first.stemX,
        y1: avgTipY,
        x2: last.stemX,
        y2: avgTipY,
      });
    }
  });

  return { chordGroups, beamGroups };
}

/**
 * Finds the immediate next note in the score with the exact same pitch for rendering a tie.
 */
export function findNextNoteWithPitch(
  score: Score,
  note: ScoreNote
): { note: ScoreNote; x: number; y: number; isSameLine: boolean } | null {
  const allLines = score.lines || [];
  const isGrandStaff = score.layoutMode === 'grand';
  const systemHeight = isGrandStaff ? GRAND_LINE_HEIGHT : LINE_HEIGHT;
  let foundCurrent = false;

  for (const line of allLines) {
    const beatsPerMeasure = line.timeSignatureNumerator * (4 / line.timeSignatureDenominator);
    const systemTop = STAFF_PADDING_TOP + line.lineIndex * systemHeight;

    for (let mOffset = 0; mOffset < line.measures.length; mOffset++) {
      const measure = line.measures[mOffset];
      const measureLeft = CLEF_WIDTH + mOffset * MEASURE_WIDTH;

      for (const n of measure.notes) {
        if (n.id === note.id) {
          foundCurrent = true;
          continue;
        }

        if (foundCurrent && n.pitch === note.pitch && !n.isRest) {
          const x = measureLeft + (n.beatPosition / beatsPerMeasure) * (MEASURE_WIDTH - 30) + 15;
          const staffTop =
            isGrandStaff && n.clef === 'bass'
              ? systemTop + STAFF_HEIGHT + GRAND_STAFF_GAP
              : systemTop;
          const y = calculateNoteY(n.pitch, staffTop, n.clef);
          const isSameLine = n.lineIndex === note.lineIndex;
          return { note: n, x, y, isSameLine };
        }
      }
    }
  }

  return null;
}

/**
 * Generates an SVG path string for a musical tie arc.
 */
export function getTiePath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  stemDir: 'up' | 'down'
): string {
  // If stem is up, arc curves downward beneath notehead; if stem is down, arc curves upward
  const curveOffset = stemDir === 'up' ? 14 : -14;
  const startPtX = startX + 4;
  const startPtY = startY + (stemDir === 'up' ? 6 : -6);
  const endPtX = endX - 4;
  const endPtY = endY + (stemDir === 'up' ? 6 : -6);

  const ctrlX = (startPtX + endPtX) / 2;
  const ctrlY = (startPtY + endPtY) / 2 + curveOffset;

  return `M ${startPtX} ${startPtY} Q ${ctrlX} ${ctrlY} ${endPtX} ${endPtY}`;
}


