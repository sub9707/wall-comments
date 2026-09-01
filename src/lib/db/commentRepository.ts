import { randomUUID } from "node:crypto";
import { getDb } from "./client";
import { getKstIsoTimestamp } from "@/lib/date/kst";
import type { Comment } from "@/types/comment";

type CommentRow = {
  id: string;
  text: string;
  created_at: string;
  updated_at: string | null;
  date_key: string;
};

function rowToComment(row: CommentRow): Comment {
  return {
    id: row.id,
    text: row.text,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? row.created_at,
    dateKey: row.date_key,
  };
}

export const CommentRepository = {
  insert(text: string, dateKey: string): Comment {
    const db = getDb();
    const now = getKstIsoTimestamp();
    const comment: Comment = {
      id: randomUUID(),
      text,
      createdAt: now,
      updatedAt: now,
      dateKey,
    };

    db.prepare(
      `INSERT INTO comments (id, text, created_at, updated_at, date_key) VALUES (@id, @text, @createdAt, @updatedAt, @dateKey)`
    ).run({
      id: comment.id,
      text: comment.text,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      dateKey: comment.dateKey,
    });

    return comment;
  },

  findByDateKey(dateKey: string, limit: number): Comment[] {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT id, text, created_at, updated_at, date_key FROM comments
         WHERE date_key = ? ORDER BY created_at DESC, rowid DESC LIMIT ?`
      )
      .all(dateKey, limit) as CommentRow[];

    return rows.map(rowToComment);
  },

  /** Most recent comments across all history, newest first — used for spam/duplicate checks. */
  findRecent(limit: number): Comment[] {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT id, text, created_at, updated_at, date_key FROM comments
         ORDER BY created_at DESC, rowid DESC LIMIT ?`
      )
      .all(limit) as CommentRow[];

    return rows.map(rowToComment);
  },

  findById(id: string): Comment | null {
    const db = getDb();
    const row = db
      .prepare(`SELECT id, text, created_at, updated_at, date_key FROM comments WHERE id = ?`)
      .get(id) as CommentRow | undefined;
    return row ? rowToComment(row) : null;
  },

  countByDateKey(dateKey: string): number {
    const db = getDb();
    const row = db
      .prepare(`SELECT COUNT(*) as count FROM comments WHERE date_key = ?`)
      .get(dateKey) as { count: number };
    return row.count;
  },

  updateText(id: string, text: string): Comment | null {
    const db = getDb();
    const updatedAt = getKstIsoTimestamp();
    const result = db
      .prepare(`UPDATE comments SET text = ?, updated_at = ? WHERE id = ?`)
      .run(text, updatedAt, id);
    if (result.changes === 0) return null;
    return this.findById(id);
  },

  deleteById(id: string): boolean {
    const db = getDb();
    const result = db.prepare(`DELETE FROM comments WHERE id = ?`).run(id);
    return result.changes > 0;
  },

  deleteAllByDateKey(dateKey: string): number {
    const db = getDb();
    const result = db.prepare(`DELETE FROM comments WHERE date_key = ?`).run(dateKey);
    return result.changes;
  },
};
