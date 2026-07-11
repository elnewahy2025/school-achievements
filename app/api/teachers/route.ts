import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { hashSync } from 'bcryptjs';
import { z } from 'zod';

const createSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username: letters, numbers, underscores only'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required').max(100),
  department: z.string().min(1, 'Department is required'),
  is_admin: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId!) as any;
    if (!account?.is_admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const accounts = db.prepare(
      'SELECT id, username, full_name, department, is_admin, created_at FROM accounts ORDER BY full_name'
    ).all();
    return NextResponse.json(accounts);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const adminAccount = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId!) as any;
    if (!adminAccount?.is_admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    }

    const { username, password, full_name, department, is_admin } = parsed.data;

    const existing = db.prepare('SELECT id FROM accounts WHERE username = ?').get(username);
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const result = db.prepare(
      'INSERT INTO accounts (username, password, full_name, department, is_admin) VALUES (?, ?, ?, ?, ?)'
    ).run(username, hashSync(password, 10), full_name, department, is_admin ? 1 : 0);

    return NextResponse.json({
      id: result.lastInsertRowid,
      username,
      full_name,
      department,
      is_admin: is_admin ? 1 : 0,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
