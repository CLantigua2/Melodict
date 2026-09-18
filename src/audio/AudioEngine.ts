import {
  InstrumentId,
  NotePlayOptions,
  ScheduledNoteItem,
} from './audio.types';
import { midiToFrequency, pitchToMidi } from './audio.constants';

type StopFn = () => void;

class AudioEngineClass {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentInstrumentId: InstrumentId = 'acoustic_grand_piano';
  private smplrInstance: any = null;
  private activeVoices: Map<number, StopFn[]> = new Map();
  private activeMetronomeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private scheduledTimeouts: number[] = [];
  private isLoadingSamples: boolean = false;
  private volume: number = 0.8;

  public async unlockAudio(): Promise<AudioContext> {
    const ctx = this.init();
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('AudioContext resume failed:', err);
      }
    }
    return ctx;
  }

  public init(): AudioContext {
    if (typeof window === 'undefined') {
      throw new Error('AudioContext can only be initialized in the browser');
    }

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      if (typeof window !== 'undefined') {
        (window as any).__MELODICT_AUDIO__ = this;
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public getContext(): AudioContext | null {
    return this.ctx;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.02);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public async loadInstrument(id: InstrumentId): Promise<void> {
    this.currentInstrumentId = id;
    if (typeof window === 'undefined') return;

    const ctx = await this.unlockAudio();
    this.isLoadingSamples = true;

    try {
      const smplr = await import('smplr');

      let instance: any = null;
      // Map instrument IDs to reliable high-quality soundfonts
      const soundfontMap: Record<InstrumentId, string> = {
        acoustic_grand_piano: 'acoustic_grand_piano',
        electric_piano: 'electric_piano_1',
        string_ensemble_1: 'string_ensemble_1',
        violin: 'violin',
        flute: 'flute',
        acoustic_guitar_nylon: 'acoustic_guitar_nylon',
        marimba: 'marimba',
        synth_lead: 'lead_1_square',
      };

      const soundfontName = soundfontMap[id] || 'acoustic_grand_piano';
      instance = new smplr.Soundfont(ctx, {
        instrument: soundfontName as any,
        destination: this.masterGain ?? ctx.destination,
      });

      await instance.load;
      this.smplrInstance = instance;
    } catch (err) {
      console.warn('smplr instrument loading encountered error or offline, fallback synthesis active:', err);
    } finally {
      this.isLoadingSamples = false;
    }
  }

  public playNote(opts: NotePlayOptions): StopFn {
    const ctx = this.init();
    const midi = typeof opts.pitch === 'number' ? opts.pitch : pitchToMidi(opts.pitch);
    const duration = opts.duration ?? 0.5;
    const velocity = opts.velocity ?? 90;
    const startTime = opts.time ?? ctx.currentTime;

    // Use smplr if loaded and ready
    if (this.smplrInstance && typeof this.smplrInstance.start === 'function') {
      try {
        const stopVoice = this.smplrInstance.start({
          note: midi,
          velocity,
          time: startTime,
          duration,
        });

        const stopHandler = () => {
          if (typeof stopVoice === 'function') stopVoice();
          else if (this.smplrInstance.stop) this.smplrInstance.stop(midi);
        };

        this.trackVoice(midi, stopHandler);
        return stopHandler;
      } catch (err) {
        console.warn('Error in smplr start, falling back to Web Audio oscillator', err);
      }
    }

    // High quality Web Audio Synth Fallback (low-latency, zero-dependency)
    return this.playFallbackSynthNote(midi, startTime, duration, velocity);
  }

  private playFallbackSynthNote(
    midi: number,
    startTime: number,
    duration: number,
    velocity: number
  ): StopFn {
    if (!this.ctx || !this.masterGain) return () => {};

    const freq = midiToFrequency(midi);
    const gainNode = this.ctx.createGain();
    gainNode.connect(this.masterGain);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();

    // Instrument character modulation
    if (this.currentInstrumentId === 'electric_piano') {
      osc1.type = 'sine';
      osc2.type = 'triangle';
      osc2.detune.setValueAtTime(4, startTime);
    } else if (this.currentInstrumentId === 'string_ensemble_1' || this.currentInstrumentId === 'violin') {
      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc2.detune.setValueAtTime(8, startTime);
    } else if (this.currentInstrumentId === 'flute') {
      osc1.type = 'sine';
      osc2.type = 'triangle';
    } else if (this.currentInstrumentId === 'marimba') {
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 4, startTime);
    } else {
      // Default piano-like rich timbre
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc2.detune.setValueAtTime(2, startTime);
    }

    osc1.frequency.setValueAtTime(freq, startTime);
    osc2.frequency.setValueAtTime(freq, startTime);

    const amp = (velocity / 127) * 0.4;
    const attack = 0.015;
    const decay = duration * 0.4;
    const sustain = amp * 0.4;
    const release = 0.08;

    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(amp, startTime + attack);
    gainNode.gain.exponentialRampToValueAtTime(Math.max(sustain, 0.0001), startTime + attack + decay);
    gainNode.gain.setValueAtTime(Math.max(sustain, 0.0001), startTime + duration);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration + release);

    osc1.connect(gainNode);
    osc2.connect(gainNode);

    osc1.start(startTime);
    osc2.start(startTime);

    const stopTime = startTime + duration + release + 0.05;
    osc1.stop(stopTime);
    osc2.stop(stopTime);

    const stopHandler = () => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      gainNode.gain.cancelScheduledValues(now);
      gainNode.gain.setValueAtTime(gainNode.gain.value, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
      setTimeout(() => {
        try {
          osc1.stop();
          osc2.stop();
          gainNode.disconnect();
        } catch (_) {}
      }, 60);
    };

    this.trackVoice(midi, stopHandler);
    return stopHandler;
  }

  public playMetronomeTick(isDownbeat: boolean, time?: number) {
    const ctx = this.init();
    if (!this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = time ?? ctx.currentTime;

    osc.type = isDownbeat ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(isDownbeat ? 1760 : 880, startTime);

    const peak = isDownbeat ? 0.45 : 0.28;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.035);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + 0.04);

    const nodeEntry = { osc, gain };
    this.activeMetronomeNodes.push(nodeEntry);
    const cleanupDelay = Math.max(60, (startTime - ctx.currentTime + 0.1) * 1000);
    setTimeout(() => {
      const idx = this.activeMetronomeNodes.indexOf(nodeEntry);
      if (idx !== -1) this.activeMetronomeNodes.splice(idx, 1);
    }, cleanupDelay);
  }

  public stopMetronome() {
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.activeMetronomeNodes.forEach(({ osc, gain }) => {
        try {
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(0.0001, now);
          osc.stop(now + 0.01);
          osc.disconnect();
          gain.disconnect();
        } catch (_) {}
      });
    }
    this.activeMetronomeNodes = [];
  }

  private trackVoice(midi: number, stopFn: StopFn) {
    const list = this.activeVoices.get(midi) || [];
    list.push(stopFn);
    this.activeVoices.set(midi, list);
  }

  public stopPitch(pitchOrMidi: string | number) {
    const midi = typeof pitchOrMidi === 'number' ? pitchOrMidi : pitchToMidi(pitchOrMidi);
    const list = this.activeVoices.get(midi);
    if (list) {
      list.forEach((fn) => fn());
      this.activeVoices.delete(midi);
    }
  }

  public stopAll() {
    this.stopMetronome();
    this.activeVoices.forEach((list) => {
      list.forEach((fn) => fn());
    });
    this.activeVoices.clear();

    if (this.smplrInstance && typeof this.smplrInstance.stop === 'function') {
      try {
        this.smplrInstance.stop();
      } catch (_) {}
    }

    this.scheduledTimeouts.forEach((id) => clearTimeout(id));
    this.scheduledTimeouts = [];
  }

  public getInstrumentId(): InstrumentId {
    return this.currentInstrumentId;
  }

  public isInstrumentLoading(): boolean {
    return this.isLoadingSamples;
  }
}

export const AudioEngine = new AudioEngineClass();
