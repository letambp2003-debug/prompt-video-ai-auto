"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderKanban, PlusCircle, Search, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Project } from "@/types";
import { getProjectsLocal, saveProjectLocal, syncProjectToServer } from "@/utils/projectStorage";

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Nạp ngay từ localStorage để hiển thị tức thì, không bị trống trang
    const localList = getProjectsLocal();
    if (localList.length > 0) {
      setProjects(localList);
      setIsLoading(false);
    }

    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        const json = await res.json();
        const serverList: Project[] = json.ok && Array.isArray(json.data) ? json.data : [];

        // Hợp nhất danh sách server và client theo id
        const mergedMap = new Map<string, Project>();
        for (const p of localList) {
          mergedMap.set(p.id, p);
        }
        for (const p of serverList) {
          mergedMap.set(p.id, p);
          saveProjectLocal(p); // Lưu bản mới nhất từ server vào local
        }

        const merged = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        setProjects(merged);

        // Tự động đồng bộ các dự án local lên server nếu server chưa có
        const serverIds = new Set(serverList.map((s) => s.id));
        for (const p of localList) {
          if (!serverIds.has(p.id)) {
            syncProjectToServer(p).catch(() => {});
          }
        }
      } catch {
        // Nếu server lỗi, vẫn giữ nguyên danh sách từ localStorage
      } finally {
        setIsLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.subject && p.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.topic && p.topic.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dự án của tôi</h1>
          <p className="text-sm text-slate-500">Quản lý và tiếp tục hoàn thiện các dự án video đã tạo.</p>
        </div>

        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-edu-600 hover:bg-edu-700 text-white font-bold text-sm shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo dự án mới</span>
        </Link>
      </div>

      {/* Tìm kiếm */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm dự án theo tên bài, môn học hoặc chủ đề..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-edu-500 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-white"
        />
      </div>

      {isLoading ? (
        <div className="py-16 flex items-center justify-center text-slate-400 text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-edu-600" />
          <span>Đang tải danh sách dự án...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 bg-white rounded-2xl">
          <FolderKanban className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">
            {searchTerm ? "Không tìm thấy dự án phù hợp với từ khóa" : "Chưa có dự án nào"}
          </p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? "Vui lòng thử tìm kiếm với tên bài học hoặc chủ đề khác."
              : "Bắt đầu chuyển đổi học liệu bài giảng hoặc chủ đề truyền thông thành video ngay hôm nay."}
          </p>
          {!searchTerm && (
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-edu-600 text-white text-xs font-bold hover:bg-edu-700"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo dự án đầu tiên</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((proj) => {
            const isLesson = proj.taskType === "LESSON";
            return (
              <Link
                key={proj.id}
                href={`/projects/${proj.id}`}
                className="p-5 rounded-2xl border border-slate-200 hover:border-edu-400 hover:shadow-md transition-all flex flex-col justify-between group bg-white"
              >
                <div className="space-y-2.5">
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

                  <h3 className="font-bold text-slate-900 text-base group-hover:text-edu-700 transition-colors line-clamp-1">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {isLesson
                      ? `${proj.subject || "Chưa rõ môn"} • ${proj.targetGrade || "Chưa rõ lớp"}`
                      : proj.topic || "Chiến dịch truyền thông"}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {proj.status}
                  </span>
                  <span className="font-bold text-edu-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Vào dự án
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
