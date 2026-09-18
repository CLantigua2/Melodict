import { InstrumentOption } from './audio.types';

export const INSTRUMENT_OPTIONS: InstrumentOption[] = [
  {
    id: 'acoustic_grand_piano',
    name: 'Concert Grand Piano',
    category: 'Keyboard',
    description: 'Rich acoustic Steinway grand piano sample library',
  },
  {
    id: 'electric_piano',
    name: 'Rhodes Electric Piano',
    category: 'Keyboard',
    description: 'Warm vintage electric piano with bell-like transients',
  },
  {
    id: 'string_ensemble_1',
    name: 'String Ensemble',
    category: 'Strings',
    description: 'Lush orchestral string section with sustained vibrato',
  },
  {
    id: 'violin',
    name: 'Solo Violin',
    category: 'Strings',
    description: 'Expressive acoustic solo violin',
  },
  {
    id: 'flute',
    name: 'Concert Flute',
    category: 'Winds',
    description: 'Airy melodic acoustic concert flute',
  },
  {
    id: 'acoustic_guitar_nylon',
    name: 'Classical Guitar',
    category: 'Plucked',
    description: 'Warm nylon-string classical acoustic guitar',
  },
  {
    id: 'marimba',
    name: 'Rosewood Marimba',
    category: 'Percussion',
    description: 'Resonant wooden bar pitched percussion mallet',
  },
  {
    id: 'synth_lead',
    name: 'Analog Synth Lead',
    category: 'Synth',
    description: 'Classic warm analog sawtooth lead with filter envelope',
  },
];

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function pitchToMidi(pitch: string): number {
  const match = pitch.trim().match(/^([A-Ga-g])([#b]?)(-?\d+)$/);
  if (!match) return 60; // Default C4

  let [, noteLetter, accidental, octaveStr] = match;
  noteLetter = noteLetter.toUpperCase();
  const octave = parseInt(octaveStr, 10);

  const baseOffsets: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  let semitone = baseOffsets[noteLetter] ?? 0;
  if (accidental === '#') semitone += 1;
  else if (accidental === 'b') semitone -= 1;

  return (octave + 1) * 12 + semitone;
}

export function midiToPitch(midi: number): string {
  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${NOTE_NAMES[noteIndex]}${octave}`;
}

export function midiToFrequency(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}
