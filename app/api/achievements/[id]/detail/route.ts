import { NextRequest, NextResponse } from 'next/server';
import { getDb, getAchievement } from '@/lib/db';
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const achievement = getAchievement(parseInt(params.id));
  if (!achievement) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Get teacher info
  const teacher = achievement.teacher_id ? db.prepare('SELECT id, full_name, department, bio, avatar_url FROM accounts WHERE id = ?').get(achievement.teacher_id) : null;
  return NextResponse.json({ ...achievement, teacher });
}
