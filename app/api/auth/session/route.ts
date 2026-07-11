import { NextRequest, NextResponse } from 'next/server';
import { getDb, type Account } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn || !session.userId) {
      return NextResponse.json({ user: null });
    }

    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId) as Account | undefined;
    if (!account) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: account.id,
        username: account.username,
        full_name: account.full_name,
        department: account.department,
        is_admin: account.is_admin,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
