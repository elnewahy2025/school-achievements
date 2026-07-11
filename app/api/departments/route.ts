import { NextRequest, NextResponse } from 'next/server';
import { getDb, type Department } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { z } from 'zod';

const createSchema = z.object({ name: z.string().min(1, 'Department name is required').max(100) });

export async function GET() {
  const departments = getDb().prepare('SELECT * FROM departments ORDER BY name').all() as Department[];
  return NextResponse.json(departments);
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId!) as any;
    if (!account?.is_admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { name } = parsed.data;
    const existing = db.prepare('SELECT id FROM departments WHERE name = ?').get(name);
    if (existing) {
      return NextResponse.json({ error: 'Department already exists' }, { status: 409 });
    }

    const result = db.prepare('INSERT INTO departments (name) VALUES (?)').run(name);
    return NextResponse.json({ id: result.lastInsertRowid, name }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId!) as any;
    if (!account?.is_admin) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Department ID required' }, { status: 400 });

    const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(id) as Department | undefined;
    if (!dept) return NextResponse.json({ error: 'Department not found' }, { status: 404 });

    const accountsInDept = db.prepare('SELECT COUNT(*) as c FROM accounts WHERE department = ?').get(dept.name) as any;
    if (accountsInDept.c > 0) {
      return NextResponse.json({ error: `Cannot delete: ${accountsInDept.c} account(s) in this department` }, { status: 409 });
    }

    const achievementsInDept = db.prepare('SELECT COUNT(*) as c FROM achievements WHERE department = ?').get(dept.name) as any;
    if (achievementsInDept.c > 0) {
      return NextResponse.json({ error: `Cannot delete: ${achievementsInDept.c} achievement(s) in this department` }, { status: 409 });
    }

    db.prepare('DELETE FROM departments WHERE id = ?').run(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
