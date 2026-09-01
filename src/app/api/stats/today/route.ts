import { NextResponse } from "next/server";
import { CommentRepository } from "@/lib/db/commentRepository";
import { getKstDateKey } from "@/lib/date/kst";
import type { StatsTodayResponse } from "@/types/comment";

export async function GET(): Promise<NextResponse<StatsTodayResponse>> {
  const dateKey = getKstDateKey();
  const count = CommentRepository.countByDateKey(dateKey);

  return NextResponse.json({ dateKey, count });
}
