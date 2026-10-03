"use client";

import React, { useState, useEffect } from "react";
import { Project, DataPack, Script, Storyboard, QCReport } from "@/types";
import {
  Download,
  Copy,
  Check,
  FileText,
  FileCode,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Film,
  Layers,
  ExternalLink,
} from "lucide-react";
import {
  getDataPackLocal,
  getScriptLocal,
  getStoryboardLocal,
  getQCReportLocal,
} from "@/utils/projectStorage";
import { generateExportPackage } from "@/utils/exportGenerator";

interface ExportViewerProps {
  project: Project;
  dataPack?: DataPack | null;
  script?: Script | null;
  storyboard?: Storyboard | null;
  qcReport?: QCReport | null;
  onBackToStoryboard: () => void;
  onBackToQC: () => void;
}

export const ExportViewer: React.FC<ExportViewerProps> = ({
  project,
  dataPack,
  script,
  storyboard,
  qcReport,
  onBackToStoryboard,
  onBackToQC,
}) => {
  const [activeTab, setActiveTab] = useState<"MARKDOWN" | "PROMPTS" | "JSON">("MARKDOWN");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{
    markdown: string;
    promptPack: string;
    jsonPackage: object;
  } | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  useEffect(() => {
    const fetchExport = async () => {
      // 1. Thu thập dữ liệu từ props hoặc từ localStorage của trình duyệt
      const resolvedDataPack = dataPack || getDataPackLocal(project.id);
      const resolvedScript = script || getScriptLocal(project.id);
      const resolvedStoryboard = storyboard || getStoryboardLocal(project.id);
      const resolvedQC = qcReport || getQCReportLocal(project.id);

      // 2. Tạo trước bộ hồ sơ cục bộ (đảm bảo hiển thị ngay lập tức, không bao giờ bị trắng trang hay lỗi)
      const immediatePackage = generateExportPackage(
        project,
        resolvedDataPack,
        resolvedScript,
        resolvedStoryboard,
        resolvedQC
      );
      setData(immediatePackage);
      setIsLoading(false);
      setError(null);

      // 3. Đồng bộ và làm giàu dữ liệu qua Serverless POST endpoint
      try {
        const res = await fetch(`/api/projects/${project.id}/export`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            project,
            dataPack: resolvedDataPack,
            script: resolvedScript,
            storyboard: resolvedStoryboard,
            qc: resolvedQC,
          }),
        });
        const json = await res.json();
        if (res.ok && json.ok && json.data) {
          setData(json.data);
          setError(null);
        }
      } catch (err: unknown) {
        // Nếu mạng có gián đoạn hoặc serverless worker khởi động lại,
        // gói dữ liệu cục bộ đã tạo vẫn giữ nguyên trọn vẹn 100% dữ liệu bài học
        console.warn("Lưu ý đồng bộ máy chủ (đã kích hoạt chế độ xuất bản độc lập):", err);
      }
    };

    fetchExport();
  }, [project, dataPack, script, storyboard, qcReport]);

  const handleCopy = async (type: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      // Fallback
    }
  };

  const downloadFile = (filename: string, content: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const sanitizeName = (str: string) => {
    return str
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .slice(0, 30);
  };

  const baseFileName = `${sanitizeName(project.title || "video_edu")}_production_pack`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              BƯỚC 8: XUẤT BẢN PRODUCTION PACK (HOÀN TẤT QUY TRÌNH)
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Bộ Hồ Sơ Sản Xuất Video Sư Phạm Chuẩn GDPT 2018
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dự án: <strong>{project.title}</strong> • Đã sẵn sàng đưa vào sản xuất trên Google Flow & Veo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToQC}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Xem lại QC</span>
          </button>

          <button
            type="button"
            onClick={onBackToStoryboard}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Film className="w-3.5 h-3.5 text-slate-400" />
            <span>Xem Storyboard</span>
          </button>
        </div>
      </div>

      {/* Thông báo thành công */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-start gap-4 text-emerald-950 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="font-bold text-sm text-emerald-900">
            Xin chúc mừng! Quy trình sư phạm 8 bước đã hoàn thành trọn vẹn 100%
          </p>
          <p className="text-xs text-emerald-800 leading-relaxed">
            Hồ sơ sản xuất bao gồm đầy đủ: <strong>YCCD & Tri thức chuẩn</strong>, <strong>Kịch bản timeline phân đoạn</strong>,{" "}
            <strong>4 Phân cảnh độc lập với Prompt Veo/Flow</strong>, <strong>Khóa Master Locks</strong> và{" "}
            <strong>Chứng nhận QC Đạt chuẩn sư phạm GDPT 2018</strong>.
          </p>
        </div>
      </div>

      {/* Tabs Chuyển Đổi Định Dạng Xuất */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("MARKDOWN")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "MARKDOWN"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Hồ sơ sản xuất (Markdown)</span>
            </button>

            <button
              onClick={() => setActiveTab("PROMPTS")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "PROMPTS"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Prompt Pack (Veo & Flow)</span>
            </button>

            <button
              onClick={() => setActiveTab("JSON")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === "JSON"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Gói dữ liệu kỹ thuật (JSON)</span>
            </button>
          </div>

          {/* Nút Tải Xuống & Sao Chép Cho Tab Hiện Tại */}
          {data && (
            <div className="flex items-center gap-2">
              {activeTab === "MARKDOWN" && (
                <>
                  <button
                    onClick={() => handleCopy("MARKDOWN", data.markdown)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedType === "MARKDOWN" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép MD</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sao chép Markdown</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(`${baseFileName}.md`, data.markdown, "text/markdown;charset=utf-8")
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-edu-600 hover:bg-edu-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file .md</span>
                  </button>
                </>
              )}

              {activeTab === "PROMPTS" && (
                <>
                  <button
                    onClick={() => handleCopy("PROMPTS", data.promptPack)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedType === "PROMPTS" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép toàn bộ Prompt</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sao chép 1-Click</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(`${baseFileName}_prompts.txt`, data.promptPack, "text/plain;charset=utf-8")
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-edu-600 hover:bg-edu-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải prompts.txt</span>
                  </button>
                </>
              )}

              {activeTab === "JSON" && (
                <>
                  <button
                    onClick={() =>
                      handleCopy("JSON", JSON.stringify(data.jsonPackage, null, 2))
                    }
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedType === "JSON" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Đã chép JSON</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sao chép JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() =>
                      downloadFile(
                        `${baseFileName}.json`,
                        JSON.stringify(data.jsonPackage, null, 2),
                        "application/json;charset=utf-8"
                      )
                    }
                    className="px-3.5 py-1.5 rounded-lg bg-edu-600 hover:bg-edu-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải file .json</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Nội dung file xem trước */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-6 h-6 border-2 border-edu-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Đang đóng gói hồ sơ sản xuất...</span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs">{error}</div>
        ) : data ? (
          <div>
            {activeTab === "MARKDOWN" && (
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-[500px] leading-relaxed select-text">
                {data.markdown}
              </pre>
            )}

            {activeTab === "PROMPTS" && (
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-[500px] leading-relaxed select-text">
                {data.promptPack}
              </pre>
            )}

            {activeTab === "JSON" && (
              <pre className="p-4 bg-slate-900 text-amber-300 rounded-xl text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-[500px] leading-relaxed select-text">
                {JSON.stringify(data.jsonPackage, null, 2)}
              </pre>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
