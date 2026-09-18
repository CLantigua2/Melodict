import { NextResponse } from 'next/server';
import { INITIAL_MOCK_SCORES } from '@/mock/scores.data';
import { Score } from '@/types/score.types';

let scoresStore: Score[] = [...INITIAL_MOCK_SCORES];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const score = scoresStore.find((s) => s.id === id);

  if (!score) {
    return NextResponse.json(
      { success: false, error: 'Score not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: score,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body: Partial<Score> = await request.json();
    const index = scoresStore.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Score not found' },
        { status: 404 }
      );
    }

    const updatedScore: Score = {
      ...scoresStore[index],
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };

    scoresStore[index] = updatedScore;

    return NextResponse.json({
      success: true,
      data: updatedScore,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update score' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const index = scoresStore.findIndex((s) => s.id === id);

  if (index === -1) {
    return NextResponse.json(
      { success: false, error: 'Score not found' },
      { status: 404 }
    );
  }

  const removed = scoresStore.splice(index, 1)[0];

  return NextResponse.json({
    success: true,
    data: removed,
  });
}
