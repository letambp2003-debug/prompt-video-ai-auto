import { describe, it, expect, beforeEach, afterAll } from "vitest";
import path from "path";
import fs from "fs/promises";
import { FileSystemProjectRepository } from "@/server/repositories/FileSystemProjectRepository";
import { SourceAnalyzerAgent, DataPackPayloadSchema } from "@/ai/agents/SourceAnalyzerAgent";
import { Project, SourceFile } from "@/types";

const TEST_DIR = path.join(process.cwd(), "tests", "fixtures", "data_multimodal_test");

describe("Source Analyzer — Deep Reading & Multimodal Gemini Pipeline", () => {
  let repo: FileSystemProjectRepository;
  let project: Project;
  let testFilePath: string;

  beforeEach(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {}
    await fs.mkdir(TEST_DIR, { recursive: true });

    repo = new FileSystemProjectRepository(TEST_DIR);

    project = await repo.createProject({
      title: "Bài 10: Năng lượng và sự biến đổi hóa học",
      taskType: "LESSON",
      status: "NEW",
      subject: "Khoa học tự nhiên",
      targetGrade: "Lớp 8",
      targetAudience: "Học sinh THCS",
      durationSeconds: 60,
    });

    // Tạo một tệp tài liệu giả lập thực tế trên đĩa
    testFilePath = path.join(TEST_DIR, "sgk_khtn8_trang45.txt");
    await fs.writeFile(
      testFilePath,
      "Bài 10: Năng lượng và sự biến đổi hóa học.\nPhản ứng tỏa nhiệt là phản ứng hóa học giải phóng năng lượng dưới dạng nhiệt ra môi trường xung quanh.\nVí dụ: Đốt cháy than củi, cồn, khí gas.\nPhương trình: C + O2 -> CO2 + Q.",
      "utf-8"
    );
  });

  afterAll(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {}
  });

  it("TC13: Trích xuất DATA PACK chuẩn GDPT 2018 có đầy đủ siêu dữ liệu phân tích (analysisMetadata)", async () => {
    const sources: SourceFile[] = [
      {
        id: "src_real_01",
        projectId: project.id,
        filename: "sgk_khtn8_trang45.txt",
        mimeType: "text/plain",
        storageKey: testFilePath,
        sizeBytes: 250,
        pageCount: 1,
        parseStatus: "PARSED",
        createdAt: new Date().toISOString(),
      },
    ];

    const dataPack = await SourceAnalyzerAgent.analyzeProjectSources(project, sources);

    expect(dataPack.id).toBeDefined();
    expect(dataPack.payload.lessonTitle).toBe(project.title);
    expect(dataPack.payload.learningOutcomes.length).toBeGreaterThanOrEqual(1);
    expect(dataPack.payload.keyKnowledge.length).toBeGreaterThanOrEqual(1);

    // Kiểm tra cấu trúc metadata phân tích chuyên sâu
    expect(dataPack.payload.analysisMetadata).toBeDefined();
    expect(["GEMINI_MULTIMODAL", "FALLBACK_SIMULATION"]).toContain(
      dataPack.payload.analysisMetadata?.engine
    );
    expect(dataPack.payload.analysisMetadata?.analyzedAt).toBeDefined();
  });

  it("TC14: Kiểm định Zod Schema với các trường chuyên sâu (figures, terms, misconceptions)", () => {
    const fallback = SourceAnalyzerAgent.generateFallbackDataPack(project, []);
    const validation = DataPackPayloadSchema.safeParse(fallback);

    expect(validation.success).toBe(true);
    if (validation.success) {
      expect(validation.data.learningOutcomes[0].id).toMatch(/^YCCD-/);
      expect(validation.data.keyKnowledge[0].id).toMatch(/^KT-/);
      expect(validation.data.figures).toBeDefined();
      expect(validation.data.misconceptions.length).toBeGreaterThanOrEqual(1);
      expect(validation.data.videoHookCandidates.length).toBeGreaterThanOrEqual(1);
    }
  });
});
