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
} from "lucide-react";

interface DataPackViewerProps {
  project: Project;
  dataPack: DataPack;
  onApprove: () => Promise<void>;
  onReAnalyze: () => void;
  onBackToSources: () => void;
  onUpdateDataPack: (updated: DataPack) => Promise<void>;
}

export const DataPackViewer: React.FC<DataPackViewerProps> = ({
  project,
  dataPack,
  onApprove,
  onReAnalyze,
  onBackToSources,
  onUpdateDataPack,
}) => {
  const [activeTab, setActiveTab] = useState<"ALL" | "YCCD" | "KT" | "SAI" | "TT" | "HK" | "HINH">("ALL");
  const [isApproving, setIsApproving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const isApproved = dataPack.status === "APPROVED" || project.status === "DATA_PACK_APPROVED";

  const payload = dataPack.payload;

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

    const updatedDataPack: DataPack = {
      ...dataPack,
      payload: updatedPayload,
      updatedAt: new Date().toISOString(),
    };

    setEditingId(null);
    await onUpdateDataPack(updatedDataPack);
  };

  const handleApproveClick = async () => {
    setIsApproving(true);
    try {
      await onApprove();
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Trạng thái & Hành động */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToSources}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <span>Xem nguồn tệp</span>
          </button>

          {!isApproved && (
            <button
              type="button"
              onClick={onReAnalyze}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
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
              className="px-5 py-2.5 rounded-xl bg-edu-600 hover:bg-edu-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer"
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
            <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Đã sẵn sàng tạo Concept (Sprint 3)</span>
            </div>
          )}
        </div>
      </div>

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
                    <p
                      onClick={() => handleStartEdit(item.id, item.content)}
                      className={`text-xs text-slate-700 leading-relaxed ${!isApproved ? "cursor-pointer hover:text-edu-600" : ""}`}
                    >
                      {item.content}
                    </p>
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
                      className={`text-xs text-slate-700 leading-relaxed ${!isApproved ? "cursor-pointer hover:text-amber-700" : ""}`}
                    >
                      {item.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. HIỂU LẦM THƯỜNG GẶP CỦA HỌC SINH (SAI) */}
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
                    <div className="pt-1 text-[11px] text-emerald-700 bg-white p-2 rounded-lg border border-slate-200">
                      <strong>Đính chính sư phạm:</strong> {item.correctionReference}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. LIÊN HỆ THỰC TIỄN & Ý TƯỞNG VIDEO HOOK */}
        {(activeTab === "ALL" || activeTab === "TT" || activeTab === "HK") && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            {/* Thực tiễn */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="text-emerald-600">🌍</span>
                <span>Liên hệ thực tế (TT)</span>
              </h3>
              {payload.realLifeConnections.map((item) => (
                <div key={item.id} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-700">
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
              {payload.videoHookCandidates.map((hook) => (
                <div key={hook.id} className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                      {hook.id} • {hook.mode}
                    </span>
                  </div>
                  <p className="font-medium text-purple-950 pt-0.5">{hook.idea}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
