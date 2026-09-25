import { InstrumentId, PlaybackState } from "@/audio/audio.types";
import { AccidentalType, ClefType, DynamicMarking, NoteDurationType, Score, ScoreNote } from "@/types/score.types";

export type EditTool = 'input' | 'select' | 'pan' | 'erase';
export type BackendSaveStatus = 'saved' | 'saving' | 'error' | 'offline';

export interface PlaybackSection {
  startLine: number;
  startMeasure: number;
  startBeat: number;
  endLine: number;
  endMeasure: number;
  endBeat: number;
}

export interface ScoreContextType {
  score: Score;
  scoresList: Score[];
  activeTool: EditTool;
  setActiveTool: (tool: EditTool) => void;
  selectedDuration: NoteDurationType;
  setSelectedDuration: (d: NoteDurationType) => void;
  selectedAccidental: AccidentalType;
  setSelectedAccidental: (a: AccidentalType) => void;
  isDotted: boolean;
  setIsDotted: (d: boolean) => void;
  isRest: boolean;
  setIsRest: (r: boolean) => void;
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  selectedNote: ScoreNote | null;
  playbackState: PlaybackState;
  playheadLine: number;
  playheadMeasure: number;
  playheadBeat: number;
  selectedSection: PlaybackSection | null;
  setSelectedSection: (sec: PlaybackSection | null) => void;
  setPlayheadPosition: (line: number, measure: number, beat?: number) => void;
  rewindToBeginning: () => void;
  activeMidiNotes: number[];
  metronomeActive: boolean;
  setMetronomeActive: (m: boolean) => void;
  loopActive: boolean;
  setLoopActive: (l: boolean) => void;
  masterVolume: number;
  setMasterVolume: (v: number) => void;
  isInstrumentLoading: boolean;

  // Tabs & Library
  openScores: Score[];
  openScoreIds: string[];

  // Actions
  loadScoreById: (id: string) => void;
  createNewScore: () => void;
  closeTab: (id: string) => void;
  closeScore: (id: string) => void;
  deleteScoreFromLibrary: (id: string) => Promise<void>;
  updateScoreMeta: (meta: Partial<Score>) => void;
  toggleLayoutMode: () => void;
  addNote: (
    measureIndex: number,
    beatPosition: number,
    pitch: string,
    clef?: ClefType,
    lineIndex?: number
  ) => void;
  deleteNote: (noteId: string) => void;
  deleteSelectedNote: () => void;
  updateNote: (noteId: string, updates: Partial<ScoreNote>) => void;
  updateSelectedNote: (updates: Partial<ScoreNote>) => void;
  moveNote: (
    noteId: string,
    targetMeasureIndex: number,
    targetBeatPosition: number,
    newPitch: string,
    targetLineIndex?: number,
    newClef?: ClefType
  ) => void;
  moveSelectedNotePitch: (semitoneDelta: number) => void;
  moveSelectedNoteBeat: (beatDelta: number) => void;
  addChordInterval: (semitones: number) => void;
  addTriadToSelectedNote: (type?: 'major' | 'minor') => void;
  toggleTieSelectedNote: () => void;
  setSelectedNoteDynamic: (dyn?: DynamicMarking) => void;

  // Multi-line and Time Signature Management
  addLine: (numerator?: number, denominator?: number, clef?: ClefType) => void;
  removeLine: (lineIndex: number) => void;
  changeLineTimeSignature: (lineIndex: number, numerator: number, denominator: number) => void;
  changeLineClef: (lineIndex: number, clef: ClefType) => void;
  addMeasureToLine: (lineIndex: number) => void;
  removeMeasureFromLine: (lineIndex: number, measureIndex?: number) => void;

  // Measure operations (global / legacy)
  addMeasure: () => void;
  removeMeasure: (index?: number) => void;
  clearAllNotes: () => void;
  changeInstrument: (id: InstrumentId) => Promise<void>;
  togglePlayback: () => void;
  stopPlayback: () => void;
  previewNote: (pitch: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Backend persistence & anonymous user
  userId: string;
  saveStatus: BackendSaveStatus;
  saveScoreToBackend: (scoreToSave?: Score) => Promise<void>;
}