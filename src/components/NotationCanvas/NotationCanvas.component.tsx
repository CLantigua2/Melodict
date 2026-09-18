'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  X,
  Music,
} from 'lucide-react';
import { useScore } from '@/context/ScoreContext';
import { useAppTheme } from '@/theme/ThemeProvider';
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
  TIME_SIGNATURES,
  KEY_SIGNATURE_MAP,
  getDiatonicPitchFromStep,
} from './NotationCanvas.constants';
import {
  calculateNoteY,
  getLedgerLines,
  getStemDirection,
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
    moveSelectedNotePitch,
    addLine,
    removeLine,
    changeLineTimeSignature,
    changeLineClef,
    addMeasureToLine,
    removeMeasureFromLine,
    playheadLine,
    playheadMeasure,
    playheadBeat,
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
      } else if (e.key === 'Escape') {
        setSelectedNoteId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNoteId, selectedNote]);

  // Determine SVG total dimensions based on lines and measures
  const maxMeasuresInAnyLine = Math.max(
    1,
    ...score.lines.map((l) => l.measures.length)
  );
  const totalWidth = Math.max(
    880,
    CLEF_WIDTH + maxMeasuresInAnyLine * MEASURE_WIDTH + 80
  );
  const totalHeight =
    STAFF_PADDING_TOP + score.lines.length * LINE_HEIGHT + 40;

  // Mouse move handler for ghost note placement across lines
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool !== 'input' || !svgRef.current) {
      if (ghostNote.visible) setGhostNote((prev) => ({ ...prev, visible: false }));
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / zoom;
    const mouseY = (e.clientY - rect.top) / zoom;

    // Determine target line by vertical coordinate
    const lineIndex = Math.min(
      score.lines.length - 1,
      Math.max(0, Math.floor((mouseY - STAFF_PADDING_TOP + LINE_HEIGHT / 2) / LINE_HEIGHT))
    );
    const targetLine = score.lines[lineIndex];
    if (!targetLine) return;

    const lineStaffTop = STAFF_PADDING_TOP + lineIndex * LINE_HEIGHT;
    const beatsPerMeasure =
      targetLine.timeSignatureNumerator * (4 / targetLine.timeSignatureDenominator);

    // Check if within measures of this line
    const relativeX = mouseX - CLEF_WIDTH;
    if (relativeX < 0 || relativeX > targetLine.measures.length * MEASURE_WIDTH) {
      if (ghostNote.visible) setGhostNote((prev) => ({ ...prev, visible: false }));
      return;
    }

    const measureOffset = Math.min(
      targetLine.measures.length - 1,
      Math.max(0, Math.floor(relativeX / MEASURE_WIDTH))
    );
    const measure = targetLine.measures[measureOffset];
    if (!measure) return;

    const measureX = relativeX % MEASURE_WIDTH;
    const rawBeat = (measureX / (MEASURE_WIDTH - 20)) * beatsPerMeasure;
    const snappedBeat = Math.min(
      beatsPerMeasure - 0.25,
      Math.max(0, Math.round(rawBeat * 2) / 2)
    );

    // Calculate Y step based on line staff top and line clef
    const stepFromTop = Math.round((mouseY - lineStaffTop) / STEP_Y);
    const clampedStep = Math.max(-4, Math.min(13, stepFromTop));
    let pitch = getDiatonicPitchFromStep(clampedStep, targetLine.clef);

    if (selectedAccidental === 'sharp') {
      pitch = `${pitch[0]}#${pitch.slice(1)}`;
    } else if (selectedAccidental === 'flat') {
      pitch = `${pitch[0]}b${pitch.slice(1)}`;
    }

    const snappedX =
      CLEF_WIDTH +
      measureOffset * MEASURE_WIDTH +
      (snappedBeat / beatsPerMeasure) * (MEASURE_WIDTH - 30) +
      15;
    const snappedY = lineStaffTop + clampedStep * STEP_Y;

    setGhostNote({
      visible: true,
      lineIndex,
      measureIndex: measure.index,
      beatPosition: snappedBeat,
      pitch,
      x: snappedX,
      y: snappedY,
    });
  };

  const handleMouseLeave = () => {
    setGhostNote((prev) => ({ ...prev, visible: false }));
  };

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'pan') {
      return;
    }
    if (activeTool === 'input' && ghostNote.visible) {
      const targetLine = score.lines[ghostNote.lineIndex];
      addNote(
        ghostNote.measureIndex,
        ghostNote.beatPosition,
        ghostNote.pitch,
        targetLine?.clef || 'treble',
        ghostNote.lineIndex
      );
    } else if (activeTool === 'select') {
      setSelectedNoteId(null);
    }
  };

  const handleNoteClick = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (activeTool === 'pan') {
      return;
    }
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
  const currentLineStaffTop =
    STAFF_PADDING_TOP + (currentPlayingLine ? currentPlayingLine.lineIndex : 0) * LINE_HEIGHT;
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

  return (
    <CanvasContainer>
      <CanvasToolbar>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>
            Interactive Score &bull; {score.lines.length} Line
            {score.lines.length > 1 ? 's' : ''} &bull; Key: {score.keySignature} Major
          </span>

          {/* Selected Note Inspector Banner */}
          {selectedNote && (
            <NoteInspector>
              <span>Selected Note:</span>
              <InspectorPill>{selectedNote.pitch}</InspectorPill>
              <span style={{ textTransform: 'capitalize' }}>
                {selectedNote.duration}
                {selectedNote.dotted ? ' (Dotted)' : ''}
              </span>
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
          )}
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
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={handleCanvasClick}
            >
              {/* Render Each Staff Line System */}
              {score.lines.map((line, lIdx) => {
                const lineStaffTop = STAFF_PADDING_TOP + lIdx * LINE_HEIGHT;
                const beatsPerMeasure =
                  line.timeSignatureNumerator * (4 / line.timeSignatureDenominator);

                return (
                  <g key={line.id} id={`line-${lIdx}`}>
                    {/* Line Header & Controls in SVG (lifted well above notes and note letter labels) */}
                    <g transform={`translate(16, ${lineStaffTop - 52})`}>
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
                      y={lineStaffTop - 12}
                      fontSize="14"
                      fontWeight="700"
                      fontStyle="italic"
                      fill={currentTheme.colors.textSecondary}
                    >
                      {line.measures[0].index + 1}
                    </text>
                  )}

                  {/* Clef, Key Signature & Time Signature Section on Staff */}
                  <g id={`clef-section-${lIdx}`}>
                    {/* Treble Clef Symbol (on every line) */}
                    <text
                      x={16}
                      y={lineStaffTop + LINE_SPACING * 3.7}
                      fontSize="52"
                      fill={currentTheme.colors.sheetClef}
                      style={{
                        fontFamily: currentTheme.fonts.music,
                        pointerEvents: 'none',
                      }}
                    >
                      𝄞
                    </text>

                    {/* Key Signature Glyphs on Every Line (Sharps/Flats) */}
                    {(() => {
                      const keyDef = KEY_SIGNATURE_MAP[score.keySignature || 'C'];
                      if (!keyDef || keyDef.type === 'none') return null;

                      const startX = 52;
                      const spacingX = 11;
                      const symbol = keyDef.type === 'sharp' ? '♯' : '♭';

                      return (
                        <g id={`key-sig-${lIdx}`}>
                          {keyDef.trebleSteps.map((step, kIdx) => {
                            const glyphX = startX + kIdx * spacingX;
                            // Step Y offset for the sharp/flat glyph
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

                  {/* Measures on this line */}
                  {line.measures.map((measure, mOffset) => {
                    const measureLeft = CLEF_WIDTH + mOffset * MEASURE_WIDTH;
                    const measureRight = measureLeft + MEASURE_WIDTH;

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
                        {measure.notes.map((note) => {
                          const noteY = calculateNoteY(
                            note.pitch,
                            lineStaffTop,
                            line.clef
                          );
                          const noteX =
                            measureLeft +
                            (note.beatPosition / beatsPerMeasure) *
                              (MEASURE_WIDTH - 30) +
                            15;
                          const isSelected = selectedNoteId === note.id;
                          const ledgerLines = getLedgerLines(
                            note.pitch,
                            lineStaffTop,
                            line.clef
                          );
                          const stemDir = getStemDirection(note.pitch, line.clef);

                          const noteColor = isSelected
                            ? currentTheme.colors.sheetNoteSelected
                            : currentTheme.colors.sheetNote;

                          return (
                            <g
                              key={note.id}
                              onClick={(e) => handleNoteClick(e, note.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              {/* Note Letter Name Label (Matching reference sheet music, e.g. C, G, A) */}
                              {showNoteLabels && !note.isRest && (
                                <text
                                  x={noteX}
                                  y={lineStaffTop - 12}
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
                                  y={lineStaffTop + 4 * LINE_SPACING + 20}
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

                              {/* Large Transparent Hit Box to guarantee easy clicking & selection */}
                              <rect
                                x={noteX - 18}
                                y={noteY - 35}
                                width="36"
                                height="70"
                                fill="transparent"
                                style={{ cursor: 'pointer' }}
                              />

                              {/* Prominent Selection Halo & Glow Box */}
                              {isSelected && (
                                <g>
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
                                />
                              ) : (
                                <ellipse
                                  cx={noteX}
                                  cy={noteY}
                                  rx={NOTEHEAD_RX}
                                  ry={NOTEHEAD_RY}
                                  fill={noteColor}
                                  transform={`rotate(-20, ${noteX}, ${noteY})`}
                                />
                              )}

                              {/* Note Stem */}
                              {note.duration !== 'whole' && (
                                <line
                                  x1={
                                    stemDir === 'up'
                                      ? noteX + NOTEHEAD_RX - 1
                                      : noteX - NOTEHEAD_RX + 1
                                  }
                                  y1={noteY}
                                  x2={
                                    stemDir === 'up'
                                      ? noteX + NOTEHEAD_RX - 1
                                      : noteX - NOTEHEAD_RX + 1
                                  }
                                  y2={
                                    stemDir === 'up'
                                      ? noteY - STEM_HEIGHT
                                      : noteY + STEM_HEIGHT
                                  }
                                  stroke={noteColor}
                                  strokeWidth="1.8"
                                />
                              )}

                              {/* Eighth Note Flag */}
                              {note.duration === 'eighth' && (
                                <path
                                  d={
                                    stemDir === 'up'
                                      ? `M ${noteX + NOTEHEAD_RX - 1} ${noteY - STEM_HEIGHT} Q ${noteX + NOTEHEAD_RX + 10} ${noteY - STEM_HEIGHT + 14} ${noteX + NOTEHEAD_RX + 8} ${noteY - STEM_HEIGHT + 24}`
                                      : `M ${noteX - NOTEHEAD_RX + 1} ${noteY + STEM_HEIGHT} Q ${noteX - NOTEHEAD_RX + 10} ${noteY + STEM_HEIGHT - 14} ${noteX - NOTEHEAD_RX + 8} ${noteY + STEM_HEIGHT - 24}`
                                  }
                                  fill="none"
                                  stroke={noteColor}
                                  strokeWidth="2.2"
                                />
                              )}

                              {/* Sixteenth Note Flags */}
                              {note.duration === 'sixteenth' && (
                                <>
                                  <path
                                    d={
                                      stemDir === 'up'
                                        ? `M ${noteX + NOTEHEAD_RX - 1} ${noteY - STEM_HEIGHT} Q ${noteX + NOTEHEAD_RX + 10} ${noteY - STEM_HEIGHT + 14} ${noteX + NOTEHEAD_RX + 8} ${noteY - STEM_HEIGHT + 24}`
                                        : `M ${noteX - NOTEHEAD_RX + 1} ${noteY + STEM_HEIGHT} Q ${noteX - NOTEHEAD_RX + 10} ${noteY + STEM_HEIGHT - 14} ${noteX - NOTEHEAD_RX + 8} ${noteY + STEM_HEIGHT - 24}`
                                    }
                                    fill="none"
                                    stroke={noteColor}
                                    strokeWidth="2.2"
                                  />
                                  <path
                                    d={
                                      stemDir === 'up'
                                        ? `M ${noteX + NOTEHEAD_RX - 1} ${noteY - STEM_HEIGHT + 8} Q ${noteX + NOTEHEAD_RX + 10} ${noteY - STEM_HEIGHT + 22} ${noteX + NOTEHEAD_RX + 8} ${noteY - STEM_HEIGHT + 32}`
                                        : `M ${noteX - NOTEHEAD_RX + 1} ${noteY + STEM_HEIGHT - 8} Q ${noteX - NOTEHEAD_RX + 10} ${noteY + STEM_HEIGHT - 22} ${noteX - NOTEHEAD_RX + 8} ${noteY + STEM_HEIGHT - 32}`
                                    }
                                    fill="none"
                                    stroke={noteColor}
                                    strokeWidth="2.2"
                                  />
                                </>
                              )}

                              {/* Dotted note dot */}
                              {note.dotted && (
                                <circle
                                  cx={noteX + NOTEHEAD_RX + 6}
                                  cy={noteY}
                                  r="2.5"
                                  fill={noteColor}
                                />
                              )}
                            </g>
                          );
                        })}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Ghost Note Preview on Hover */}
            {ghostNote.visible && (
              <g style={{ pointerEvents: 'none', opacity: 0.6 }}>
                {getLedgerLines(
                  ghostNote.pitch,
                  STAFF_PADDING_TOP + ghostNote.lineIndex * LINE_HEIGHT,
                  score.lines[ghostNote.lineIndex]?.clef || 'treble'
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
            )}

            {/* Playhead Transport Line on Current Playing Line */}
            {playbackState !== 'idle' && (
              <g id="playhead" style={{ pointerEvents: 'none' }}>
                <line
                  x1={playheadX}
                  y1={currentLineStaffTop - 15}
                  x2={playheadX}
                  y2={currentLineStaffTop + 4 * LINE_SPACING + 15}
                  stroke={currentTheme.colors.sheetPlayhead}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <polygon
                  points={`${playheadX - 6},${currentLineStaffTop - 18} ${playheadX + 6},${currentLineStaffTop - 18} ${playheadX},${currentLineStaffTop - 10}`}
                  fill={currentTheme.colors.sheetPlayhead}
                />
              </g>
            )}
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
