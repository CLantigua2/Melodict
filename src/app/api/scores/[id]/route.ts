import { NextResponse } from 'next/server';
import { getServerUserId, generateUUID } from '@/lib/user';
import { getScoreById, saveScore, deleteScore } from '@/lib/server/storage';
import { Score } from '@/types/score.types';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getServerUserId(request) || generateUUID();
    const { id } = params;
    const score = await getScoreById(userId, id);

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
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to get score' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const userId = getServerUserId(request) || generateUUID();
    const body: Partial<Score> = await request.json();

    const updatedScore = await saveScore(userId, {
      ...body,
      id,
    });

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
  try {
    const userId = getServerUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const removed = await deleteScore(userId, id);

    if (!removed) {
      return NextResponse.json(
        { success: false, error: 'Score not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { id, deleted: true },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete score' },
      { status: 500 }
    );
  }
}
