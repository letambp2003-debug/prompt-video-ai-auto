import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { PedagogyAgent } from "@/ai/agents/PedagogyAgent";
import { ApiResponse, QCReport, Project, DataPack, Script, Storyboard } from "@/types";

export const maxDuration = 45;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<QCReport | null>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();
    const report = await repo.getLatestQCReport(projectId);
    return NextResponse.json({ ok: true, data: report });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi lấy báo cáo QC";
    return NextResponse.json(
      { ok: false, error: { code: "GET_QC_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ project: Project; qcReport: QCReport }>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();

    let body: { project?: Project; dataPack?: DataPack; script?: Script; storyboard?: Storyboard } = {};
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

    let script = await repo.getScriptByProjectId(projectId);
    if (!script && body.script) {
      script = await repo.saveScript({ ...body.script, projectId });
    }

    let storyboard = await repo.getStoryboardByProjectId(projectId);
    if (!storyboard && body.storyboard) {
      storyboard = await repo.saveStoryboard({ ...body.storyboard, projectId });
    }

    if (!dataPack || !script || !storyboard) {
      return NextResponse.json(
        { ok: false, error: { code: "INCOMPLETE_PIPELINE", message: "Cần hoàn thiện Kịch bản và Storyboard trước khi kiểm tra QC." } },
        { status: 400 }
      );
    }

    // Chạy QC 5 chiều
    const qcReport = PedagogyAgent.generateQCReport(project, dataPack, script, storyboard);
    await repo.saveQCReport(qcReport);

    // Cập nhật trạng thái dự án
    const updatedProject = await repo.updateProject(projectId, {
      status: "QC_READY",
    });

    return NextResponse.json({
      ok: true,
      data: { project: updatedProject, qcReport },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi kiểm tra chất lượng QC";
    return NextResponse.json(
      { ok: false, error: { code: "RUN_QC_FAILED", message } },
      { status: 500 }
    );
  }
}
