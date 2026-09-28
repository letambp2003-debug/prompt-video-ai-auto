import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { ApiResponse, Concept, Project } from "@/types";

export const maxDuration = 30;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ project: Project; selectedConcept: Concept }>>> {
  try {
    const { id: projectId } = await params;
    const body = await req.json();
    const { conceptId } = body as { conceptId: string };

    if (!conceptId) {
      return NextResponse.json(
        { ok: false, error: { code: "NO_CONCEPT_ID", message: "Vui lòng chọn một Concept." } },
        { status: 400 }
      );
    }

    const repo = getProjectRepository();
    const selected = await repo.selectConcept(projectId, conceptId);

    if (!selected) {
      return NextResponse.json(
        { ok: false, error: { code: "CONCEPT_NOT_FOUND", message: "Không tìm thấy Concept đã chọn." } },
        { status: 404 }
      );
    }

    const project = await repo.getProjectById(projectId);

    return NextResponse.json({
      ok: true,
      data: { project: project!, selectedConcept: selected },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi chọn Concept";
    return NextResponse.json(
      { ok: false, error: { code: "SELECT_CONCEPT_FAILED", message } },
      { status: 500 }
    );
  }
}
