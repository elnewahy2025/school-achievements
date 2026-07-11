import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function getVisitorId(request: NextRequest): string {
  const cookie = request.cookies.get('visitor_id')?.value;
  if (cookie) return cookie;
  return crypto.randomUUID();
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db = getDb();
    const achievementId = parseInt(params.id);
    if (isNaN(achievementId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const { emoji } = await request.json();
    if (!emoji) return NextResponse.json({ error: 'Emoji required' }, { status: 400 });

    const visitorId = getVisitorId(request);

    // Try to insert reaction (unique constraint prevents duplicates)
    try {
      db.prepare('INSERT INTO reactions_log (achievement_id, emoji, visitor_id) VALUES (?, ?, ?)').run(achievementId, emoji, visitorId);
    } catch {
      // Already reacted with this emoji — remove it (toggle)
      db.prepare('DELETE FROM reactions_log WHERE achievement_id = ? AND emoji = ? AND visitor_id = ?').run(achievementId, emoji, visitorId);
    }

    // Recount reactions
    const counts = db.prepare('SELECT emoji, COUNT(*) as count FROM reactions_log WHERE achievement_id = ? GROUP BY emoji').all(achievementId) as any[];
    const reactions: Record<string, number> = {};
    counts.forEach((r) => { reactions[r.emoji] = r.count; });

    db.prepare('UPDATE achievements SET reactions = ? WHERE id = ?').run(JSON.stringify(reactions), achievementId);

    const response = NextResponse.json({ reactions });
    response.cookies.set('visitor_id', visitorId, { httpOnly: true, maxAge: 60 * 60 * 24 * 365, path: '/' });
    return response;
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
