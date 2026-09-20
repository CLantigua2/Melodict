/**
 * Client & Server User Identification Utility
 *
 * Assigns each anonymous user a unique UUID v4 so their compositions,
 * audio settings, and preferences persist seamlessly on Next.js/Vercel
 * without requiring login friction.
 */

export const USER_ID_STORAGE_KEY = 'melodict_user_id';
export const USER_ID_COOKIE_NAME = 'melodict_user_id';
export const USER_ID_HEADER = 'x-user-id';

/**
 * Validates whether a string matches standard UUID v4 format.
 */
export function isValidUUID(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Generates a random UUID v4 with environment fallbacks.
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Client-side: retrieves existing anonymous user UUID from localStorage or document.cookie,
 * or generates and stores a new one.
 */
export function getOrCreateClientUserId(): string {
  if (typeof window === 'undefined') {
    return generateUUID();
  }

  // 1. Check localStorage
  let userId = localStorage.getItem(USER_ID_STORAGE_KEY);
  if (userId && isValidUUID(userId)) {
    // Ensure cookie is in sync
    setClientCookie(userId);
    return userId;
  }

  // 2. Check document.cookie
  const match = document.cookie.match(new RegExp(`(?:^|; )${USER_ID_COOKIE_NAME}=([^;]*)`));
  if (match && match[1] && isValidUUID(match[1])) {
    userId = decodeURIComponent(match[1]);
    localStorage.setItem(USER_ID_STORAGE_KEY, userId);
    return userId;
  }

  // 3. Generate new UUID
  const newUserId = generateUUID();
  localStorage.setItem(USER_ID_STORAGE_KEY, newUserId);
  setClientCookie(newUserId);
  return newUserId;
}

/**
 * Helper to set client cookie for 1 year with SameSite=Lax.
 */
function setClientCookie(userId: string) {
  if (typeof document === 'undefined') return;
  const maxAge = 60 * 60 * 24 * 365; // 1 year
  document.cookie = `${USER_ID_COOKIE_NAME}=${encodeURIComponent(userId)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Server-side: extracts anonymous user UUID from incoming request headers or cookies.
 * If none or invalid, returns null so handler can generate or respond accordingly.
 */
export function getServerUserId(request: Request): string | null {
  // Check custom header
  const headerId = request.headers.get(USER_ID_HEADER);
  if (headerId && isValidUUID(headerId)) {
    return headerId;
  }

  // Check Cookie header
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|; )${USER_ID_COOKIE_NAME}=([^;]*)`));
  if (match && match[1]) {
    const cookieId = decodeURIComponent(match[1]);
    if (isValidUUID(cookieId)) {
      return cookieId;
    }
  }

  return null;
}
