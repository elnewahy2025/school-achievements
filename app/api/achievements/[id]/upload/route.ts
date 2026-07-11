import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionFromCookies } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_PDF_TYPES = ['application/pdf'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const MAX_PDF_SIZE = 20 * 1024 * 1024;

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSessionFromCookies(request.cookies);
    if (!session?.isLoggedIn) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(session.userId!) as any;
    if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

    const achievementId = parseInt(params.id);
    if (isNaN(achievementId)) return NextResponse.json({ error: 'Invalid achievement ID' }, { status: 400 });

    const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId) as any;
    if (!achievement) return NextResponse.json({ error: 'Achievement not found' }, { status: 404 });

    if (!account.is_admin && achievement.teacher_id !== account.id) {
      return NextResponse.json({ error: 'Cannot upload files to other teachers\' achievements' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
    }

    const formData = await request.formData();
    const entries = Array.from(formData.entries());
    const files: File[] = [];
    for (const [key, value] of entries) {
      if (value instanceof File && key === 'files') {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const achDir = path.join(process.cwd(), 'public', 'uploads', String(achievementId));
    await mkdir(achDir, { recursive: true });

    const savedFiles = [];

    for (const file of files) {
      const mimeType = file.type || '';
      const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
      const isPdf = ALLOWED_PDF_TYPES.includes(mimeType);

      if (!isImage && !isPdf) {
        return NextResponse.json({ error: `Invalid file type: ${mimeType}. Allowed: images (jpg/png/webp/gif) and PDFs.` }, { status: 400 });
      }

      const maxSize = isPdf ? MAX_PDF_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        return NextResponse.json({ error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: ${maxSize / 1024 / 1024}MB` }, { status: 400 });
      }

      const ext = file.name.split('.').pop() || (isPdf ? 'pdf' : 'jpg');
      const storedName = `${crypto.randomUUID()}.${ext}`;
      const filePath = path.join(achDir, storedName);

      const arrayBuffer = await file.arrayBuffer();
      await writeFile(filePath, Buffer.from(arrayBuffer));

      const fileType = isPdf ? 'pdf' : 'image';
      const result = db.prepare(
        'INSERT INTO files (achievement_id, file_type, original_name, stored_name, mime_type, size) VALUES (?, ?, ?, ?, ?, ?)'
      ).run(achievementId, fileType, file.name, storedName, mimeType, file.size);

      savedFiles.push({
        id: result.lastInsertRowid,
        file_type: fileType,
        original_name: file.name,
        stored_name: storedName,
        mime_type: mimeType,
        size: file.size,
      });
    }

    return NextResponse.json({ ok: true, files: savedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
