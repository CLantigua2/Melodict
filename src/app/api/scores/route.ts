import { NextResponse } from 'next/server';
import { INITIAL_MOCK_SCORES } from '@/mock/scores.data';
import { Score, CreateScoreDTO } from '@/types/score.types';

// In-memory store initialized from mock data
let scoresStore: Score[] = [...INITIAL_MOCK_SCORES];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: scoresStore,
  });
}

export async function POST(request: Request) {
  try {
    const body: CreateScoreDTO = await request.json();

    const defaultMeasures = [
      {
        index: 0,
        lineIndex: 0,
        timeSignatureNumerator: body.timeSignatureNumerator || 4,
        timeSignatureDenominator: body.timeSignatureDenominator || 4,
        notes: [],
      },
      {
        index: 1,
        lineIndex: 0,
        timeSignatureNumerator: body.timeSignatureNumerator || 4,
        timeSignatureDenominator: body.timeSignatureDenominator || 4,
        notes: [],
      },
    ];

    const defaultLines = [
      {
        id: `line-${Date.now()}-1`,
        lineIndex: 0,
        clef: 'treble' as const,
        timeSignatureNumerator: body.timeSignatureNumerator || 4,
        timeSignatureDenominator: body.timeSignatureDenominator || 4,
        measures: defaultMeasures,
      },
    ];

    const lines = body.lines || defaultLines;
    const measures = body.measures || lines.flatMap((l) => l.measures);

    const newScore: Score = {
      id: `score-${Date.now()}`,
      title: body.title || 'Untitled Composition',
      composer: body.composer || 'Anonymous',
      tempo: body.tempo || 120,
      timeSignatureNumerator: body.timeSignatureNumerator || 4,
      timeSignatureDenominator: body.timeSignatureDenominator || 4,
      keySignature: body.keySignature || 'C',
      instrumentId: body.instrumentId || 'acoustic_grand_piano',
      lines,
      measures,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    scoresStore.unshift(newScore);

    return NextResponse.json({
      success: true,
      data: newScore,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Invalid score payload' },
      { status: 400 }
    );
  }
}
