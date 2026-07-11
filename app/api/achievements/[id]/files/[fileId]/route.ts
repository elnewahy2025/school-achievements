import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { unlink } from 'fs/promises';
import path from 'path';
import fs from 'fs';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId!) as any;
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    const achievementId = parseInt(params.id);
    const fileId = parseInt(params.fileId);
    if (isNaN(achievementId) || isNaN(fileId)) {
      return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
    }

    const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId) as any;
    if (!achievement) return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });

    if (!account.is_admin && achievement.teacher_id !== account.id) {
      return NextResponse.json({ error: 'Cannot modify other teachers\' achievements' }, { status: 403 });
    }

    const file = db.prepare('SELECT * FROM files WHERE id = ? AND achievement_id = ?').get(fileId, achievementId) as any;
    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });

    // Delete from disk
    const filePath = path.join(process.cwd(), 'public', 'uploads', String(achievementId), file.stored_name);
    try {
      if (fs.existsSync(filePath)) await unlink(filePath);
    } catch {}

    // Delete from database
    db.prepare('DELETE FROM files WHERE id = ?').run(fileId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
