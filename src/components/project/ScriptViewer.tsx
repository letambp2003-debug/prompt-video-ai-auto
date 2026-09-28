"use client";

import React, { useState } from "react";
import { Script, Project } from "@/types";
import {
  FileText,
  Lock,
  User,
  MapPin,
  Palette,
  ArrowRight,
  Clock,
  Sparkles,
  Volume2,
  Film,
  RotateCcw,
} from "lucide-react";

interface ScriptViewerProps {
  project: Project;
  script: Script;
  onGenerateStoryboard: () => Promise<void>;
  onReGenerateScript: () => Promise<void>;
  isGeneratingStoryboard: boolean;
}

export const ScriptViewer: React.FC<ScriptViewerProps> = ({
  project,
  script,
  onGenerateStoryboard,
  onReGenerateScript,
  isGeneratingStoryboard,
}) => {
  const { brief, timeline } = script.payload;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              BƯỚC 4: KỊCH BẢN PHÂN ĐOẠN & KHÓA TÍNH LIÊN TỤC
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
            Kịch Bản Video: {brief.title}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thời lượng: <strong>{brief.durationSeconds} giây</strong> • MODE sư phạm:{" "}
            <strong>{brief.selectedMode}</strong> • Tỷ lệ: <strong>{brief.aspectRatio}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReGenerateScript}
            className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Tạo lại kịch bản</span>
          </button>

          <button
            type="button"
            disabled={isGeneratingStoryboard}
            onClick={onGenerateStoryboard}
            className="px-5 py-2.5 rounded-xl bg-edu-600 hover:bg-edu-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer ring-4 ring-edu-100"
          >
            {isGeneratingStoryboard ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang phân rã Storyboard & Prompt...</span>
              </>
            ) : (
              <>
                <Film className="w-4 h-4" />
                <span>PHÂN RÃ STORYBOARD & SINH PROMPT VEO/FLOW</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3 Master Continuity Locks */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Character Lock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-edu-600" />
              <span>Character Master Lock</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              ĐÃ KHÓA
            </span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <p><strong>Vai trò:</strong> AI Mentor dẫn dắt bài giảng</p>
            <p><strong>Đặc điểm:</strong> Thanh niên 18-20 tuổi, gương mặt sáng thông minh, tóc đen tự nhiên.</p>
            <p><strong>Trang phục:</strong> Áo sơ mi cách tân xanh giáo dục lịch thiệp chuẩn mực.</p>
          </div>
        </div>

        {/* Location Lock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Location Master Lock</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              ĐÃ KHÓA
            </span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <p><strong>Không gian:</strong> Không gian thực tế ảo sư phạm (Edu Metaverse Studio)</p>
            <p><strong>Ánh sáng:</strong> Ánh sáng mềm chuẩn điện ảnh (Cinematic Studio soft lighting)</p>
            <p><strong>Đạo cụ:</strong> Màn hình nổi Hologram SGK, quả địa cầu tri thức 3D</p>
          </div>
        </div>

        {/* Visual Style Lock */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-purple-600" />
              <span>Visual Style Lock</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              ĐÃ KHÓA
            </span>
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <p><strong>Phong cách:</strong> 3D Cinematic Animation chuẩn GDPT 2018</p>
            <p><strong>Bảng màu:</strong> Xanh Edu Navy, Xanh Dương Sáng, Xanh Ngọc Lục Bảo</p>
            <p><strong>Chuyển động:</strong> Smooth Dolly & Pan mượt mà không rung lắc</p>
          </div>
        </div>
      </div>

      {/* Timeline Kịch bản phân đoạn */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-edu-600" />
            <span>Timeline Phân Đoạn 4 Cảnh Sư Phạm</span>
          </h3>
          <span className="text-xs text-slate-400">4 phân cảnh • Đạt chuẩn thời lượng</span>
        </div>

        <div className="space-y-4">
          {timeline.map((item) => (
            <div
              key={item.sceneNumber}
              className="p-4 rounded-xl border border-slate-200 hover:border-edu-300 transition-colors bg-slate-50/50 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-lg bg-edu-600 text-white font-black text-xs">
                    Cảnh {item.sceneNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-800">{item.timeRange}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-semibold text-edu-700">{item.purpose}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-xs">
                {/* Cột trái: Thị giác & Hành động */}
                <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-1.5">
                  <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                    <Film className="w-3.5 h-3.5 text-blue-600" />
                    <span>Thị giác & Hành động máy quay:</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed text-xs">{item.visualSummary}</p>
                  <p className="text-slate-500 text-[11px] italic pt-1">{item.action}</p>
                </div>

                {/* Cột phải: Lời thoại & Âm thanh */}
                <div className="p-3 bg-white rounded-lg border border-slate-100 space-y-1.5">
                  <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Lời thoại (Voiceover) & Âm thanh SFX:</span>
                  </p>
                  <p className="text-slate-900 font-medium leading-relaxed text-xs italic">
                    "{item.dialogueOrVoiceover}"
                  </p>
                  <p className="text-slate-500 text-[11px] pt-1">SFX: {item.sfxOrMusic}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
