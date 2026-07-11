import { NextRequest, NextResponse } from 'next/server';
import { getDb, type Account } from '@/lib/db';
import { createSession, COOKIE_NAME, loginSchema } from '@/lib/auth';
import { compareSync } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { username, password } = parsed.data;
    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE username = ?').get(username) as Account | undefined;

    if (!account || !compareSync(password, account.password)) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const token = await createSession(account.id);
    const response = NextResponse.json({
      user: {
        id: account.id,
        username: account.username,
        full_name: account.full_name,
        department: account.department,
        is_admin: account.is_admin,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
