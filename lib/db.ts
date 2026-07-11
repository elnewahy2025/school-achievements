import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { hashSync } from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'school.db');

let _db: Database.Database | null = null;

function columnExists(db: Database.Database, table: string, column: string): boolean {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as any[];
  return cols.some((c) => c.name === column);
}

export function getDb(): Database.Database {
  if (!_db) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');

    _db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY, value TEXT NOT NULL DEFAULT ''
      );
      CREATE TABLE IF NOT EXISTS departments (
        id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL,
        full_name TEXT NOT NULL, department TEXT NOT NULL, is_admin INTEGER NOT NULL DEFAULT 0,
        bio TEXT NOT NULL DEFAULT '', avatar_url TEXT NOT NULL DEFAULT '', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '',
        department TEXT NOT NULL, teacher_id INTEGER, teacher_name TEXT NOT NULL DEFAULT '',
        event_date TEXT, is_featured INTEGER DEFAULT 0, is_pinned INTEGER DEFAULT 0,
        reactions TEXT NOT NULL DEFAULT '{}', categories TEXT NOT NULL DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT, achievement_id INTEGER NOT NULL,
        file_type TEXT NOT NULL, original_name TEXT NOT NULL, stored_name TEXT NOT NULL,
        mime_type TEXT NOT NULL, size INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS reactions_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT, achievement_id INTEGER NOT NULL,
        emoji TEXT NOT NULL, visitor_id TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(achievement_id, emoji, visitor_id),
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
      );
    `);

    // Migrations for existing databases
    const addCol = (table: string, col: string, def: string) => {
      if (!columnExists(_db!, table, col)) {
        _db!.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
      }
    };
    addCol('accounts', 'bio', "TEXT NOT NULL DEFAULT ''");
    addCol('accounts', 'avatar_url', "TEXT NOT NULL DEFAULT ''");
    addCol('achievements', 'is_featured', 'INTEGER DEFAULT 0');
    addCol('achievements', 'is_pinned', 'INTEGER DEFAULT 0');
    addCol('achievements', 'reactions', "TEXT NOT NULL DEFAULT '{}'");
    addCol('achievements', 'categories', "TEXT NOT NULL DEFAULT ''");

    // Seed defaults
    const ins = _db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
    ins.run('school_name', 'School Achievements');
    ins.run('manager_name', 'School Manager');
    ins.run('phone', '');
    ins.run('address', '');
    ins.run('logo_url', '');
    ins.run('tagline', 'Celebrating Academic & Extracurricular Excellence');

    const hasAdmin = _db.prepare('SELECT COUNT(*) as c FROM accounts WHERE is_admin = 1').get() as any;
    if (hasAdmin.c === 0) {
      _db.prepare('INSERT OR IGNORE INTO accounts (username, password, full_name, department, is_admin) VALUES (?, ?, ?, ?, ?)').run(
        'admin', hashSync('admin123', 10), 'Administrator', 'Administration', 1
      );
    }
    const hasDept = _db.prepare('SELECT COUNT(*) as c FROM departments').get() as any;
    if (hasDept.c === 0) {
      _db.prepare('INSERT OR IGNORE INTO departments (name) VALUES (?)').run('Administration');
    }
  }
  return _db;
}

export type Achievement = {
  id: number; title: string; description: string; department: string;
  teacher_id: number | null; teacher_name: string; event_date: string | null;
  is_featured: number; is_pinned: number; reactions: string; categories: string;
  created_at: string; files: FileRecord[];
};
export type FileRecord = { id: number; achievement_id: number; file_type: string; original_name: string; stored_name: string; mime_type: string; size: number; };
export type Department = { id: number; name: string; created_at: string };
export type Account = { id: number; username: string; password: string; full_name: string; department: string; is_admin: number; bio: string; avatar_url: string; created_at: string; };
export type Settings = Record<string, string>;

export function getSettings(): Settings {
  const rows = getDb().prepare('SELECT key, value FROM settings').all() as any[];
  const s: Settings = {};
  rows.forEach((r) => (s[r.key] = r.value));
  return s;
}

export function getAchievementFiles(achievementId: number): FileRecord[] {
  return getDb().prepare('SELECT * FROM files WHERE achievement_id = ?').all(achievementId) as FileRecord[];
}

export function getAchievement(id: number): Achievement | null {
  const row = getDb().prepare('SELECT * FROM achievements WHERE id = ?').get(id) as any;
  if (!row) return null;
  return { ...row, files: getAchievementFiles(id) };
}
