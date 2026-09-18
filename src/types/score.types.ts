import { InstrumentId } from '../audio/audio.types';

export type NoteDurationType = 'whole' | 'half' | 'quarter' | 'eighth' | 'sixteenth';
export type AccidentalType = 'sharp' | 'flat' | 'natural' | 'none';
export type ClefType = 'treble' | 'bass';
export type DynamicMarking = 'pp' | 'p' | 'mp' | 'mf' | 'f' | 'ff';

export interface ScoreNote {
  id: string;
  pitch: string;              // e.g. "C4", "E4", "G#4", "Bb5"
  accidental?: AccidentalType;
  duration: NoteDurationType;
  dotted?: boolean;
  isRest?: boolean;
  clef: ClefType;
  lineIndex?: number;         // Which staff line this belongs to
  measureIndex: number;       // Measure index
  beatPosition: number;        // in quarter beats (0, 0.5, 1.0, etc.)
  lyric?: string;             // Lyric syllable or word under the note
  chordId?: string;           // Notes with the same measureIndex & beatPosition form a chord
  tied?: boolean;             // True if tied to a subsequent note of the same pitch
  dynamic?: DynamicMarking;   // Dynamic expression marking (p, f, mf, etc.)
  selected?: boolean;
}

export interface Measure {
  id?: string;
  index: number;
  lineIndex?: number;
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  notes: ScoreNote[];
}

export interface ScoreLine {
  id: string;
  lineIndex: number;
  clef: ClefType;
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  measures: Measure[];
}

export interface Score {
  id: string;
  title: string;
  composer: string;
  tempo: number; // BPM (e.g. 120)
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  keySignature: string; // e.g. "C", "G", "F", "D"
  instrumentId: InstrumentId;
  lines: ScoreLine[];
  measures: Measure[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateScoreDTO {
  title: string;
  composer?: string;
  tempo?: number;
  timeSignatureNumerator?: number;
  timeSignatureDenominator?: number;
  keySignature?: string;
  instrumentId?: InstrumentId;
  lines?: ScoreLine[];
  measures?: Measure[];
}
