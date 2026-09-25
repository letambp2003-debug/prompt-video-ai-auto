import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { SourceAnalyzerAgent } from "@/ai/agents/SourceAnalyzerAgent";
import { ApiResponse, Project, DataPack } from "@/types";

export const maxDuration = 60;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ project: Project; dataPack: DataPack }>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();

    const project = await repo.getProjectById(projectId);
    if (!project) {
      return NextResponse.json(
        { ok: false, error: { code: "PROJECT_NOT_FOUND", message: "Không tìm thấy dự án để phân tích." } },
        { status: 404 }
      );
    }

    const sources = await repo.getSourceFilesByProjectId(projectId);
    if (sources.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: "NO_SOURCES", message: "Vui lòng tải lên ít nhất 1 tài liệu bài học trước khi phân tích." } },
        { status: 400 }
      );
    }

    // 1. Cập nhật trạng thái sang ANALYZING_SOURCE
    await repo.updateProject(projectId, { status: "ANALYZING_SOURCE" });

    // 2. Chạy SourceAnalyzerAgent
    const dataPack = await SourceAnalyzerAgent.analyzeProjectSources(project, sources);

    // 3. Lưu DataPack vào repository
    await repo.saveDataPack(dataPack);

    // 4. Cập nhật trạng thái dự án sang DATA_PACK_READY
    const updatedProject = await repo.updateProject(projectId, { status: "DATA_PACK_READY" });

    return NextResponse.json({
      ok: true,
      data: {
        project: updatedProject,
        dataPack,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã xảy ra lỗi trong quá trình phân tích bài học.";
    return NextResponse.json(
      { ok: false, error: { code: "ANALYSIS_FAILED", message } },
      { status: 500 }
    );
  }
}
