import { NextResponse } from "next/server";
import { CommentRepository } from "@/lib/db/commentRepository";
import { checkRateLimit, getClientKey } from "@/lib/security/rateLimiter";
import { getKstDateKey } from "@/lib/date/kst";

/**
 * Public "전체 제거" — deletes ALL of today's comments, permanently.
 * Same open-access model as the per-bubble delete (confirmed by the
 * user), but the blast radius is the whole wall, so the client must
 * always send an explicit confirm flag (see ClearAllModal.tsx) and
 * this only ever touches the current KST day, never history.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const clientKey = `clear-today:${getClientKey(request)}`;
  const { allowed } = checkRateLimit(clientKey);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
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
