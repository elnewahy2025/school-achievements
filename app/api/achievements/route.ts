import { NextRequest, NextResponse } from 'next/server';
import { getDb, type Achievement } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { z } from 'zod';

const createSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
  department: z.string().min(1, 'Department is required'),
  event_date: z.string().optional(),
  categories: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId!) as any;
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    let achievements: Achievement[];
    if (account.is_admin) {
      achievements = db.prepare('SELECT * FROM achievements ORDER BY is_pinned DESC, created_at DESC').all() as Achievement[];
    } else {
      achievements = db.prepare('SELECT * FROM achievements WHERE teacher_id = ? OR department = ? ORDER BY is_pinned DESC, created_at DESC').all(account.id, account.department) as Achievement[];
    }
    const stmt = db.prepare('SELECT * FROM files WHERE achievement_id = ?');
    achievements = achievements.map((a) => ({ ...a, files: stmt.all(a.id) as any[] }));
    return NextResponse.json(achievements);
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId!) as any;
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    const { title, description, department, event_date, categories } = parsed.data;
    const dateValue = event_date && event_date.trim() ? event_date.trim() : null;
    const result = db.prepare('INSERT INTO achievements (title, description, department, teacher_id, teacher_name, event_date, categories) VALUES (?, ?, ?, ?, ?, ?, ?)').run(title, description || '', department, account.id, account.full_name, dateValue, categories || '');
    return NextResponse.json({ id: result.lastInsertRowid, title, description: description || '', department, teacher_id: account.id, teacher_name: account.full_name, event_date: dateValue, is_featured: 0, is_pinned: 0, reactions: '{}', categories: categories || '', files: [] }, { status: 201 });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId!) as any;
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    const body = await request.json();
    const { id, is_featured, is_pinned, categories, ...fields } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
    const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(id) as any;
    if (!achievement) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!account.is_admin && achievement.teacher_id !== account.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const parsed = createSchema.partial().safeParse(fields);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.errors.map((e) => e.message).join(', ') }, { status: 400 });
    const { title, description, department, event_date } = parsed.data;
    const dateValue = event_date !== undefined ? (event_date && event_date.trim() ? event_date.trim() : null) : achievement.event_date;
    const featVal = is_featured !== undefined ? (is_featured ? 1 : 0) : achievement.is_featured;
    const pinVal = is_pinned !== undefined ? (is_pinned ? 1 : 0) : achievement.is_pinned;
    const catVal = categories !== undefined ? categories : achievement.categories;

    db.prepare('UPDATE achievements SET title=?, description=?, department=?, event_date=?, is_featured=?, is_pinned=?, categories=? WHERE id=?').run(
      title ?? achievement.title, description ?? achievement.description, department ?? achievement.department, dateValue, featVal, pinVal, catVal, id
    );
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: 'Failed' }, { status: 500 }); }
}
