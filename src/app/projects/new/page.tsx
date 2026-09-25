"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, ShieldCheck, ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { TaskType } from "@/types";
import { saveProjectLocal } from "@/utils/projectStorage";

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [taskType, setTaskType] = useState<TaskType>("LESSON");
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("Sinh học");
  const [targetGrade, setTargetGrade] = useState("Lớp 11");
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("Học sinh THCS");
  const [durationSeconds, setDurationSeconds] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam === "CAMPAIGN") {
      setTaskType("CAMPAIGN");
    } else {
      setTaskType("LESSON");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const projectTitle = title.trim();
    if (!projectTitle) {
      setErrorMessage("Vui lòng nhập tên dự án.");
      return;
    }

    if (taskType === "CAMPAIGN" && !topic.trim()) {
      setErrorMessage("Vui lòng nhập chủ đề truyền thông.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        title: projectTitle,
        taskType,
        subject: taskType === "LESSON" ? subject : undefined,
        targetGrade: taskType === "LESSON" ? targetGrade : undefined,
        topic: taskType === "CAMPAIGN" ? topic.trim() : undefined,
        targetAudience: taskType === "CAMPAIGN" ? targetAudience : undefined,
        durationSeconds,
      };

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error?.message || "Không thể khởi tạo dự án.");
      }

      // Lưu trữ ngay lập tức vào localStorage để chống mất dữ liệu khi chuyển trang
      saveProjectLocal(json.data);

      // Điều hướng trực tiếp vào không gian làm việc của dự án
      router.push(`/projects/${json.data.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo dự án.";
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-2">
      {/* Nút quay lại */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Bảng điều khiển</span>
        </Link>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Khởi tạo dự án video mới</h1>
        <p className="text-sm text-slate-500">
          Chọn nghiệp vụ phù hợp và nhập các thông số sư phạm ban đầu để bắt đầu.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Lựa chọn Task A vs Task B */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            setTaskType("LESSON");
            if (!title || title.startsWith("Chiến dịch:")) {
              setTitle("Bài 12: Quang hợp ở thực vật");
            }
          }}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            taskType === "LESSON"
              ? "border-edu-500 bg-edu-50/50 ring-2 ring-edu-500 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                taskType === "LESSON" ? "bg-edu-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-edu-600">TASK A</span>
              <h3 className="font-bold text-slate-900 text-base">Video Bài Học</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Từ tài liệu bài học (PDF / ảnh SGK) → Tạo DATA PACK có nguồn → Đề xuất 10 MODE sư phạm.
          </p>
        </button>

        <button
          type="button"
          onClick={() => {
            setTaskType("CAMPAIGN");
            if (!title || title.startsWith("Bài")) {
              setTitle("Chiến dịch: Kỹ năng từ chối người lạ");
            }
          }}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            taskType === "CAMPAIGN"
              ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                taskType === "CAMPAIGN" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">TASK B</span>
              <h3 className="font-bold text-slate-900 text-base">Video Truyền Thông</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Từ chủ đề học đường → Quét 12 tiêu chí Policy Gate → Safe Cast & Safe Rewrite an toàn.
          </p>
        </button>
      </div>

      {/* Biểu mẫu cấu hình chi tiết */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Tên dự án <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={taskType === "LESSON" ? "Ví dụ: Bài 12: Quang hợp ở thực vật" : "Ví dụ: An toàn giao thông cổng trường"}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-edu-500 text-sm font-medium text-slate-900 placeholder:text-slate-400"
            required
          />
        </div>

        {taskType === "LESSON" ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Môn học
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-edu-500 text-sm font-medium text-slate-900 bg-white"
              >
                <option value="Sinh học">Sinh học</option>
                <option value="Toán học">Toán học</option>
                <option value="Vật lí">Vật lí</option>
                <option value="Hóa học">Hóa học</option>
                <option value="Lịch sử & Địa lí">Lịch sử & Địa lí</option>
                <option value="Ngữ văn">Ngữ văn</option>
                <option value="Tin học">Tin học</option>
                <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                <option value="Giáo dục công dân">Giáo dục công dân</option>
                <option value="Khác">Môn khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Khối lớp
              </label>
              <select
                value={targetGrade}
                onChange={(e) => setTargetGrade(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-edu-500 text-sm font-medium text-slate-900 bg-white"
              >
                <option value="Lớp 1">Lớp 1</option>
                <option value="Lớp 2">Lớp 2</option>
                <option value="Lớp 3">Lớp 3</option>
                <option value="Lớp 4">Lớp 4</option>
                <option value="Lớp 5">Lớp 5</option>
                <option value="Lớp 6">Lớp 6</option>
                <option value="Lớp 7">Lớp 7</option>
                <option value="Lớp 8">Lớp 8</option>
                <option value="Lớp 9">Lớp 9</option>
                <option value="Lớp 10">Lớp 10</option>
                <option value="Lớp 11">Lớp 11</option>
                <option value="Lớp 12">Lớp 12</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Chủ đề truyền thông giáo dục <span className="text-red-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Hướng dẫn học sinh nhận biết người lạ có ý định xấu và cách từ chối an toàn..."
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Đối tượng người xem
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 bg-white"
                >
                  <option value="Học sinh Tiểu học (6-10 tuổi)">Học sinh Tiểu học (6-10 tuổi)</option>
                  <option value="Học sinh THCS (11-14 tuổi)">Học sinh THCS (11-14 tuổi)</option>
                  <option value="Học sinh THPT (15-18 tuổi)">Học sinh THPT (15-18 tuổi)</option>
                  <option value="Phụ huynh học sinh">Phụ huynh học sinh</option>
                  <option value="Toàn trường & Cộng đồng">Toàn trường & Cộng đồng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Thời lượng dự kiến
                </label>
                <select
                  value={durationSeconds}
                  onChange={(e) => setDurationSeconds(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-900 bg-white"
                >
                  <option value={45}>45 giây (Ngắn gọn, mạng xã hội)</option>
                  <option value={60}>60 giây (Chuẩn trình chiếu lớp học)</option>
                  <option value={90}>90 giây (Câu chuyện đầy đủ chi tiết)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-bold shadow-sm transition-colors ${
              taskType === "LESSON"
                ? "bg-edu-600 hover:bg-edu-700"
                : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang tạo dự án...</span>
              </>
            ) : (
              <>
                <span>Tiếp tục đến bước Tải lên</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-edu-600" />
          <p className="text-xs text-slate-500">Đang chuẩn bị biểu mẫu...</p>
        </div>
      }
    >
      <NewProjectForm />
    </Suspense>
  );
}

