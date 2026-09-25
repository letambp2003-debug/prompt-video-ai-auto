import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { Project, TaskType, ApiResponse } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<Project[]>>> {
  try {
    const repo = getProjectRepository();
    const projects = await repo.listProjects();
    return NextResponse.json({ ok: true, data: projects });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Không thể lấy danh sách dự án";
    return NextResponse.json(
      { ok: false, error: { code: "LIST_PROJECTS_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Project>>> {
  try {
    const body = await req.json();
    const { title, taskType, subject, targetGrade, topic, targetAudience, durationSeconds } = body;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_TITLE", message: "Vui lòng nhập tên dự án." } },
        { status: 400 }
      );
    }

    const validTaskType: TaskType = taskType === "CAMPAIGN" ? "CAMPAIGN" : "LESSON";
    const initialStatus = validTaskType === "CAMPAIGN" && topic ? "TOPIC_ENTERED" : "NEW";

    const repo = getProjectRepository();
    const project = await repo.createProject({
      title: title.trim(),
      taskType: validTaskType,
      status: initialStatus,
      subject: subject?.trim(),
      targetGrade: targetGrade?.trim(),
      topic: topic?.trim(),
      targetAudience: targetAudience?.trim(),
      durationSeconds: durationSeconds ? Number(durationSeconds) : 60,
    });

    return NextResponse.json({ ok: true, data: project }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi tạo dự án";
    return NextResponse.json(
      { ok: false, error: { code: "CREATE_PROJECT_FAILED", message } },
      { status: 500 }
    );
  }
}
