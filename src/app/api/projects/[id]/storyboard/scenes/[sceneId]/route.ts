import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { ApiResponse, Scene } from "@/types";

export const maxDuration = 30;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; sceneId: string }> }
): Promise<NextResponse<ApiResponse<Scene>>> {
  try {
    const { sceneId } = await params;
    const body = await req.json();
    const repo = getProjectRepository();

    const updated = await repo.updateScene(sceneId, body);

    return NextResponse.json({ ok: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi cập nhật Scene";
    return NextResponse.json(
      { ok: false, error: { code: "UPDATE_SCENE_FAILED", message } },
      { status: 500 }
    );
  }
}
