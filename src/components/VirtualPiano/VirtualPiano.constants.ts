export interface PianoKeyData {
  midi: number;
  pitch: string;
  isBlack: boolean;
  keyLabel: string;
}

// Generate standard 2-octave to 3-octave keyboard (e.g. C3 to C6, MIDI 48 to 84)
export function generatePianoKeys(startMidi = 48, endMidi = 84): PianoKeyData[] {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const keys: PianoKeyData[] = [];

  for (let midi = startMidi; midi <= endMidi; midi++) {
    const noteIndex = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1;
    const name = noteNames[noteIndex];
    const isBlack = name.includes('#');
    const pitch = `${name}${octave}`;

    keys.push({
      midi,
      pitch,
      isBlack,
      keyLabel: isBlack ? '' : pitch,
    });
  }

  return keys;
}

export const DEFAULT_PIANO_KEYS = generatePianoKeys(48, 84); // C3 to C6
