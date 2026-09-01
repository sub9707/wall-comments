import { NextResponse } from "next/server";
import { CommentRepository } from "@/lib/db/commentRepository";
import { requireAdminSession } from "@/lib/security/requireAdmin";
import { getKstDateKey } from "@/lib/date/kst";

/**
 * Deletes ALL of today's comments from the database. This is
 * destructive and separate from "clear screen" (which only resets the
 * on-screen visualization). Requires an explicit confirm flag from the
 * client to reduce the chance of an accidental tap wiping event data.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const confirm = typeof body === "object" && body !== null ? (body as Record<string, unknown>).confirm : undefined;
  if (confirm !== true) {
    return NextResponse.json({ success: false, error: "confirmation_required" }, { status: 400 });
  }

  const dateKey = getKstDateKey();
  const deletedCount = CommentRepository.deleteAllByDateKey(dateKey);

  return NextResponse.json({ success: true, dateKey, deletedCount });
}
