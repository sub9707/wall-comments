import { NextResponse } from "next/server";
import { CommentRepository } from "@/lib/db/commentRepository";
import { validateCommentText } from "@/lib/validation/commentValidator";
import { checkRateLimit, getClientKey } from "@/lib/security/rateLimiter";
import type { PatchCommentResponse } from "@/types/comment";

/**
 * Public delete: any visitor can click a bubble on the main wall and
 * remove it (confirmed by the user for this event — see WallUI's
 * delete-confirm modal). Separate from /api/admin/comments/[id], which
 * requires an admin session; this one is intentionally open but still
 * rate-limited per IP so a script can't mass-delete the wall.
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  const clientKey = `delete:${getClientKey(request)}`;
  const { allowed } = checkRateLimit(clientKey);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  const { id } = await params;
  const deleted = CommentRepository.deleteById(id);

  if (!deleted) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

/**
 * Public edit — same open-access model as delete. Duplicate-text
 * checking is skipped here (unlike POST): re-saving similar wording on
 * an edit shouldn't be blocked as spam.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<PatchCommentResponse>> {
  const clientKey = `edit:${getClientKey(request)}`;
  const { allowed } = checkRateLimit(clientKey);
  if (!allowed) {
    return NextResponse.json({ success: false, error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid_json" }, { status: 400 });
  }

  const rawText = typeof body === "object" && body !== null ? (body as Record<string, unknown>).text : undefined;
  const result = validateCommentText(rawText, []);
  if (!result.valid) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  const { id } = await params;
  const updated = CommentRepository.updateText(id, result.text);

  if (!updated) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, comment: updated });
}
