import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { PedagogyAgent } from "@/ai/agents/PedagogyAgent";
import { ApiResponse, Script, Project, DataPack, Concept } from "@/types";

export const maxDuration = 45;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Script | null>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();
    const script = await repo.getScriptByProjectId(projectId);
    return NextResponse.json({ ok: true, data: script });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi lấy kịch bản";
    return NextResponse.json(
      { ok: false, error: { code: "GET_SCRIPT_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ project: Project; script: Script }>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();

    let body: { project?: Project; dataPack?: DataPack; conceptId?: string } = {};
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
        { ok: false, error: { code: "NO_DATAPACK", message: "Chưa có DATA PACK." } },
        { status: 400 }
      );
    }

    // Lấy Concept đã chọn
    let concepts = await repo.getConceptsByProjectId(projectId);
    let selectedConcept = concepts.find((c) => c.isSelected);

    if (!selectedConcept && body.conceptId) {
      selectedConcept = concepts.find((c) => c.id === body.conceptId);
    }

    if (!selectedConcept) {
      // Tự động tạo concepts nếu chưa có
      concepts = PedagogyAgent.generateConcepts(project, dataPack);
      await repo.saveConcepts(projectId, concepts);
      selectedConcept = concepts[0];
    }

    // Sinh Kịch bản
    const script = PedagogyAgent.generateScript(project, dataPack, selectedConcept);
    await repo.saveScript(script);

    // Cập nhật trạng thái dự án
    const updatedProject = await repo.updateProject(projectId, {
      status: "SCRIPT_READY",
    });

    return NextResponse.json({
      ok: true,
      data: { project: updatedProject, script },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi sinh kịch bản phân đoạn";
    return NextResponse.json(
      { ok: false, error: { code: "GENERATE_SCRIPT_FAILED", message } },
      { status: 500 }
    );
  }
}
