"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  FileCheck,
  Info,
} from "lucide-react";
import { Project, SourceFile } from "@/types";
import { ProjectStepper } from "@/components/project/ProjectStepper";
import { UploadZone } from "@/components/project/UploadZone";
import {
  getProjectLocal,
  saveProjectLocal,
  getSourcesLocal,
  saveSourcesLocal,
  syncProjectToServer,
} from "@/utils/projectStorage";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [sources, setSources] = useState<SourceFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSprint2Notice, setShowSprint2Notice] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    // 1. Khôi phục tức thì từ localStorage nếu có để tránh giật lag hoặc mất trang khi tải lại
    const localProj = getProjectLocal(projectId);
    const localSrcs = getSourcesLocal(projectId);
    if (localProj) {
      setProject(localProj);
      setSources(localSrcs);
      setIsLoading(false);
    }

    const fetchProjectData = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        const json = await res.json();

        if (res.ok && json.ok && json.data?.project) {
          setProject(json.data.project);
          const serverSources = json.data.sources || [];
          setSources(serverSources);
          saveProjectLocal(json.data.project);
          saveSourcesLocal(projectId, serverSources);
          setError(null);
        } else {
          // Nếu container serverless chưa có dự án nhưng client có trong localStorage -> tự động đồng bộ lên server
          if (localProj) {
            await syncProjectToServer(localProj, localSrcs);
            setError(null);
          } else {
            throw new Error(json.error?.message || "Không thể tải dữ liệu dự án.");
          }
        }
      } catch (err: unknown) {
        if (!localProj) {
          const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tải dữ liệu dự án.";
          setError(msg);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleUploadSuccess = (newSource: SourceFile) => {
    setSources((prev) => {
      const updated = [...prev, newSource];
      saveSourcesLocal(projectId, updated);
      return updated;
    });

    if (project) {
      const updatedProject: Project = { ...project, status: "SOURCE_UPLOADED" };
      setProject(updatedProject);
      saveProjectLocal(updatedProject);
    }
  };

  const handleDeleteSuccess = (sourceId: string) => {
    setSources((prev) => {
      const remaining = prev.filter((s) => s.id !== sourceId);
      saveSourcesLocal(projectId, remaining);
      if (remaining.length === 0 && project) {
        const updatedProject: Project = { ...project, status: "NEW" };
        setProject(updatedProject);
        saveProjectLocal(updatedProject);
      }
      return remaining;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="w-8 h-8 text-edu-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Đang tải không gian làm việc dự án...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white border border-red-200 rounded-2xl text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Không thể mở dự án</h2>
          <p className="text-xs text-slate-500 mt-1">{error || "Dự án không tồn tại hoặc đã bị xóa."}</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ</span>
        </Link>
      </div>
    );
  }

  const isLesson = project.taskType === "LESSON";

  return (
    <div className="space-y-6 py-2">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                  isLesson
                    ? "bg-edu-50 text-edu-700 border-edu-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isLesson ? "TASK A — Video Bài Học" : "TASK B — Video Truyền Thông"}
              </span>
              <span className="text-xs text-slate-400 font-medium">ID: {project.id}</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">{project.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium text-slate-600 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Trạng thái: </span>
            <span className="font-bold text-edu-700">{project.status}</span>
          </div>
        </div>
      </div>

      {/* Stepper tiến trình 8 bước */}
      <ProjectStepper taskType={project.taskType} status={project.status} />

      {/* Nội dung Bước 1: Kết nối dữ liệu đầu vào */}
      {isLesson ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cột trái: Khu vực tải lên tài liệu */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-edu-600" />
                    <span>Bước 1: Kết nối tài liệu bài học</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Tải lên các trang sách giáo khoa, file bài học PDF hoặc ảnh chụp để hệ thống chuẩn bị dữ liệu.
                  </p>
                </div>
              </div>

              {/* Upload Zone */}
              <UploadZone
                projectId={project.id}
                project={project}
                sources={sources}
                onUploadSuccess={handleUploadSuccess}
                onDeleteSuccess={handleDeleteSuccess}
              />
            </div>

            {/* Thông báo sẵn sàng Sprint 2 */}
            {showSprint2Notice && (
              <div className="p-4 rounded-xl bg-edu-50 border border-edu-200 flex items-start gap-3 text-edu-900 text-xs">
                <Sparkles className="w-5 h-5 text-edu-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Tài liệu đã được kết nối & lưu trữ an toàn!</p>
                  <p className="mt-1">
                    Tại <strong>Sprint 2</strong>, nút <em>"PHÂN TÍCH BÀI HỌC"</em> sẽ tự động gọi AI trích xuất tri thức thành <strong>DATA PACK</strong> chuẩn hóa với đầy đủ trích dẫn trang nguồn.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Cột phải: Thông tin sư phạm & Nút hành động chính */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Thông tin sư phạm</h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Môn học:</span>
                  <span className="font-bold text-slate-800">{project.subject || "Chưa xác định"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Khối lớp:</span>
                  <span className="font-bold text-slate-800">{project.targetGrade || "Chưa xác định"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-400">Số tài liệu đã nạp:</span>
                  <span className="font-bold text-edu-700">{sources.length} tệp</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Tiến độ lưu trữ:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Đã autosave cục bộ
                  </span>
                </div>
              </div>

              {/* Nút hành động chính: PHÂN TÍCH BÀI HỌC */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={sources.length === 0}
                  onClick={() => setShowSprint2Notice(true)}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all ${
                    sources.length > 0
                      ? "bg-edu-600 hover:bg-edu-700 text-white cursor-pointer"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>PHÂN TÍCH BÀI HỌC</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  {sources.length > 0
                    ? "Nhấn để chuẩn bị trích xuất tri thức sang DATA PACK"
                    : "Vui lòng tải lên ít nhất 1 tài liệu để tiếp tục"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* GIAO DIỆN TASK B - VIDEO TRUYỀN THÔNG */
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Bước 1: Thông tin chủ đề truyền thông học đường</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Dữ liệu đầu vào cho chiến dịch truyền thông an toàn học đường.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông điệp chính</span>
                <p className="text-sm font-semibold text-slate-900 mt-1 leading-relaxed">
                  {project.topic || "Chưa có nội dung chủ đề"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Đối tượng tiếp nhận:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{project.targetAudience}</p>
                </div>
                <div>
                  <span className="text-slate-400">Thời lượng video:</span>
                  <p className="font-bold text-slate-800 mt-0.5">{project.durationSeconds} giây</p>
                </div>
              </div>
            </div>

            {/* Thông báo chuẩn bị cho Policy Gate */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Chủ đề đã được kết nối an toàn</p>
                <p className="mt-1">
                  Dữ liệu này sẽ được quét qua <strong>12 tiêu chí của Policy Gate</strong> và đề xuất <strong>Safe Cast</strong> tự động ở các Sprint tiếp theo.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Quy chuẩn an toàn</h3>
              <ul className="text-xs text-slate-500 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Không cho phép hành vi nguy hiểm</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Bảo vệ quyền riêng tư của học sinh</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Safe Rewrite giữ mục tiêu giáo dục</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={() => setShowSprint2Notice(true)}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>KIỂM TRA CHÍNH SÁCH</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
