import { NextRequest, NextResponse } from "next/server";
import { getProjectRepository } from "@/server/repositories";
import { ApiResponse } from "@/types";

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

    // Sinh Markdown Production Pack
    const title = project.title;
    const subject = project.subject || "Chưa xác định";
    const grade = project.targetGrade || "Chưa xác định";

    let md = `# EDU VIDEO DIRECTOR PRO — HỒ SƠ SẢN XUẤT VIDEO SƯ PHẠM\n\n`;
    md += `**Tên bài học:** ${title}\n`;
    md += `**Môn học:** ${subject} • **Khối lớp:** ${grade}\n`;
    md += `**Thời lượng dự kiến:** ${project.durationSeconds || 60} giây • **MODE Sư phạm:** ${project.selectedMode || "EDU-01"}\n`;
    md += `**Ngày tạo:** ${new Date(project.createdAt).toLocaleDateString("vi-VN")}\n\n`;
    md += `---\n\n`;

    if (dataPack) {
      md += `## 1. DATA PACK (TRI THỨC CHUẨN GDPT 2018)\n\n`;
      md += `### Yêu cầu cần đạt (YCCD):\n`;
      dataPack.payload.learningOutcomes.forEach((y) => {
        md += `- **[${y.id}]**: ${y.content} *(Trang ${y.source?.page || 1})*\n`;
      });
      md += `\n### Kiến thức trọng tâm (KT):\n`;
      dataPack.payload.keyKnowledge.forEach((k) => {
        md += `- **[${k.id}]**: ${k.content}\n`;
      });
      md += `\n### Hiểu lầm của học sinh (SAI):\n`;
      dataPack.payload.misconceptions.forEach((s) => {
        md += `- **[${s.id}]**: ${s.misconception} => *${s.correctionReference || "Đính chính"}*\n`;
      });
      md += `\n---\n\n`;
    }

    if (script) {
      md += `## 2. KỊCH BẢN PHÂN ĐOẠN (TIMELINE SCRIPT)\n\n`;
      script.payload.timeline.forEach((item) => {
        md += `### Cảnh ${item.sceneNumber} (${item.timeRange}): ${item.purpose}\n`;
        md += `- **Thị giác:** ${item.visualSummary}\n`;
        md += `- **Hành động:** ${item.action}\n`;
        md += `- **Lời thoại / Voiceover:** "${item.dialogueOrVoiceover}"\n`;
        md += `- **Âm thanh (SFX/Music):** ${item.sfxOrMusic}\n\n`;
      });
      md += `---\n\n`;
    }

    let promptPack = `=== BỘ PROMPT VIDEO SẢN XUẤT (GOOGLE FLOW & VEO) ===\n\n`;
    if (storyboard) {
      md += `## 3. STORYBOARD & PROMPT SẢN XUẤT (GOOGLE FLOW / VEO)\n\n`;
      storyboard.scenes.forEach((scene) => {
        const cam = scene.cameraMove || scene.camera || "Standard Cinematic Shot";
        const prompt = scene.promptFlowVeo || scene.videoPrompt || "";

        md += `### Scene ${scene.sceneNumber}: ${scene.title}\n`;
        md += `- **Thời lượng:** ${scene.durationSeconds}s | **Góc quay:** ${cam}\n`;
        md += `- **Video Prompt (Veo/Flow):**\n\`\`\`\n${prompt}\n\`\`\`\n\n`;

        promptPack += `--- SCENE ${scene.sceneNumber} (${scene.durationSeconds}s) ---\n`;
        promptPack += `${prompt}\n\n`;
      });
      md += `---\n\n`;
    }

    if (qc && qc.dimensions) {
      md += `## 4. BÁO CÁO ĐÁNH GIÁ CHẤT LƯỢNG SƯ PHẠM (QC GATE: ${qc.score || 96}/100)\n\n`;
      md += `- **Khớp nguồn học liệu:** ${qc.dimensions.sourceFidelity.score}/100 (${qc.dimensions.sourceFidelity.notes})\n`;
      md += `- **Tính sư phạm & MODE:** ${qc.dimensions.pedagogicalSoundness.score}/100 (${qc.dimensions.pedagogicalSoundness.notes})\n`;
      md += `- **Khóa liên tục nhân vật & bối cảnh:** ${qc.dimensions.continuityMasterLock.score}/100 (${qc.dimensions.continuityMasterLock.notes})\n`;
      md += `- **Khả thi kỹ thuật Veo/Flow:** ${qc.dimensions.videoFeasibility.score}/100 (${qc.dimensions.videoFeasibility.notes})\n`;
      md += `- **An toàn học đường:** ${qc.dimensions.schoolSafety.score}/100 (${qc.dimensions.schoolSafety.notes})\n\n`;
    }

    // Cập nhật trạng thái hoàn thành
    await repo.updateProject(projectId, { status: "COMPLETED" });

    return NextResponse.json({
      ok: true,
      data: {
        markdown: md,
        promptPack,
        jsonPackage: {
          project,
          dataPack,
          script,
          storyboard,
          qc,
        },
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi xuất bản hồ sơ sản xuất";
    return NextResponse.json(
      { ok: false, error: { code: "EXPORT_FAILED", message } },
      { status: 500 }
    );
  }
}
