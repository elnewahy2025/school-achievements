import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { unlink, rm } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId!) as any;
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    const achievementId = parseInt(params.id);
    if (isNaN(achievementId)) return NextResponse.json({ error: 'Invalid achievement ID' }, { status: 400 });

    const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId) as any;
    if (!achievement) return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });

    if (!account.is_admin && achievement.teacher_id !== account.id) {
      return NextResponse.json({ error: 'Cannot delete achievements by other teachers' }, { status: 403 });
    }

    // Delete files from disk
    const files = db.prepare('SELECT * FROM files WHERE achievement_id = ?').all(achievementId) as any[];
    for (const file of files) {
      const filePath = path.join(process.cwd(), 'public', 'uploads', String(achievementId), file.stored_name);
      try {
        if (fs.existsSync(filePath)) await unlink(filePath);
      } catch {}
    }

    // Remove achievement directory
    const achDir = path.join(process.cwd(), 'public', 'uploads', String(achievementId));
    try {
      if (fs.existsSync(achDir)) await rm(achDir, { recursive: true, force: true });
    } catch {}

    // Delete from database (files cascade)
    db.prepare('DELETE FROM achievements WHERE id = ?').run(achievementId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete achievement' }, { status: 500 });
  }
}
