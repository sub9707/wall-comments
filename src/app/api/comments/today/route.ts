import { NextResponse } from "next/server";
import { CommentRepository } from "@/lib/db/commentRepository";
import { getKstDateKey } from "@/lib/date/kst";
import { PINK_DROP_CONFIG } from "@/lib/config";
import type { CommentsTodayResponse } from "@/types/comment";

export async function GET(): Promise<NextResponse<CommentsTodayResponse>> {
  const dateKey = getKstDateKey();
  const comments = CommentRepository.findByDateKey(dateKey, PINK_DROP_CONFIG.todayFetchLimit);
  const count = CommentRepository.countByDateKey(dateKey);

  return NextResponse.json({ success: true, dateKey, count, comments });
}
