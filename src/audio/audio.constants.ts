import { InstrumentOption, InstrumentId, InstrumentRange } from './audio.types';

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
    id: 'clarinet',
    name: 'Bb Clarinet',
    category: 'Winds',
    description: 'Warm, woody acoustic soprano clarinet',
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

/**
 * Standard acoustic/physical playable pitch ranges for each instrument in Melodict.
 * MIDI values and standard pitch designations.
 */
export const INSTRUMENT_RANGES: Record<InstrumentId, InstrumentRange> = {
  // Full 88-key acoustic concert grand: A0 (MIDI 21) to C8 (MIDI 108)
  acoustic_grand_piano: { minPitch: 'A0', maxPitch: 'C8', minMidi: 21, maxMidi: 108 },
  // Electric piano: E1 (MIDI 28) to C7 (MIDI 96)
  electric_piano: { minPitch: 'E1', maxPitch: 'C7', minMidi: 28, maxMidi: 96 },
  // Full orchestral string section (Basses up through Violins): C2 (MIDI 36) to C7 (MIDI 96)
  string_ensemble_1: { minPitch: 'C2', maxPitch: 'C7', minMidi: 36, maxMidi: 96 },
  // Solo Violin: lowest open string is G3 (MIDI 55); upper professional range E7 (MIDI 100) or higher
  violin: { minPitch: 'G3', maxPitch: 'E7', minMidi: 55, maxMidi: 100 },
  // Concert Flute: C4 (MIDI 60) up through D7 (MIDI 98)
  flute: { minPitch: 'C4', maxPitch: 'D7', minMidi: 60, maxMidi: 98 },
  // Bb Soprano Clarinet: sounding range D3 (MIDI 50, written E3) up to C7 (MIDI 96, altissimo register)
  clarinet: { minPitch: 'D3', maxPitch: 'C7', minMidi: 50, maxMidi: 96, writtenTranspositionSemitones: -2 },
  // Classical Nylon Guitar: lowest 6th string E2 (MIDI 40) up through high B5 (MIDI 71)
  acoustic_guitar_nylon: { minPitch: 'E2', maxPitch: 'B5', minMidi: 40, maxMidi: 71 },
  // Concert Rosewood Marimba: C2 (MIDI 36) to C7 (MIDI 96)
  marimba: { minPitch: 'C2', maxPitch: 'C7', minMidi: 36, maxMidi: 96 },
  // Analog Synth Lead: C1 (MIDI 24) to C8 (MIDI 108)
  synth_lead: { minPitch: 'C1', maxPitch: 'C8', minMidi: 24, maxMidi: 108 },
};

/**
 * Checks whether a given pitch is within the playable range of the specified instrument.
 */
export function isPitchInInstrumentRange(pitch: string, instrumentId: InstrumentId = 'acoustic_grand_piano'): boolean {
  const midi = pitchToMidi(pitch);
  const range = INSTRUMENT_RANGES[instrumentId] || INSTRUMENT_RANGES.acoustic_grand_piano;
  return midi >= range.minMidi && midi <= range.maxMidi;
}

/**
 * Returns playable range definition for an instrument.
 */
export function getInstrumentRange(instrumentId: InstrumentId): InstrumentRange {
  return INSTRUMENT_RANGES[instrumentId] || INSTRUMENT_RANGES.acoustic_grand_piano;
}
