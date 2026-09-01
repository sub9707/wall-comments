import { NextResponse } from "next/server";
import { CommentRepository } from "@/lib/db/commentRepository";
import { requireAdminSession } from "@/lib/security/requireAdmin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  if (!(await requireAdminSession())) {
    return NextResponse.json({ success: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = CommentRepository.deleteById(id);

  if (!deleted) {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
