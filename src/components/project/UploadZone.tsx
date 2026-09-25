"use client";

import React, { useState, useRef } from "react";
import { SourceFile } from "@/types";
import { UploadCloud, FileText, Image as ImageIcon, Trash2, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

interface UploadZoneProps {
  projectId: string;
  sources: SourceFile[];
  onUploadSuccess: (newSource: SourceFile) => void;
  onDeleteSuccess: (sourceId: string) => void;
}

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".webp"];
const DANGEROUS_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".msi", ".com", ".vbs", ".js", ".ps1"];

export const UploadZone: React.FC<UploadZoneProps> = ({
  projectId,
  sources,
  onUploadSuccess,
  onDeleteSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileProcess = async (file: File) => {
    setUploadError(null);
    const filename = file.name;
    const ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();

    // Kiểm tra file thực thi/nguy hiểm (TC04)
    if (DANGEROUS_EXTENSIONS.includes(ext) || !ALLOWED_EXTENSIONS.includes(ext)) {
      setUploadError(
        "Định dạng tệp không được hỗ trợ. Vui lòng chỉ tải lên tài liệu PDF hoặc hình ảnh (PNG, JPG)."
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setUploadError("Dung lượng tệp vượt quá 50MB. Vui lòng chọn tệp nhỏ hơn.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/projects/${projectId}/sources`, {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Tải lên tệp thất bại");
      }

      onUploadSuccess(json.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải lên tệp.";
      setUploadError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await handleFileProcess(file);
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
      const file = e.target.files[0];
      await handleFileProcess(file);
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
          <div className="flex-1">
            <p className="font-semibold">Lỗi tải lên</p>
            <p className="mt-0.5">{uploadError}</p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="text-xs text-red-500 hover:text-red-700 underline"
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
          accept=".pdf,.png,.jpg,.jpeg,.webp"
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
                ? "Đang lưu trữ tài liệu..."
                : isDragging
                ? "Thả tài liệu vào đây"
                : "Kéo thả tài liệu bài học vào đây, hoặc nhấn để chọn tệp"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Hỗ trợ định dạng: <strong>PDF sách giáo khoa, ảnh chụp trang sách (PNG, JPG)</strong> (tối đa 50MB)
            </p>
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
                        <span>{isPdf ? `~${source.pageCount || 1} trang` : "Ảnh đơn"}</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">Đã lưu trữ an toàn</span>
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
