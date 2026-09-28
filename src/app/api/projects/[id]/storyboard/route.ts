import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { PedagogyAgent } from "@/ai/agents/PedagogyAgent";
import { ApiResponse, Storyboard, Project, Script } from "@/types";

export const maxDuration = 45;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Storyboard | null>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();
    const storyboard = await repo.getStoryboardByProjectId(projectId);
    return NextResponse.json({ ok: true, data: storyboard });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi lấy Storyboard";
    return NextResponse.json(
      { ok: false, error: { code: "GET_STORYBOARD_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ project: Project; storyboard: Storyboard }>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();

    let body: { project?: Project; script?: Script } = {};
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

    let script = await repo.getScriptByProjectId(projectId);
    if (!script && body.script) {
      script = await repo.saveScript({ ...body.script, projectId });
    }
    if (!script) {
      return NextResponse.json(
        { ok: false, error: { code: "NO_SCRIPT", message: "Chưa có kịch bản để tạo Storyboard." } },
        { status: 400 }
      );
    }

    // Phân rã Storyboard & Sinh Prompt Flow/Veo
    const storyboard = PedagogyAgent.generateStoryboard(project, script);
    await repo.saveStoryboard(storyboard);

    // Cập nhật trạng thái dự án
    const updatedProject = await repo.updateProject(projectId, {
      status: "STORYBOARD_READY",
    });

    return NextResponse.json({
      ok: true,
      data: { project: updatedProject, storyboard },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi sinh Storyboard & Video Prompt";
    return NextResponse.json(
      { ok: false, error: { code: "GENERATE_STORYBOARD_FAILED", message } },
      { status: 500 }
    );
  }
}
