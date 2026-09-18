'use client';

import React from 'react';
import {
  Play,
  Pause,
  Square,
  Repeat,
  Bell,
  Minus,
  Plus,
  Undo2,
  Redo2,
  MousePointer,
  PenTool,
  Hand,
  Eraser,
  Dot,
  Volume2,
  ChevronsLeft,
  X,
} from 'lucide-react';
import { useScore } from '@/context/ScoreContext';
import {
  DURATION_OPTIONS,
  ACCIDENTAL_OPTIONS,
  TIME_SIGNATURE_OPTIONS,
  KEY_SIGNATURE_OPTIONS,
} from './TransportToolbar.constants';
import { TransportToolbarProps } from './TransportToolbar.types';
import {
  ToolbarContainer,
  SectionGroup,
  Divider,
  TransportPlayButton,
  IconButton,
  DurationButton,
  AccidentalButton,
  TempoControl,
  TempoInput,
  SmallSelect,
  MeasureBadge,
} from './TransportToolbar.styles';

export const TransportToolbar: React.FC<TransportToolbarProps> = () => {
  const {
    score,
    updateScoreMeta,
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
    playbackState,
    togglePlayback,
    stopPlayback,
    rewindToBeginning,
    selectedSection,
    setSelectedSection,
    loopActive,
    setLoopActive,
    metronomeActive,
    setMetronomeActive,
    addLine,
    removeLine,
    addMeasure,
    removeMeasure,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useScore();

  const handleBpmChange = (delta: number) => {
    const current = score.tempo || 120;
    const newBpm = Math.max(40, Math.min(240, current + delta));
    updateScoreMeta({ tempo: newBpm });
  };

  return (
    <ToolbarContainer>
      {/* Playback Transport Controls */}
      <SectionGroup>
        <IconButton onClick={rewindToBeginning} title="Rewind to beginning (<<)">
          <ChevronsLeft size={18} />
        </IconButton>

        <TransportPlayButton
          $isPlaying={playbackState === 'playing'}
          onClick={togglePlayback}
          title={playbackState === 'playing' ? 'Pause (Space)' : 'Play (Space)'}
        >
          {playbackState === 'playing' ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
        </TransportPlayButton>

        <IconButton onClick={stopPlayback} title="Stop">
          <Square size={16} />
        </IconButton>

        <IconButton
          $active={loopActive}
          onClick={() => setLoopActive(!loopActive)}
          title="Toggle Repeat Loop"
        >
          <Repeat size={16} />
        </IconButton>

        <IconButton
          $active={metronomeActive}
          onClick={() => setMetronomeActive(!metronomeActive)}
          title="Toggle Metronome"
        >
          <Bell size={16} />
        </IconButton>

        {selectedSection && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 8px',
              borderRadius: '4px',
              background: '#0284c7',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <span>
              Looping M{selectedSection.startMeasure + 1} - M{selectedSection.endMeasure + 1}
            </span>
            <button
              onClick={() => setSelectedSection(null)}
              title="Clear Section Loop"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                color: '#ffffff',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
              }}
            >
              <X size={12} />
            </button>
          </div>
        )}
      </SectionGroup>

      <Divider />

      {/* Tempo / BPM */}
      <SectionGroup>
        <TempoControl>
          <IconButton onClick={() => handleBpmChange(-5)} title="Decrease Tempo">
            <Minus size={14} />
          </IconButton>
          <TempoInput
            type="number"
            min={40}
            max={240}
            value={score.tempo}
            onChange={(e) =>
              updateScoreMeta({ tempo: parseInt(e.target.value, 10) || 120 })
            }
            title="Tempo in BPM"
          />
          <IconButton onClick={() => handleBpmChange(5)} title="Increase Tempo">
            <Plus size={14} />
          </IconButton>
        </TempoControl>
        <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>BPM</span>
      </SectionGroup>

      <Divider />

      {/* Time & Key Signature */}
      <SectionGroup>
        <SmallSelect
          value={`${score.timeSignatureNumerator}/${score.timeSignatureDenominator}`}
          onChange={(e) => {
            const [num, den] = e.target.value.split('/').map(Number);
            updateScoreMeta({
              timeSignatureNumerator: num,
              timeSignatureDenominator: den,
            });
          }}
          title="Time Signature"
        >
          {TIME_SIGNATURE_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          ))}
        </SmallSelect>

        <SmallSelect
          value={score.keySignature}
          onChange={(e) => updateScoreMeta({ keySignature: e.target.value })}
          title="Key Signature"
        >
          {KEY_SIGNATURE_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </SmallSelect>
      </SectionGroup>

      <Divider />

      {/* Note Values & Durations */}
      <SectionGroup>
        {DURATION_OPTIONS.map((opt) => (
          <DurationButton
            key={opt.type}
            $selected={selectedDuration === opt.type && !isRest}
            onClick={() => {
              setSelectedDuration(opt.type);
              setIsRest(false);
            }}
            title={`${opt.label} Note (${opt.beats} beat${opt.beats > 1 ? 's' : ''})`}
          >
            <span>{opt.symbol}</span>
          </DurationButton>
        ))}

        {/* Dotted Note Toggle */}
        <DurationButton
          $selected={isDotted}
          onClick={() => setIsDotted(!isDotted)}
          title="Dotted Note (+50% duration)"
        >
          <Dot size={20} />
        </DurationButton>

        {/* Rest Toggle */}
        <DurationButton
          $selected={isRest}
          onClick={() => setIsRest(!isRest)}
          title="Rest Note"
        >
          <span style={{ fontSize: '0.9rem' }}>𝄽 Rest</span>
        </DurationButton>
      </SectionGroup>

      <Divider />

      {/* Accidentals */}
      <SectionGroup>
        {ACCIDENTAL_OPTIONS.map((opt) => (
          <AccidentalButton
            key={opt.type}
            $selected={selectedAccidental === opt.type}
            onClick={() => setSelectedAccidental(opt.type)}
            title={opt.label}
          >
            {opt.symbol}
          </AccidentalButton>
        ))}
      </SectionGroup>

      <Divider />

      {/* Editing Tools */}
      <SectionGroup>
        <IconButton
          $active={activeTool === 'input'}
          onClick={() => setActiveTool('input')}
          title="Note Input Tool (Click on staff to place notes)"
        >
          <PenTool size={16} />
        </IconButton>
        <IconButton
          $active={activeTool === 'select'}
          onClick={() => setActiveTool('select')}
          title="Selection Tool (Click to select notes)"
        >
          <MousePointer size={16} />
        </IconButton>
        <IconButton
          $active={activeTool === 'pan'}
          onClick={() => setActiveTool('pan')}
          title="Hand Tool (Click and drag to pan sheet music)"
        >
          <Hand size={16} />
        </IconButton>
        <IconButton
          $active={activeTool === 'erase'}
          onClick={() => setActiveTool('erase')}
          title="Eraser Tool (Click notes to erase)"
        >
          <Eraser size={16} />
        </IconButton>
      </SectionGroup>

      <Divider />

      {/* Lines & Measures Management */}
      <SectionGroup>
        <MeasureBadge>
          Lines: <span>{score.lines.length}</span>
        </MeasureBadge>
        <IconButton onClick={() => addLine()} title="Add Staff Line">
          <Plus size={16} />
        </IconButton>
        <IconButton
          onClick={() => removeLine(score.lines.length - 1)}
          disabled={score.lines.length <= 1}
          title="Remove Last Staff Line"
        >
          <Minus size={16} />
        </IconButton>
      </SectionGroup>

      <Divider />

      {/* Measure Add/Remove */}
      <SectionGroup>
        <MeasureBadge>
          Measures: <span>{score.measures.length}</span>
        </MeasureBadge>
        <IconButton onClick={addMeasure} title="Add Measure">
          <Plus size={16} />
        </IconButton>
        <IconButton
          onClick={() => removeMeasure()}
          disabled={score.measures.length <= 1}
          title="Remove Measure"
        >
          <Minus size={16} />
        </IconButton>
      </SectionGroup>

      <Divider />

      {/* Undo / Redo */}
      <SectionGroup>
        <IconButton onClick={undo} disabled={!canUndo} title="Undo">
          <Undo2 size={16} />
        </IconButton>
        <IconButton onClick={redo} disabled={!canRedo} title="Redo">
          <Redo2 size={16} />
        </IconButton>
      </SectionGroup>
    </ToolbarContainer>
  );
};
