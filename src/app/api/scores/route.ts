import { NextResponse } from 'next/server';
import { getServerUserId, generateUUID, USER_ID_COOKIE_NAME } from '@/lib/user';
import { getUserScores, saveScore } from '@/lib/server/storage';
import { CreateScoreDTO } from '@/types/score.types';

export async function GET(request: Request) {
  try {
    let userId = getServerUserId(request);
    let isNewUser = false;

    if (!userId) {
      userId = generateUUID();
      isNewUser = true;
    }

    const scores = await getUserScores(userId);

    const response = NextResponse.json({
      success: true,
      userId,
      data: scores,
    });

    if (isNewUser) {
      response.cookies.set(USER_ID_COOKIE_NAME, userId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to retrieve scores' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let userId = getServerUserId(request);
    let isNewUser = false;

    if (!userId) {
      userId = generateUUID();
      isNewUser = true;
    }

    const body: CreateScoreDTO = await request.json();
    const newScore = await saveScore(userId, body);

    const response = NextResponse.json(
      {
        success: true,
        userId,
        data: newScore,
      },
      { status: 201 }
    );

    if (isNewUser) {
      response.cookies.set(USER_ID_COOKIE_NAME, userId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Invalid score payload' },
      { status: 400 }
    );
  }
}
