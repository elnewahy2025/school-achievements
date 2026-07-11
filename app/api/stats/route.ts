import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
export async function GET() {
  const db = getDb();
  const achievements = db.prepare('SELECT COUNT(*) as c FROM achievements').get() as any;
  const teachers = db.prepare('SELECT COUNT(*) as c FROM accounts WHERE is_admin = 0').get() as any;
  const departments = db.prepare('SELECT COUNT(*) as c FROM departments').get() as any;
  const files = db.prepare('SELECT COUNT(*) as c FROM files').get() as any;
  return NextResponse.json({
    achievements: achievements.c,
    teachers: teachers.c,
    departments: departments.c,
    files: files.c,
  });
}
