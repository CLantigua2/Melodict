'use client';

import React, { useState } from 'react';
import { Volume2, Music2 } from 'lucide-react';
import { useScore } from '@/context/ScoreContext';
import { AudioEngine } from '@/audio/AudioEngine';
import { DEFAULT_PIANO_KEYS } from './VirtualPiano.constants';
import { VirtualPianoProps } from './VirtualPiano.types';
import {
  PianoContainer,
  PianoHeader,
  PianoTitle,
  KeysScrollWrapper,
  KeyboardRoll,
  WhiteKey,
  BlackKey,
  KeyLabel,
} from './VirtualPiano.styles';

export const VirtualPiano: React.FC<VirtualPianoProps> = ({ onKeyClick }) => {
  const {
    activeMidiNotes,
    activeTool,
    addNote,
    score,
    selectedNoteId,
    updateSelectedNote,
    playheadLine,
    playheadMeasure,
    playheadBeat,
  } = useScore();

  const [pressedMidis, setPressedMidis] = useState<Set<number>>(new Set());

  // Split keys into white keys and black keys with absolute positioning
  const whiteKeys = DEFAULT_PIANO_KEYS.filter((k) => !k.isBlack);
  const whiteKeyWidth = 32;

  // Map each white key MIDI to its index in whiteKeys array
  const whiteKeyIndices = new Map<number, number>();
  whiteKeys.forEach((k, idx) => {
    whiteKeyIndices.set(k.midi, idx);
  });

  const blackKeys = DEFAULT_PIANO_KEYS.filter((k) => k.isBlack).map((bk) => {
    // The black key sits after the preceding white key (bk.midi - 1)
    const prevWhiteIdx = whiteKeyIndices.get(bk.midi - 1) ?? 0;
    // Offset black key centered over the border between white keys
    const leftOffset = 3 + (prevWhiteIdx + 1) * whiteKeyWidth - 10;
    return {
      ...bk,
      leftOffset,
    };
  });

  const handleKeyDown = async (pitch: string, midi: number) => {
    setPressedMidis((prev) => new Set(prev).add(midi));
    await AudioEngine.unlockAudio();
    AudioEngine.playNote({ pitch, duration: 0.5, velocity: 100 });

    if (onKeyClick) {
      onKeyClick(pitch, midi);
    } else if (selectedNoteId) {
      // If a note is currently selected, update its pitch!
      updateSelectedNote({ pitch });
    } else if (activeTool === 'input') {
      // Place note onto score at current measure/beat!
      const targetLine = score.lines[playheadLine] || score.lines[0];
      addNote(
        playheadMeasure,
        playheadBeat,
        pitch,
        targetLine?.clef || 'treble',
        playheadLine
      );
    }
  };

  const handleKeyUp = (midi: number) => {
    setPressedMidis((prev) => {
      const next = new Set(prev);
      next.delete(midi);
      return next;
    });
    AudioEngine.stopPitch(midi);
  };

  return (
    <PianoContainer>
      <PianoHeader>
        <PianoTitle>
          <Music2 size={14} />
          <span>Interactive Piano Keyboard (C3 - C6)</span>
        </PianoTitle>
        <div>Click or drag keys to play sound &amp; input notes onto the staff</div>
      </PianoHeader>

      <KeysScrollWrapper>
        <KeyboardRoll style={{ width: `${whiteKeys.length * whiteKeyWidth + 6}px` }}>
          {/* White Keys */}
          {whiteKeys.map((k) => {
            const isPlaying = activeMidiNotes.includes(k.midi);
            const isPressed = pressedMidis.has(k.midi);
            const isActive = isPlaying || isPressed;
            const isC = k.pitch.startsWith('C') && !k.pitch.includes('#');

            return (
              <WhiteKey
                key={k.midi}
                $isActive={isActive}
                onMouseDown={() => handleKeyDown(k.pitch, k.midi)}
                onMouseUp={() => handleKeyUp(k.midi)}
                onMouseLeave={() => handleKeyUp(k.midi)}
                title={k.pitch}
              >
                <KeyLabel $isC={isC}>{k.keyLabel}</KeyLabel>
              </WhiteKey>
            );
          })}

          {/* Black Keys */}
          {blackKeys.map((bk) => {
            const isPlaying = activeMidiNotes.includes(bk.midi);
            const isPressed = pressedMidis.has(bk.midi);
            const isActive = isPlaying || isPressed;

            return (
              <BlackKey
                key={bk.midi}
                $isActive={isActive}
                $leftOffset={bk.leftOffset}
                onMouseDown={() => handleKeyDown(bk.pitch, bk.midi)}
                onMouseUp={() => handleKeyUp(bk.midi)}
                onMouseLeave={() => handleKeyUp(bk.midi)}
                title={bk.pitch}
              />
            );
          })}
        </KeyboardRoll>
      </KeysScrollWrapper>
    </PianoContainer>
  );
};
