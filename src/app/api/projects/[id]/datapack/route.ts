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
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: { code: "DATAPACK_NOT_FOUND", message: "DATA PACK chưa tồn tại để cập nhật." } },
        { status: 404 }
      );
    }

    const updatedDataPack: DataPack = {
      ...existing,
      ...body,
      projectId,
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
