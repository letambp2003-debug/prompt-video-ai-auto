import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { PedagogyAgent } from "@/ai/agents/PedagogyAgent";
import { ApiResponse, Concept, Project, DataPack } from "@/types";

export const maxDuration = 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Concept[]>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();
    const concepts = await repo.getConceptsByProjectId(projectId);
    return NextResponse.json({ ok: true, data: concepts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi lấy danh sách ý tưởng";
    return NextResponse.json(
      { ok: false, error: { code: "GET_CONCEPTS_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ project: Project; concepts: Concept[] }>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();

    let body: { project?: Project; dataPack?: DataPack } = {};
    try {
      body = await req.json();
    } catch {
      // Empty
    }

    let project = await repo.getProjectById(projectId);
    if (!project && body.project) {
      project = await repo.upsertProject({ ...body.project, id: projectId });
    }
    if (!project) {
      return NextResponse.json(
        { ok: false, error: { code: "PROJECT_NOT_FOUND", message: "Không tìm thấy dự án." } },
        { status: 404 }
      );
    }

    let dataPack = await repo.getDataPackByProjectId(projectId);
    if (!dataPack && body.dataPack) {
      dataPack = await repo.saveDataPack({ ...body.dataPack, projectId });
    }
    if (!dataPack) {
      return NextResponse.json(
        { ok: false, error: { code: "NO_DATAPACK", message: "Vui lòng phân tích và duyệt DATA PACK trước." } },
        { status: 400 }
      );
    }

    // 1. Sinh 3 Concepts
    const concepts = PedagogyAgent.generateConcepts(project, dataPack);
    await repo.saveConcepts(projectId, concepts);

    // 2. Cập nhật trạng thái dự án
    const updatedProject = await repo.updateProject(projectId, {
      status: "CONCEPTS_READY",
      selectedMode: concepts[0].mode,
    });

    return NextResponse.json({
      ok: true,
      data: { project: updatedProject, concepts },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi tạo ý tưởng Concept";
    return NextResponse.json(
      { ok: false, error: { code: "GENERATE_CONCEPTS_FAILED", message } },
      { status: 500 }
    );
  }
}
