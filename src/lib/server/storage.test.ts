import {
  getOrCreateUserData,
  getUserScores,
  getScoreById,
  saveScore,
  deleteScore,
  updateUserSettings,
} from './storage';

describe('Server Storage Layer', () => {
  const testUserId = 'test-user-12345-abcde';

  it('initializes new user with default mock scores', async () => {
    const userData = await getOrCreateUserData(testUserId);

    expect(userData.userId).toBe(testUserId);
    expect(userData.scores.length).toBeGreaterThanOrEqual(2);
    expect(userData.scores[0].title).toBeDefined();

    const scores = await getUserScores(testUserId);
    expect(scores.length).toBe(userData.scores.length);
  });

  it('saves a new score for the user and retrieves it', async () => {
    const created = await saveScore(testUserId, {
      title: 'My Custom Symphony',
      composer: 'Test Author',
      tempo: 140,
    });

    expect(created.id).toBeDefined();
    expect(created.title).toBe('My Custom Symphony');
    expect(created.tempo).toBe(140);
    expect(created.userId).toBe(testUserId);

    const fetched = await getScoreById(testUserId, created.id);
    expect(fetched).not.toBeNull();
    expect(fetched?.title).toBe('My Custom Symphony');
  });

  it('updates an existing score', async () => {
    const created = await saveScore(testUserId, {
      title: 'Initial Title',
    });

    const updated = await saveScore(testUserId, {
      id: created.id,
      title: 'Updated Title',
      tempo: 132,
    });

    expect(updated.id).toBe(created.id);
    expect(updated.title).toBe('Updated Title');
    expect(updated.tempo).toBe(132);

    const fetched = await getScoreById(testUserId, created.id);
    expect(fetched?.title).toBe('Updated Title');
  });

  it('deletes an existing score', async () => {
    const created = await saveScore(testUserId, {
      title: 'Score to delete',
    });

    const deleted = await deleteScore(testUserId, created.id);
    expect(deleted).toBe(true);

    const fetched = await getScoreById(testUserId, created.id);
    expect(fetched).toBeNull();
  });

  it('updates top-level user settings', async () => {
    const updatedUser = await updateUserSettings(testUserId, {
      theme: 'midnight',
    });

    expect(updatedUser.theme).toBe('midnight');
  });
});
