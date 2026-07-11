import { NextRequest, NextResponse } from 'next/server';
import { getDb, getSettings } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { z } from 'zod';

const updateSchema = z.object({
  school_name: z.string().max(200).optional(),
  manager_name: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  logo_url: z.string().max(500).optional(),
  tagline: z.string().max(500).optional(),
});

export async function GET() {
  return NextResponse.json(getSettings());
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId!) as any;
    if (!account?.is_admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [key, value] of Object.entries(parsed.data)) {
      if (value !== undefined) {
        upsert.run(key, String(value));
      }
    }

    return NextResponse.json(getSettings());
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
