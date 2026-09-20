'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Music,
} from 'lucide-react';
import { useScore } from '@/context/ScoreContext';
import { useAppTheme } from '@/theme/ThemeProvider';
import { ScoreNote, ClefType } from '@/types/score.types';
import { isPitchInInstrumentRange, getInstrumentRange } from '@/audio/audio.constants';
import {
  LINE_SPACING,
  STEP_Y,
  NOTEHEAD_RX,
  NOTEHEAD_RY,
  STEM_HEIGHT,
  MEASURE_WIDTH,
  CLEF_WIDTH,
  STAFF_PADDING_TOP,
  LINE_HEIGHT,
  GRAND_LINE_HEIGHT,
  GRAND_STAFF_GAP,
  STAFF_HEIGHT,
  TIME_SIGNATURES,
  KEY_SIGNATURE_MAP,
  getDiatonicPitchFromStep,
} from './NotationCanvas.constants';
import {
  calculateNoteY,
  getLedgerLines,
  getStemDirection,
  groupMeasureChordsAndBeams,
  findNextNoteWithPitch,
  getTiePath,
  getPianoBracePath,
} from './NotationCanvas.helpers';
import { NotationCanvasProps, GhostNoteState } from './NotationCanvas.types';
import {
  CanvasContainer,
  CanvasToolbar,
  ZoomControls,
  ZoomButton,
  SheetScrollArea,
  SheetPaper,
  ScoreHeaderInfo,
  ScoreTitle,
  ScoreComposer,
  SvgCanvas,
  SvgScrollWrapper,
  PitchTooltip,
  AddLineButton,
  NoteInspector,
  InspectorPill,
  SmallActionBtn,
  LyricInput,
} from './NotationCanvas.styles';
import { EditableText } from '../EditableText';

export const NotationCanvas: React.FC<NotationCanvasProps> = () => {
  const {
    score,
    activeTool,
    selectedDuration,
    selectedAccidental,
    selectedNoteId,
    setSelectedNoteId,
    selectedNote,
    addNote,
    deleteNote,
    deleteSelectedNote,
    updateNote,
    updateSelectedNote,
    updateScoreMeta,
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
    playheadLine,
    playheadMeasure,
    playheadBeat,
    selectedSection,
    setSelectedSection,
    setPlayheadPosition,
    playbackState,
    previewNote,
  } = useScore();

  const { currentTheme } = useAppTheme();
  const [zoom, setZoom] = useState<number>(1);
  const [showNoteLabels, setShowNoteLabels] = useState<boolean>(true);
  const [ghostNote, setGhostNote] = useState<GhostNoteState>({
    visible: false,
    lineIndex: 0,
    measureIndex: 0,
    beatPosition: 0,
    pitch: 'C4',
    x: 0,
    y: 0,
  });

  const svgRef = useRef<SVGSVGElement | null>(null);
  const scrollWrapperRef = useRef<HTMLDivElement | null>(null);
  const sheetScrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Pan / Hand tool dragging state (2D pan across both vertical and horizontal axes)
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const [isPanning, setIsPanning] = useState(false);

  const handlePanMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'pan') return;
    isPanningRef.current = true;
    setIsPanning(true);
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: scrollWrapperRef.current ? scrollWrapperRef.current.scrollLeft : 0,
      scrollTop: sheetScrollAreaRef.current ? sheetScrollAreaRef.current.scrollTop : 0,
    };
  };

  const handlePanMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;

    if (scrollWrapperRef.current) {
      scrollWrapperRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
    }
    if (sheetScrollAreaRef.current) {
      sheetScrollAreaRef.current.scrollTop = panStartRef.current.scrollTop - dy;
    }
  };

  const handlePanMouseUp = () => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanning(false);
    }
  };

  // Keyboard navigation for selected note
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNoteId) {
          e.preventDefault();
          deleteSelectedNote();
        }
      } else if (e.key === 'ArrowUp') {
        if (selectedNoteId) {
          e.preventDefault();
          moveSelectedNotePitch(1);
        }
      } else if (e.key === 'ArrowDown') {
        if (selectedNoteId) {
          e.preventDefault();
          moveSelectedNotePitch(-1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (selectedNoteId) {
          e.preventDefault();
          moveSelectedNoteBeat(-0.5);
        }
      } else if (e.key === 'ArrowRight') {
        if (selectedNoteId) {
          e.preventDefault();
          moveSelectedNoteBeat(0.5);
        }
      } else if (e.key === 'Escape') {
        setSelectedNoteId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNoteId, selectedNote, moveSelectedNoteBeat, moveSelectedNotePitch, deleteSelectedNote, setSelectedNoteId]);

  // Note Dragging State
  interface DraggingNoteState {
    noteId: string;
    note: ScoreNote;
    startX: number;
    startY: number;
    hasMoved: boolean;
    currentX: number;
    currentY: number;
    currentPitch: string;
    currentClef: ClefType;
    currentMeasureIndex: number;
    currentBeatPosition: number;
    currentLineIndex: number;
  }

  const [draggingNote, setDraggingNote] = useState<DraggingNoteState | null>(null);
  const draggingNoteRef = useRef<DraggingNoteState | null>(null);
  draggingNoteRef.current = draggingNote;
  const justDraggedRef = useRef<boolean>(false);

  // Snapping / Grid calculator
  const calculateGridPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = (clientX - rect.left) / zoom;
      const mouseY = (clientY - rect.top) / zoom;

      const isGrandStaff = score.layoutMode === 'grand';
      const systemHeight = isGrandStaff ? GRAND_LINE_HEIGHT : LINE_HEIGHT;

      // Determine target line based on vertical boundary between consecutive systems
      let lineIndex = 0;
      for (let i = 0; i < score.lines.length; i++) {
        if (i === score.lines.length - 1) {
          lineIndex = i;
          break;
        }
        const currentSystemTop = STAFF_PADDING_TOP + i * systemHeight;
        const currentSystemStaffBottom = isGrandStaff
          ? currentSystemTop + STAFF_HEIGHT + GRAND_STAFF_GAP + STAFF_HEIGHT
          : currentSystemTop + STAFF_HEIGHT;
        const nextSystemTop = STAFF_PADDING_TOP + (i + 1) * systemHeight;
        const nextButtonsTop = nextSystemTop - 62;
        const splitY = (currentSystemStaffBottom + 30 + nextButtonsTop) / 2;

        if (mouseY < splitY) {
          lineIndex = i;
          break;
        }
      }

      const targetLine = score.lines[lineIndex];
      if (!targetLine) return null;

      const systemTop = STAFF_PADDING_TOP + lineIndex * systemHeight;
      const trebleStaffTop = systemTop;
      const bassStaffTop = systemTop + STAFF_HEIGHT + GRAND_STAFF_GAP;

      // Determine clef and staffTop based on mode and vertical position
      let clef: ClefType = targetLine.clef || 'treble';
      let staffTop = systemTop;
      let minStep = -2; // Up to A5 on treble staff (stops cleanly below line header buttons)
      let maxStep = 10; // Down to C4 on treble staff (Middle C)

      if (isGrandStaff) {
        const boundaryY = systemTop + STAFF_HEIGHT + GRAND_STAFF_GAP / 2;
        if (mouseY >= boundaryY) {
          clef = 'bass';
          staffTop = bassStaffTop;
          minStep = -2; // Up to C4 on bass staff (Middle C)
          maxStep = 12; // Down to C2 on bass staff (clean, standard piano reading range)
        } else {
          clef = 'treble';
          staffTop = trebleStaffTop;
          minStep = -2; // Up to A5 on treble staff (stops cleanly below line header buttons)
          maxStep = 10; // Down to C4 on treble staff (Middle C)
        }
      } else {
        // Single staff: standard musical range down to C3 and up to A5
        minStep = -2;
        maxStep = 17;
      }

      const beatsPerMeasure =
        targetLine.timeSignatureNumerator * (4 / targetLine.timeSignatureDenominator);

      const relativeX = mouseX - CLEF_WIDTH;
      if (relativeX < 0) return null;

      const measureOffset = Math.min(
        targetLine.measures.length - 1,
        Math.max(0, Math.floor(relativeX / MEASURE_WIDTH))
      );
      const measure = targetLine.measures[measureOffset];
      if (!measure) return null;

      const measureX = Math.max(0, Math.min(MEASURE_WIDTH - 20, relativeX % MEASURE_WIDTH));
      const rawBeat = (measureX / (MEASURE_WIDTH - 20)) * beatsPerMeasure;
      const snappedBeat = Math.min(
        beatsPerMeasure - 0.25,
        Math.max(0, Math.round(rawBeat * 2) / 2)
      );

      const stepFromTop = Math.round((mouseY - staffTop) / STEP_Y);
      const clampedStep = Math.max(minStep, Math.min(maxStep, stepFromTop));
      const diatonicPitch = getDiatonicPitchFromStep(clampedStep, clef);

      const snappedX =
        CLEF_WIDTH +
        measureOffset * MEASURE_WIDTH +
        (snappedBeat / beatsPerMeasure) * (MEASURE_WIDTH - 30) +
        15;
      const snappedY = staffTop + clampedStep * STEP_Y;

      return {
        lineIndex,
        targetLine,
        clef,
        lineStaffTop: staffTop,
        measureIndex: measure.index,
        beatPosition: snappedBeat,
        diatonicPitch,
        snappedX,
        snappedY,
      };
    },
    [score, zoom]
  );

  // Mouse down on a note to start dragging
  const handleNoteMouseDown = (e: React.MouseEvent, note: ScoreNote) => {
    if (activeTool === 'pan' || activeTool === 'erase' || activeTool === 'input') return;
    e.stopPropagation();

    setSelectedNoteId(note.id);
    if (!note.isRest) {
      previewNote(note.pitch);
    }

    const isGrandStaff = score.layoutMode === 'grand';
    const systemHeight = isGrandStaff ? GRAND_LINE_HEIGHT : LINE_HEIGHT;
    const systemTop = STAFF_PADDING_TOP + (note.lineIndex ?? 0) * systemHeight;
    const staffTop =
      isGrandStaff && note.clef === 'bass'
        ? systemTop + STAFF_HEIGHT + GRAND_STAFF_GAP
        : systemTop;

    const noteY = calculateNoteY(note.pitch, staffTop, note.clef);
    const targetLine = score.lines[note.lineIndex ?? 0] || score.lines[0];
    const beats = targetLine.timeSignatureNumerator * (4 / targetLine.timeSignatureDenominator);
    const mOffset = targetLine.measures.findIndex((m) => m.index === note.measureIndex);
    const noteX =
      CLEF_WIDTH +
      Math.max(0, mOffset) * MEASURE_WIDTH +
      (note.beatPosition / beats) * (MEASURE_WIDTH - 30) +
      15;

    setDraggingNote({
      noteId: note.id,
      note,
      startX: e.clientX,
      startY: e.clientY,
      hasMoved: false,
      currentX: noteX,
      currentY: noteY,
      currentPitch: note.pitch,
      currentClef: note.clef,
      currentMeasureIndex: note.measureIndex,
      currentBeatPosition: note.beatPosition,
      currentLineIndex: note.lineIndex ?? 0,
    });
  };

  // Window listeners for smooth note drag across entire page
  useEffect(() => {
    if (!draggingNote) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const currentDrag = draggingNoteRef.current;
      if (!currentDrag) return;

      const dist = Math.hypot(e.clientX - currentDrag.startX, e.clientY - currentDrag.startY);
      const pos = calculateGridPosition(e.clientX, e.clientY);
      if (!pos) return;

      let finalPitch = pos.diatonicPitch;
      if (currentDrag.note.accidental === 'sharp') {
        finalPitch = `${finalPitch[0]}#${finalPitch.slice(1)}`;
      } else if (currentDrag.note.accidental === 'flat') {
        finalPitch = `${finalPitch[0]}b${finalPitch.slice(1)}`;
      } else {
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
        const match = (keyAlterations[keySig] || []).find((a) => a.note === finalPitch[0]);
        if (match) {
          finalPitch = `${finalPitch[0]}${match.acc}${finalPitch.slice(1)}`;
        }
      }

      if (dist > 4 && finalPitch !== currentDrag.currentPitch) {
        previewNote(finalPitch);
      }

      const nextDrag: DraggingNoteState = {
        ...currentDrag,
        hasMoved: dist > 4,
        currentX: pos.snappedX,
        currentY: pos.snappedY,
        currentPitch: finalPitch,
        currentClef: pos.clef,
        currentMeasureIndex: pos.measureIndex,
        currentBeatPosition: pos.beatPosition,
        currentLineIndex: pos.lineIndex,
      };

      draggingNoteRef.current = nextDrag;
      setDraggingNote(nextDrag);
    };

    const handleWindowMouseUp = () => {
      const currentDrag = draggingNoteRef.current;
      if (currentDrag && currentDrag.hasMoved) {
        justDraggedRef.current = true;
        setTimeout(() => {
          justDraggedRef.current = false;
        }, 120);

        moveNote(
          currentDrag.noteId,
          currentDrag.currentMeasureIndex,
          currentDrag.currentBeatPosition,
          currentDrag.currentPitch,
          currentDrag.currentLineIndex,
          currentDrag.currentClef
        );
        setSelectedNoteId(currentDrag.noteId);
      }
      setDraggingNote(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingNote !== null, score, zoom, calculateGridPosition, moveNote, previewNote, setSelectedNoteId]);

  // Determine SVG total dimensions based on lines, measures and layout mode
  const isGrandStaff = score.layoutMode === 'grand';
  const systemHeight = isGrandStaff ? GRAND_LINE_HEIGHT : LINE_HEIGHT;

  const maxMeasuresInAnyLine = Math.max(
    1,
    ...score.lines.map((l) => l.measures.length)
  );
  const totalWidth = Math.max(
    880,
    CLEF_WIDTH + maxMeasuresInAnyLine * MEASURE_WIDTH + 80
  );
  const totalHeight =
    STAFF_PADDING_TOP + score.lines.length * systemHeight + 60;

  // Mouse move handler for ghost note placement across lines
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool !== 'input' || !svgRef.current || draggingNoteRef.current) {
      if (ghostNote.visible) setGhostNote((prev) => ({ ...prev, visible: false }));
      return;
    }

    const pos = calculateGridPosition(e.clientX, e.clientY);
    if (!pos) {
      if (ghostNote.visible) setGhostNote((prev) => ({ ...prev, visible: false }));
      return;
    }

    let pitch = pos.diatonicPitch;
    if (selectedAccidental === 'sharp') {
      pitch = `${pitch[0]}#${pitch.slice(1)}`;
    } else if (selectedAccidental === 'flat') {
      pitch = `${pitch[0]}b${pitch.slice(1)}`;
    }

    setGhostNote({
      visible: true,
      lineIndex: pos.lineIndex,
      measureIndex: pos.measureIndex,
      beatPosition: pos.beatPosition,
      pitch,
      clef: pos.clef,
      x: pos.snappedX,
      y: pos.snappedY,
    });
  };

  const handleMouseLeave = () => {
    setGhostNote((prev) => ({ ...prev, visible: false }));
  };

  // Canvas Click Handler: click to place note when in input tool mode
  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool !== 'input' || justDraggedRef.current || draggingNoteRef.current?.hasMoved) {
      return;
    }
    const pos = calculateGridPosition(e.clientX, e.clientY);
    if (!pos) return;

    let pitch = pos.diatonicPitch;
    if (selectedAccidental === 'sharp') {
      pitch = `${pitch[0]}#${pitch.slice(1)}`;
    } else if (selectedAccidental === 'flat') {
      pitch = `${pitch[0]}b${pitch.slice(1)}`;
    } else {
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
      const match = (keyAlterations[keySig] || []).find((a) => a.note === pitch[0]);
      if (match) {
        pitch = `${pitch[0]}${match.acc}${pitch.slice(1)}`;
      }
    }

    previewNote(pitch);
    const targetLine = score.lines[pos.lineIndex];
    const finalClef = pos.clef || targetLine?.clef || 'treble';
    addNote(pos.measureIndex, pos.beatPosition, pitch, finalClef, pos.lineIndex);
  };

  // Section Selection Dragging State (when activeTool === 'select')
  interface SelectingSectionState {
    startLine: number;
    startMeasure: number;
    startBeat: number;
    startX: number;
    currentLine: number;
    currentMeasure: number;
    currentBeat: number;
    currentX: number;
    hasMoved: boolean;
  }

  const [selectingSection, setSelectingSection] = useState<SelectingSectionState | null>(null);
  const selectingSectionRef = useRef<SelectingSectionState | null>(null);
  selectingSectionRef.current = selectingSection;

  const handleCanvasMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool !== 'select' || draggingNoteRef.current) return;
    const pos = calculateGridPosition(e.clientX, e.clientY);
    if (!pos) return;

    setSelectingSection({
      startLine: pos.lineIndex,
      startMeasure: pos.measureIndex,
      startBeat: pos.beatPosition,
      startX: pos.snappedX,
      currentLine: pos.lineIndex,
      currentMeasure: pos.measureIndex,
      currentBeat: pos.beatPosition,
      currentX: pos.snappedX,
      hasMoved: false,
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (selectingSectionRef.current) {
      const pos = calculateGridPosition(e.clientX, e.clientY);
      if (pos) {
        setSelectingSection((prev) =>
          prev
            ? {
                ...prev,
                hasMoved: true,
                currentLine: pos.lineIndex,
                currentMeasure: pos.measureIndex,
                currentBeat: pos.beatPosition,
                currentX: pos.snappedX,
              }
            : null
        );
      }
      return;
    }
    handleMouseMove(e);
  };

  const handleCanvasMouseUp = () => {
    const sel = selectingSectionRef.current;
    if (sel) {
      if (sel.hasMoved) {
        // Defined a selection section
        const isForward =
          sel.currentMeasure > sel.startMeasure ||
          (sel.currentMeasure === sel.startMeasure && sel.currentBeat >= sel.startBeat);

        const startM = isForward ? sel.startMeasure : sel.currentMeasure;
        const startL = isForward ? sel.startLine : sel.currentLine;
        const startB = isForward ? sel.startBeat : sel.currentBeat;
        const endM = isForward ? sel.currentMeasure : sel.startMeasure;
        const endL = isForward ? sel.currentLine : sel.startLine;
        const endB = isForward ? sel.currentBeat : sel.startBeat;

        // Ensure range spans at least 1 beat
        if (startM !== endM || Math.abs(endB - startB) >= 0.5) {
          setSelectedSection({
            startLine: startL,
            startMeasure: startM,
            startBeat: startB,
            endLine: endL,
            endMeasure: endM,
            endBeat: endB,
          });
          setPlayheadPosition(startL, startM, startB);
        } else {
          // Just clicked a position: place playhead there!
          setSelectedSection(null);
          setPlayheadPosition(sel.startLine, sel.startMeasure, sel.startBeat);
        }
      } else {
        // Simple click without drag in select mode: pick playback start position!
        setSelectedSection(null);
        setPlayheadPosition(sel.startLine, sel.startMeasure, sel.startBeat);
      }
      setSelectingSection(null);
    }
  };

  const handleNoteClick = (e: React.MouseEvent, noteId: string) => {
    if (activeTool === 'pan' || justDraggedRef.current || draggingNoteRef.current?.hasMoved) {
      return;
    }
    if (activeTool === 'input') {
      // Allow click to bubble to canvas so harmonic notes/chords can be placed at any step above/below
      return;
    }
    e.stopPropagation();
    if (activeTool === 'erase') {
      deleteNote(noteId);
    } else {
      setSelectedNoteId(noteId);
      const note = score.lines
        .flatMap((l) => l.measures)
        .flatMap((m) => m.notes)
        .find((n) => n.id === noteId);
      if (note && !note.isRest) {
        previewNote(note.pitch);
      }
    }
  };

  // Cycle time signature on clicking time signature numerals on line 1
  const cycleGlobalTimeSignature = () => {
    const currentIdx = TIME_SIGNATURES.findIndex(
      (ts) =>
        ts.num === score.timeSignatureNumerator &&
        ts.den === score.timeSignatureDenominator
    );
    const nextIdx = (currentIdx + 1) % TIME_SIGNATURES.length;
    const nextTs = TIME_SIGNATURES[nextIdx];
    updateScoreMeta({
      timeSignatureNumerator: nextTs.num,
      timeSignatureDenominator: nextTs.den,
    });
  };

  // Playhead exact coordinate calculation
  const currentPlayingLine = score.lines[playheadLine] || score.lines[0];
  const currentSystemTop =
    STAFF_PADDING_TOP + (currentPlayingLine ? currentPlayingLine.lineIndex : 0) * systemHeight;
  const currentMeasureInLine = currentPlayingLine
    ? currentPlayingLine.measures.findIndex((m) => m.index === playheadMeasure)
    : 0;
  const activeMeasureOffset = Math.max(0, currentMeasureInLine);
  const activeLineBeats = currentPlayingLine
    ? currentPlayingLine.timeSignatureNumerator *
      (4 / currentPlayingLine.timeSignatureDenominator)
    : 4;

  const playheadX =
    CLEF_WIDTH +
    activeMeasureOffset * MEASURE_WIDTH +
    (playheadBeat / activeLineBeats) * (MEASURE_WIDTH - 30) +
    15;

  const playheadTopY = currentSystemTop - 15;
  const playheadBottomY = isGrandStaff
    ? currentSystemTop + STAFF_HEIGHT + GRAND_STAFF_GAP + 4 * LINE_SPACING + 15
    : currentSystemTop + 4 * LINE_SPACING + 15;

  // Sub-renderer for notes, stems, beams, chords, ties, dynamics & lyrics on a given staff
  const renderStaffNotesAndGroupings = (
    notes: ScoreNote[],
    staffTop: number,
    clef: ClefType,
    measureLeft: number,
    measureIndex: number,
    beatsPerMeasure: number,
    staffPrefix: string
  ) => {
    const { chordGroups, beamGroups } = groupMeasureChordsAndBeams(
      notes,
      measureLeft,
      MEASURE_WIDTH,
      beatsPerMeasure,
      staffTop,
      clef
    );

    return (
      <g id={`${staffPrefix}-measure-notes-${measureIndex}`}>
        {/* Solid Beams connecting eighth and sixteenth notes */}
        {beamGroups.map((bg, bIdx) => (
          <g key={`beam-${staffPrefix}-${measureIndex}-${bIdx}`} style={{ pointerEvents: 'none' }}>
            <line
              x1={bg.x1}
              y1={bg.y1}
              x2={bg.x2}
              y2={bg.y2}
              stroke={currentTheme.colors.sheetNote}
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {bg.duration === 'sixteenth' && (
              <line
                x1={bg.x1}
                y1={bg.stemDirection === 'up' ? bg.y1 + 5 : bg.y1 - 5}
                x2={bg.x2}
                y2={bg.stemDirection === 'up' ? bg.y2 + 5 : bg.y2 - 5}
                stroke={currentTheme.colors.sheetNote}
                strokeWidth="3"
                strokeLinecap="round"
              />
            )}
          </g>
        ))}

        {/* Unified Stems and Unbeamed Flags for chords and notes */}
        {chordGroups.map((cg, cgIdx) => {
          if (cg.notes[0]?.duration === 'whole' || cg.notes.every((n) => n.isRest))
            return null;
          const hasSelected = cg.notes.some((n) => n.id === selectedNoteId);
          const stemColor = hasSelected
            ? currentTheme.colors.sheetNoteSelected
            : currentTheme.colors.sheetNote;

          return (
            <g key={`chord-stem-${staffPrefix}-${measureIndex}-${cgIdx}`} style={{ pointerEvents: 'none' }}>
              <line
                x1={cg.stemX}
                y1={cg.stemStartY}
                x2={cg.stemX}
                y2={cg.stemTipY}
                stroke={stemColor}
                strokeWidth="1.8"
              />

              {/* Unbeamed eighth and sixteenth flags */}
              {!cg.isBeamed && cg.notes[0]?.duration === 'eighth' && (
                <path
                  d={
                    cg.stemDirection === 'up'
                      ? `M ${cg.stemX} ${cg.stemTipY} Q ${cg.stemX + 10} ${cg.stemTipY + 14} ${cg.stemX + 8} ${cg.stemTipY + 24}`
                      : `M ${cg.stemX} ${cg.stemTipY} Q ${cg.stemX + 10} ${cg.stemTipY - 14} ${cg.stemX + 8} ${cg.stemTipY - 24}`
                  }
                  fill="none"
                  stroke={stemColor}
                  strokeWidth="2.2"
                />
              )}

              {!cg.isBeamed && cg.notes[0]?.duration === 'sixteenth' && (
                <>
                  <path
                    d={
                      cg.stemDirection === 'up'
                        ? `M ${cg.stemX} ${cg.stemTipY} Q ${cg.stemX + 10} ${cg.stemTipY + 14} ${cg.stemX + 8} ${cg.stemTipY + 24}`
                        : `M ${cg.stemX} ${cg.stemTipY} Q ${cg.stemX + 10} ${cg.stemTipY - 14} ${cg.stemX + 8} ${cg.stemTipY - 24}`
                    }
                    fill="none"
                    stroke={stemColor}
                    strokeWidth="2.2"
                  />
                  <path
                    d={
                      cg.stemDirection === 'up'
                        ? `M ${cg.stemX} ${cg.stemTipY + 8} Q ${cg.stemX + 10} ${cg.stemTipY + 22} ${cg.stemX + 8} ${cg.stemTipY + 32}`
                        : `M ${cg.stemX} ${cg.stemTipY - 8} Q ${cg.stemX + 10} ${cg.stemTipY - 22} ${cg.stemX + 8} ${cg.stemTipY - 32}`
                    }
                    fill="none"
                    stroke={stemColor}
                    strokeWidth="2.2"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* Measure Notes */}
        {notes.map((note) => {
          const noteY = calculateNoteY(note.pitch, staffTop, clef);
          const noteX =
            measureLeft +
            (note.beatPosition / beatsPerMeasure) * (MEASURE_WIDTH - 30) +
            15;
          const isSelected = selectedNoteId === note.id;
          const isBeingDragged =
            draggingNote?.noteId === note.id && draggingNote.hasMoved;
          const ledgerLines = getLedgerLines(note.pitch, staffTop, clef);
          const stemDir = getStemDirection(note.pitch, clef);

          const noteColor = isSelected
            ? currentTheme.colors.sheetNoteSelected
            : currentTheme.colors.sheetNote;

          return (
            <g
              key={note.id}
              onClick={(e) => handleNoteClick(e, note.id)}
              onMouseDown={(e) => handleNoteMouseDown(e, note)}
              opacity={isBeingDragged ? 0.25 : 1}
              style={{
                cursor:
                  activeTool === 'erase'
                    ? 'pointer'
                    : activeTool === 'pan'
                    ? 'inherit'
                    : isSelected
                    ? 'grab'
                    : activeTool === 'input'
                    ? 'crosshair'
                    : 'pointer',
              }}
            >
              {/* Note Letter Name Label */}
              {showNoteLabels && !note.isRest && (
                <text
                  x={noteX}
                  y={staffTop - 12}
                  fontSize="12"
                  fontWeight="700"
                  fill={
                    isSelected
                      ? currentTheme.colors.primary
                      : currentTheme.colors.textSecondary
                  }
                  textAnchor="middle"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {note.pitch.replace(/[0-9]/g, '')}
                </text>
              )}

              {/* In-place Editable Lyrics under note */}
              {!note.isRest && (
                <foreignObject
                  x={noteX - 40}
                  y={staffTop + 4 * LINE_SPACING + 20}
                  width="80"
                  height="24"
                  style={{ overflow: 'visible' }}
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <EditableText
                    value={note.lyric || ''}
                    onSave={(lyric) => updateNote(note.id, { lyric })}
                    placeholder={isSelected ? 'lyric...' : ''}
                    title="Click to edit lyric"
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      textAlign: 'center',
                      color: isSelected
                        ? currentTheme.colors.primary
                        : currentTheme.colors.textPrimary,
                      lineHeight: '22px',
                    }}
                  />
                </foreignObject>
              )}

              {/* Musical Tie to next same-pitch note */}
              {note.tied && (() => {
                const nextInfo = findNextNoteWithPitch(score, note);
                if (!nextInfo) return null;
                const path = getTiePath(noteX, noteY, nextInfo.x, nextInfo.y, stemDir);
                return (
                  <path
                    key={`tie-${note.id}`}
                    d={path}
                    fill="none"
                    stroke={noteColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ pointerEvents: 'none' }}
                  />
                );
              })()}

              {/* Dynamics Expression Marking */}
              {note.dynamic && (
                <text
                  x={noteX}
                  y={staffTop + 4 * LINE_SPACING + 46}
                  fontSize="14"
                  fontStyle="italic"
                  fontWeight="900"
                  fill={currentTheme.colors.primary}
                  textAnchor="middle"
                  style={{ pointerEvents: 'none', fontFamily: 'serif' }}
                >
                  {note.dynamic}
                </text>
              )}

              {/* Hit Box for clicking, selection & dragging (only in select / erase modes) */}
              {activeTool !== 'input' && (
                <rect
                  x={noteX - 16}
                  y={noteY - 14}
                  width="32"
                  height="28"
                  fill="transparent"
                  style={{
                    cursor:
                      activeTool === 'erase'
                        ? 'pointer'
                        : isSelected
                        ? 'grab'
                        : 'pointer',
                  }}
                  onMouseDown={(e) => handleNoteMouseDown(e, note)}
                />
              )}

              {/* Prominent Selection Halo & Glow Box */}
              {isSelected && !isBeingDragged && (
                <g style={{ pointerEvents: 'none' }}>
                  <rect
                    x={noteX - 16}
                    y={
                      stemDir === 'up'
                        ? noteY - STEM_HEIGHT - 8
                        : noteY - 12
                    }
                    width="32"
                    height={STEM_HEIGHT + 20}
                    rx="6"
                    fill="rgba(0, 229, 255, 0.16)"
                    stroke={currentTheme.colors.sheetNoteSelected}
                    strokeWidth="2"
                    strokeDasharray="4,2"
                  />
                  {/* Pitch label badge floating above selection */}
                  <rect
                    x={noteX - 14}
                    y={
                      stemDir === 'up'
                        ? noteY - STEM_HEIGHT - 24
                        : noteY - 26
                    }
                    width="28"
                    height="15"
                    rx="3"
                    fill={currentTheme.colors.sheetNoteSelected}
                  />
                  <text
                    x={noteX}
                    y={
                      stemDir === 'up'
                        ? noteY - STEM_HEIGHT - 13
                        : noteY - 15
                    }
                    fontSize="9"
                    fontWeight="bold"
                    fill="#ffffff"
                    textAnchor="middle"
                  >
                    {note.pitch}
                  </text>
                </g>
              )}

              {/* Ledger Lines */}
              {ledgerLines.map((ledgerY, ldIdx) => (
                <line
                  key={`ledger-${note.id}-${ldIdx}`}
                  x1={noteX - 12}
                  y1={ledgerY}
                  x2={noteX + 12}
                  y2={ledgerY}
                  stroke={currentTheme.colors.sheetLedgerLines}
                  strokeWidth="1.5"
                  style={{ pointerEvents: 'none' }}
                />
              ))}

              {/* Accidental */}
              {note.pitch.includes('#') && (
                <text
                  x={noteX - 16}
                  y={noteY + 4}
                  fontSize="16"
                  fontWeight="bold"
                  fill={noteColor}
                  style={{ pointerEvents: 'none' }}
                >
                  ♯
                </text>
              )}
              {note.pitch.includes('b') && (
                <text
                  x={noteX - 16}
                  y={noteY + 4}
                  fontSize="16"
                  fontWeight="bold"
                  fill={noteColor}
                  style={{ pointerEvents: 'none' }}
                >
                  ♭
                </text>
              )}

              {/* Note Head */}
              {note.duration === 'whole' ? (
                <ellipse
                  cx={noteX}
                  cy={noteY}
                  rx={NOTEHEAD_RX}
                  ry={NOTEHEAD_RY}
                  fill="none"
                  stroke={noteColor}
                  strokeWidth="2.5"
                  transform={`rotate(-20, ${noteX}, ${noteY})`}
                  style={{ pointerEvents: activeTool === 'input' ? 'none' : 'auto' }}
                />
              ) : note.duration === 'half' ? (
                <ellipse
                  cx={noteX}
                  cy={noteY}
                  rx={NOTEHEAD_RX}
                  ry={NOTEHEAD_RY}
                  fill="none"
                  stroke={noteColor}
                  strokeWidth="2.2"
                  transform={`rotate(-20, ${noteX}, ${noteY})`}
                  style={{ pointerEvents: activeTool === 'input' ? 'none' : 'auto' }}
                />
              ) : (
                <ellipse
                  cx={noteX}
                  cy={noteY}
                  rx={NOTEHEAD_RX}
                  ry={NOTEHEAD_RY}
                  fill={noteColor}
                  transform={`rotate(-20, ${noteX}, ${noteY})`}
                  style={{ pointerEvents: activeTool === 'input' ? 'none' : 'auto' }}
                />
              )}

              {/* Dotted note dot */}
              {note.dotted && (
                <circle
                  cx={noteX + NOTEHEAD_RX + 6}
                  cy={noteY}
                  r="2.5"
                  fill={noteColor}
                  style={{ pointerEvents: 'none' }}
                />
              )}
            </g>
          );
        })}
      </g>
    );
  };

  return (
    <CanvasContainer>
      <CanvasToolbar>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>
            Interactive Score &bull; {score.lines.length} Line
            {score.lines.length > 1 ? 's' : ''} &bull; Key: {score.keySignature} Major
          </span>

          {/* Selected Note Inspector Banner */}
          {selectedNote && (() => {
            const isPlayable = isPitchInInstrumentRange(selectedNote.pitch, score.instrumentId);
            const instRange = getInstrumentRange(score.instrumentId || 'acoustic_grand_piano');

            return (
              <NoteInspector>
                <span>Selected Note:</span>
                <InspectorPill>{selectedNote.pitch}</InspectorPill>
                <span style={{ textTransform: 'capitalize' }}>
                  {selectedNote.duration}
                  {selectedNote.dotted ? ' (Dotted)' : ''}
                </span>

                {!isPlayable && (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#f43f5e',
                      background: 'rgba(244, 63, 94, 0.15)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: '1px solid rgba(244, 63, 94, 0.4)',
                    }}
                    title={`Note ${selectedNote.pitch} is outside playable range (${instRange.minPitch} - ${instRange.maxPitch})`}
                  >
                    ⚠️ Out of Range ({instRange.minPitch}–{instRange.maxPitch})
                  </span>
                )}

                <SmallActionBtn
                  onClick={() => moveSelectedNotePitch(1)}
                  title="Shift Pitch Up (Arrow Up)"
                >
                  <ChevronUp size={12} />
                </SmallActionBtn>
                <SmallActionBtn
                  onClick={() => moveSelectedNotePitch(-1)}
                  title="Shift Pitch Down (Arrow Down)"
                >
                  <ChevronDown size={12} />
                </SmallActionBtn>
                <SmallActionBtn
                  onClick={() => moveSelectedNoteBeat(-0.5)}
                  title="Shift Beat Backward (Arrow Left)"
                >
                  <ChevronLeft size={12} />
                </SmallActionBtn>
                <SmallActionBtn
                  onClick={() => moveSelectedNoteBeat(0.5)}
                  title="Shift Beat Forward (Arrow Right)"
                >
                  <ChevronRight size={12} />
                </SmallActionBtn>

                {/* Chord Harmony Builders */}
                <SmallActionBtn
                  onClick={() => addChordInterval(4)}
                  title="Add Major 3rd above to form chord"
                >
                  +3rd
                </SmallActionBtn>
                <SmallActionBtn
                  onClick={() => addChordInterval(7)}
                  title="Add Perfect 5th above"
                >
                  +5th
                </SmallActionBtn>
                <SmallActionBtn
                  onClick={() => addTriadToSelectedNote('major')}
                  title="Add Major Triad (3rd & 5th)"
                >
                  +Triad
                </SmallActionBtn>

                {/* Musical Tie Toggle */}
                <SmallActionBtn
                  onClick={toggleTieSelectedNote}
                  style={{
                    background: selectedNote.tied ? currentTheme.colors.surfaceActive : undefined,
                    borderColor: selectedNote.tied ? currentTheme.colors.primary : undefined,
                    color: selectedNote.tied ? currentTheme.colors.primary : undefined,
                    fontWeight: selectedNote.tied ? 700 : 500,
                  }}
                  title="Toggle musical tie to next note (⌢)"
                >
                  ⌢ Tie
                </SmallActionBtn>

                {/* Musical Dynamics Expression */}
                <select
                  value={selectedNote.dynamic || ''}
                  onChange={(e) => setSelectedNoteDynamic((e.target.value as any) || undefined)}
                  style={{
                    background: currentTheme.colors.surface,
                    color: currentTheme.colors.textPrimary,
                    border: `1px solid ${currentTheme.colors.border}`,
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 4px',
                    cursor: 'pointer',
                    fontStyle: 'italic',
                  }}
                  title="Assign musical dynamic expression (p, mp, mf, f, ff)"
                >
                  <option value="">Dyn: —</option>
                  <option value="pp">pp (pianissimo)</option>
                  <option value="p">p (piano)</option>
                  <option value="mp">mp (mezzo-piano)</option>
                  <option value="mf">mf (mezzo-forte)</option>
                  <option value="f">f (forte)</option>
                  <option value="ff">ff (fortissimo)</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: '0.72rem', color: currentTheme.colors.textMuted }}>Lyric:</span>
                  <LyricInput
                    value={selectedNote.lyric || ''}
                    onChange={(e) => updateSelectedNote({ lyric: e.target.value })}
                    placeholder="Text..."
                    title="Edit lyrics for this note"
                  />
                </div>
                <SmallActionBtn
                  onClick={deleteSelectedNote}
                  title="Delete Note (Delete/Backspace)"
                >
                  <Trash2 size={12} />
                </SmallActionBtn>
                <SmallActionBtn
                  onClick={() => setSelectedNoteId(null)}
                  title="Deselect (Escape)"
                >
                  <X size={12} />
                </SmallActionBtn>
              </NoteInspector>
            );
          })()}
        </div>

        <ZoomControls>
          <SmallActionBtn
            onClick={() => setShowNoteLabels(!showNoteLabels)}
            title="Toggle Pitch Name Labels above notes"
            style={{ padding: '3px 8px', fontSize: '0.75rem', fontWeight: 600 }}
          >
            🏷️ Labels: {showNoteLabels ? 'ON' : 'OFF'}
          </SmallActionBtn>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <ZoomButton
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.1))}
            title="Zoom out"
          >
            -
          </ZoomButton>
          <ZoomButton
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            title="Zoom in"
          >
            +
          </ZoomButton>
          <ZoomButton onClick={() => setZoom(1)} title="Reset zoom">
            1:1
          </ZoomButton>
        </ZoomControls>
      </CanvasToolbar>

      <SheetScrollArea
        ref={sheetScrollAreaRef}
        $isPanTool={activeTool === 'pan'}
        $isPanning={isPanning}
        onMouseDown={handlePanMouseDown}
        onMouseMove={handlePanMouseMove}
        onMouseUp={handlePanMouseUp}
        onMouseLeave={handlePanMouseUp}
      >
        <SheetPaper style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}>
          <ScoreHeaderInfo>
            <ScoreTitle>
              <EditableText
                value={score.title}
                onSave={(title) => updateScoreMeta({ title: title || 'Untitled Score' })}
                placeholder="Score Title"
                title="Click to edit score title"
              />
            </ScoreTitle>
            <ScoreComposer>
              <EditableText
                value={score.composer}
                onSave={(composer) => updateScoreMeta({ composer: composer || 'Unknown Composer' })}
                placeholder="Composer"
                title="Click to edit composer"
              />
            </ScoreComposer>
          </ScoreHeaderInfo>

          <SvgScrollWrapper
            ref={scrollWrapperRef}
            $isPanTool={activeTool === 'pan'}
            $isPanning={isPanning}
            onMouseDown={handlePanMouseDown}
            onMouseMove={handlePanMouseMove}
            onMouseUp={handlePanMouseUp}
            onMouseLeave={handlePanMouseUp}
          >
            <SvgCanvas
              ref={svgRef}
              $isPanTool={activeTool === 'pan'}
              width={totalWidth}
              height={totalHeight}
              onClick={handleCanvasClick}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleMouseLeave}
            >
              {/* Render Each Staff Line System */}
              {score.lines.map((line, lIdx) => {
                const systemTop = STAFF_PADDING_TOP + lIdx * systemHeight;
                const trebleStaffTop = systemTop;
                const bassStaffTop = systemTop + STAFF_HEIGHT + GRAND_STAFF_GAP;
                const bassStaffBottom = bassStaffTop + 4 * LINE_SPACING;
                const lineStaffTop = isGrandStaff ? trebleStaffTop : systemTop;
                const beatsPerMeasure =
                  line.timeSignatureNumerator * (4 / line.timeSignatureDenominator);

                return (
                  <g key={line.id} id={`line-${lIdx}`}>
                    {/* Line Header & Controls in SVG (lifted well above notes and note letter labels) */}
                    <g transform={`translate(16, ${systemTop - 62})`}>
                      <rect
                        x="0"
                        y="0"
                        width="52"
                        height="20"
                        rx="4"
                        fill={currentTheme.colors.surfaceElevated}
                        stroke={currentTheme.colors.border}
                      />
                      <text
                        x="26"
                        y="14"
                        fontSize="10"
                        fontWeight="bold"
                        fill={currentTheme.colors.primary}
                        textAnchor="middle"
                      >
                        Line {lIdx + 1}
                      </text>

                      {/* Add Measure to this line */}
                      <g
                        transform="translate(60, 0)"
                        onClick={(e) => {
                          e.stopPropagation();
                          addMeasureToLine(lIdx);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <title>Add Measure to this Line</title>
                        <rect
                          x="0"
                          y="0"
                          width="68"
                          height="20"
                          rx="4"
                          fill={currentTheme.colors.surfaceElevated}
                          stroke={currentTheme.colors.border}
                        />
                        <text
                          x="34"
                          y="14"
                          fontSize="10"
                          fontWeight="600"
                          fill={currentTheme.colors.textSecondary}
                          textAnchor="middle"
                        >
                          + Measure
                        </text>
                      </g>

                      {/* Remove Measure from this line */}
                      {line.measures.length > 1 && (
                        <g
                          transform="translate(134, 0)"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeMeasureFromLine(lIdx);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <title>Remove Last Measure from this Line</title>
                          <rect
                            x="0"
                            y="0"
                            width="68"
                            height="20"
                            rx="4"
                            fill={currentTheme.colors.surfaceElevated}
                            stroke={currentTheme.colors.border}
                          />
                          <text
                            x="34"
                            y="14"
                            fontSize="10"
                            fontWeight="600"
                            fill={currentTheme.colors.textSecondary}
                            textAnchor="middle"
                          >
                            - Measure
                          </text>
                        </g>
                      )}

                      {/* Delete Line button (if > 1 line) */}
                      {score.lines.length > 1 && (
                        <g
                          transform={`translate(${line.measures.length > 1 ? 208 : 134}, 0)`}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLine(lIdx);
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <title>Remove this staff line</title>
                          <rect
                            x="0"
                            y="0"
                            width="68"
                            height="20"
                            rx="4"
                            fill={currentTheme.colors.surfaceElevated}
                            stroke={currentTheme.colors.border}
                          />
                          <text
                            x="34"
                            y="14"
                            fontSize="10"
                            fontWeight="600"
                            fill={currentTheme.colors.accentRose}
                            textAnchor="middle"
                          >
                            ✕ Del Line
                          </text>
                        </g>
                      )}
                    </g>

                    {/* System Measure Number at top-left (e.g. 5, 9, 13 like sheet music, placed above the clef) */}
                    {lIdx > 0 && line.measures.length > 0 && (
                      <text
                        x={18}
                        y={systemTop - 14}
                        fontSize="14"
                        fontWeight="700"
                        fontStyle="italic"
                        fill={currentTheme.colors.textSecondary}
                      >
                        {line.measures[0].index + 1}
                      </text>
                    )}

                    {/* Clef, Key Signature & Time Signature Section on Staff */}
                    {isGrandStaff ? (
                      <g id={`grand-clef-section-${lIdx}`}>
                        {/* Piano Brace & vertical line connecting Treble & Bass */}
                        <g id={`piano-brace-${lIdx}`}>
                          <path
                            d={getPianoBracePath(trebleStaffTop, bassStaffBottom, 16)}
                            fill={currentTheme.colors.sheetClef}
                          />
                          <line
                            x1={16}
                            y1={trebleStaffTop}
                            x2={16}
                            y2={bassStaffBottom}
                            stroke={currentTheme.colors.sheetStaffLines}
                            strokeWidth="1.5"
                          />
                        </g>

                        {/* Upper Treble Clef */}
                        <text
                          x={22}
                          y={trebleStaffTop + LINE_SPACING * 3.7}
                          fontSize="52"
                          fill={currentTheme.colors.sheetClef}
                          style={{
                            fontFamily: currentTheme.fonts.music,
                            pointerEvents: 'none',
                          }}
                        >
                          𝄞
                        </text>

                        {/* Lower Bass Clef */}
                        <text
                          x={22}
                          y={bassStaffTop + LINE_SPACING * 3.2}
                          fontSize="46"
                          fill={currentTheme.colors.sheetClef}
                          style={{
                            fontFamily: currentTheme.fonts.music,
                            pointerEvents: 'none',
                          }}
                        >
                          𝄢
                        </text>

                        {/* Key Signature Glyphs on Treble & Bass */}
                        {(() => {
                          const keyDef = KEY_SIGNATURE_MAP[score.keySignature || 'C'];
                          if (!keyDef || keyDef.type === 'none') return null;

                          const startX = 54;
                          const spacingX = 11;
                          const symbol = keyDef.type === 'sharp' ? '♯' : '♭';

                          return (
                            <g id={`grand-key-sig-${lIdx}`}>
                              {/* Treble staff key signature */}
                              {keyDef.trebleSteps.map((step, kIdx) => {
                                const glyphX = startX + kIdx * spacingX;
                                const glyphY = trebleStaffTop + step * STEP_Y + (keyDef.type === 'sharp' ? 4 : 2);
                                return (
                                  <text
                                    key={`treble-key-${lIdx}-${kIdx}`}
                                    x={glyphX}
                                    y={glyphY}
                                    fontSize="16"
                                    fontWeight="bold"
                                    fill={currentTheme.colors.sheetClef}
                                    textAnchor="middle"
                                    style={{ pointerEvents: 'none' }}
                                  >
                                    {symbol}
                                  </text>
                                );
                              })}

                              {/* Bass staff key signature */}
                              {keyDef.bassSteps.map((step, kIdx) => {
                                const glyphX = startX + kIdx * spacingX;
                                const glyphY = bassStaffTop + step * STEP_Y + (keyDef.type === 'sharp' ? 4 : 2);
                                return (
                                  <text
                                    key={`bass-key-${lIdx}-${kIdx}`}
                                    x={glyphX}
                                    y={glyphY}
                                    fontSize="16"
                                    fontWeight="bold"
                                    fill={currentTheme.colors.sheetClef}
                                    textAnchor="middle"
                                    style={{ pointerEvents: 'none' }}
                                  >
                                    {symbol}
                                  </text>
                                );
                              })}
                            </g>
                          );
                        })()}

                        {/* Time Signature Glyphs on Line 1 for Treble & Bass */}
                        {lIdx === 0 && (
                          <g
                            onClick={(e) => {
                              e.stopPropagation();
                              cycleGlobalTimeSignature();
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <title>Score Time Signature (Click to cycle, or adjust in top toolbar)</title>
                            {/* Treble Time Signature */}
                            <rect
                              x={CLEF_WIDTH - 24}
                              y={trebleStaffTop}
                              width="24"
                              height={LINE_SPACING * 4}
                              fill="transparent"
                            />
                            <text
                              x={CLEF_WIDTH - 12}
                              y={trebleStaffTop + LINE_SPACING * 1.6}
                              fontSize="22"
                              fontWeight="bold"
                              fill={currentTheme.colors.sheetClef}
                              textAnchor="middle"
                            >
                              {score.timeSignatureNumerator}
                            </text>
                            <text
                              x={CLEF_WIDTH - 12}
                              y={trebleStaffTop + LINE_SPACING * 3.6}
                              fontSize="22"
                              fontWeight="bold"
                              fill={currentTheme.colors.sheetClef}
                              textAnchor="middle"
                            >
                              {score.timeSignatureDenominator}
                            </text>

                            {/* Bass Time Signature */}
                            <rect
                              x={CLEF_WIDTH - 24}
                              y={bassStaffTop}
                              width="24"
                              height={LINE_SPACING * 4}
                              fill="transparent"
                            />
                            <text
                              x={CLEF_WIDTH - 12}
                              y={bassStaffTop + LINE_SPACING * 1.6}
                              fontSize="22"
                              fontWeight="bold"
                              fill={currentTheme.colors.sheetClef}
                              textAnchor="middle"
                            >
                              {score.timeSignatureNumerator}
                            </text>
                            <text
                              x={CLEF_WIDTH - 12}
                              y={bassStaffTop + LINE_SPACING * 3.6}
                              fontSize="22"
                              fontWeight="bold"
                              fill={currentTheme.colors.sheetClef}
                              textAnchor="middle"
                            >
                              {score.timeSignatureDenominator}
                            </text>
                          </g>
                        )}
                      </g>
                    ) : (
                      <g id={`clef-section-${lIdx}`}>
                        {/* Single Clef Symbol */}
                        <text
                          x={16}
                          y={lineStaffTop + (line.clef === 'bass' ? LINE_SPACING * 3.2 : LINE_SPACING * 3.7)}
                          fontSize={line.clef === 'bass' ? '46' : '52'}
                          fill={currentTheme.colors.sheetClef}
                          style={{
                            fontFamily: currentTheme.fonts.music,
                            pointerEvents: 'none',
                          }}
                        >
                          {line.clef === 'bass' ? '𝄢' : '𝄞'}
                        </text>

                        {/* Key Signature Glyphs on Every Line */}
                        {(() => {
                          const keyDef = KEY_SIGNATURE_MAP[score.keySignature || 'C'];
                          if (!keyDef || keyDef.type === 'none') return null;

                          const startX = 52;
                          const spacingX = 11;
                          const symbol = keyDef.type === 'sharp' ? '♯' : '♭';
                          const steps = line.clef === 'bass' ? keyDef.bassSteps : keyDef.trebleSteps;

                          return (
                            <g id={`key-sig-${lIdx}`}>
                              {steps.map((step, kIdx) => {
                                const glyphX = startX + kIdx * spacingX;
                                const glyphY = lineStaffTop + step * STEP_Y + (keyDef.type === 'sharp' ? 4 : 2);
                                return (
                                  <text
                                    key={`key-glyph-${lIdx}-${kIdx}`}
                                    x={glyphX}
                                    y={glyphY}
                                    fontSize="16"
                                    fontWeight="bold"
                                    fill={currentTheme.colors.sheetClef}
                                    textAnchor="middle"
                                    style={{ pointerEvents: 'none' }}
                                  >
                                    {symbol}
                                  </text>
                                );
                              })}
                            </g>
                          );
                        })()}

                        {/* Time Signature Glyphs: ONLY on Line 1 (lIdx === 0) */}
                        {lIdx === 0 && (
                          <g
                            onClick={(e) => {
                              e.stopPropagation();
                              cycleGlobalTimeSignature();
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            <title>Score Time Signature (Click to cycle, or adjust in top toolbar)</title>
                            <rect
                              x={CLEF_WIDTH - 24}
                              y={lineStaffTop}
                              width="24"
                              height={LINE_SPACING * 4}
                              fill="transparent"
                            />
                            <text
                              x={CLEF_WIDTH - 12}
                              y={lineStaffTop + LINE_SPACING * 1.6}
                              fontSize="22"
                              fontWeight="bold"
                              fill={currentTheme.colors.sheetClef}
                              textAnchor="middle"
                            >
                              {score.timeSignatureNumerator}
                            </text>
                            <text
                              x={CLEF_WIDTH - 12}
                              y={lineStaffTop + LINE_SPACING * 3.6}
                              fontSize="22"
                              fontWeight="bold"
                              fill={currentTheme.colors.sheetClef}
                              textAnchor="middle"
                            >
                              {score.timeSignatureDenominator}
                            </text>
                          </g>
                        )}
                      </g>
                    )}

                    {/* Measures on this line */}
                    {line.measures.map((measure, mOffset) => {
                      const measureLeft = CLEF_WIDTH + mOffset * MEASURE_WIDTH;
                      const measureRight = measureLeft + MEASURE_WIDTH;

                      if (isGrandStaff) {
                        return (
                          <g
                            key={`line-${lIdx}-measure-${measure.index}`}
                            id={`measure-${measure.index}`}
                          >
                            {/* Treble Staff 5 lines */}
                            {[0, 1, 2, 3, 4].map((lineIndex) => {
                              const lineY = trebleStaffTop + lineIndex * LINE_SPACING;
                              return (
                                <line
                                  key={`line-${lIdx}-m-${mOffset}-treble-line-${lineIndex}`}
                                  x1={measureLeft}
                                  y1={lineY}
                                  x2={measureRight}
                                  y2={lineY}
                                  stroke={currentTheme.colors.sheetStaffLines}
                                  strokeWidth="1.2"
                                />
                              );
                            })}

                            {/* Bass Staff 5 lines */}
                            {[0, 1, 2, 3, 4].map((lineIndex) => {
                              const lineY = bassStaffTop + lineIndex * LINE_SPACING;
                              return (
                                <line
                                  key={`line-${lIdx}-m-${mOffset}-bass-line-${lineIndex}`}
                                  x1={measureLeft}
                                  y1={lineY}
                                  x2={measureRight}
                                  y2={lineY}
                                  stroke={currentTheme.colors.sheetStaffLines}
                                  strokeWidth="1.2"
                                />
                              );
                            })}

                            {/* Left barline spanning both staves */}
                            {mOffset === 0 && (
                              <line
                                x1={measureLeft}
                                y1={trebleStaffTop}
                                x2={measureLeft}
                                y2={bassStaffBottom}
                                stroke={currentTheme.colors.sheetStaffLines}
                                strokeWidth="1.5"
                              />
                            )}

                            {/* Right barline spanning both staves */}
                            <line
                              x1={measureRight}
                              y1={trebleStaffTop}
                              x2={measureRight}
                              y2={bassStaffBottom}
                              stroke={
                                mOffset === line.measures.length - 1 &&
                                lIdx === score.lines.length - 1
                                  ? currentTheme.colors.textPrimary
                                  : currentTheme.colors.sheetMeasureBar
                              }
                              strokeWidth={
                                mOffset === line.measures.length - 1 &&
                                lIdx === score.lines.length - 1
                                  ? '3'
                                  : '1.5'
                              }
                            />

                            {/* Treble Staff Notes */}
                            {renderStaffNotesAndGroupings(
                              measure.notes.filter((n) => n.clef !== 'bass'),
                              trebleStaffTop,
                              'treble',
                              measureLeft,
                              measure.index,
                              beatsPerMeasure,
                              'treble'
                            )}

                            {/* Bass Staff Notes */}
                            {renderStaffNotesAndGroupings(
                              measure.notes.filter((n) => n.clef === 'bass'),
                              bassStaffTop,
                              'bass',
                              measureLeft,
                              measure.index,
                              beatsPerMeasure,
                              'bass'
                            )}
                          </g>
                        );
                      }

                      // Single Staff Measure Rendering
                      return (
                        <g
                          key={`line-${lIdx}-measure-${measure.index}`}
                          id={`measure-${measure.index}`}
                        >
                          {/* 5 Staff Lines for this measure */}
                          {[0, 1, 2, 3, 4].map((lineIndex) => {
                            const lineY = lineStaffTop + lineIndex * LINE_SPACING;
                            return (
                              <line
                                key={`line-${lIdx}-measure-${mOffset}-staff-${lineIndex}`}
                                x1={measureLeft}
                                y1={lineY}
                                x2={measureRight}
                                y2={lineY}
                                stroke={currentTheme.colors.sheetStaffLines}
                                strokeWidth="1.2"
                              />
                            );
                          })}

                          {/* Left barline (at start of line) */}
                          {mOffset === 0 && (
                            <line
                              x1={measureLeft}
                              y1={lineStaffTop}
                              x2={measureLeft}
                              y2={lineStaffTop + 4 * LINE_SPACING}
                              stroke={currentTheme.colors.sheetStaffLines}
                              strokeWidth="1.5"
                            />
                          )}

                          {/* Right barline */}
                          <line
                            x1={measureRight}
                            y1={lineStaffTop}
                            x2={measureRight}
                            y2={lineStaffTop + 4 * LINE_SPACING}
                            stroke={
                              mOffset === line.measures.length - 1 &&
                              lIdx === score.lines.length - 1
                                ? currentTheme.colors.textPrimary
                                : currentTheme.colors.sheetMeasureBar
                            }
                            strokeWidth={
                              mOffset === line.measures.length - 1 &&
                              lIdx === score.lines.length - 1
                                ? '3'
                                : '1.5'
                            }
                          />

                          {/* Measure Notes */}
                          {renderStaffNotesAndGroupings(
                            measure.notes,
                            lineStaffTop,
                            line.clef,
                            measureLeft,
                            measure.index,
                            beatsPerMeasure,
                            'single'
                          )}
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Active Note Dragging Ghost & Live Repositioning Preview */}
              {draggingNote && draggingNote.hasMoved && (() => {
                const dragSystemTop = STAFF_PADDING_TOP + draggingNote.currentLineIndex * systemHeight;
                const dragStaffTop =
                  isGrandStaff && draggingNote.currentClef === 'bass'
                    ? dragSystemTop + STAFF_HEIGHT + GRAND_STAFF_GAP
                    : dragSystemTop;

                return (
                  <g style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 6px rgba(0, 229, 255, 0.6))' }}>
                    {/* Ledger Lines for dragged note */}
                    {getLedgerLines(
                      draggingNote.currentPitch,
                      dragStaffTop,
                      draggingNote.currentClef
                    ).map((ly, idx) => (
                      <line
                        key={`drag-ledger-${idx}`}
                        x1={draggingNote.currentX - 12}
                        y1={ly}
                        x2={draggingNote.currentX + 12}
                        y2={ly}
                        stroke={currentTheme.colors.primary}
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* Selection glow box following the dragged note */}
                    <rect
                      x={draggingNote.currentX - 16}
                      y={draggingNote.currentY - STEM_HEIGHT - 8}
                      width="32"
                      height={STEM_HEIGHT + 20}
                      rx="6"
                      fill="rgba(0, 229, 255, 0.25)"
                      stroke={currentTheme.colors.primary}
                      strokeWidth="2"
                    />

                    {/* Floating Pitch Badge above dragged note */}
                    <rect
                      x={draggingNote.currentX - 14}
                      y={draggingNote.currentY - STEM_HEIGHT - 24}
                      width="28"
                      height="15"
                      rx="3"
                      fill={currentTheme.colors.primary}
                    />
                    <text
                      x={draggingNote.currentX}
                      y={draggingNote.currentY - STEM_HEIGHT - 13}
                      fontSize="9"
                      fontWeight="bold"
                      fill="#000000"
                      textAnchor="middle"
                    >
                      {draggingNote.currentPitch}
                    </text>

                    {/* Dragged Notehead */}
                    <ellipse
                      cx={draggingNote.currentX}
                      cy={draggingNote.currentY}
                      rx={NOTEHEAD_RX}
                      ry={NOTEHEAD_RY}
                      fill={currentTheme.colors.primary}
                      transform={`rotate(-20, ${draggingNote.currentX}, ${draggingNote.currentY})`}
                    />

                    {/* Dragged Stem */}
                    <line
                      x1={draggingNote.currentX + NOTEHEAD_RX - 1}
                      y1={draggingNote.currentY}
                      x2={draggingNote.currentX + NOTEHEAD_RX - 1}
                      y2={draggingNote.currentY - STEM_HEIGHT}
                      stroke={currentTheme.colors.primary}
                      strokeWidth="2"
                    />
                  </g>
                );
              })()}

              {/* Ghost Note Preview on Hover */}
              {ghostNote.visible && !draggingNote && (() => {
                const ghostSystemTop = STAFF_PADDING_TOP + ghostNote.lineIndex * systemHeight;
                const ghostClef = ghostNote.clef || 'treble';
                const ghostStaffTop =
                  isGrandStaff && ghostClef === 'bass'
                    ? ghostSystemTop + STAFF_HEIGHT + GRAND_STAFF_GAP
                    : ghostSystemTop;

                return (
                  <g style={{ pointerEvents: 'none', opacity: 0.6 }}>
                    {getLedgerLines(
                      ghostNote.pitch,
                      ghostStaffTop,
                      ghostClef
                    ).map((ly, idx) => (
                      <line
                        key={`ghost-ledger-${idx}`}
                        x1={ghostNote.x - 12}
                        y1={ly}
                        x2={ghostNote.x + 12}
                        y2={ly}
                        stroke={currentTheme.colors.primary}
                        strokeWidth="1.5"
                        strokeDasharray="2,2"
                      />
                    ))}
                    <ellipse
                      cx={ghostNote.x}
                      cy={ghostNote.y}
                      rx={NOTEHEAD_RX}
                      ry={NOTEHEAD_RY}
                      fill={currentTheme.colors.primary}
                      transform={`rotate(-20, ${ghostNote.x}, ${ghostNote.y})`}
                    />
                    <line
                      x1={ghostNote.x + NOTEHEAD_RX - 1}
                      y1={ghostNote.y}
                      x2={ghostNote.x + NOTEHEAD_RX - 1}
                      y2={ghostNote.y - STEM_HEIGHT}
                      stroke={currentTheme.colors.primary}
                      strokeWidth="1.8"
                    />
                  </g>
                );
              })()}

              {/* Playhead Transport Line on Current Playing Line (Visible when playing OR when stopped after being positioned) */}
              {(playbackState !== 'idle' || playheadMeasure > 0 || playheadBeat > 0) && (
                <g id="playhead" style={{ pointerEvents: 'none' }}>
                  <line
                    x1={playheadX}
                    y1={playheadTopY}
                    x2={playheadX}
                    y2={playheadBottomY}
                    stroke={currentTheme.colors.sheetPlayhead}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`${playheadX - 6},${playheadTopY - 3} ${playheadX + 6},${playheadTopY - 3} ${playheadX},${playheadTopY + 5}`}
                    fill={currentTheme.colors.sheetPlayhead}
                  />
                </g>
              )}

              {/* Selected Section Highlight Box (when looping or set via Select Tool) */}
              {selectedSection && (() => {
                const startLineTop = STAFF_PADDING_TOP + selectedSection.startLine * systemHeight;
                const startLineObj = score.lines[selectedSection.startLine];
                const beatsStart = startLineObj
                  ? startLineObj.timeSignatureNumerator * (4 / startLineObj.timeSignatureDenominator)
                  : 4;
                const startMOffset = startLineObj
                  ? startLineObj.measures.findIndex((m) => m.index === selectedSection.startMeasure)
                  : 0;
                const boxX1 =
                  CLEF_WIDTH +
                  Math.max(0, startMOffset) * MEASURE_WIDTH +
                  (selectedSection.startBeat / beatsStart) * (MEASURE_WIDTH - 30) +
                  15;

                const endLineTop = STAFF_PADDING_TOP + selectedSection.endLine * systemHeight;
                const endLineObj = score.lines[selectedSection.endLine];
                const beatsEnd = endLineObj
                  ? endLineObj.timeSignatureNumerator * (4 / endLineObj.timeSignatureDenominator)
                  : 4;
                const endMOffset = endLineObj
                  ? endLineObj.measures.findIndex((m) => m.index === selectedSection.endMeasure)
                  : 0;
                const boxX2 =
                  CLEF_WIDTH +
                  Math.max(0, endMOffset) * MEASURE_WIDTH +
                  (selectedSection.endBeat / beatsEnd) * (MEASURE_WIDTH - 30) +
                  15;

                const isSameLine = selectedSection.startLine === selectedSection.endLine;
                const minX = Math.min(boxX1, boxX2);
                const spanWidth = Math.max(16, Math.abs(boxX2 - boxX1));
                const sectionSpanHeight = isGrandStaff
                  ? STAFF_HEIGHT + GRAND_STAFF_GAP + 4 * LINE_SPACING + 30
                  : 4 * LINE_SPACING + 30;

                return isSameLine ? (
                  <g id="selected-section-highlight" style={{ pointerEvents: 'none' }}>
                    <rect
                      x={minX - 8}
                      y={startLineTop - 15}
                      width={spanWidth + 16}
                      height={sectionSpanHeight}
                      rx="6"
                      fill="rgba(2, 132, 199, 0.18)"
                      stroke="#0284c7"
                      strokeWidth="1.5"
                      strokeDasharray="4,2"
                    />
                    <rect
                      x={minX - 8}
                      y={startLineTop - 30}
                      width="70"
                      height="14"
                      rx="3"
                      fill="#0284c7"
                    />
                    <text
                      x={minX + 27}
                      y={startLineTop - 19}
                      fontSize="9"
                      fontWeight="bold"
                      fill="#ffffff"
                      textAnchor="middle"
                    >
                      LOOP SECTION
                    </text>
                  </g>
                ) : null;
              })()}

              {/* In-progress Drag Selection Box */}
              {selectingSection && selectingSection.hasMoved && (() => {
                const dragSelHeight = isGrandStaff
                  ? STAFF_HEIGHT + GRAND_STAFF_GAP + 4 * LINE_SPACING + 24
                  : 4 * LINE_SPACING + 24;

                return (
                  <g style={{ pointerEvents: 'none' }}>
                    <rect
                      x={Math.min(selectingSection.startX, selectingSection.currentX)}
                      y={STAFF_PADDING_TOP + selectingSection.startLine * systemHeight - 12}
                      width={Math.max(8, Math.abs(selectingSection.currentX - selectingSection.startX))}
                      height={dragSelHeight}
                      rx="4"
                      fill="rgba(0, 229, 255, 0.2)"
                      stroke={currentTheme.colors.primary}
                      strokeWidth="1.5"
                      strokeDasharray="3,2"
                    />
                  </g>
                );
              })()}
          </SvgCanvas>
        </SvgScrollWrapper>

        {/* Add Line Action Button */}
        <AddLineButton onClick={() => addLine()}>
          <Plus size={16} />
          <span>Add Staff Line (System)</span>
        </AddLineButton>

        {/* Tooltip hovering over staff showing pitch name */}
        {ghostNote.visible && (
          <PitchTooltip $x={ghostNote.x} $y={ghostNote.y}>
            {ghostNote.pitch}
          </PitchTooltip>
        )}
      </SheetPaper>
    </SheetScrollArea>
    </CanvasContainer>
  );
};
