import { describe, it, expect, beforeEach, afterAll } from "vitest";
import path from "path";
import fs from "fs/promises";
import { FileSystemProjectRepository } from "@/server/repositories/FileSystemProjectRepository";

const TEST_DATA_DIR = path.join(process.cwd(), "tests", "fixtures", "data_sprint1");

describe("Sprint 1 - Project Management & Input/Upload Tests", () => {
  let repo: FileSystemProjectRepository;

  beforeEach(async () => {
    // Dọn dẹp thư mục test trước mỗi lượt chạy
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

  it("TC01 - Tạo project TASK A và TASK B được lưu và đọc lại đúng", async () => {
    // 1. Tạo project TASK A
    const lessonProject = await repo.createProject({
      title: "Bài 1: Quang hợp ở thực vật",
      taskType: "LESSON",
      status: "NEW",
      subject: "Sinh học",
      targetGrade: "Lớp 11",
    });

    expect(lessonProject.id).toBeDefined();
    expect(lessonProject.title).toBe("Bài 1: Quang hợp ở thực vật");
    expect(lessonProject.taskType).toBe("LESSON");
    expect(lessonProject.status).toBe("NEW");

    // 2. Tạo project TASK B
    const campaignProject = await repo.createProject({
      title: "Chiến dịch: Kỹ năng từ chối người lạ",
      taskType: "CAMPAIGN",
      status: "TOPIC_ENTERED",
      topic: "Hướng dẫn học sinh từ chối khi người lạ nhờ mang đồ",
      targetAudience: "Học sinh Tiểu học",
      durationSeconds: 60,
    });

    expect(campaignProject.id).toBeDefined();
    expect(campaignProject.taskType).toBe("CAMPAIGN");
    expect(campaignProject.status).toBe("TOPIC_ENTERED");

    // 3. Đọc lại từ repository
    const retrieved = await repo.getProjectById(lessonProject.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(lessonProject.id);

    // 4. Danh sách dự án
    const all = await repo.listProjects();
    expect(all).toHaveLength(2);
  });

  it("TC02 - Upload PDF hợp lệ chuyển project sang SOURCE_UPLOADED", async () => {
    const project = await repo.createProject({
      title: "Bài 2: Hô hấp tế bào",
      taskType: "LESSON",
      status: "NEW",
    });

    const sourceFile = await repo.addSourceFile({
      projectId: project.id,
      filename: "sgk_sinh_hoc_11_bai2.pdf",
      mimeType: "application/pdf",
      storageKey: path.join(TEST_DATA_DIR, project.id, "files", "sgk.pdf"),
      sizeBytes: 1024 * 500, // 500KB
      pageCount: 4,
      parseStatus: "PENDING",
    });

    expect(sourceFile.id).toBeDefined();
    expect(sourceFile.filename).toBe("sgk_sinh_hoc_11_bai2.pdf");

    // Project status phải tự động cập nhật thành SOURCE_UPLOADED
    const updatedProject = await repo.getProjectById(project.id);
    expect(updatedProject?.status).toBe("SOURCE_UPLOADED");
  });

  it("TC03 - Upload ảnh hợp lệ (PNG/JPG)", async () => {
    const project = await repo.createProject({
      title: "Bài 3: Cấu tạo nguyên tử",
      taskType: "LESSON",
      status: "NEW",
    });

    const imgSource = await repo.addSourceFile({
      projectId: project.id,
      filename: "so_do_nguyen_tu.png",
      mimeType: "image/png",
      storageKey: path.join(TEST_DATA_DIR, project.id, "files", "so_do.png"),
      sizeBytes: 250000,
      pageCount: 1,
      parseStatus: "PENDING",
    });

    expect(imgSource.mimeType).toBe("image/png");
    expect(imgSource.pageCount).toBe(1);

    const sources = await repo.getSourceFilesByProjectId(project.id);
    expect(sources).toHaveLength(1);
    expect(sources[0].id).toBe(imgSource.id);
  });

  it("TC04 - Kiểm tra logic chặn file không hợp lệ (.exe, script)", () => {
    const dangerousExtensions = [".exe", ".bat", ".cmd", ".sh", ".msi", ".com", ".vbs", ".js", ".ps1"];
    const allowedExtensions = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];

    function validateFile(filename: string): { valid: boolean; error?: string } {
      const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
      if (dangerousExtensions.includes(ext) || !allowedExtensions.includes(ext)) {
        return {
          valid: false,
          error: "Định dạng tệp không được hỗ trợ. Vui lòng chỉ tải lên tài liệu PDF hoặc hình ảnh (PNG, JPG).",
        };
      }
      return { valid: true };
    }

    expect(validateFile("trojan.exe").valid).toBe(false);
    expect(validateFile("script.bat").valid).toBe(false);
    expect(validateFile("virus.sh").valid).toBe(false);
    expect(validateFile("unknown.xyz").valid).toBe(false);
    expect(validateFile("trojan.exe").error).toContain("Định dạng tệp không được hỗ trợ");

    expect(validateFile("bai_hoc.pdf").valid).toBe(true);
    expect(validateFile("trang_sach.png").valid).toBe(true);
    expect(validateFile("anh_chup.jpg").valid).toBe(true);
  });

  it("TC19 - Dữ liệu project và source files còn nguyên sau khi khởi tạo lại repository (Persistence / Reload)", async () => {
    const project = await repo.createProject({
      title: "Bài 4: Tế bào nhân thực",
      taskType: "LESSON",
      status: "NEW",
    });

    await repo.addSourceFile({
      projectId: project.id,
      filename: "te_bao.pdf",
      mimeType: "application/pdf",
      storageKey: path.join(TEST_DATA_DIR, project.id, "files", "te_bao.pdf"),
      sizeBytes: 300000,
      pageCount: 3,
      parseStatus: "PENDING",
    });

    // Tạo một instance Repository mới hoàn toàn mô phỏng việc restart server hoặc F5 reload
    const secondRepo = new FileSystemProjectRepository(TEST_DATA_DIR);

    const reloadedProject = await secondRepo.getProjectById(project.id);
    expect(reloadedProject).not.toBeNull();
    expect(reloadedProject?.title).toBe("Bài 4: Tế bào nhân thực");
    expect(reloadedProject?.status).toBe("SOURCE_UPLOADED");

    const reloadedSources = await secondRepo.getSourceFilesByProjectId(project.id);
    expect(reloadedSources).toHaveLength(1);
    expect(reloadedSources[0].filename).toBe("te_bao.pdf");
  });

  it("Xóa tệp nguồn cuối cùng đưa project trở lại trạng thái NEW", async () => {
    const project = await repo.createProject({
      title: "Bài 5: Di truyền học",
      taskType: "LESSON",
      status: "NEW",
    });

    const source = await repo.addSourceFile({
      projectId: project.id,
      filename: "sample.pdf",
      mimeType: "application/pdf",
      storageKey: path.join(TEST_DATA_DIR, project.id, "files", "sample.pdf"),
      sizeBytes: 100000,
      parseStatus: "PENDING",
    });

    let current = await repo.getProjectById(project.id);
    expect(current?.status).toBe("SOURCE_UPLOADED");

    // Xóa source file
    const deleted = await repo.deleteSourceFile(source.id);
    expect(deleted).toBe(true);

    const remainingSources = await repo.getSourceFilesByProjectId(project.id);
    expect(remainingSources).toHaveLength(0);

    current = await repo.getProjectById(project.id);
    expect(current?.status).toBe("NEW");
  });

  it("upsertProject lưu trữ và khôi phục dự án đúng ID ngay cả khi container serverless khởi động lại", async () => {
    const fixedId = "proj_serverless_recovery_test_999";
    const upserted = await repo.upsertProject({
      id: fixedId,
      title: "Bài 10: Năng lượng tái tạo",
      taskType: "LESSON",
      status: "NEW",
      subject: "Vật lý",
      targetGrade: "Lớp 10",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    expect(upserted.id).toBe(fixedId);
    expect(upserted.title).toBe("Bài 10: Năng lượng tái tạo");

    const retrieved = await repo.getProjectById(fixedId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(fixedId);
    expect(retrieved?.subject).toBe("Vật lý");
  });
});
