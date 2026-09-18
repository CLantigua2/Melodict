export interface VirtualPianoProps {
  className?: string;
  onKeyClick?: (pitch: string, midi: number) => void;
}
