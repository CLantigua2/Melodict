'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import {
  Score,
  ScoreLine,
  ScoreNote,
  Measure,
  NoteDurationType,
  AccidentalType,
  ClefType,
  DynamicMarking,
} from '@/types/score.types';
import { InstrumentId, PlaybackState } from '@/audio/audio.types';
import { AudioEngine } from '@/audio/AudioEngine';
import { INITIAL_MOCK_SCORES } from '@/mock/scores.data';
import { pitchToMidi, midiToPitch } from '@/audio/audio.constants';

export type EditTool = 'input' | 'select' | 'pan' | 'erase';

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

  // Actions
  loadScoreById: (id: string) => void;
  createNewScore: () => void;
  closeScore: (id: string) => void;
  updateScoreMeta: (meta: Partial<Score>) => void;
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
    targetLineIndex?: number
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
}

const ScoreContext = createContext<ScoreContextType | null>(null);

export function useScore(): ScoreContextType {
  const ctx = useContext(ScoreContext);
  if (!ctx) {
    throw new Error('useScore must be used within a ScoreProvider');
  }
  return ctx;
}

function normalizeScore(raw: Score): Score {
  if (raw.lines && raw.lines.length > 0) {
    const syncedLines = raw.lines.map((l, lIdx) => ({
      ...l,
      lineIndex: lIdx,
      measures: l.measures.map((m) => ({
        ...m,
        lineIndex: lIdx,
        notes: m.notes.map((n) => ({ ...n, lineIndex: lIdx })),
      })),
    }));
    return {
      ...raw,
      lines: syncedLines,
      measures: syncedLines.flatMap((l) => l.measures),
    };
  }

  // Fallback: partition measures into lines of 2 measures
  const measures = raw.measures || [];
  const lines: ScoreLine[] = [];
  const measuresPerLine = 2;
  const numLines = Math.max(1, Math.ceil(measures.length / measuresPerLine));

  for (let l = 0; l < numLines; l++) {
    const lineMeasures = measures
      .slice(l * measuresPerLine, (l + 1) * measuresPerLine)
      .map((m) => ({
        ...m,
        lineIndex: l,
        timeSignatureNumerator: m.timeSignatureNumerator || raw.timeSignatureNumerator || 4,
        timeSignatureDenominator: m.timeSignatureDenominator || raw.timeSignatureDenominator || 4,
        notes: m.notes.map((n) => ({ ...n, lineIndex: l })),
      }));

    lines.push({
      id: `line-${l + 1}`,
      lineIndex: l,
      clef: 'treble',
      timeSignatureNumerator: lineMeasures[0]?.timeSignatureNumerator || raw.timeSignatureNumerator || 4,
      timeSignatureDenominator: lineMeasures[0]?.timeSignatureDenominator || raw.timeSignatureDenominator || 4,
      measures: lineMeasures,
    });
  }

  return {
    ...raw,
    lines,
    measures: lines.flatMap((l) => l.measures),
  };
}

export const ScoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scoresList, setScoresList] = useState<Score[]>(INITIAL_MOCK_SCORES.map(normalizeScore));
  const [score, setScore] = useState<Score>(normalizeScore(INITIAL_MOCK_SCORES[0]));

  // Undo / Redo history
  const [history, setHistory] = useState<Score[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Editing state
  const [activeTool, setActiveTool] = useState<EditTool>('input');
  const [selectedDuration, setSelectedDurationState] = useState<NoteDurationType>('quarter');
  const [selectedAccidental, setSelectedAccidentalState] = useState<AccidentalType>('none');
  const [isDotted, setIsDottedState] = useState<boolean>(false);
  const [isRest, setIsRestState] = useState<boolean>(false);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  // Playhead & Transport
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [playheadLine, setPlayheadLine] = useState<number>(0);
  const [playheadMeasure, setPlayheadMeasure] = useState<number>(0);
  const [playheadBeat, setPlayheadBeat] = useState<number>(0);
  const [selectedSection, setSelectedSection] = useState<PlaybackSection | null>(null);
  const [activeMidiNotes, setActiveMidiNotes] = useState<number[]>([]);
  const [metronomeActive, setMetronomeActive] = useState<boolean>(false);
  const [loopActive, setLoopActive] = useState<boolean>(false);
  const [masterVolume, setMasterVolumeState] = useState<number>(0.8);
  const [isInstrumentLoading, setIsInstrumentLoading] = useState<boolean>(false);

  const playbackTimerRef = useRef<number | null>(null);
  const playbackStartTimeRef = useRef<number>(0);
  const playbackStartBeatRef = useRef<number>(0);

  // Find currently selected note object
  const selectedNote = useMemo(() => {
    if (!selectedNoteId) return null;
    return (
      score.lines
        .flatMap((l) => l.measures)
        .flatMap((m) => m.notes)
        .find((n) => n.id === selectedNoteId) || null
    );
  }, [score, selectedNoteId]);

  // Synchronize toolbar states when selecting a note
  useEffect(() => {
    if (selectedNote) {
      setSelectedDurationState(selectedNote.duration);
      setSelectedAccidentalState(selectedNote.accidental || 'none');
      setIsDottedState(!!selectedNote.dotted);
      setIsRestState(!!selectedNote.isRest);
    }
  }, [selectedNoteId]);

  const pushHistory = useCallback((newScore: Score) => {
    setHistory((prev) => {
      const sliced = prev.slice(0, historyIndex + 1);
      return [...sliced, JSON.parse(JSON.stringify(newScore))];
    });
    setHistoryIndex((prev) => prev + 1);
    setScoresList((prev) => prev.map((s) => (s.id === newScore.id ? newScore : s)));
  }, [historyIndex]);

  // Initialize AudioEngine on first instrument change or mount
  useEffect(() => {
    changeInstrument(score.instrumentId);
    pushHistory(score);
  }, []);

  const changeInstrument = async (id: InstrumentId) => {
    setIsInstrumentLoading(true);
    setScore((prev) => ({ ...prev, instrumentId: id }));
    try {
      await AudioEngine.loadInstrument(id);
    } finally {
      setIsInstrumentLoading(false);
    }
  };

  const setMasterVolume = (v: number) => {
    setMasterVolumeState(v);
    AudioEngine.setVolume(v);
  };

  const previewNote = async (pitch: string) => {
    await AudioEngine.unlockAudio();
    AudioEngine.playNote({ pitch, duration: 0.4, velocity: 95 });
  };

  const updateScoreMeta = (meta: Partial<Score>) => {
    setScore((prev) => {
      const num = meta.timeSignatureNumerator ?? prev.timeSignatureNumerator;
      const den = meta.timeSignatureDenominator ?? prev.timeSignatureDenominator;

      const updatedLines = (prev.lines || []).map((l) => ({
        ...l,
        timeSignatureNumerator: num,
        timeSignatureDenominator: den,
        measures: l.measures.map((m) => ({
          ...m,
          timeSignatureNumerator: num,
          timeSignatureDenominator: den,
        })),
      }));

      const next = normalizeScore({
        ...prev,
        ...meta,
        timeSignatureNumerator: num,
        timeSignatureDenominator: den,
        lines: updatedLines,
        measures: updatedLines.flatMap((l) => l.measures),
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });
  };

  const loadScoreById = (id: string) => {
    const found = scoresList.find((s) => s.id === id);
    if (found) {
      stopPlayback();
      const cloned = normalizeScore(JSON.parse(JSON.stringify(found)));
      setScore(cloned);
      changeInstrument(cloned.instrumentId);
      setHistory([cloned]);
      setHistoryIndex(0);
      setSelectedNoteId(null);
    }
  };

  const createNewScore = () => {
    stopPlayback();
    const newScore: Score = normalizeScore({
      id: `score-${Date.now()}`,
      title: 'New Composition',
      composer: 'Composer',
      tempo: 120,
      timeSignatureNumerator: 4,
      timeSignatureDenominator: 4,
      keySignature: 'C',
      instrumentId: 'acoustic_grand_piano',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lines: [
        {
          id: `line-${Date.now()}-1`,
          lineIndex: 0,
          clef: 'treble',
          timeSignatureNumerator: 4,
          timeSignatureDenominator: 4,
          measures: [
            {
              index: 0,
              lineIndex: 0,
              timeSignatureNumerator: 4,
              timeSignatureDenominator: 4,
              notes: [],
            },
            {
              index: 1,
              lineIndex: 0,
              timeSignatureNumerator: 4,
              timeSignatureDenominator: 4,
              notes: [],
            },
          ],
        },
      ],
      measures: [],
    });

    setScoresList((prev) => [...prev, newScore]);
    setScore(newScore);
    pushHistory(newScore);
    setSelectedNoteId(null);
  };

  const closeScore = (id: string) => {
    if (scoresList.length <= 1) return;
    const remaining = scoresList.filter((s) => s.id !== id);
    setScoresList(remaining);
    if (score.id === id) {
      const nextScore = remaining[0];
      loadScoreById(nextScore.id);
    }
  };

  // Note Selection and Updates
  const updateNote = (noteId: string, updates: Partial<ScoreNote>) => {
    setScore((prev) => {
      const updatedLines = prev.lines.map((l) => ({
        ...l,
        measures: l.measures.map((m) => ({
          ...m,
          notes: m.notes.map((n) => {
            if (n.id !== noteId) return n;
            const updated = { ...n, ...updates };
            if (updates.pitch && updates.pitch !== n.pitch) {
              previewNote(updates.pitch);
            }
            return updated;
          }),
        })),
      }));

      const next = normalizeScore({
        ...prev,
        lines: updatedLines,
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });
  };

  const updateSelectedNote = (updates: Partial<ScoreNote>) => {
    if (!selectedNoteId) return;
    updateNote(selectedNoteId, updates);
  };

  const moveNote = (
    noteId: string,
    targetMeasureIndex: number,
    targetBeatPosition: number,
    newPitch: string,
    targetLineIndex?: number
  ) => {
    setScore((prev) => {
      let foundNote: ScoreNote | undefined;
      for (const l of prev.lines) {
        for (const m of l.measures) {
          const match = m.notes.find((n) => n.id === noteId);
          if (match) {
            foundNote = match;
            break;
          }
        }
        if (foundNote) break;
      }

      if (!foundNote) return prev;
      const noteToMove = foundNote;

      // Remove from previous location
      const updatedLines = prev.lines.map((l) => ({
        ...l,
        measures: l.measures.map((m) => ({
          ...m,
          notes: m.notes.filter((n) => n.id !== noteId),
        })),
      }));

      // Resolved line index and clef
      const targetLine =
        targetLineIndex !== undefined
          ? updatedLines[targetLineIndex]
          : updatedLines.find((l) => l.measures.some((m) => m.index === targetMeasureIndex));
      const resolvedLineIdx = targetLine ? targetLine.lineIndex : noteToMove.lineIndex ?? 0;
      const resolvedClef = targetLine?.clef || noteToMove.clef || 'treble';

      const updatedNote: ScoreNote = {
        ...noteToMove,
        pitch: newPitch,
        measureIndex: targetMeasureIndex,
        beatPosition: targetBeatPosition,
        lineIndex: resolvedLineIdx,
        clef: resolvedClef,
      };

      let inserted = false;
      updatedLines.forEach((l) => {
        l.measures.forEach((m) => {
          if (m.index === targetMeasureIndex) {
            const filtered = m.notes.filter(
              (n) => !(n.beatPosition === targetBeatPosition && n.pitch === newPitch)
            );
            m.notes = [...filtered, updatedNote].sort(
              (a, b) => a.beatPosition - b.beatPosition
            );
            inserted = true;
          }
        });
      });

      if (!inserted) return prev;

      const next = normalizeScore({
        ...prev,
        lines: updatedLines,
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });

    previewNote(newPitch);
  };

  const moveSelectedNoteBeat = (beatDelta: number) => {
    if (!selectedNote) return;
    const currentMeasure = score.measures.find((m) => m.index === selectedNote.measureIndex);
    const beatsPerMeasure = currentMeasure
      ? currentMeasure.timeSignatureNumerator * (4 / currentMeasure.timeSignatureDenominator)
      : 4;

    let newBeat = selectedNote.beatPosition + beatDelta;
    let newMeasureIndex = selectedNote.measureIndex;

    if (newBeat < 0) {
      if (newMeasureIndex > 0) {
        newMeasureIndex -= 1;
        const prevMeasure = score.measures.find((m) => m.index === newMeasureIndex);
        const prevBeats = prevMeasure
          ? prevMeasure.timeSignatureNumerator * (4 / prevMeasure.timeSignatureDenominator)
          : 4;
        newBeat = Math.max(0, prevBeats - 0.5);
      } else {
        newBeat = 0;
      }
    } else if (newBeat >= beatsPerMeasure) {
      if (newMeasureIndex < score.measures.length - 1) {
        newMeasureIndex += 1;
        newBeat = 0;
      } else {
        newBeat = beatsPerMeasure - 0.25;
      }
    }

    moveNote(selectedNote.id, newMeasureIndex, newBeat, selectedNote.pitch, selectedNote.lineIndex);
  };

  const moveSelectedNotePitch = (semitoneDelta: number) => {
    if (!selectedNote) return;
    const currentMidi = pitchToMidi(selectedNote.pitch);
    const newMidi = Math.max(21, Math.min(108, currentMidi + semitoneDelta));
    const newPitch = midiToPitch(newMidi);
    updateSelectedNote({ pitch: newPitch });
  };

  const addChordInterval = (semitones: number) => {
    if (!selectedNote) return;
    const baseMidi = pitchToMidi(selectedNote.pitch);
    const newMidi = Math.max(21, Math.min(108, baseMidi + semitones));
    const newPitch = midiToPitch(newMidi);

    addNote(
      selectedNote.measureIndex,
      selectedNote.beatPosition,
      newPitch,
      selectedNote.clef,
      selectedNote.lineIndex
    );
  };

  const addTriadToSelectedNote = (type: 'major' | 'minor' = 'major') => {
    if (!selectedNote) return;
    const third = type === 'major' ? 4 : 3;
    addChordInterval(third);
    addChordInterval(7);
  };

  const toggleTieSelectedNote = () => {
    if (!selectedNote) return;
    updateSelectedNote({ tied: !selectedNote.tied });
  };

  const setSelectedNoteDynamic = (dyn?: DynamicMarking) => {
    if (!selectedNote) return;
    updateSelectedNote({ dynamic: dyn });
  };

  // Wrapped toolbar setters that simultaneously update selected note if one is selected
  const setSelectedDuration = (d: NoteDurationType) => {
    setSelectedDurationState(d);
    if (selectedNoteId) {
      updateSelectedNote({ duration: d });
    }
  };

  const setSelectedAccidental = (a: AccidentalType) => {
    setSelectedAccidentalState(a);
    if (selectedNote) {
      let base = selectedNote.pitch.replace(/[#b]/g, '');
      let oct = base.slice(1);
      let letter = base[0];
      let newPitch = base;
      if (a === 'sharp') newPitch = `${letter}#${oct}`;
      else if (a === 'flat') newPitch = `${letter}b${oct}`;
      updateSelectedNote({ accidental: a, pitch: newPitch });
    }
  };

  const setIsDotted = (d: boolean) => {
    setIsDottedState(d);
    if (selectedNoteId) {
      updateSelectedNote({ dotted: d });
    }
  };

  const setIsRest = (r: boolean) => {
    setIsRestState(r);
    if (selectedNoteId) {
      updateSelectedNote({ isRest: r });
    }
  };

  const addNote = (
    measureIndex: number,
    beatPosition: number,
    pitch: string,
    clef: ClefType = 'treble',
    targetLineIndex?: number
  ) => {
    let finalPitch = pitch;
    let finalAccidental = selectedAccidental;

    if (selectedAccidental === 'sharp' && !pitch.includes('#')) {
      const letter = pitch[0];
      const oct = pitch.slice(1);
      finalPitch = `${letter}#${oct}`;
    } else if (selectedAccidental === 'flat' && !pitch.includes('b')) {
      const letter = pitch[0];
      const oct = pitch.slice(1);
      finalPitch = `${letter}b${oct}`;
    } else if (selectedAccidental === 'natural') {
      const letter = pitch[0];
      const oct = pitch.replace(/[^0-9]/g, '');
      finalPitch = `${letter}${oct}`;
    } else if (selectedAccidental === 'none') {
      // Automatically apply key signature accidentals to diatonic notes if none specified
      const letter = pitch[0].toUpperCase();
      const oct = pitch.replace(/[^0-9]/g, '');
      const keySig = score.keySignature || 'C';

      const keyAlterations: Record<string, { note: string; acc: '#' | 'b' }[]> = {
        G: [{ note: 'F', acc: '#' }],
        D: [{ note: 'F', acc: '#' }, { note: 'C', acc: '#' }],
        A: [{ note: 'F', acc: '#' }, { note: 'C', acc: '#' }, { note: 'G', acc: '#' }],
        E: [{ note: 'F', acc: '#' }, { note: 'C', acc: '#' }, { note: 'G', acc: '#' }, { note: 'D', acc: '#' }],
        F: [{ note: 'B', acc: 'b' }],
        Bb: [{ note: 'B', acc: 'b' }, { note: 'E', acc: 'b' }],
        Eb: [{ note: 'B', acc: 'b' }, { note: 'E', acc: 'b' }, { note: 'A', acc: 'b' }],
        Ab: [{ note: 'B', acc: 'b' }, { note: 'E', acc: 'b' }, { note: 'A', acc: 'b' }, { note: 'D', acc: 'b' }],
      };

      const alterations = keyAlterations[keySig] || [];
      const match = alterations.find((a) => a.note === letter);
      if (match) {
        finalPitch = `${letter}${match.acc}${oct}`;
        finalAccidental = 'none'; // Part of the key signature, so no accidental glyph needed on notehead
      }
    }

    const newNoteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newNote: ScoreNote = {
      id: newNoteId,
      pitch: finalPitch,
      accidental: finalAccidental,
      duration: selectedDuration,
      dotted: isDotted,
      isRest: isRest,
      clef,
      lineIndex: targetLineIndex,
      measureIndex,
      beatPosition,
    };

    if (!isRest) {
      previewNote(finalPitch);
    }

    setScore((prev) => {
      const updatedLines = prev.lines.map((l) => ({
        ...l,
        measures: l.measures.map((m) => {
          if (m.index !== measureIndex) return m;

          const filtered = m.notes.filter(
            (n) => !(n.beatPosition === beatPosition && n.pitch === finalPitch)
          );

          return {
            ...m,
            notes: [...filtered, { ...newNote, lineIndex: l.lineIndex }].sort(
              (a, b) => a.beatPosition - b.beatPosition
            ),
          };
        }),
      }));

      const next = normalizeScore({
        ...prev,
        lines: updatedLines,
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });

    setSelectedNoteId(newNoteId);
  };

  const deleteNote = (noteId: string) => {
    setScore((prev) => {
      const updatedLines = prev.lines.map((l) => ({
        ...l,
        measures: l.measures.map((m) => ({
          ...m,
          notes: m.notes.filter((n) => n.id !== noteId),
        })),
      }));

      const next = normalizeScore({
        ...prev,
        lines: updatedLines,
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });

    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  };

  const deleteSelectedNote = () => {
    if (selectedNoteId) {
      deleteNote(selectedNoteId);
    }
  };

  // Multi-line and Time Signature Actions
  const addLine = (numerator?: number, denominator?: number, clef?: ClefType) => {
    setScore((prev) => {
      const nextLineIdx = prev.lines.length;
      const num =
        numerator ??
        prev.lines[nextLineIdx - 1]?.timeSignatureNumerator ??
        prev.timeSignatureNumerator ??
        4;
      const den =
        denominator ??
        prev.lines[nextLineIdx - 1]?.timeSignatureDenominator ??
        prev.timeSignatureDenominator ??
        4;
      const newClef = clef ?? prev.lines[nextLineIdx - 1]?.clef ?? 'treble';

      // Find highest existing measure index
      const maxMeasureIdx = prev.lines
        .flatMap((l) => l.measures)
        .reduce((max, m) => Math.max(max, m.index), -1);

      const newMeasures: Measure[] = [
        {
          index: maxMeasureIdx + 1,
          lineIndex: nextLineIdx,
          timeSignatureNumerator: num,
          timeSignatureDenominator: den,
          notes: [],
        },
        {
          index: maxMeasureIdx + 2,
          lineIndex: nextLineIdx,
          timeSignatureNumerator: num,
          timeSignatureDenominator: den,
          notes: [],
        },
      ];

      const newLine: ScoreLine = {
        id: `line-${Date.now()}-${nextLineIdx}`,
        lineIndex: nextLineIdx,
        clef: newClef,
        timeSignatureNumerator: num,
        timeSignatureDenominator: den,
        measures: newMeasures,
      };

      const updatedLines = [...prev.lines, newLine];
      const next = normalizeScore({
        ...prev,
        lines: updatedLines,
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });
  };

  const removeLine = (lineIndex: number) => {
    setScore((prev) => {
      if (prev.lines.length <= 1) return prev; // Preserve at least 1 line

      const filtered = prev.lines
        .filter((_, idx) => idx !== lineIndex)
        .map((l, lIdx) => ({
          ...l,
          lineIndex: lIdx,
          measures: l.measures.map((m) => ({ ...m, lineIndex: lIdx })),
        }));

      // Re-index all measures in sequence
      let currentIdx = 0;
      filtered.forEach((l) => {
        l.measures.forEach((m) => {
          m.index = currentIdx++;
          m.notes.forEach((n) => {
            n.measureIndex = m.index;
            n.lineIndex = l.lineIndex;
          });
        });
      });

      const next = normalizeScore({
        ...prev,
        lines: filtered,
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });
    setSelectedNoteId(null);
  };

  const changeLineTimeSignature = (lineIndex: number, numerator: number, denominator: number) => {
    setScore((prev) => {
      const updatedLines = prev.lines.map((l, idx) => {
        if (idx !== lineIndex) return l;
        return {
          ...l,
          timeSignatureNumerator: numerator,
          timeSignatureDenominator: denominator,
          measures: l.measures.map((m) => ({
            ...m,
            timeSignatureNumerator: numerator,
            timeSignatureDenominator: denominator,
          })),
        };
      });

      const next = normalizeScore({
        ...prev,
        lines: updatedLines,
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });
  };

  const changeLineClef = (lineIndex: number, clef: ClefType) => {
    setScore((prev) => {
      const updatedLines = prev.lines.map((l, idx) => {
        if (idx !== lineIndex) return l;
        return {
          ...l,
          clef,
          measures: l.measures.map((m) => ({
            ...m,
            notes: m.notes.map((n) => ({ ...n, clef })),
          })),
        };
      });

      const next = normalizeScore({
        ...prev,
        lines: updatedLines,
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });
  };

  const addMeasureToLine = (lineIndex: number) => {
    setScore((prev) => {
      const targetLine = prev.lines[lineIndex];
      if (!targetLine) return prev;

      const updatedLines = prev.lines.map((l) => ({ ...l, measures: [...l.measures] }));
      const newMeasure: Measure = {
        index: 0,
        lineIndex,
        timeSignatureNumerator: targetLine.timeSignatureNumerator,
        timeSignatureDenominator: targetLine.timeSignatureDenominator,
        notes: [],
      };
      updatedLines[lineIndex].measures.push(newMeasure);

      let runningIdx = 0;
      updatedLines.forEach((l) => {
        l.measures.forEach((m) => {
          m.index = runningIdx++;
          m.notes.forEach((n) => {
            n.measureIndex = m.index;
          });
        });
      });

      const next = normalizeScore({
        ...prev,
        lines: updatedLines,
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });
  };

  const removeMeasureFromLine = (lineIndex: number, measureIndex?: number) => {
    setScore((prev) => {
      const totalMeasuresCount = prev.lines.flatMap((l) => l.measures).length;
      if (totalMeasuresCount <= 1) return prev;

      const targetLine = prev.lines[lineIndex];
      if (!targetLine || targetLine.measures.length <= 1) return prev;

      const updatedLines = prev.lines.map((l) => ({ ...l, measures: [...l.measures] }));
      if (measureIndex !== undefined) {
        updatedLines[lineIndex].measures = updatedLines[lineIndex].measures.filter(
          (m) => m.index !== measureIndex
        );
      } else {
        updatedLines[lineIndex].measures.pop();
      }

      let runningIdx = 0;
      updatedLines.forEach((l) => {
        l.measures.forEach((m) => {
          m.index = runningIdx++;
          m.notes.forEach((n) => {
            n.measureIndex = m.index;
          });
        });
      });

      const next = normalizeScore({
        ...prev,
        lines: updatedLines,
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });
  };

  // Legacy global measure helpers
  const addMeasure = () => {
    if (score.lines.length > 0) {
      addMeasureToLine(score.lines.length - 1);
    }
  };

  const removeMeasure = () => {
    if (score.lines.length > 0) {
      removeMeasureFromLine(score.lines.length - 1);
    }
  };

  const clearAllNotes = () => {
    setScore((prev) => {
      const updatedLines = prev.lines.map((l) => ({
        ...l,
        measures: l.measures.map((m) => ({ ...m, notes: [] })),
      }));
      const next = normalizeScore({
        ...prev,
        lines: updatedLines,
        updatedAt: new Date().toISOString(),
      });
      pushHistory(next);
      return next;
    });
    setSelectedNoteId(null);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      setScore(normalizeScore(JSON.parse(JSON.stringify(history[targetIndex]))));
      setHistoryIndex(targetIndex);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      setScore(normalizeScore(JSON.parse(JSON.stringify(history[targetIndex]))));
      setHistoryIndex(targetIndex);
    }
  };

  // Multi-Line Playback Engine Implementation
  const stopPlayback = useCallback(() => {
    if (playbackTimerRef.current) {
      cancelAnimationFrame(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    AudioEngine.stopAll();
    setPlaybackState('idle');
    setActiveMidiNotes([]);
  }, []);

  const rewindToBeginning = useCallback(() => {
    if (playbackTimerRef.current) {
      cancelAnimationFrame(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    AudioEngine.stopAll();
    setPlaybackState('idle');
    setPlayheadLine(0);
    setPlayheadMeasure(0);
    setPlayheadBeat(0);
    setActiveMidiNotes([]);
  }, []);

  const setPlayheadPosition = useCallback((line: number, measure: number, beat: number = 0) => {
    if (playbackTimerRef.current) {
      cancelAnimationFrame(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
    AudioEngine.stopAll();
    setPlaybackState('idle');
    setPlayheadLine(line);
    setPlayheadMeasure(measure);
    setPlayheadBeat(beat);
    setActiveMidiNotes([]);
  }, []);

  const togglePlayback = async () => {
    if (playbackState === 'playing') {
      if (playbackTimerRef.current) {
        cancelAnimationFrame(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      AudioEngine.stopAll();
      setPlaybackState('paused');
      setActiveMidiNotes([]);
      return;
    }

    const ctx = await AudioEngine.unlockAudio();
    setPlaybackState('playing');

    const bpm = score.tempo || 120;
    const secondsPerQuarterBeat = 60 / bpm;

    // Build timeline respecting each line's and measure's time signature
    interface MeasureTiming {
      measureIndex: number;
      lineIndex: number;
      startGlobalBeat: number;
      beatCount: number;
    }

    interface FlatNote {
      id: string;
      pitch: string;
      midi: number;
      globalBeat: number;
      durationBeats: number;
      isRest: boolean;
      measureIndex: number;
      lineIndex: number;
    }

    const measureTimings: MeasureTiming[] = [];
    const flatNotes: FlatNote[] = [];
    let runningGlobalBeat = 0;

    score.lines.forEach((l) => {
      l.measures.forEach((m) => {
        // Quarter note beat count for this measure = numerator * (4 / denominator)
        const beatCount = m.timeSignatureNumerator * (4 / m.timeSignatureDenominator);
        measureTimings.push({
          measureIndex: m.index,
          lineIndex: l.lineIndex,
          startGlobalBeat: runningGlobalBeat,
          beatCount,
        });

        m.notes.forEach((n) => {
          let durationBeats = 1;
          if (n.duration === 'whole') durationBeats = 4;
          else if (n.duration === 'half') durationBeats = 2;
          else if (n.duration === 'quarter') durationBeats = 1;
          else if (n.duration === 'eighth') durationBeats = 0.5;
          else if (n.duration === 'sixteenth') durationBeats = 0.25;

          if (n.dotted) durationBeats *= 1.5;

          flatNotes.push({
            id: n.id,
            pitch: n.pitch,
            midi: pitchToMidi(n.pitch),
            globalBeat: runningGlobalBeat + n.beatPosition,
            durationBeats,
            isRest: !!n.isRest,
            measureIndex: m.index,
            lineIndex: l.lineIndex,
          });
        });

        runningGlobalBeat += beatCount;
      });
    });

    const totalScoreBeats = runningGlobalBeat;

    // Check if playing a selected section range
    let startGlobalBeat = 0;
    let endGlobalBeat = totalScoreBeats;

    if (selectedSection) {
      const sectionStartTiming = measureTimings.find((t) => t.measureIndex === selectedSection.startMeasure);
      const sectionEndTiming = measureTimings.find((t) => t.measureIndex === selectedSection.endMeasure);
      const sStart = sectionStartTiming
        ? sectionStartTiming.startGlobalBeat + selectedSection.startBeat
        : 0;
      const sEnd = sectionEndTiming
        ? sectionEndTiming.startGlobalBeat + selectedSection.endBeat
        : totalScoreBeats;

      startGlobalBeat = sStart;
      endGlobalBeat = Math.max(sStart + 0.25, sEnd);
    } else {
      // Calculate current global beat from playhead state
      const currentTiming =
        measureTimings.find((t) => t.measureIndex === playheadMeasure) ||
        measureTimings[0];
      startGlobalBeat = currentTiming
        ? currentTiming.startGlobalBeat + playheadBeat
        : 0;
    }

    const audioStartTime = ctx.currentTime;
    playbackStartTimeRef.current = audioStartTime;
    playbackStartBeatRef.current = startGlobalBeat;

    // Schedule notes within range
    const scheduledNotes = flatNotes.filter(
      (n) => n.globalBeat >= startGlobalBeat && n.globalBeat < endGlobalBeat
    );
    scheduledNotes.forEach((n) => {
      if (n.isRest) return;
      const beatOffset = n.globalBeat - startGlobalBeat;
      const noteStartTime = audioStartTime + beatOffset * secondsPerQuarterBeat;
      const durationSeconds = Math.min(
        n.durationBeats * secondsPerQuarterBeat,
        (endGlobalBeat - n.globalBeat) * secondsPerQuarterBeat
      );

      AudioEngine.playNote({
        pitch: n.pitch,
        time: noteStartTime,
        duration: durationSeconds,
        velocity: 95,
      });
    });

    // Schedule metronome
    if (metronomeActive) {
      measureTimings.forEach((t) => {
        for (let b = 0; b < t.beatCount; b++) {
          const globalB = t.startGlobalBeat + b;
          if (globalB >= startGlobalBeat && globalB < endGlobalBeat) {
            const beatOffset = globalB - startGlobalBeat;
            const beatTime = audioStartTime + beatOffset * secondsPerQuarterBeat;
            const isDownbeat = b === 0;

            setTimeout(() => {
              if (playbackState !== 'idle') {
                AudioEngine.playMetronomeTick(isDownbeat);
              }
            }, Math.max(0, (beatTime - ctx.currentTime) * 1000));
          }
        }
      });
    }

    const updateTransport = () => {
      const now = ctx.currentTime;
      const elapsedSeconds = now - audioStartTime;
      const currentGlobalBeat =
        playbackStartBeatRef.current + elapsedSeconds / secondsPerQuarterBeat;

      if (currentGlobalBeat >= endGlobalBeat) {
        if (loopActive || selectedSection) {
          stopPlayback();
          if (selectedSection) {
            setPlayheadLine(selectedSection.startLine);
            setPlayheadMeasure(selectedSection.startMeasure);
            setPlayheadBeat(selectedSection.startBeat);
          } else {
            setPlayheadLine(0);
            setPlayheadMeasure(0);
            setPlayheadBeat(0);
          }
          setTimeout(() => togglePlayback(), 20);
          return;
        } else {
          stopPlayback();
          return;
        }
      }

      // Find which measure is currently playing
      const currentMeasureTiming =
        measureTimings.find(
          (t) =>
            currentGlobalBeat >= t.startGlobalBeat &&
            currentGlobalBeat < t.startGlobalBeat + t.beatCount
        ) || measureTimings[measureTimings.length - 1];

      if (currentMeasureTiming) {
        setPlayheadLine(currentMeasureTiming.lineIndex);
        setPlayheadMeasure(currentMeasureTiming.measureIndex);
        setPlayheadBeat(currentGlobalBeat - currentMeasureTiming.startGlobalBeat);
      }

      // Active MIDI notes for keyboard glow
      const active = flatNotes
        .filter(
          (n) =>
            !n.isRest &&
            currentGlobalBeat >= n.globalBeat &&
            currentGlobalBeat < n.globalBeat + n.durationBeats
        )
        .map((n) => n.midi);

      setActiveMidiNotes(active);

      playbackTimerRef.current = requestAnimationFrame(updateTransport);
    };

    playbackTimerRef.current = requestAnimationFrame(updateTransport);
  };

  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) {
        cancelAnimationFrame(playbackTimerRef.current);
      }
      AudioEngine.stopAll();
    };
  }, []);

  return (
    <ScoreContext.Provider
      value={{
        score,
        scoresList,
        activeTool,
        setActiveTool,
        selectedDuration,
        setSelectedDuration,
        selectedAccidental,
        setSelectedAccidental,
        isDotted,
        setIsDotted,
        isRest,
        setIsRest,
        selectedNoteId,
        setSelectedNoteId,
        selectedNote,
        playbackState,
        playheadLine,
        playheadMeasure,
        playheadBeat,
        selectedSection,
        setSelectedSection,
        setPlayheadPosition,
        rewindToBeginning,
        activeMidiNotes,
        metronomeActive,
        setMetronomeActive,
        loopActive,
        setLoopActive,
        masterVolume,
        setMasterVolume,
        isInstrumentLoading,

        loadScoreById,
        createNewScore,
        closeScore,
        updateScoreMeta,
        addNote,
        deleteNote,
        deleteSelectedNote,
        updateNote,
        updateSelectedNote,
        moveNote,
        moveSelectedNotePitch,
        moveSelectedNoteBeat,
        addChordInterval,
        addTriadToSelectedNote,
        toggleTieSelectedNote,
        setSelectedNoteDynamic,

        addLine,
        removeLine,
        changeLineTimeSignature,
        changeLineClef,
        addMeasureToLine,
        removeMeasureFromLine,

        addMeasure,
        removeMeasure,
        clearAllNotes,
        changeInstrument,
        togglePlayback,
        stopPlayback,
        previewNote,
        undo,
        redo,
        canUndo: historyIndex > 0,
        canRedo: historyIndex < history.length - 1,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
};
