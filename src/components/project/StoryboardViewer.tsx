"use client";

import React, { useState } from "react";
import { Storyboard, Scene, Project } from "@/types";
import {
  Film,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Video,
  Camera,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface StoryboardViewerProps {
  project: Project;
  storyboard: Storyboard;
  onRunQC: () => Promise<void>;
  onRegenerateScene: (sceneId: string) => Promise<void>;
  isGeneratingQC: boolean;
}

export const StoryboardViewer: React.FC<StoryboardViewerProps> = ({
  project,
  storyboard,
  onRunQC,
  onRegenerateScene,
  isGeneratingQC,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const handleCopyPrompt = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const handleRegen = async (sceneId: string) => {
    setRegeneratingId(sceneId);
    try {
      await onRegenerateScene(sceneId);
    } finally {
      setRegeneratingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              BƯỚC 5: STORYBOARD & VIDEO PROMPT STUDIO
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Bộ Prompt Sản Xuất Video Google Flow & Veo
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi phân cảnh được độc lập hóa tuyệt đối. Thầy/cô có thể sao chép trực tiếp Prompt vào Google Flow / Veo hoặc tạo lại từng cảnh riêng biệt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isGeneratingQC}
            onClick={onRunQC}
            className="px-5 py-2.5 rounded-xl bg-edu-600 hover:bg-edu-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer ring-4 ring-edu-100"
          >
            {isGeneratingQC ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang quét kiểm tra QC 5 chiều...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>KIỂM TRA CHẤT LƯỢNG (QC 5 CHIỀU)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danh sách Scene Cards */}
      <div className="space-y-5">
        {storyboard.scenes.map((scene) => {
          const isCopied = copiedId === scene.id;
          const isRegen = regeneratingId === scene.id;

          return (
            <div
              key={scene.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-edu-300 transition-colors"
            >
              {/* Header Scene */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-xl bg-slate-900 text-white font-black text-xs">
                    SCENE {scene.sceneNumber}
                  </span>
                  <h3 className="font-extrabold text-sm text-slate-900">{scene.title}</h3>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-edu-700 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {scene.durationSeconds} giây
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <Camera className="w-3 h-3" />
                    {scene.cameraMove}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Nút Tạo lại cảnh này (TC11: độc lập tuyệt đối) */}
                  <button
                    type="button"
                    disabled={isRegen}
                    onClick={() => handleRegen(scene.id)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Tạo lại riêng cảnh này mà không làm đổi các cảnh khác (TC11)"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 text-slate-400 ${isRegen ? "animate-spin" : ""}`} />
                    <span>{isRegen ? "Đang tạo lại..." : "Tạo lại cảnh này"}</span>
                  </button>

                  {/* Nút Sao chép Prompt Veo/Flow */}
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(scene.id, scene.promptFlowVeo || scene.videoPrompt || "")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCopied
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-edu-50 hover:bg-edu-100 text-edu-700 border border-edu-200"
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã chép Prompt!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Chép Prompt Veo/Flow</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Chi tiết nội dung Scene */}
              <div className="grid md:grid-cols-2 gap-4 text-xs">
                {/* Lời thoại & Diễn giải */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div>
                    <span className="font-bold text-slate-700 text-[11px]">Tóm tắt thị giác:</span>
                    <p className="text-slate-800 text-xs mt-0.5 leading-relaxed">{scene.visualSummary || scene.visual}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700 text-[11px]">Lời thoại / Thuyết minh:</span>
                    <p className="text-edu-950 font-medium text-xs mt-0.5 italic bg-white p-2 rounded-lg border border-slate-200">
                      "{scene.dialogue}"
                    </p>
                  </div>
                </div>

                {/* Prompt Video Veo / Google Flow */}
                <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-bold text-edu-400 flex items-center gap-1">
                      <Video className="w-3.5 h-3.5" />
                      <span>Video Prompt (Google Flow / Veo 16:9):</span>
                    </span>
                    <span>Text-to-Video Model</span>
                  </div>
                  <pre className="font-mono text-[11px] leading-relaxed text-slate-200 whitespace-pre-wrap select-all bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    {scene.promptFlowVeo || scene.videoPrompt}
                  </pre>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
