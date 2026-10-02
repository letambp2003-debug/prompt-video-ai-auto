"use client";

import React, { useState } from "react";
import { DataPack, Project } from "@/types";
import {
  CheckCircle2,
  Lock,
  Sparkles,
  BookOpen,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Globe,
  Film,
  Image as ImageIcon,
  Edit2,
  Save,
  Check,
  RotateCcw,
  ArrowRight,
  Plus,
  Trash2,
  FileCheck,
  Key,
  X,
  ExternalLink,
  Cpu,
} from "lucide-react";

interface DataPackViewerProps {
  project: Project;
  dataPack: DataPack;
  onApprove: () => Promise<void>;
  onReAnalyze: () => void;
  onBackToSources: () => void;
  onUpdateDataPack: (updated: DataPack) => Promise<void>;
  onProceedToConcepts?: () => void;
}

export const DataPackViewer: React.FC<DataPackViewerProps> = ({
  project,
  dataPack,
  onApprove,
  onReAnalyze,
  onBackToSources,
  onUpdateDataPack,
  onProceedToConcepts,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "YCCD" | "KT" | "HINH" | "TN" | "SAI" | "TT" | "HK">("ALL");
  const [isApproving, setIsApproving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [keyModalError, setKeyModalError] = useState<string | null>(null);

  const isApproved = dataPack.status === "APPROVED" || project.status === "DATA_PACK_APPROVED";
  const payload = dataPack.payload;
  const analysisMeta = payload.analysisMetadata;
  const isGeminiEngine = analysisMeta?.engine === "GEMINI_MULTIMODAL";

  const handleStartEdit = (id: string, initialContent: string) => {
    if (isApproved) return;
    setEditingId(id);
    setEditContent(initialContent);
  };

  const handleSaveEdit = async (category: "YCCD" | "KT" | "TN" | "SAI" | "TT" | "HK", id: string) => {
    if (!editContent.trim()) {
      setEditingId(null);
      return;
    }

    const updatedPayload = { ...payload };

    if (category === "YCCD") {
      updatedPayload.learningOutcomes = updatedPayload.learningOutcomes.map((item) =>
        item.id === id ? { ...item, content: editContent.trim() } : item
      );
    } else if (category === "KT") {
      updatedPayload.keyKnowledge = updatedPayload.keyKnowledge.map((item) =>
        item.id === id ? { ...item, content: editContent.trim() } : item
      );
    } else if (category === "TN") {
      updatedPayload.terms = updatedPayload.terms.map((item) =>
        item.id === id ? { ...item, content: editContent.trim() } : item
      );
    } else if (category === "SAI") {
      updatedPayload.misconceptions = updatedPayload.misconceptions.map((item) =>
        item.id === id ? { ...item, misconception: editContent.trim() } : item
      );
    } else if (category === "TT") {
      updatedPayload.realLifeConnections = updatedPayload.realLifeConnections.map((item) =>
        item.id === id ? { ...item, connection: editContent.trim() } : item
      );
    } else if (category === "HK") {
      updatedPayload.videoHookCandidates = updatedPayload.videoHookCandidates.map((item) =>
        item.id === id ? { ...item, idea: editContent.trim() } : item
      );
    }

    await onUpdateDataPack({
      ...dataPack,
      payload: updatedPayload,
    });
    setEditingId(null);
  };

  const handleApproveClick = async () => {
    setIsApproving(true);
    try {
      await onApprove();
    } finally {
      setIsApproving(false);
    }
  };

  const handleSaveKeyAndReAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) {
      setKeyModalError("Vui lòng nhập API Key.");
      return;
    }

    setIsSavingKey(true);
    setKeyModalError(null);

    try {
      const res = await fetch("/api/settings/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: apiKeyInput.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Không thể lưu API Key.");
      }

      setShowKeyModal(false);
      setApiKeyInput("");
      onReAnalyze();
    } catch (err: unknown) {
      setKeyModalError(err instanceof Error ? err.message : "Lỗi lưu API Key");
    } finally {
      setIsSavingKey(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Trạng thái & Hành động */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-edu-50 text-edu-700 border border-edu-200">
              DATA PACK v{payload.version}
            </span>
            {isApproved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Lock className="w-3 h-3" />
                ĐÃ PHÊ DUYỆT & KHÓA NỘI DUNG
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <Edit2 className="w-3 h-3" />
                BẢN THẢO (CÓ THỂ CHỈNH SỬA)
              </span>
            )}

            {isGeminiEngine ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-3 h-3 text-purple-600" />
                Gemini Multimodal ({analysisMeta?.model}) • Đã đọc trực tiếp {analysisMeta?.filesReadCount} tài liệu
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                <Cpu className="w-3 h-3 text-slate-500" />
                Bản phân tích mô phỏng GDPT 2018
              </span>
            )}
          </div>

          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Bộ dữ liệu sư phạm chuẩn hóa: {payload.lessonTitle}
          </h2>
          <p className="text-xs text-slate-500">
            Môn học: <strong>{payload.subject}</strong> • Khối: <strong>{payload.grade}</strong> • Bộ sách:{" "}
            <strong>{payload.bookSeries || "GDPT 2018"}</strong>
          </p>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onBackToSources}
            className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Xem nguồn tệp</span>
          </button>

          {!isApproved && (
            <button
              type="button"
              onClick={onReAnalyze}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Phân tích lại bằng AI"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Phân tích lại</span>
            </button>
          )}

          {!isApproved ? (
            <button
              type="button"
              disabled={isApproving}
              onClick={handleApproveClick}
              className="px-5 py-2.5 rounded-xl bg-edu-600 hover:bg-edu-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer ring-4 ring-edu-100"
            >
              {isApproving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang khóa dữ liệu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>XÁC NHẬN & KHÓA DATA PACK</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Đã duyệt & Khóa</span>
              </div>
              {onProceedToConcepts && (
                <button
                  type="button"
                  onClick={onProceedToConcepts}
                  className="px-5 py-2.5 rounded-xl bg-edu-600 hover:bg-edu-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer ring-4 ring-edu-100"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>TIẾP TỤC: TẠO 3 CONCEPT (BƯỚC 3)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Thông báo tình trạng phân tích & Nút kết nối Gemini API nếu đang chạy fallback */}
      {!isGeminiEngine && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-900">
                Đang hiển thị bản phân tích mô phỏng chuẩn mực GDPT 2018
              </p>
              <p className="text-amber-800 mt-0.5">
                {analysisMeta?.notes || "Chưa có Gemini API Key hợp lệ được kết nối. Để AI chuyên gia đọc trực tiếp và trích xuất từng trang sách giáo khoa thực tế của thầy/cô:"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer ring-4 ring-amber-100"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Kết nối Gemini API Key</span>
          </button>
        </div>
      )}

      {/* Tabs Phân loại tri thức */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === "ALL" ? "bg-slate-900 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          Tất cả tri thức
        </button>
        <button
          onClick={() => setActiveTab("YCCD")}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "YCCD" ? "bg-edu-600 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>🎯 Yêu cầu cần đạt</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {payload.learningOutcomes.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("KT")}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "KT" ? "bg-edu-600 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>💡 Kiến thức trọng tâm</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {payload.keyKnowledge.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("HINH")}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "HINH" ? "bg-blue-600 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>🖼️ Kênh hình & Sơ đồ</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {payload.figures?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("TN")}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "TN" ? "bg-teal-600 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>📖 Thuật ngữ & Dữ liệu</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {(payload.terms?.length || 0) + (payload.formulas?.length || 0) + (payload.data?.length || 0)}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("SAI")}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "SAI" ? "bg-red-600 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>⚠️ Hiểu lầm của học sinh</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {payload.misconceptions.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("TT")}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "TT" ? "bg-emerald-600 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>🌍 Thực tiễn</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {payload.realLifeConnections.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("HK")}
          className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "HK" ? "bg-purple-600 text-white font-bold" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <span>🎬 Hook mở đầu</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
            {payload.videoHookCandidates.length}
          </span>
        </button>
      </div>

      {/* Nội dung chi tiết các khối tri thức */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 1. YÊU CẦU CẦN ĐẠT (YCCD) */}
        {(activeTab === "ALL" || activeTab === "YCCD") && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-edu-600">🎯</span>
                <span>Yêu cầu cần đạt (YCCD)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Theo chuẩn GDPT 2018</span>
            </div>

            <div className="space-y-2.5">
              {payload.learningOutcomes.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-edu-700 bg-edu-50 px-2 py-0.5 rounded border border-edu-200">
                      {item.id}
                    </span>
                    {item.source?.page && (
                      <span className="text-slate-400">Trang {item.source.page}</span>
                    )}
                  </div>
                  {editingId === item.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-edu-400 focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSaveEdit("YCCD", item.id)}
                          className="px-3 py-1 text-[11px] bg-edu-600 text-white rounded font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p
                        onClick={() => handleStartEdit(item.id, item.content)}
                        className={`text-xs text-slate-800 font-medium leading-relaxed ${!isApproved ? "cursor-pointer hover:text-edu-600" : ""}`}
                      >
                        {item.content}
                      </p>
                      {item.source?.quote && (
                        <p className="mt-1 text-[11px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                          "{item.source.quote}"
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. KIẾN THỨC TRỌNG TÂM (KT) */}
        {(activeTab === "ALL" || activeTab === "KT") && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-amber-500">💡</span>
                <span>Kiến thức trọng tâm (KT)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Bản chất bài giảng</span>
            </div>

            <div className="space-y-2.5">
              {payload.keyKnowledge.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {item.id}
                    </span>
                    {item.source?.page && (
                      <span className="text-slate-400">Trang {item.source.page}</span>
                    )}
                  </div>
                  {editingId === item.id ? (
                    <div className="space-y-2 pt-1">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-amber-400 focus:outline-none"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800"
                        >
                          Hủy
                        </button>
                        <button
                          onClick={() => handleSaveEdit("KT", item.id)}
                          className="px-3 py-1 text-[11px] bg-amber-600 text-white rounded font-bold"
                        >
                          Lưu
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      onClick={() => handleStartEdit(item.id, item.content)}
                      className={`text-xs text-slate-800 leading-relaxed ${!isApproved ? "cursor-pointer hover:text-amber-700" : ""}`}
                    >
                      {item.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. KÊNH HÌNH & TƯ LIỆU TRỰC QUAN (FIGURES) */}
        {(activeTab === "ALL" || activeTab === "HINH") && payload.figures && payload.figures.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600">🖼️</span>
                <span>Kênh hình & Sơ đồ giáo khoa</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Giải mã vai trò sư phạm</span>
            </div>

            <div className="space-y-2.5">
              {payload.figures.map((fig) => (
                <div key={fig.id} className="p-3.5 rounded-xl bg-blue-50/40 border border-blue-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                      {fig.id}
                    </span>
                    {fig.source?.page && (
                      <span className="text-slate-400">Trang {fig.source.page}</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{fig.description}</p>
                  {fig.pedagogicalRole && (
                    <p className="text-[11px] text-blue-900 bg-white p-2 rounded-lg border border-blue-100 leading-relaxed">
                      <strong>Vai trò sư phạm:</strong> {fig.pedagogicalRole}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. THUẬT NGỮ & CÔNG THỨC & DỮ LIỆU */}
        {(activeTab === "ALL" || activeTab === "TN") && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-teal-600">📖</span>
                <span>Thuật ngữ & Số liệu chính xác</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Định nghĩa & Mốc khoa học</span>
            </div>

            <div className="space-y-2.5">
              {payload.terms?.map((term) => (
                <div key={term.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-800">
                  <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 mr-2 text-[10px]">
                    {term.id}
                  </span>
                  {term.content}
                </div>
              ))}

              {payload.formulas?.map((f) => (
                <div key={f.id} className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-950 font-mono">
                  <span className="font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded mr-2 text-[10px]">
                    {f.id}
                  </span>
                  {f.content}
                </div>
              ))}

              {payload.data?.map((d) => (
                <div key={d.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <span className="font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded mr-2 text-[10px]">
                    {d.id}
                  </span>
                  {d.content}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. HIỂU LẦM THƯỜNG GẶP CỦA HỌC SINH (SAI) */}
        {(activeTab === "ALL" || activeTab === "SAI") && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span>Hiểu lầm thường gặp (SAI)</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Để làm xung đột kịch bản</span>
            </div>

            <div className="space-y-2.5">
              {payload.misconceptions.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-red-50/50 border border-red-100 space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      {item.id}
                    </span>
                    <span className="text-red-600 font-semibold">Nhận định sai:</span>
                  </div>
                  <p className="text-xs text-slate-800">{item.misconception}</p>
                  {item.correctionReference && (
                    <div className="pt-1 text-[11px] text-emerald-700 bg-white p-2 rounded-lg border border-slate-200 leading-relaxed">
                      <strong>Đính chính sư phạm:</strong> {item.correctionReference}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. LIÊN HỆ THỰC TIỄN & Ý TƯỞNG VIDEO HOOK */}
        {(activeTab === "ALL" || activeTab === "TT" || activeTab === "HK") && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Thực tiễn */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-emerald-600">🌍</span>
                <span>Liên hệ thực tế (TT)</span>
              </h3>
              {payload.realLifeConnections.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded mr-2 text-[10px]">
                    {item.id}
                  </span>
                  {item.connection}
                </div>
              ))}
            </div>

            {/* Video Hook Candidates */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-purple-600">🎬</span>
                <span>Gợi ý Hook mở đầu video (HK)</span>
              </h3>
              {payload.videoHookCandidates.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-slate-700 leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-purple-700 text-[11px] mb-1">
                    <span className="bg-purple-100 px-1.5 py-0.5 rounded text-[10px]">{item.id}</span>
                    <span>MODE: {item.mode}</span>
                  </div>
                  {item.idea}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Nhập Gemini API Key Nhanh */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kết nối Gemini API Key</h3>
                  <p className="text-[11px] text-slate-500">Kích hoạt AI đọc sách giáo khoa thực tế</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKeyAndReAnalyze} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-200 focus:border-purple-600 outline-none font-mono"
                  autoFocus
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Chưa có key? Lấy miễn phí tại{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-600 hover:underline inline-flex items-center gap-0.5 font-semibold"
                  >
                    Google AI Studio <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>

              {keyModalError && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">
                  {keyModalError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSavingKey}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer ring-4 ring-purple-100"
                >
                  {isSavingKey ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Đang lưu & chạy phân tích...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Lưu & Phân tích ngay</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
