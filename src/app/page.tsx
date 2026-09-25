"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  FolderKanban,
  Clock,
  PlusCircle,
  Loader2,
} from "lucide-react";
import { Project } from "@/types";

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        const json = await res.json();
        if (json.ok) {
          setProjects(json.data || []);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  return (
    <div className="space-y-8 py-2">
      {/* Hero Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-edu-100 text-edu-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Sprint 1 — Project Management & Input/Upload Pipeline Active</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Hôm nay thầy/cô muốn tạo video gì?
        </h1>
        <p className="text-slate-600 max-w-2xl text-base">
          Hệ thống hỗ trợ tự động chuyển đổi học liệu bài giảng hoặc chủ đề truyền thông học đường thành bộ tài nguyên sản xuất video hoàn chỉnh (chuẩn bị cho Google Flow / Veo và Google Vids).
        </p>
      </div>

      {/* 2 Lựa chọn nghiệp vụ chính */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* TASK A CARD */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-edu-50 text-edu-600 flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-edu-600 uppercase tracking-wider">NGHIỆP VỤ 1</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Video Bài Học Từ Tài Liệu</h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Tải lên PDF hoặc ảnh SGK. Hệ thống tự động tạo <strong>DATA PACK</strong> trích xuất nguồn, gợi ý 3 ý tưởng từ <strong>10 MODE</strong> sư phạm, dựng kịch bản, storyboard và prompt Flow/Veo từng cảnh.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Bám sát chuẩn kiến thức SGK, có trích dẫn trang nguồn</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>10 hình thức mở bài sư phạm (tình huống, câu đố, tranh luận...)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Khóa nhân vật & bối cảnh nhất quán xuyên suốt các cảnh</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/projects/new?type=LESSON"
              className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 rounded-xl bg-edu-600 hover:bg-edu-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <span>Bắt đầu tạo Video Bài học</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* TASK B CARD */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">NGHIỆP VỤ 2</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Video Truyền Thông An Toàn</h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Nhập chủ đề an toàn trường học, phòng chống bạo lực hoặc kỹ năng số. Hệ thống tự động kích hoạt <strong>Policy Gate</strong>, đề xuất <strong>Safe Cast</strong> và <strong>Safe Rewrite</strong> chuẩn chính sách.
              </p>
            </div>

            <ul className="space-y-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Kiểm soát an toàn 12 tiêu chí (không bạo lực, bảo vệ trẻ em)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Diễn viên an toàn: Giáo viên hư cấu, linh vật mascot giáo dục</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Tự động viết lại theo hướng an toàn, giữ nguyên thông điệp</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/projects/new?type=CAMPAIGN"
              className="inline-flex items-center justify-center w-full gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-colors shadow-sm"
            >
              <span>Bắt đầu tạo Video Truyền thông</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* DANH SÁCH DỰ ÁN GẦN ĐÂY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FolderKanban className="w-5 h-5 text-edu-600" />
            <h3 className="text-base font-bold text-slate-900">Dự án gần đây của thầy/cô</h3>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-edu-600 hover:text-edu-700"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo dự án mới</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-8 flex items-center justify-center text-slate-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-edu-600" />
            <span>Đang tải danh sách dự án...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
            <p className="text-sm font-medium text-slate-500">Chưa có dự án nào được tạo.</p>
            <p className="text-xs text-slate-400 mt-1">
              Hãy chọn một trong hai nghiệp vụ phía trên để khởi tạo dự án video đầu tiên!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const isLesson = proj.taskType === "LESSON";
              return (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}`}
                  className="p-4 rounded-xl border border-slate-200 hover:border-edu-400 hover:shadow-md transition-all flex flex-col justify-between group bg-slate-50/50 hover:bg-white"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          isLesson
                            ? "bg-edu-50 text-edu-700 border-edu-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {isLesson ? "Bài học" : "Truyền thông"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(proj.updatedAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm group-hover:text-edu-700 transition-colors line-clamp-1">
                      {proj.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {isLesson
                        ? `${proj.subject || "Chưa rõ môn"} • ${proj.targetGrade || "Chưa rõ lớp"}`
                        : proj.topic || "Chiến dịch truyền thông"}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {proj.status}
                    </span>
                    <span className="font-bold text-edu-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Tiếp tục
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
