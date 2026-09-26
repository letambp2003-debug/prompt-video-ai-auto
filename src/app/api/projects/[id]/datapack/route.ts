import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { ApiResponse, DataPack } from "@/types";

export const maxDuration = 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<DataPack | null>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();
    const dataPack = await repo.getDataPackByProjectId(projectId);

    return NextResponse.json({ ok: true, data: dataPack });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi lấy thông tin DATA PACK.";
    return NextResponse.json(
      { ok: false, error: { code: "GET_DATAPACK_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<DataPack>>> {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const repo = getProjectRepository();

    const existing = await repo.getDataPackByProjectId(projectId);
    const updatedDataPack: DataPack = {
      id: existing?.id || body.id || `dp_${projectId}_v1`,
      projectId,
      version: existing?.version || body.version || 1,
      status: existing?.status || body.status || "DRAFT",
      payload: body.payload || body,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await repo.saveDataPack(updatedDataPack);
    return NextResponse.json({ ok: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi cập nhật DATA PACK.";
    return NextResponse.json(
      { ok: false, error: { code: "UPDATE_DATAPACK_FAILED", message } },
      { status: 500 }
    );
  }
}
