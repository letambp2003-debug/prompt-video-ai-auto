import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { SourceAnalyzerAgent } from "@/ai/agents/SourceAnalyzerAgent";
import { ApiResponse, Project, SourceFile, DataPack } from "@/types";

export const maxDuration = 60;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ project: Project; dataPack: DataPack }>>> {
  try {
    const { id: projectId } = await params;
    const repo = getProjectRepository();

    // 1. Đọc dữ liệu gửi kèm từ Client để phòng ngừa serverless container bị cold restart
    let body: { project?: Project; sources?: SourceFile[] } = {};
    try {
      body = await req.json();
    } catch {
      // Body rỗng nếu client gửi không kèm payload
    }

    // 2. Tìm hoặc tự động phục hồi dự án trên container này
    let project = await repo.getProjectById(projectId);
    if (!project && body.project) {
      project = await repo.upsertProject({ ...body.project, id: projectId });
    }
    if (!project) {
      project = await repo.upsertProject({
        id: projectId,
        title: "Dự án bài học",
        taskType: "LESSON",
        status: "SOURCE_UPLOADED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 3. Tìm hoặc phục hồi danh sách tài liệu
    let sources = await repo.getSourceFilesByProjectId(projectId);
    if (sources.length === 0 && Array.isArray(body.sources) && body.sources.length > 0) {
      for (const s of body.sources) {
        await repo.addSourceFile(s);
      }
      sources = await repo.getSourceFilesByProjectId(projectId);
    }

    if (sources.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: "NO_SOURCES", message: "Vui lòng tải lên ít nhất 1 tài liệu bài học trước khi phân tích." } },
        { status: 400 }
      );
    }

    // 4. Cập nhật trạng thái sang ANALYZING_SOURCE
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
