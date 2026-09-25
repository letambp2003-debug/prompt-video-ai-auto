"use client";

import React, { useState, useRef } from "react";
import { Project, SourceFile } from "@/types";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";

interface UploadZoneProps {
  projectId: string;
  project?: Project | null;
  sources: SourceFile[];
  onUploadSuccess: (newSource: SourceFile) => void;
  onDeleteSuccess: (sourceId: string) => void;
}

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
const DANGEROUS_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".msi", ".com", ".vbs", ".js", ".ps1"];

// Giới hạn payload của máy chủ đám mây Vercel Serverless Function là 4.5MB
const VERCEL_SERVERLESS_MAX_BYTES = 4.2 * 1024 * 1024; // 4.2MB

/**
 * Tự động nén ảnh chất lượng cao chụp từ điện thoại (3MB - 15MB) xuống dưới 1MB
 * Giữ nguyên độ sắc nét 2048px đủ cho AI đọc rõ chữ sách giáo khoa
 */
async function optimizeImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith("image/") && !/\.(png|jpg|jpeg|webp)$/i.test(file.name)) {
    return file;
  }

  // Nếu ảnh đã nhỏ hơn 2MB thì không cần nén
  if (file.size <= 2 * 1024 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDimension = 2048; // Chuẩn độ nét cao cho tài liệu giáo khoa

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const safeName = file.name.replace(/\.[^.]+$/, ".jpg");
              const optimizedFile = new File([blob], safeName, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          0.85
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  projectId,
  project,
  sources,
  onUploadSuccess,
  onDeleteSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const uploadSingleFile = async (rawFile: File) => {
    const filename = rawFile.name;
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();

    // 1. Kiểm tra phần mở rộng nguy hiểm (TC04)
    if (DANGEROUS_EXTENSIONS.includes(ext) || !ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(
        `Tệp "${filename}" không được hỗ trợ. Vui lòng chỉ tải lên tài liệu PDF hoặc hình ảnh (PNG, JPG).`
      );
    }

    // 2. Tự động tối ưu dung lượng nếu là ảnh chụp độ phân giải lớn
    let fileToUpload = rawFile;
    if (rawFile.type.startsWith("image/") || /\.(png|jpg|jpeg|webp)$/i.test(filename)) {
      if (rawFile.size > 2 * 1024 * 1024) {
        setUploadStatusText(`Đang tối ưu dung lượng ảnh "${filename}"...`);
        fileToUpload = await optimizeImageForUpload(rawFile);
      }
    }

    // 3. Kiểm tra giới hạn máy chủ đám mây (4.5MB trên Vercel)
    if (fileToUpload.size > VERCEL_SERVERLESS_MAX_BYTES) {
      const sizeMb = (fileToUpload.size / (1024 * 1024)).toFixed(1);
      if (ext === ".pdf") {
        throw new Error(
          `Tệp PDF "${filename}" có dung lượng ${sizeMb}MB, vượt quá giới hạn 4.5MB của máy chủ đám mây Vercel.\n` +
          `👉 Gợi ý cho thầy/cô: Thầy/cô có thể chụp ảnh từng trang sách giáo khoa cần dạy để tải lên (hệ thống sẽ tự động tối ưu hóa dung lượng), hoặc nén tệp PDF trước khi tải lên.`
        );
      } else {
        throw new Error(
          `Tệp "${filename}" (${sizeMb}MB) vượt quá giới hạn 4.5MB của máy chủ. Vui lòng chọn tệp nhỏ hơn.`
        );
      }
    }

    setUploadStatusText(`Đang tải lên "${filename}"...`);
    const formData = new FormData();
    formData.append("file", fileToUpload);
    formData.append("projectId", projectId);

    // Kèm theo thông tin dự án để máy chủ tự động phục hồi nếu container bị khởi động lại
    if (project) {
      formData.append("project", JSON.stringify(project));
      formData.append("projectTitle", project.title);
      formData.append("taskType", project.taskType);
      if (project.subject) formData.append("subject", project.subject);
      if (project.targetGrade) formData.append("targetGrade", project.targetGrade);
    }

    const res = await fetch(`/api/projects/${projectId}/sources`, {
      method: "POST",
      body: formData,
    });

    // 4. Đọc an toàn để tránh lỗi cú pháp "Unexpected token R, Request Entity Too Large is not valid JSON"
    const responseText = await res.text();
    let json: { ok?: boolean; data?: SourceFile; error?: { message?: string } } | null = null;

    try {
      json = JSON.parse(responseText);
    } catch {
      // Máy chủ trả về HTML hoặc Text (ví dụ HTTP 413 Payload Too Large)
      if (res.status === 413 || responseText.includes("Request Entity Too Large") || responseText.includes("Payload Too Large")) {
        throw new Error(
          `Dung lượng tệp "${filename}" vượt quá giới hạn tải lên của máy chủ Vercel (tối đa 4.5MB). Thầy/cô vui lòng chụp ảnh từng trang hoặc nén tệp PDF nhỏ hơn.`
        );
      }
      throw new Error(`Máy chủ phản hồi lỗi (${res.status}): ${responseText || res.statusText}`);
    }

    if (!res.ok || !json?.ok) {
      throw new Error(json?.error?.message || `Tải lên tệp "${filename}" thất bại.`);
    }

    if (json?.data) {
      onUploadSuccess(json.data);
    }
  };

  const handleFilesProcess = async (files: FileList | File[]) => {
    setUploadError(null);
    setIsUploading(true);

    try {
      const fileArray = Array.from(files);
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        if (fileArray.length > 1) {
          setUploadStatusText(`Đang xử lý tệp ${i + 1}/${fileArray.length}: ${file.name}`);
        }
        await uploadSingleFile(file);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải lên tài liệu.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
      setUploadStatusText(null);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFilesProcess(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFilesProcess(e.target.files);
      e.target.value = ""; // Reset file input
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    setDeletingId(sourceId);
    setUploadError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/sources/${sourceId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Không thể xóa tệp");
      }
      onDeleteSuccess(sourceId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi xóa tệp.";
      setUploadError(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Thông báo lỗi nếu có */}
      {uploadError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1 whitespace-pre-line">
            <p className="font-semibold">Lỗi tải lên tài liệu</p>
            <p className="mt-1 leading-relaxed text-xs">{uploadError}</p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-xs text-red-500 hover:text-red-700 underline font-semibold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Khu vực Drag & Drop */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? "border-edu-500 bg-edu-50/60 scale-[1.01]"
            : "border-slate-300 hover:border-edu-400 bg-white hover:bg-slate-50/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,image/*"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
              isDragging ? "bg-edu-500 text-white" : "bg-edu-50 text-edu-600"
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <p className="text-base font-bold text-slate-800">
              {isUploading
                ? uploadStatusText || "Đang xử lý và lưu trữ tài liệu..."
                : isDragging
                ? "Thả tài liệu vào đây"
                : "Kéo thả tài liệu bài học vào đây, hoặc nhấn để chọn tệp"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Hỗ trợ: <strong>Ảnh chụp trang SGK (PNG, JPG)</strong> hoặc <strong>PDF bài học</strong> (tự động tối ưu dung lượng)
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-[11px] text-slate-600">
              <Sparkles className="w-3 h-3 text-edu-600" />
              <span>Hỗ trợ chọn nhiều ảnh cùng lúc • Tự động nén ảnh camera</span>
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách tệp đã tải lên */}
      {sources.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>TÀI LIỆU ĐÃ TẢI LÊN ({sources.length})</span>
            <span className="text-emerald-600 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sẵn sàng để phân tích bài học
            </span>
          </div>

          <div className="space-y-2">
            {sources.map((source) => {
              const isPdf = source.filename.toLowerCase().endsWith(".pdf");
              const isDeleting = deletingId === source.id;

              return (
                <div
                  key={source.id}
                  className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                        isPdf ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 truncate max-w-md">
                        {source.filename}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{formatFileSize(source.sizeBytes)}</span>
                        <span>•</span>
                        <span>{isPdf ? `~${source.pageCount || 1} trang` : "Ảnh trang sách"}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">Đã kết nối thành công</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSource(source.id);
                    }}
                    disabled={isDeleting}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa tệp này"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
