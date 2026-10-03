import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { ApiResponse, Project, DataPack, Script, Storyboard, QCReport } from "@/types";
import { generateExportPackage } from "@/utils/exportGenerator";

export const maxDuration = 30;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ markdown: string; promptPack: string; jsonPackage: object }>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();

    const project = await repo.getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { ok: false, error: { code: "PROJECT_NOT_FOUND", message: "Không tìm thấy dự án." } },
        { status: 404 }
      );
    }

    const dataPack = await repo.getDataPackByProjectId(projectId);
    const script = await repo.getScriptByProjectId(projectId);
    const storyboard = await repo.getStoryboardByProjectId(projectId);
    const qc = await repo.getLatestQCReport(projectId);

    try {
      await repo.updateProject(projectId, { status: "COMPLETED" });
    } catch {
      // Ignore
    }

    const exportPackage = generateExportPackage(project, dataPack, script, storyboard, qc);

    return NextResponse.json({
      ok: true,
      data: exportPackage,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi xuất bản hồ sơ sản xuất";
    return NextResponse.json(
      { ok: false, error: { code: "EXPORT_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ markdown: string; promptPack: string; jsonPackage: object }>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();

    let body: {
      project?: Project;
      dataPack?: DataPack;
      script?: Script;
      storyboard?: Storyboard;
      qc?: QCReport;
    } = {};

    try {
      body = await req.json();
    } catch {
      // Empty body
    }

    let project = await repo.getProjectById(projectId);
    if (!project && body.project) {
      try {
        project = await repo.upsertProject({ ...body.project, id: projectId });
      } catch {
        project = body.project;
      }
    }
    if (!project && body.project) {
      project = body.project;
    }
    if (!project) {
      return NextResponse.json(
        { ok: false, error: { code: "PROJECT_NOT_FOUND", message: "Không tìm thấy dự án." } },
        { status: 404 }
      );
    }

    let dataPack = await repo.getDataPackByProjectId(projectId);
    if (!dataPack && body.dataPack) {
      try {
        dataPack = await repo.saveDataPack({ ...body.dataPack, projectId });
      } catch {
        dataPack = body.dataPack;
      }
    }
    if (!dataPack && body.dataPack) dataPack = body.dataPack;

    let script = await repo.getScriptByProjectId(projectId);
    if (!script && body.script) {
      try {
        script = await repo.saveScript({ ...body.script, projectId });
      } catch {
        script = body.script;
      }
    }
    if (!script && body.script) script = body.script;

    let storyboard = await repo.getStoryboardByProjectId(projectId);
    if (!storyboard && body.storyboard) {
      try {
        storyboard = await repo.saveStoryboard({ ...body.storyboard, projectId });
      } catch {
        storyboard = body.storyboard;
      }
    }
    if (!storyboard && body.storyboard) storyboard = body.storyboard;

    let qc = await repo.getLatestQCReport(projectId);
    if (!qc && body.qc) {
      try {
        qc = await repo.saveQCReport({ ...body.qc, projectId });
      } catch {
        qc = body.qc;
      }
    }
    if (!qc && body.qc) qc = body.qc;

    try {
      await repo.updateProject(projectId, { status: "COMPLETED" });
    } catch {
      // Ignore
    }

    const exportPackage = generateExportPackage(project, dataPack, script, storyboard, qc);

    return NextResponse.json({
      ok: true,
      data: exportPackage,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi xuất bản hồ sơ sản xuất";
    return NextResponse.json(
      { ok: false, error: { code: "EXPORT_FAILED", message } },
      { status: 500 }
    );
  }
}
