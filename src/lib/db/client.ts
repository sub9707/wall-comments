import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "wall-comments.db");

declare global {
  var __wallCommentsDb: Database.Database | undefined;
}

function createConnection(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      date_key TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_comments_date_key_created_at
      ON comments (date_key, created_at);
  `);

  // Migration: `updated_at` was added after the table already existed on
  // some deployments — add it if missing rather than assuming a fresh DB.
  const columns = db.prepare(`PRAGMA table_info(comments)`).all() as { name: string }[];
  if (!columns.some((c) => c.name === "updated_at")) {
    db.exec(`ALTER TABLE comments ADD COLUMN updated_at TEXT`);
    db.exec(`UPDATE comments SET updated_at = created_at WHERE updated_at IS NULL`);
  }

  return db;
}

// Reuse a single connection across Next.js dev hot-reloads / module reloads
// so we never leak file handles on an app that runs for 8-12 hours straight.
export function getDb(): Database.Database {
  if (!globalThis.__wallCommentsDb) {
    globalThis.__wallCommentsDb = createConnection();
  }
  return globalThis.__wallCommentsDb;
}

export const DB_FILE_PATH = DB_PATH;
export const BACKUP_DIR = path.join(process.cwd(), "backup");
