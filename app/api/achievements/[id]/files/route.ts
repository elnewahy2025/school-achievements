import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const achievementId = parseInt(params.id);
    if (isNaN(achievementId)) return NextResponse.json({ error: 'Invalid achievement ID' }, { status: 400 });

    const db = getDb();
    const files = db.prepare('SELECT * FROM files WHERE achievement_id = ?').all(achievementId);
    return NextResponse.json(files);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}
