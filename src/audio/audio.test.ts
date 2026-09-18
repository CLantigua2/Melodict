import { pitchToMidi, midiToPitch, midiToFrequency } from './audio.constants';
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
});
