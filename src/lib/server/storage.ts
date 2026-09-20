import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { INITIAL_MOCK_SCORES } from '@/mock/scores.data';
import { Score, ScoreLine, Measure } from '@/types/score.types';

export interface UserData {
  userId: string;
  createdAt: string;
  updatedAt: string;
  currentScoreId?: string;
  theme?: string;
  scores: Score[];
}

// In-memory cache across requests within the same server instance / warm lambda
const memoryCache = new Map<string, UserData>();

/**
 * Resolves the directory for saving user files.
 * Uses os.tmpdir() across both local development and Vercel serverless environments.
 * This prevents the Next.js dev server file-watcher from detecting changes inside
 * the project folder and triggering hot-reload recompilation loops.
 */
function getDataDirectory(): string {
  if (process.env.MELODICT_DATA_DIR) {
    return process.env.MELODICT_DATA_DIR;
  }
  return path.join(os.tmpdir(), 'melodict-users');
}

/**
 * Returns the file path for a user's data file.
 */
function getUserFilePath(userId: string): string {
  const dir = getDataDirectory();
  // Sanitize userId to prevent path traversal
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
  return path.join(dir, `${safeId}.json`);
}

/**
 * Ensures the data directory exists.
 */
async function ensureDirectory(): Promise<void> {
  const dir = getDataDirectory();
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err: any) {
    if (err.code !== 'EEXIST') {
      console.warn('Failed to create storage directory:', err);
    }
  }
}

/**
 * Creates default seed data for a new anonymous user UUID.
 */
function createDefaultUserData(userId: string): UserData {
  const now = new Date().toISOString();
  const initialScores: Score[] = INITIAL_MOCK_SCORES.map((s) => ({
    ...s,
    userId,
    updatedAt: now,
  }));

  return {
    userId,
    createdAt: now,
    updatedAt: now,
    currentScoreId: initialScores[0]?.id || 'score-1',
    theme: 'dark',
    scores: initialScores,
  };
}

/**
 * Loads a user's complete data from memory cache or filesystem.
 * If user does not exist, initializes them with default starter compositions.
 */
export async function getOrCreateUserData(userId: string): Promise<UserData> {
  // 1. Check memory cache
  const cached = memoryCache.get(userId);
  if (cached) {
    return cached;
  }

  // 2. Check filesystem
  const filePath = getUserFilePath(userId);
  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed: UserData = JSON.parse(raw);
    memoryCache.set(userId, parsed);
    return parsed;
  } catch (err: any) {
    // File not found or corrupt: initialize new user data
    const newUserData = createDefaultUserData(userId);
    await saveUserData(newUserData);
    return newUserData;
  }
}

/**
 * Persists user data to both memory cache and filesystem.
 */
export async function saveUserData(userData: UserData): Promise<void> {
  userData.updatedAt = new Date().toISOString();
  memoryCache.set(userData.userId, userData);

  try {
    await ensureDirectory();
    const filePath = getUserFilePath(userData.userId);
    await fs.writeFile(filePath, JSON.stringify(userData, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing user file to disk, relying on memory cache:', err);
  }
}

/**
 * Retrieves all scores belonging to a user.
 */
export async function getUserScores(userId: string): Promise<Score[]> {
  const user = await getOrCreateUserData(userId);
  return user.scores;
}

/**
 * Retrieves a single score by ID for a user.
 */
export async function getScoreById(userId: string, scoreId: string): Promise<Score | null> {
  const user = await getOrCreateUserData(userId);
  return user.scores.find((s) => s.id === scoreId) || null;
}

/**
 * Saves (creates or updates) a score for a user.
 */
export async function saveScore(
  userId: string,
  scorePayload: Partial<Score> & { id?: string }
): Promise<Score> {
  const user = await getOrCreateUserData(userId);
  const now = new Date().toISOString();

  let targetId = scorePayload.id;
  const existingIdx = targetId ? user.scores.findIndex((s) => s.id === targetId) : -1;

  if (existingIdx !== -1) {
    // Update existing score
    const updated: Score = {
      ...user.scores[existingIdx],
      ...scorePayload,
      id: user.scores[existingIdx].id,
      userId,
      updatedAt: now,
    };
    user.scores[existingIdx] = updated;
    await saveUserData(user);
    return updated;
  }

  // Create new score with defaults if lines/measures not provided
  targetId = targetId || `score-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const defaultMeasures: Measure[] = [
    {
      index: 0,
      lineIndex: 0,
      timeSignatureNumerator: scorePayload.timeSignatureNumerator || 4,
      timeSignatureDenominator: scorePayload.timeSignatureDenominator || 4,
      notes: [],
    },
    {
      index: 1,
      lineIndex: 0,
      timeSignatureNumerator: scorePayload.timeSignatureNumerator || 4,
      timeSignatureDenominator: scorePayload.timeSignatureDenominator || 4,
      notes: [],
    },
  ];

  const defaultLines: ScoreLine[] = [
    {
      id: `line-${Date.now()}-1`,
      lineIndex: 0,
      clef: 'treble',
      timeSignatureNumerator: scorePayload.timeSignatureNumerator || 4,
      timeSignatureDenominator: scorePayload.timeSignatureDenominator || 4,
      measures: defaultMeasures,
    },
  ];

  const lines = scorePayload.lines || defaultLines;
  const measures = scorePayload.measures || lines.flatMap((l) => l.measures);

  const newScore: Score = {
    id: targetId,
    title: scorePayload.title || 'Untitled Score',
    composer: scorePayload.composer || 'Anonymous',
    tempo: scorePayload.tempo || 120,
    timeSignatureNumerator: scorePayload.timeSignatureNumerator || 4,
    timeSignatureDenominator: scorePayload.timeSignatureDenominator || 4,
    keySignature: scorePayload.keySignature || 'C',
    instrumentId: scorePayload.instrumentId || 'acoustic_grand_piano',
    layoutMode: scorePayload.layoutMode || 'single',
    lines,
    measures,
    userId,
    createdAt: scorePayload.createdAt || now,
    updatedAt: now,
  };

  user.scores.unshift(newScore);
  user.currentScoreId = newScore.id;
  await saveUserData(user);
  return newScore;
}

/**
 * Deletes a score by ID for a user.
 */
export async function deleteScore(userId: string, scoreId: string): Promise<boolean> {
  const user = await getOrCreateUserData(userId);
  const initialLength = user.scores.length;
  user.scores = user.scores.filter((s) => s.id !== scoreId);

  if (user.scores.length === initialLength) {
    return false;
  }

  if (user.currentScoreId === scoreId) {
    user.currentScoreId = user.scores[0]?.id;
  }

  await saveUserData(user);
  return true;
}

/**
 * Updates top-level preferences for the user.
 */
export async function updateUserSettings(
  userId: string,
  settings: Partial<Omit<UserData, 'userId' | 'createdAt' | 'scores'>>
): Promise<UserData> {
  const user = await getOrCreateUserData(userId);
  Object.assign(user, settings);
  await saveUserData(user);
  return user;
}
