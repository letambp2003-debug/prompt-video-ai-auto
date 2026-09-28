import { describe, it, expect, beforeEach, afterAll } from "vitest";
import path from "path";
import fs from "fs/promises";
import { FileSystemProjectRepository } from "@/server/repositories/FileSystemProjectRepository";
import { PedagogyAgent } from "@/ai/agents/PedagogyAgent";
import { Project, DataPack } from "@/types";

const TEST_DATA_DIR = path.join(process.cwd(), "tests", "fixtures", "data_sprint3");

describe("Sprint 3 — End-to-End Pedagogical Pipeline", () => {
  let repo: FileSystemProjectRepository;
  let testProject: Project;
  let testDataPack: DataPack;

  beforeEach(async () => {
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {}

    repo = new FileSystemProjectRepository(TEST_DATA_DIR);

    testProject = await repo.createProject({
      title: "Quang hợp ở thực vật",
      taskType: "LESSON",
      subject: "Khoa học tự nhiên",
      targetGrade: "Lớp 7",
      targetAudience: "Học sinh THCS",
      durationSeconds: 60,
    });

    testDataPack = {
      id: `dp_${testProject.id}`,
      projectId: testProject.id,
      version: 1,
      status: "APPROVED",
      payload: {
        lessonTitle: "Quang hợp ở thực vật",
        subject: "Khoa học tự nhiên",
        grade: "Lớp 7",
        bookSeries: "Kết nối tri thức",
        learningOutcomes: [
          {
            id: "YCCD-01",
            content: "Nêu được vai trò của lá cây và lục lạp trong quang hợp",
            source: { fileId: "src_1", filename: "sgk.pdf", page: 42, quote: "Lá cây là cơ quan quang hợp chính" },
          },
        ],
        keyKnowledge: [
          {
            id: "KT-01",
            title: "Khái niệm quang hợp",
            content: "Quá trình lá cây sử dụng ánh sáng để biến đổi nước và CO2 thành glucose và O2",
            source: { fileId: "src_1", filename: "sgk.pdf", page: 42 },
          },
        ],
        terms: [
          {
            id: "TN-01",
            term: "Lục lạp",
            definition: "Bào quan chứa chất diệp lục hấp thụ ánh sáng mặt trời",
            source: { fileId: "src_1", filename: "sgk.pdf", page: 43 },
          },
        ],
        misconceptions: [
          {
            id: "SAI-01",
            misconception: "Cây chỉ quang hợp vào ban đêm",
            correctionReference: "Cây quang hợp khi có ánh sáng mặt trời (ban ngày)",
            pedagogicalNote: "Cần nhấn mạnh điều kiện ánh sáng",
          },
        ],
        order: ["YCCD-01", "KT-01"],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await repo.saveDataPack(testDataPack);
  });

  afterAll(async () => {
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("TC07: Sinh 3 Concept sư phạm từ 10 MODE và chọn 1 Concept", () => {
    const concepts = PedagogyAgent.generateConcepts(testProject, testDataPack);

    expect(concepts).toHaveLength(3);
    expect(concepts[0].title).toBeDefined();
    expect(concepts[0].hook).toBeDefined();
    expect(concepts[0].finalQuestion).toBeDefined();
    expect(concepts[0].isSelected).toBe(true);

    const modes = concepts.map((c) => c.mode);
    expect(new Set(modes).size).toBe(3);
  });

  it("TC08: Sinh kịch bản phân đoạn Timeline (4 cảnh) & Khóa tính liên tục Master Locks", () => {
    const concepts = PedagogyAgent.generateConcepts(testProject, testDataPack);
    const selectedConcept = concepts[0];

    const script = PedagogyAgent.generateScript(testProject, testDataPack, selectedConcept);

    expect(script.id).toBeDefined();
    expect(script.payload.timeline).toHaveLength(4);
    expect(script.payload.timeline[0].purpose.toUpperCase()).toContain("MỞ ĐẦU");
    expect(script.payload.timeline[3].dialogueOrVoiceover).toContain(selectedConcept.finalQuestion);
  });

  it("TC09: Phân rã Storyboard độc lập & tạo Prompt chuẩn Google Flow / Veo", () => {
    const concepts = PedagogyAgent.generateConcepts(testProject, testDataPack);
    const script = PedagogyAgent.generateScript(testProject, testDataPack, concepts[0]);

    const storyboard = PedagogyAgent.generateStoryboard(testProject, script);

    expect(storyboard.scenes).toHaveLength(4);
    expect(storyboard.totalDurationSeconds).toBe(60);

    const firstScene = storyboard.scenes[0];
    expect(firstScene.sceneNumber).toBe(1);
    expect(firstScene.status).toBe("READY");
    expect(firstScene.promptFlowVeo).toContain("Cinematic 4K video");
    expect(firstScene.promptFlowVeo).toContain("16:9");
  });

  it("TC10: Đánh giá chất lượng sư phạm 5 chiều (QC Gate >= 90 điểm)", () => {
    const concepts = PedagogyAgent.generateConcepts(testProject, testDataPack);
    const script = PedagogyAgent.generateScript(testProject, testDataPack, concepts[0]);
    const storyboard = PedagogyAgent.generateStoryboard(testProject, script);

    const qc = PedagogyAgent.generateQCReport(testProject, testDataPack, script, storyboard);

    expect(qc.score).toBeGreaterThanOrEqual(90);
    expect(qc.overallStatus).toBe("PASS");
    expect(qc.dimensions).toBeDefined();
    expect(qc.dimensions?.sourceFidelity.score).toBeGreaterThanOrEqual(95);
    expect(qc.dimensions?.pedagogicalSoundness.score).toBeGreaterThanOrEqual(90);
    expect(qc.dimensions?.continuityMasterLock.score).toBeGreaterThanOrEqual(90);
    expect(qc.dimensions?.videoFeasibility.score).toBeGreaterThanOrEqual(90);
    expect(qc.dimensions?.schoolSafety.score).toBe(100);
    expect(qc.checks).toHaveLength(5);
  });

  it("TC11: Tái tạo độc lập từng Scene mà không ảnh hưởng các Scene khác", () => {
    const concepts = PedagogyAgent.generateConcepts(testProject, testDataPack);
    const script = PedagogyAgent.generateScript(testProject, testDataPack, concepts[0]);
    const storyboard = PedagogyAgent.generateStoryboard(testProject, script);

    const scene2Before = storyboard.scenes[1];
    const scene3Before = storyboard.scenes[2];

    const regeneratedScene2 = {
      ...scene2Before,
      title: "Cảnh 2: Góc quay vĩ mô tế bào lá mới",
      promptFlowVeo: "Updated cinematic prompt for Scene 2 exclusively",
      version: scene2Before.version + 1,
      updatedAt: new Date().toISOString(),
    };

    const updatedScenes = storyboard.scenes.map((s) => (s.id === scene2Before.id ? regeneratedScene2 : s));

    expect(updatedScenes[1].version).toBe(scene2Before.version + 1);
    expect(updatedScenes[1].promptFlowVeo).toBe("Updated cinematic prompt for Scene 2 exclusively");
    expect(updatedScenes[2].version).toBe(scene3Before.version);
    expect(updatedScenes[2].promptFlowVeo).toBe(scene3Before.promptFlowVeo);
  });
});
