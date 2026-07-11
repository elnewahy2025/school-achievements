import { NextRequest, NextResponse } from 'next/server';
import { getDb, getAchievementFiles, type Achievement } from '@/lib/db';
import { z } from 'zod';

const querySchema = z.object({
  department: z.string().optional(),
  teacher: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = querySchema.safeParse({
      department: searchParams.get('department') || undefined,
      teacher: searchParams.get('teacher') || undefined,
      search: searchParams.get('search') || undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const { department, teacher, search } = parsed.data;
    const db = getDb();

    let query = 'SELECT * FROM achievements WHERE 1=1';
    const params: any[] = [];

    if (department) {
      query += ' AND department = ?';
      params.push(department);
    }

    if (teacher) {
      query += ' AND teacher_name LIKE ?';
      params.push(`%${teacher}%`);
    }

    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const achievements = db.prepare(query).all(...params) as Achievement[];

    // Attach files
    const result = achievements.map((a) => ({
      ...a,
      files: getAchievementFiles(a.id),
    }));

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
}
