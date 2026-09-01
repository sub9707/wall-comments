import { NextResponse } from "next/server";
import { CommentRepository } from "@/lib/db/commentRepository";
import { validateCommentText } from "@/lib/validation/commentValidator";
import { checkRateLimit, getClientKey } from "@/lib/security/rateLimiter";
import { getKstDateKey } from "@/lib/date/kst";
import { PINK_DROP_CONFIG } from "@/lib/config";
import type { PostCommentResponse } from "@/types/comment";

export async function POST(request: Request): Promise<NextResponse<PostCommentResponse>> {
  const clientKey = getClientKey(request);

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

  const recentTexts = CommentRepository.findRecent(5)
    .filter((c) => Date.now() - Date.parse(c.createdAt) < PINK_DROP_CONFIG.duplicateWindowMs)
    .map((c) => c.text);

  const result = validateCommentText(rawText, recentTexts);
  if (!result.valid) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  const dateKey = getKstDateKey();

  try {
    const comment = CommentRepository.insert(result.text, dateKey);
    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "db_error" }, { status: 500 });
  }
}
