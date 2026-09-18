export type InstrumentId =
  | 'acoustic_grand_piano'
  | 'electric_piano'
  | 'string_ensemble_1'
  | 'violin'
  | 'flute'
  | 'acoustic_guitar_nylon'
  | 'marimba'
  | 'synth_lead';

export interface InstrumentOption {
  id: InstrumentId;
  name: string;
  category: 'Keyboard' | 'Strings' | 'Winds' | 'Percussion' | 'Plucked' | 'Synth';
  description: string;
}

export interface NotePlayOptions {
  pitch: string | number; // e.g. "C4", "F#5", or MIDI 60
  duration?: number;      // in seconds
  velocity?: number;      // 0 to 127
  time?: number;          // audioContext audio scheduling time (seconds)
}

export interface ScheduledNoteItem {
  id: string;
  pitch: string;
  midi: number;
  timeOffsetSeconds: number;
  durationSeconds: number;
  velocity: number;
}

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'loading';
