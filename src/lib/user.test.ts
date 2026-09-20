import { generateUUID, isValidUUID, getServerUserId, USER_ID_HEADER, USER_ID_COOKIE_NAME } from './user';

describe('User identification utility', () => {
  it('generates valid UUID v4 strings', () => {
    const uuid1 = generateUUID();
    const uuid2 = generateUUID();

    expect(isValidUUID(uuid1)).toBe(true);
    expect(isValidUUID(uuid2)).toBe(true);
    expect(uuid1).not.toBe(uuid2);
  });

  it('validates UUID strings correctly', () => {
    expect(isValidUUID('c9bf9e57-1685-4c89-bafb-ff5af830be8a')).toBe(true);
    expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    expect(isValidUUID('invalid-uuid-string')).toBe(false);
    expect(isValidUUID('')).toBe(false);
    expect(isValidUUID(null as any)).toBe(false);
  });

  it('extracts user ID from request header', () => {
    const validUuid = 'c9bf9e57-1685-4c89-bafb-ff5af830be8a';
    const req = new Request('http://localhost:3000/api/scores', {
      headers: { [USER_ID_HEADER]: validUuid },
    });

    const extracted = getServerUserId(req);
    expect(extracted).toBe(validUuid);
  });

  it('extracts user ID from request cookies when header is omitted', () => {
    const validUuid = '550e8400-e29b-41d4-a716-446655440000';
    const req = new Request('http://localhost:3000/api/scores', {
      headers: { cookie: `other_cookie=xyz; ${USER_ID_COOKIE_NAME}=${validUuid}; theme=dark` },
    });

    const extracted = getServerUserId(req);
    expect(extracted).toBe(validUuid);
  });

  it('returns null if request has no valid user ID', () => {
    const req = new Request('http://localhost:3000/api/scores', {
      headers: { cookie: 'other_cookie=xyz' },
    });

    const extracted = getServerUserId(req);
    expect(extracted).toBeNull();
  });
});
