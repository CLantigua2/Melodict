import { NextResponse } from 'next/server';
import { getServerUserId, generateUUID, USER_ID_COOKIE_NAME } from '@/lib/user';
import { getOrCreateUserData, updateUserSettings } from '@/lib/server/storage';

export async function GET(request: Request) {
  try {
    let userId = getServerUserId(request);
    let isNewUser = false;

    if (!userId) {
      userId = generateUUID();
      isNewUser = true;
    }

    const userData = await getOrCreateUserData(userId);

    const response = NextResponse.json({
      success: true,
      data: {
        userId: userData.userId,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
        currentScoreId: userData.currentScoreId,
        theme: userData.theme,
        scoreCount: userData.scores.length,
        scoresSummary: userData.scores.map((s) => ({
          id: s.id,
          title: s.title,
          composer: s.composer,
          updatedAt: s.updatedAt,
        })),
      },
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
      { success: false, error: err.message || 'Failed to retrieve user data' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = getServerUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updated = await updateUserSettings(userId, {
      currentScoreId: body.currentScoreId,
      theme: body.theme,
    });

    return NextResponse.json({
      success: true,
      data: {
        userId: updated.userId,
        currentScoreId: updated.currentScoreId,
        theme: updated.theme,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update user preferences' },
      { status: 400 }
    );
  }
}
