import { describe, it, expect } from "vitest";
import { Project, PedagogicalMode, DataPackPayload, Scene, PolicyGateEvaluation } from "@/types";

describe("Sprint 0 - Architecture & Domain Types Smoke Tests", () => {
  it("khởi tạo Project với trạng thái ban đầu chính xác cho Task A", () => {
    const project: Project = {
      id: "proj_test_01",
      title: "Bài 12: Quang hợp ở thực vật",
      taskType: "LESSON",
      status: "NEW",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(project.id).toBe("proj_test_01");
    expect(project.taskType).toBe("LESSON");
    expect(project.status).toBe("NEW");
  });

  it("hỗ trợ đầy đủ 10 Pedagogical Modes mở bài sư phạm", () => {
    const modes: PedagogicalMode[] = [
      "EDU-01",
      "EDU-02",
      "EDU-03",
      "EDU-04",
      "EDU-05",
      "EDU-06",
      "EDU-07",
      "EDU-08",
      "EDU-09",
      "EDU-10",
    ];

    expect(modes).toHaveLength(10);
    expect(modes).toContain("EDU-01"); // Tình huống có vấn đề
    expect(modes).toContain("EDU-07"); // Phát hiện lỗi sai
    expect(modes).toContain("EDU-09"); // Bí ẩn mở đầu
  });

  it("định nghĩa DataPack có đầy đủ các trường kiến thức và trích nguồn", () => {
    const mockDataPack: DataPackPayload = {
      packId: "pack_001",
      version: 1,
      subject: "Sinh học",
      grade: "Lớp 11",
      bookSeries: "Kết nối tri thức",
      lessonTitle: "Quang hợp ở thực vật",
      sourcePages: ["Trang 45", "Trang 46"],
      lessonType: ["ly_thuyet"],
      learningOutcomes: [
        { id: "YCCD-01", content: "Nêu được khái niệm quang hợp", source: { page: 45 } },
      ],
      keyKnowledge: [
        { id: "KT-01", content: "Quang hợp diễn ra tại lục lạp", source: { page: 45 } },
      ],
      terms: [{ id: "TN-01", content: "Diệp lục a và b", source: { page: 45 } }],
      formulas: [{ id: "CT-01", content: "6CO2 + 6H2O -> C6H12O6 + 6O2", source: { page: 46 } }],
      data: [{ id: "DL-01", content: "Hiệu suất quang hợp đạt 1-2%", source: { page: 46 } }],
      figures: [
        { id: "HINH-01", description: "Sơ đồ cấu tạo lục lạp", pedagogicalRole: "Minh họa vị trí phản ứng sáng/tối", source: { page: 45 } },
      ],
      examples: [{ id: "VD-01", content: "Cây xanh nhả khí oxi dưới ánh nắng", source: { page: 45 } }],
      misconceptions: [
        { id: "SAI-01", misconception: "Cây chỉ quang hợp ban ngày và không hô hấp", correctionReference: "Trang 46" },
      ],
      realLifeConnections: [
        { id: "TT-01", connection: "Trồng cây xanh điều hòa không khí đô thị", relatedKnowledgeIds: ["KT-01"] },
      ],
      videoHookCandidates: [
        { id: "HK-01", mode: "EDU-01", idea: "Vì sao cây đặt trong phòng kín ban đêm gây mệt mỏi?", uses: ["SAI-01", "KT-01"] },
      ],
      missingData: [],
      safetyFlags: [],
    };

    expect(mockDataPack.learningOutcomes[0].id).toBe("YCCD-01");
    expect(mockDataPack.keyKnowledge[0].id).toBe("KT-01");
    expect(mockDataPack.misconceptions[0].id).toBe("SAI-01");
    expect(mockDataPack.learningOutcomes[0].source?.page).toBe(45);
  });

  it("đảm bảo nguyên tắc cô lập Scene: thay đổi Scene 04 không làm thay đổi Scene 01", () => {
    const scene1: Scene = {
      id: "sc_01",
      projectId: "proj_01",
      storyboardId: "sb_01",
      sceneNumber: 1,
      title: "Hook mở đầu",
      durationSeconds: 5,
      purpose: "Tạo sự chú ý",
      visual: "Lớp học buổi sáng",
      action: "Giáo viên cầm chiếc lá xanh",
      camera: "Medium shot",
      dialogue: "Các em có biết chiếc lá này tạo ra năng lượng như thế nào?",
      voice: "Giọng truyền cảm",
      sfx: "Tiếng chuông trường",
      transition: "Cut",
      imagePrompt: "Warm cinematic classroom...",
      videoPrompt: "A friendly teacher holds a green leaf...",
      status: "READY",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const scene4: Scene = {
      id: "sc_04",
      projectId: "proj_01",
      storyboardId: "sb_01",
      sceneNumber: 4,
      title: "Câu hỏi kích hoạt",
      durationSeconds: 8,
      purpose: "Dẫn vào bài",
      visual: "Câu hỏi hiện trên bảng",
      action: "Học sinh suy nghĩ",
      camera: "Close-up",
      dialogue: "Liệu cây không có ánh sáng có thể quang hợp không?",
      voice: "Giọng gợi mở",
      sfx: "Nhạc nhẹ",
      transition: "Fade out",
      imagePrompt: "Students pondering...",
      videoPrompt: "Curious student looks at leaf under lamp...",
      status: "READY",
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const scenes: Scene[] = [scene1, scene4];

    // Tạo bản sao mới cập nhật chỉ cho Scene 04
    const updatedScenes = scenes.map((s) =>
      s.sceneNumber === 4
        ? { ...s, version: s.version + 1, action: "Học sinh hào hứng thảo luận", status: "READY" as const }
        : s
    );

    // Kiểm chứng Scene 01 hoàn toàn không bị ảnh hưởng
    expect(updatedScenes[0]).toEqual(scene1);
    expect(updatedScenes[0].version).toBe(1);

    // Kiểm chứng Scene 04 được cập nhật độc lập
    expect(updatedScenes[1].version).toBe(2);
    expect(updatedScenes[1].action).toBe("Học sinh hào hứng thảo luận");
  });

  it("hỗ trợ đầy đủ 12 tiêu chuẩn của Policy Gate", () => {
    const policyGate: PolicyGateEvaluation = {
      realPersonOrPublicFigure: "PASS",
      minorSensitiveContext: "PASS",
      sexualContent: "PASS",
      graphicViolence: "PASS",
      selfHarm: "PASS",
      dangerousInstruction: "PASS",
      illegalInstruction: "PASS",
      hateOrHarassment: "PASS",
      privacyOrBiometrics: "PASS",
      impersonationOrDeception: "PASS",
      copyrightedCharacter: "PASS",
      politicalPersuasion: "PASS",
      action: "PASS",
      reasons: [],
    };

    expect(policyGate.action).toBe("PASS");
    expect(policyGate.realPersonOrPublicFigure).toBe("PASS");
  });
});
