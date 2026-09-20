import {
  pitchToMidi,
  midiToPitch,
  midiToFrequency,
  INSTRUMENT_RANGES,
  isPitchInInstrumentRange,
  getInstrumentRange,
} from './audio.constants';
import { generateMidiFile } from './midiExport';
import { INITIAL_MOCK_SCORES } from '../mock/scores.data';

describe('Audio helpers and MIDI export', () => {
  it('converts pitch strings to correct MIDI numbers', () => {
    expect(pitchToMidi('C4')).toBe(60);
    expect(pitchToMidi('A4')).toBe(69);
    expect(pitchToMidi('C5')).toBe(72);
    expect(pitchToMidi('C#4')).toBe(61);
    expect(pitchToMidi('Db4')).toBe(61);
    expect(pitchToMidi('B3')).toBe(59);
  });

  it('converts MIDI numbers back to pitch strings', () => {
    expect(midiToPitch(60)).toBe('C4');
    expect(midiToPitch(69)).toBe('A4');
    expect(midiToPitch(72)).toBe('C5');
  });

  it('calculates correct A4 440Hz frequency', () => {
    expect(midiToFrequency(69)).toBeCloseTo(440, 1);
  });

  it('generates standard binary MIDI file buffer', () => {
    const score = INITIAL_MOCK_SCORES[0];
    const midiBytes = generateMidiFile(score);

    expect(midiBytes).toBeInstanceOf(Uint8Array);
    expect(midiBytes.length).toBeGreaterThan(14);

    // Checks 'MThd' header bytes
    expect(midiBytes[0]).toBe(0x4d); // 'M'
    expect(midiBytes[1]).toBe(0x54); // 'T'
    expect(midiBytes[2]).toBe(0x68); // 'h'
    expect(midiBytes[3]).toBe(0x64); // 'd'
  });

  it('validates playable instrument ranges accurately', () => {
    // Clarinet: D3 (MIDI 50) to C7 (MIDI 96)
    const clarinetRange = getInstrumentRange('clarinet');
    expect(clarinetRange.minPitch).toBe('D3');
    expect(clarinetRange.maxPitch).toBe('C7');

    expect(isPitchInInstrumentRange('D3', 'clarinet')).toBe(true);
    expect(isPitchInInstrumentRange('C4', 'clarinet')).toBe(true);
    expect(isPitchInInstrumentRange('A5', 'clarinet')).toBe(true);
    expect(isPitchInInstrumentRange('A6', 'clarinet')).toBe(true);
    expect(isPitchInInstrumentRange('C7', 'clarinet')).toBe(true);
    // C3 is below clarinet's lowest physical acoustic tone
    expect(isPitchInInstrumentRange('C3', 'clarinet')).toBe(false);
    // D7 is above clarinet altissimo register
    expect(isPitchInInstrumentRange('D7', 'clarinet')).toBe(false);

    // Flute: C4 (MIDI 60) to D7 (MIDI 98)
    expect(isPitchInInstrumentRange('C4', 'flute')).toBe(true);
    expect(isPitchInInstrumentRange('B3', 'flute')).toBe(false); // Below flute footjoint

    // Violin: G3 (MIDI 55) to E7 (MIDI 100)
    expect(isPitchInInstrumentRange('G3', 'violin')).toBe(true);
    expect(isPitchInInstrumentRange('F3', 'violin')).toBe(false); // Below lowest open string
  });
});
