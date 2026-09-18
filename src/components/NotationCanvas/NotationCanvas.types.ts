import { ScoreNote, ClefType } from '@/types/score.types';

export interface NotationCanvasProps {
  className?: string;
}

export interface GhostNoteState {
  visible: boolean;
  lineIndex: number;
  measureIndex: number;
  beatPosition: number;
  pitch: string;
  clef?: ClefType;
  x: number;
  y: number;
}
