import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { getDb, BACKUP_DIR } from "@/lib/db/client";
import { requireAdminSession } from "@/lib/security/requireAdmin";
import { getKstDateKey } from "@/lib/date/kst";

export async function POST(): Promise<NextResponse> {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const dateKey = getKstDateKey();
  const timestamp = Date.now();
  const fileName = `wall-comments-${dateKey}-${timestamp}.db`;
  const filePath = path.join(BACKUP_DIR, fileName);

  try {
    // better-sqlite3's built-in hot-backup API — safe to call while the
    // main connection is live and being written to.
    await getDb().backup(filePath);
    return NextResponse.json({ success: true, fileName });
  } catch {
    return NextResponse.json({ success: false, error: "backup_failed" }, { status: 500 });
  }
}
