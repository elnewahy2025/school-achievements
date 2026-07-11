import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { hashSync } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password, full_name } = await request.json();
    if (!username || !password || !full_name) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM accounts WHERE username = ?').get(username);
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    const result = db.prepare('INSERT INTO accounts (username, password, full_name, department, is_admin) VALUES (?, ?, ?, ?, ?)').run(
      username,
      hashSync(password, 10),
      full_name,
      'Administration',
      1
    );

    return NextResponse.json({ id: result.lastInsertRowid, username, full_name, is_admin: 1 }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}
