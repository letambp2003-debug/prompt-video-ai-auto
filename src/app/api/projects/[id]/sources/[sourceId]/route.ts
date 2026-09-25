import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { ApiResponse } from "@/types";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; sourceId: string }> }
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const { sourceId } = await params;
    const repo = getProjectRepository();
    const deleted = await repo.deleteSourceFile(sourceId);

    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: { code: "SOURCE_NOT_FOUND", message: "Không tìm thấy tệp để xóa." } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: { deleted: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi xóa tệp nguồn";
    return NextResponse.json(
      { ok: false, error: { code: "DELETE_SOURCE_FAILED", message } },
      { status: 500 }
    );
  }
}
