import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { ApiResponse, Project, DataPack } from "@/types";

export const maxDuration = 30;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ project: Project; dataPack: DataPack }>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();

    let body: { project?: Project; dataPack?: DataPack } = {};
    try {
      body = await req.json();
    } catch {
      // Empty
    }

    let dataPack = await repo.getDataPackByProjectId(projectId);
    if (!dataPack && body.dataPack) {
      dataPack = await repo.saveDataPack({ ...body.dataPack, projectId });
    }

    if (!dataPack) {
      return NextResponse.json(
        { ok: false, error: { code: "DATAPACK_NOT_FOUND", message: "Chưa có DATA PACK để xác nhận." } },
        { status: 404 }
      );
    }

    // 1. Cập nhật trạng thái DATA PACK thành APPROVED
    const approvedDataPack: DataPack = {
      ...dataPack,
      status: "APPROVED",
      updatedAt: new Date().toISOString(),
    };
    await repo.saveDataPack(approvedDataPack);

    // 2. Chuyển trạng thái dự án thành DATA_PACK_APPROVED
    let project = await repo.getProjectById(projectId);
    if (!project && body.project) {
      project = await repo.upsertProject({ ...body.project, id: projectId });
    }
    const updatedProject = await repo.updateProject(projectId, {
      status: "DATA_PACK_APPROVED",
    });

    return NextResponse.json({
      ok: true,
      data: {
        project: updatedProject,
        dataPack: approvedDataPack,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi xác nhận DATA PACK.";
    return NextResponse.json(
      { ok: false, error: { code: "APPROVE_DATAPACK_FAILED", message } },
      { status: 500 }
    );
  }
}
