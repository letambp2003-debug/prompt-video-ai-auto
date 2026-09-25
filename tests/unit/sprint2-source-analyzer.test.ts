import { describe, it, expect, beforeEach, afterAll } from "vitest";
import path from "path";
import fs from "fs/promises";
import { FileSystemProjectRepository } from "@/server/repositories/FileSystemProjectRepository";
import { SourceAnalyzerAgent, DataPackPayloadSchema } from "@/ai/agents/SourceAnalyzerAgent";
import { Project, SourceFile } from "@/types";

const TEST_DATA_DIR = path.join(process.cwd(), "tests", "fixtures", "data_sprint2");

describe("Sprint 2 - Source Analyzer & DATA PACK Tests", () => {
  let repo: FileSystemProjectRepository;

  beforeEach(async () => {
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {
      // Ignore
    }
    repo = new FileSystemProjectRepository(TEST_DATA_DIR);
  });

  afterAll(async () => {
    try {
      await fs.rm(TEST_DATA_DIR, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  it("TC05 - Phân tích tài liệu tạo DATA PACK hợp lệ tuân thủ Zod Schema GDPT 2018", async () => {
    const project: Project = {
      id: "proj_lsdl7_test",
      title: "Bài 1: Cuộc phát kiến địa lí",
      taskType: "LESSON",
      status: "SOURCE_UPLOADED",
      subject: "Lịch sử & Địa lí",
      targetGrade: "Lớp 7",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const sources: SourceFile[] = [
      {
        id: "src_01",
        projectId: project.id,
        filename: "BAI1-LSDL7.pdf",
        mimeType: "application/pdf",
        storageKey: "/tmp/sample.pdf",
        sizeBytes: 1500000,
        pageCount: 11,
        parseStatus: "PENDING",
        createdAt: new Date().toISOString(),
      },
    ];

    const fallbackPayload = SourceAnalyzerAgent.generateFallbackDataPack(project, sources);
    const validated = DataPackPayloadSchema.safeParse(fallbackPayload);

    expect(validated.success).toBe(true);
    if (validated.success) {
      expect(validated.data.learningOutcomes.length).toBeGreaterThanOrEqual(1);
      expect(validated.data.keyKnowledge.length).toBeGreaterThanOrEqual(1);
      expect(validated.data.misconceptions.length).toBeGreaterThanOrEqual(1);
      expect(validated.data.videoHookCandidates.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("TC06 - Lưu trữ và truy xuất DATA PACK bền vững trong Repository", async () => {
    const project = await repo.createProject({
      title: "Bài 1: Quang hợp",
      taskType: "LESSON",
      status: "SOURCE_UPLOADED",
      subject: "Sinh học",
      targetGrade: "Lớp 11",
    });

    const sources: SourceFile[] = [
      {
        id: "src_02",
        projectId: project.id,
        filename: "sgk_sinh11.pdf",
        mimeType: "application/pdf",
        storageKey: "/tmp/sinh11.pdf",
        sizeBytes: 2000000,
        pageCount: 5,
        parseStatus: "PENDING",
        createdAt: new Date().toISOString(),
      },
    ];

    const dataPack = await SourceAnalyzerAgent.analyzeProjectSources(project, sources);
    expect(dataPack.projectId).toBe(project.id);
    expect(dataPack.status).toBe("DRAFT");

    // Lưu vào Repository
    await repo.saveDataPack(dataPack);

    // Đọc lại từ Repository
    const retrieved = await repo.getDataPackByProjectId(project.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(dataPack.id);
    expect(retrieved?.payload.lessonTitle).toBe(project.title);
  });

  it("TC07 - Phê duyệt (Approve) khóa phiên bản DATA PACK và chuyển trạng thái dự án", async () => {
    const project = await repo.createProject({
      title: "Bài 3: Cấu tạo tế bào",
      taskType: "LESSON",
      status: "DATA_PACK_READY",
    });

    const sources: SourceFile[] = [];
    const dataPack = await SourceAnalyzerAgent.analyzeProjectSources(project, sources);
    await repo.saveDataPack(dataPack);

    // Tiến hành Phê duyệt
    const approvedDataPack = {
      ...dataPack,
      status: "APPROVED" as const,
      updatedAt: new Date().toISOString(),
    };
    await repo.saveDataPack(approvedDataPack);
    const updatedProject = await repo.updateProject(project.id, { status: "DATA_PACK_APPROVED" });

    expect(approvedDataPack.status).toBe("APPROVED");
    expect(updatedProject.status).toBe("DATA_PACK_APPROVED");

    const reloaded = await repo.getDataPackByProjectId(project.id);
    expect(reloaded?.status).toBe("APPROVED");
  });
});
