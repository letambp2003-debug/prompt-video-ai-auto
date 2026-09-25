import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { Project, SourceFile, ApiResponse } from "@/types";

interface ProjectDetailResponse {
  project: Project;
  sources: SourceFile[];
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProjectDetailResponse>>> {
  try {
    const { id } = await params;
    const repo = getProjectRepository();
    const project = await repo.getProjectById(id);

    if (!project) {
      return NextResponse.json(
        { ok: false, error: { code: "PROJECT_NOT_FOUND", message: "Không tìm thấy dự án." } },
        { status: 404 }
      );
    }

    const sources = await repo.getSourceFilesByProjectId(id);

    return NextResponse.json({
      ok: true,
      data: { project, sources },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi lấy thông tin dự án";
    return NextResponse.json(
      { ok: false, error: { code: "GET_PROJECT_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const { id } = await params;
    const body = await req.json();
    const repo = getProjectRepository();
    const project = await repo.upsertProject({ ...body, id });
    return NextResponse.json({ ok: true, data: project });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi lưu dự án";
    return NextResponse.json(
      { ok: false, error: { code: "PUT_PROJECT_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const { id } = await params;
    const body = await req.json();
    const repo = getProjectRepository();

    const existing = await repo.getProjectById(id);
    if (!existing) {
      return NextResponse.json(
        { ok: false, error: { code: "PROJECT_NOT_FOUND", message: "Không tìm thấy dự án." } },
        { status: 404 }
      );
    }

    const updated = await repo.updateProject(id, body);
    return NextResponse.json({ ok: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi cập nhật dự án";
    return NextResponse.json(
      { ok: false, error: { code: "UPDATE_PROJECT_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ deleted: boolean }>>> {
  try {
    const { id } = await params;
    const repo = getProjectRepository();
    const success = await repo.deleteProject(id);

    if (!success) {
      return NextResponse.json(
        { ok: false, error: { code: "DELETE_FAILED", message: "Không thể xóa dự án." } },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, data: { deleted: true } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi xóa dự án";
    return NextResponse.json(
      { ok: false, error: { code: "DELETE_PROJECT_FAILED", message } },
      { status: 500 }
    );
  }
}
