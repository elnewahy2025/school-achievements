import { sealData, unsealData } from 'iron-session';
import { z } from 'zod';

export interface SessionData {
  userId?: number;
  isLoggedIn?: boolean;
}

const SESSION_SECRET = process.env.SESSION_SECRET || 'fallback-secret-change-me-must-be-at-least-32-characters-long';
const COOKIE_NAME = 'school-achievements-session';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export { loginSchema, COOKIE_NAME };

export async function createSession(userId: number): Promise<string> {
  return sealData({ userId, isLoggedIn: true } satisfies SessionData, {
    password: SESSION_SECRET,
    ttl: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getSessionFromCookies(cookies: { get: (name: string) => { value: string | undefined } | undefined }): Promise<SessionData | null> {
  try {
    const token = cookies.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return await unsealData<SessionData>(token, { password: SESSION_SECRET });
  } catch {
    return null;
  }
}
