import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { Project, SourceFile, ApiResponse } from "@/types";

export const maxDuration = 30;

export async function POST(
  req: NextRequest
): Promise<NextResponse<ApiResponse<{ synced: boolean; project: Project }>>> {
  try {
    const body = await req.json();
    const { project, sources } = body as { project?: Project; sources?: SourceFile[] };

    if (!project || !project.id || !project.title) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_PROJECT_DATA", message: "Dữ liệu dự án không hợp lệ." } },
        { status: 400 }
      );
    }

    const repo = getProjectRepository();
    const savedProject = await repo.upsertProject(project);

    // Đồng bộ lại sources nếu có
    if (Array.isArray(sources) && sources.length > 0) {
      const existingSources = await repo.getSourceFilesByProjectId(project.id);
      const existingIds = new Set(existingSources.map((s) => s.id));

      for (const src of sources) {
        if (!existingIds.has(src.id)) {
          await repo.addSourceFile({
            projectId: project.id,
            filename: src.filename,
            mimeType: src.mimeType,
            storageKey: src.storageKey,
            sizeBytes: src.sizeBytes,
            pageCount: src.pageCount,
            parseStatus: src.parseStatus,
            extractedText: src.extractedText,
          });
        }
      }
    }

    return NextResponse.json({
      ok: true,
      data: { synced: true, project: savedProject },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi đồng bộ dự án";
    return NextResponse.json(
      { ok: false, error: { code: "SYNC_FAILED", message } },
      { status: 500 }
    );
  }
}
