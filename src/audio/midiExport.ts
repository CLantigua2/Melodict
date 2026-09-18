import { Score } from '@/types/score.types';
import { pitchToMidi } from './audio.constants';

function writeVarInt(value: number): number[] {
  let buffer = value & 0x7f;
  const bytes: number[] = [];

  while ((value >>= 7)) {
    buffer <<= 8;
    buffer |= (value & 0x7f) | 0x80;
  }

  while (true) {
    bytes.push(buffer & 0xff);
    if (buffer & 0x80) buffer >>= 8;
    else break;
  }

  return bytes;
}

export function generateMidiFile(score: Score): Uint8Array {
  const ticksPerBeat = 480;
  const bpm = score.tempo || 120;
  const usPerBeat = Math.round(60000000 / bpm);

  // Events: { tick: number, bytes: number[] }
  interface TimedEvent {
    tick: number;
    bytes: number[];
  }

  const events: TimedEvent[] = [];

  // Track Name meta event
  const titleBytes = Array.from(new TextEncoder().encode(score.title || 'Melodict Score'));
  events.push({
    tick: 0,
    bytes: [0xff, 0x03, ...writeVarInt(titleBytes.length), ...titleBytes],
  });

  // Tempo meta event
  events.push({
    tick: 0,
    bytes: [
      0xff,
      0x51,
      0x03,
      (usPerBeat >> 16) & 0xff,
      (usPerBeat >> 8) & 0xff,
      usPerBeat & 0xff,
    ],
  });

  // Time Signature meta event: numerator, denominator as power of 2 (e.g. 4 -> 2, 8 -> 3), clocks, 32nds
  const num = score.timeSignatureNumerator || 4;
  const denPower = Math.round(Math.log2(score.timeSignatureDenominator || 4));
  events.push({
    tick: 0,
    bytes: [0xff, 0x58, 0x04, num, denPower, 24, 8],
  });

  // Collect notes and compute absolute tick timings
  let currentMeasureStartBeat = 0;
  (score.measures || []).forEach((m) => {
    const beatsInMeasure = m.timeSignatureNumerator * (4 / m.timeSignatureDenominator);

    (m.notes || []).forEach((note) => {
      if (note.isRest) return;

      const midi = pitchToMidi(note.pitch);
      let durationBeats = 1;
      if (note.duration === 'whole') durationBeats = 4;
      else if (note.duration === 'half') durationBeats = 2;
      else if (note.duration === 'quarter') durationBeats = 1;
      else if (note.duration === 'eighth') durationBeats = 0.5;
      else if (note.duration === 'sixteenth') durationBeats = 0.25;

      if (note.dotted) durationBeats *= 1.5;

      const startTick = Math.round((currentMeasureStartBeat + note.beatPosition) * ticksPerBeat);
      const endTick = Math.round(startTick + durationBeats * ticksPerBeat);

      // Note on
      events.push({
        tick: startTick,
        bytes: [0x90, midi, 95],
      });

      // Note off
      events.push({
        tick: endTick,
        bytes: [0x80, midi, 0],
      });
    });

    currentMeasureStartBeat += beatsInMeasure;
  });

  // Sort events by tick
  events.sort((a, b) => a.tick - b.tick);

  // Convert to delta-time format
  const trackBytes: number[] = [];
  let lastTick = 0;

  events.forEach((ev) => {
    const delta = Math.max(0, ev.tick - lastTick);
    lastTick = ev.tick;
    trackBytes.push(...writeVarInt(delta));
    trackBytes.push(...ev.bytes);
  });

  // End of Track meta event
  trackBytes.push(0x00, 0xff, 0x2f, 0x00);

  // Construct MThd header (14 bytes)
  const header = [
    0x4d, 0x54, 0x68, 0x64, // 'MThd'
    0x00, 0x00, 0x00, 0x06, // length = 6
    0x00, 0x00,             // format 0 (single track)
    0x00, 0x01,             // 1 track
    (ticksPerBeat >> 8) & 0xff,
    ticksPerBeat & 0xff,
  ];

  // Construct MTrk track chunk
  const trackLength = trackBytes.length;
  const trackHeader = [
    0x4d, 0x54, 0x72, 0x6b, // 'MTrk'
    (trackLength >> 24) & 0xff,
    (trackLength >> 16) & 0xff,
    (trackLength >> 8) & 0xff,
    trackLength & 0xff,
  ];

  return new Uint8Array([...header, ...trackHeader, ...trackBytes]);
}
