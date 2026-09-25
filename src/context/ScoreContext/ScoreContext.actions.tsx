import { Score, ScoreLine } from '@/types/score.types';

export function normalizeScore(raw: Score): Score {
  const layoutMode = raw.layoutMode || 'single';
  if (raw.lines && raw.lines.length > 0) {
    const syncedLines = raw.lines.map((l, lIdx) => ({
      ...l,
      lineIndex: lIdx,
      measures: l.measures.map((m) => ({
        ...m,
        lineIndex: lIdx,
        notes: m.notes.map((n) => ({ ...n, lineIndex: lIdx })),
      })),
    }));
    return {
      ...raw,
      layoutMode,
      lines: syncedLines,
      measures: syncedLines.flatMap((l) => l.measures),
    };
  }

  // Fallback: partition measures into lines of 2 measures
  const measures = raw.measures || [];
  const lines: ScoreLine[] = [];
  const measuresPerLine = 2;
  const numLines = Math.max(1, Math.ceil(measures.length / measuresPerLine));

  for (let l = 0; l < numLines; l++) {
    const lineMeasures = measures
      .slice(l * measuresPerLine, (l + 1) * measuresPerLine)
      .map((m) => ({
        ...m,
        lineIndex: l,
        timeSignatureNumerator: m.timeSignatureNumerator || raw.timeSignatureNumerator || 4,
        timeSignatureDenominator: m.timeSignatureDenominator || raw.timeSignatureDenominator || 4,
        notes: m.notes.map((n) => ({ ...n, lineIndex: l })),
      }));

    lines.push({
      id: `line-${l + 1}`,
      lineIndex: l,
      clef: 'treble',
      timeSignatureNumerator: lineMeasures[0]?.timeSignatureNumerator || raw.timeSignatureNumerator || 4,
      timeSignatureDenominator: lineMeasures[0]?.timeSignatureDenominator || raw.timeSignatureDenominator || 4,
      measures: lineMeasures,
    });
  }

  return {
    ...raw,
    layoutMode,
    lines,
    measures: lines.flatMap((l) => l.measures),
  };
}