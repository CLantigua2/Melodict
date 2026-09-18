import { ScoreNote } from '@/types/score.types';

export interface NotationCanvasProps {
  className?: string;
}

export interface GhostNoteState {
  visible: boolean;
  lineIndex: number;
  measureIndex: number;
  beatPosition: number;
  pitch: string;
  x: number;
  y: number;
}
