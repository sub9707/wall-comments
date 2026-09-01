import { randomBytes } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "wall_comments_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h — matches an event day

declare global {
  var __wallCommentsAdminSessions: Map<string, number> | undefined; // token -> expiresAt
}

function getSessions(): Map<string, number> {
  if (!globalThis.__wallCommentsAdminSessions) {
    globalThis.__wallCommentsAdminSessions = new Map();
  }
  return globalThis.__wallCommentsAdminSessions;
}

export function createAdminSession(): { token: string; expiresAt: number } {
  const sessions = getSessions();
  const token = randomBytes(32).toString("hex");
  const expiresAt = Date.now() + SESSION_TTL_MS;
  sessions.set(token, expiresAt);
  return { token, expiresAt };
}

export function isValidAdminSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const sessions = getSessions();
  const expiresAt = sessions.get(token);
  if (!expiresAt) return false;
  if (expiresAt < Date.now()) {
    sessions.delete(token);
    return false;
  }
  return true;
}

export function destroyAdminSession(token: string | undefined | null): void {
  if (!token) return;
  getSessions().delete(token);
}
