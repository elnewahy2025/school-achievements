import { NextRequest, NextResponse } from 'next/server';
import { getDb, getAchievementFiles, type Achievement } from '@/lib/db';
import { z } from 'zod';

const querySchema = z.object({
  department: z.string().optional(),
  teacher: z.string().optional(),
  search: z.string().optional(),
  featured: z.string().optional(),
  recent: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      department: searchParams.get('department') || undefined,
      teacher: searchParams.get('teacher') || undefined,
      search: searchParams.get('search') || undefined,
      featured: searchParams.get('featured') || undefined,
      recent: searchParams.get('recent') || undefined,
    });
    if (!parsed.success) return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
    const { department, teacher, search, featured, recent } = parsed.data;
    const db = getDb();

    let query = 'SELECT * FROM achievements WHERE 1=1';
    const params: any[] = [];

    if (department) { query += ' AND department = ?'; params.push(department); }
    if (teacher) { query += ' AND teacher_name LIKE ?'; params.push(`%${teacher}%`); }
    if (search) { query += ' AND (title LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
    if (featured === '1') { query += ' AND is_featured = 1'; }
    if (recent === '1') { query += " AND created_at >= datetime('now', '-7 days')"; }

    query += ' ORDER BY is_pinned DESC, created_at DESC';
    const achievements = db.prepare(query).all(...params) as Achievement[];
    const result = achievements.map((a) => ({ ...a, files: getAchievementFiles(a.id) }));
    return NextResponse.json(result);
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
