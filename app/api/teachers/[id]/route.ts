import { NextRequest, NextResponse } from 'next/server';
import { getDb, getAchievementFiles } from '@/lib/db';
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const db = getDb();
  const teacher = db.prepare('SELECT id, full_name, department, bio, avatar_url, created_at FROM accounts WHERE id = ?').get(params.id) as any;
  if (!teacher) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const achievements = db.prepare('SELECT * FROM achievements WHERE teacher_id = ? ORDER BY created_at DESC').all(teacher.id) as any[];
  const withFiles = achievements.map((a: any) => ({ ...a, files: getAchievementFiles(a.id) }));

  return NextResponse.json({ teacher, achievements: withFiles });
}
