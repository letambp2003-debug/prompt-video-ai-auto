import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getProjectRepository } from "@/server/repositories";
import { SourceFile, ApiResponse } from "@/types";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
const DANGEROUS_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".msi", ".com", ".vbs", ".js", ".ps1"];

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<SourceFile[]>>> {
  try {
    const { id } = await params;
    const repo = getProjectRepository();
    const sources = await repo.getSourceFilesByProjectId(id);
    return NextResponse.json({ ok: true, data: sources });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi lấy danh sách tài liệu nguồn";
    return NextResponse.json(
      { ok: false, error: { code: "GET_SOURCES_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<SourceFile>>> {
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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { ok: false, error: { code: "NO_FILE", message: "Vui lòng chọn tệp để tải lên." } },
        { status: 400 }
      );
    }

    // 1. Kiểm tra kích thước tệp
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "Dung lượng tệp vượt quá 50MB. Vui lòng nén hoặc chọn tệp nhỏ hơn.",
          },
        },
        { status: 400 }
      );
    }

    const filename = file.name;
    const ext = path.extname(filename).toLowerCase();
    const mimeType = file.type || "";

    // 2. Chặn các tệp thực thi / nguy hiểm (TC04)
    if (DANGEROUS_EXTENSIONS.includes(ext) || (!ALLOWED_EXTENSIONS.includes(ext) && !ALLOWED_MIME_TYPES.includes(mimeType))) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Định dạng tệp không được hỗ trợ. Vui lòng chỉ tải lên tài liệu PDF hoặc hình ảnh (PNG, JPG).",
          },
        },
        { status: 400 }
      );
    }

    // 3. Chuẩn bị thư mục lưu trữ cục bộ (tự động điều chỉnh trên Serverless/Vercel)
    const { getProjectUploadDir } = await import("@/server/repositories/FileSystemProjectRepository");
    const uploadDir = getProjectUploadDir(projectId);
    await fs.mkdir(uploadDir, { recursive: true });

    // Tạo tên tệp an toàn tránh trùng lặp
    const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storageKey = path.join(uploadDir, safeFilename);

    // Ghi buffer vào ổ đĩa
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(storageKey, buffer);

    // Ước lượng số trang (ảnh mặc định 1 trang, PDF giả định hoặc đọc metadata)
    const isPdf = ext === ".pdf" || mimeType === "application/pdf";
    const estimatedPages = isPdf ? Math.max(1, Math.round(file.size / 150000)) : 1;

    // 4. Lưu SourceFile vào Repository
    const sourceFile = await repo.addSourceFile({
      projectId,
      filename,
      mimeType: mimeType || (isPdf ? "application/pdf" : "image/jpeg"),
      storageKey,
      sizeBytes: file.size,
      pageCount: estimatedPages,
      parseStatus: "PENDING",
    });

    return NextResponse.json({ ok: true, data: sourceFile }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi xử lý tải lên tệp";
    return NextResponse.json(
      { ok: false, error: { code: "UPLOAD_FAILED", message } },
      { status: 500 }
    );
  }
}
