import { NoteDurationType, AccidentalType, DynamicMarking } from '@/types/score.types';

export interface DurationOption {
  type: NoteDurationType;
  label: string;
  symbol: string;
  beats: number;
}

export const DURATION_OPTIONS: DurationOption[] = [
  { type: 'whole', label: 'Whole', symbol: '𝅝', beats: 4 },
  { type: 'half', label: 'Half', symbol: '𝅗𝅥', beats: 2 },
  { type: 'quarter', label: 'Quarter', symbol: '𝅘𝅥', beats: 1 },
  { type: 'eighth', label: 'Eighth', symbol: '𝅘𝅥𝅯', beats: 0.5 },
  { type: 'sixteenth', label: 'Sixteenth', symbol: '𝅘𝅥𝅰', beats: 0.25 },
];

export interface AccidentalOption {
  type: AccidentalType;
  label: string;
  symbol: string;
}

export const ACCIDENTAL_OPTIONS: AccidentalOption[] = [
  { type: 'none', label: 'None', symbol: '—' },
  { type: 'sharp', label: 'Sharp', symbol: '♯' },
  { type: 'flat', label: 'Flat', symbol: '♭' },
  { type: 'natural', label: 'Natural', symbol: '♮' },
];

export interface DynamicOption {
  value: DynamicMarking;
  label: string;
  italicSymbol: string;
}

export const DYNAMIC_OPTIONS: DynamicOption[] = [
  { value: 'pp', label: 'Pianissimo (pp)', italicSymbol: 'pp' },
  { value: 'p', label: 'Piano (p)', italicSymbol: 'p' },
  { value: 'mp', label: 'Mezzo-piano (mp)', italicSymbol: 'mp' },
  { value: 'mf', label: 'Mezzo-forte (mf)', italicSymbol: 'mf' },
  { value: 'f', label: 'Forte (f)', italicSymbol: 'f' },
  { value: 'ff', label: 'Fortissimo (ff)', italicSymbol: 'ff' },
];

export const TIME_SIGNATURE_OPTIONS = [
  { num: 4, den: 4, label: '4/4' },
  { num: 3, den: 4, label: '3/4' },
  { num: 2, den: 4, label: '2/4' },
  { num: 6, den: 8, label: '6/8' },
];

export const KEY_SIGNATURE_OPTIONS = [
  { key: 'C', label: 'C Major / A Minor' },
  { key: 'G', label: 'G Major (1♯)' },
  { key: 'D', label: 'D Major (2♯)' },
  { key: 'A', label: 'A Major (3♯)' },
  { key: 'F', label: 'F Major (1♭)' },
  { key: 'Bb', label: 'B♭ Major (2♭)' },
  { key: 'Eb', label: 'E♭ Major (3♭)' },
];
