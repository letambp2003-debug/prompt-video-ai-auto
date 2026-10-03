import { describe, it, expect } from "vitest";
import { generateExportPackage } from "@/utils/exportGenerator";
import { Project, DataPack, Script, Storyboard, QCReport } from "@/types";

describe("Export Production Pack & Generator Resiliency", () => {
  const mockProject: Project = {
    id: "proj-history-15",
    title: "Bài 15: Nước Âu Lạc",
    taskType: "LESSON",
    targetGrade: "Lớp 6",
    subject: "Lịch sử & Địa lí",
    durationSeconds: 60,
    selectedMode: "EDU-01",
    status: "COMPLETED",
    createdAt: "2026-10-03T01:00:00.000Z",
    updatedAt: "2026-10-03T01:00:00.000Z",
  };

  const mockDataPack: DataPack = {
    id: "dp-1",
    projectId: "proj-history-15",
    version: 1,
    status: "APPROVED",
    createdAt: "2026-10-03T01:00:00.000Z",
    updatedAt: "2026-10-03T01:00:00.000Z",
    payload: {
      packId: "dp-1",
      version: 1,
      subject: "Lịch sử & Địa lí",
      grade: "Lớp 6",
      lessonTitle: "Bài 15: Nước Âu Lạc",
      sourcePages: ["45", "46"],
      lessonType: ["Lịch sử"],
      learningOutcomes: [
        { id: "YCCD-01", content: "Nêu được sự ra đời của nước Âu Lạc và vai trò của An Dương Vương", source: { page: 45 } },
      ],
      keyKnowledge: [
        { id: "KT-01", content: "Thành Cổ Loa có kiến trúc 3 vòng xoáy trôn ốc độc đáo phòng thủ vững chắc" },
      ],
      terms: [],
      formulas: [],
      data: [],
      figures: [
        { id: "HINH-01", description: "Sơ đồ kiến trúc thành Cổ Loa hình trôn ốc", pedagogicalRole: "Trực quan hóa cấu trúc thành" },
      ],
      examples: [],
      misconceptions: [
        { id: "SAI-01", misconception: "Nước Âu Lạc ra đời trước thời Văn Lang", correctionReference: "SGK trang 45: Âu Lạc nối tiếp Văn Lang" },
      ],
      realLifeConnections: [
        { id: "TT-01", connection: "Khu di tích Thành Cổ Loa tại Đông Anh, Hà Nội ngày nay" },
      ],
      videoHookCandidates: [],
      missingData: [],
      safetyFlags: [],
    },
  };

  const mockScript: Script = {
    id: "script-1",
    projectId: "proj-history-15",
    version: 1,
    createdAt: "2026-10-03T01:00:00.000Z",
    updatedAt: "2026-10-03T01:00:00.000Z",
    payload: {
      brief: {
        title: "Bài 15: Nước Âu Lạc",
        subject: "Lịch sử & Địa lí",
        grade: "Lớp 6",
        lesson: "Bài 15",
        objective: "Nắm được thành tựu quân sự thành Cổ Loa",
        selectedMode: "EDU-01",
        durationSeconds: 60,
        aspectRatio: "16:9",
        targetPlatform: "YouTube Edu",
        hook: "Tại sao nỏ thần và thành Cổ Loa lại bất khả xâm phạm?",
        unresolvedQuestion: "Bí mật đằng sau thành ốc Cổ Loa là gì?",
      },
      timeline: [
        {
          sceneNumber: 1,
          timeRange: "0-15s",
          purpose: "Gợi mở bí ẩn thành Cổ Loa",
          visualSummary: "Flycam nhìn từ trên cao xuống 3 vòng thành xoắn ốc",
          action: "Góc máy lướt chậm trên các hào nước và lũy đất cổ kính",
          dialogueOrVoiceover: "Hơn 2000 năm trước, một kỳ quan quân sự độc nhất vô nhị đã được xây dựng...",
          sfxOrMusic: "Tiếng trống đồng rền vang, âm hưởng sử thi hào hùng",
        },
      ],
    },
  };

  const mockStoryboard: Storyboard = {
    id: "sb-1",
    projectId: "proj-history-15",
    version: 1,
    totalDurationSeconds: 60,
    createdAt: "2026-10-03T01:00:00.000Z",
    updatedAt: "2026-10-03T01:00:00.000Z",
    scenes: [
      {
        id: "scene-1",
        projectId: "proj-history-15",
        storyboardId: "sb-1",
        sceneNumber: 1,
        title: "Kỳ quan thành Cổ Loa",
        durationSeconds: 15,
        purpose: "Đặt vấn đề lịch sử",
        visual: "Sơ đồ 3 vòng thành Cổ Loa",
        action: "Bay qua hào nước",
        camera: "Aerial drone shot, slow sweeping motion",
        dialogue: "Hơn 2000 năm trước, thành Cổ Loa được xây dựng...",
        voice: "Giọng thuyết minh trầm ấm, trang nghiêm",
        sfx: "Tiếng gió lướt qua hào nước cổ kính",
        transition: "Dissolve to scene 2",
        imagePrompt: "Ancient Co Loa spiral citadel in 3rd century BC Vietnam, archaeological aerial view, photorealistic 8k",
        videoPrompt: "Cinematic drone view of ancient Co Loa fortress with triple concentric spiral earthen ramparts and defensive moats, morning mist, epic historical lighting, 4k",
        promptFlowVeo: "Veo 2 cinematic aerial shot of ancient Vietnamese spiral fortress Co Loa, 3 concentric walls, realistic water moats, golden hour lighting, 24fps",
        status: "COMPLETED",
        version: 1,
        createdAt: "2026-10-03T01:00:00.000Z",
        updatedAt: "2026-10-03T01:00:00.000Z",
      },
    ],
  };

  const mockQC: QCReport = {
    id: "qc-1",
    projectId: "proj-history-15",
    version: 1,
    overallStatus: "PASS",
    score: 96,
    passed: true,
    createdAt: "2026-10-03T01:00:00.000Z",
    checks: [],
    dimensions: {
      sourceFidelity: { score: 98, status: "PASSED", notes: "Khớp 100% nội dung SGK Lịch sử 6" },
      pedagogicalSoundness: { score: 95, status: "PASSED", notes: "MODE EDU-01 kích thích tư duy giải quyết vấn đề" },
      continuityMasterLock: { score: 96, status: "PASSED", notes: "Đồng bộ phong cách sử thi chân thực" },
      videoFeasibility: { score: 95, status: "PASSED", notes: "Prompt tối ưu cho Google Veo và Flow" },
      schoolSafety: { score: 98, status: "PASSED", notes: "Hoàn toàn an toàn, tôn vinh lịch sử dân tộc" },
    },
  };

  it("TC-EXP-01: Sinh Production Pack trọn vẹn với đầy đủ Markdown, Prompt Pack và JSON", () => {
    const result = generateExportPackage(mockProject, mockDataPack, mockScript, mockStoryboard, mockQC);

    expect(result).toBeDefined();
    expect(result.markdown).toContain("EDU VIDEO DIRECTOR PRO — HỒ SƠ SẢN XUẤT VIDEO SƯ PHẠM");
    expect(result.markdown).toContain("Bài 15: Nước Âu Lạc");
    expect(result.markdown).toContain("YCCD-01");
    expect(result.markdown).toContain("KT-01");
    expect(result.markdown).toContain("SAI-01");
    expect(result.markdown).toContain("Kỳ quan thành Cổ Loa");
    expect(result.markdown).toContain("QC GATE: 96/100");

    // Prompt Pack
    expect(result.promptPack).toContain("GOOGLE FLOW & VEO");
    expect(result.promptPack).toContain("SCENE 1: KỲ QUAN THÀNH CỔ LOA");
    expect(result.promptPack).toContain("Veo 2 cinematic aerial shot of ancient Vietnamese spiral fortress");

    // JSON
    const json = result.jsonPackage as Record<string, unknown>;
    expect(json.project).toBeDefined();
    expect(json.dataPack).toBeDefined();
    expect(json.script).toBeDefined();
    expect(json.storyboard).toBeDefined();
    expect(json.qcReport).toBeDefined();
  });

  it("TC-EXP-02: Hoạt động bền vững ngay cả khi các đối tượng phụ bị thiếu (null-safety fallback)", () => {
    // Không bị crash nếu chỉ có mỗi project cơ bản
    const result = generateExportPackage(mockProject, null, null, null, null);

    expect(result).toBeDefined();
    expect(result.markdown).toContain("Bài 15: Nước Âu Lạc");
    expect(result.promptPack).toContain("Bài 15: Nước Âu Lạc");
    expect(result.jsonPackage).toBeDefined();
  });
});
