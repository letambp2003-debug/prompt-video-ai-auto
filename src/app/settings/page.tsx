"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Key,
  Shield,
  Layers,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Info,
  Server,
  Zap,
} from "lucide-react";

interface KeyItem {
  id: string;
  maskedKey: string;
  status: "ACTIVE" | "COOLDOWN" | "INVALID";
  successCount: number;
  failureCount: number;
}

interface KeyStats {
  total: number;
  active: number;
  cooldown: number;
}

export default function SettingsPage() {
  const [keys, setKeys] = useState<KeyItem[]>([]);
  const [stats, setStats] = useState<KeyStats>({ total: 0, active: 0, cooldown: 0 });
  const [keysInput, setKeysInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/settings/keys");
      const json = await res.json();
      if (json.ok) {
        setKeys(json.data.keys || []);
        setStats(json.data.stats || { total: 0, active: 0, cooldown: 0 });
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keysInput.trim()) {
      setMessage({ text: "Vui lòng nhập ít nhất một API Key.", type: "error" });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keysText: keysInput }),
      });

      const json = await res.json();
      if (json.ok) {
        setKeys(json.data.keys || []);
        setStats(json.data.stats || { total: 0, active: 0, cooldown: 0 });
        setKeysInput("");
        setMessage({
          text: `Đã lưu thành công danh sách ${json.data.stats.total} API Key!`,
          type: "success",
        });
      } else {
        throw new Error(json.error?.message || "Lỗi khi lưu API Key");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đã xảy ra lỗi khi lưu API Key.";
      setMessage({ text: msg, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveKey = async (id: string) => {
    try {
      const res = await fetch(`/api/settings/keys?id=${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        setKeys((prev) => prev.filter((k) => k.id !== id));
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
          active: Math.max(0, prev.active - 1),
        }));
      }
    } catch {
      // Ignore
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Thầy/cô có chắc chắn muốn xóa toàn bộ API Key đã lưu?")) return;
    try {
      const res = await fetch("/api/settings/keys", {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.ok) {
        setKeys([]);
        setStats({ total: 0, active: 0, cooldown: 0 });
        setMessage({ text: "Đã xóa toàn bộ API Key.", type: "success" });
      }
    } catch {
      // Ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cài đặt hệ thống</h1>
            <p className="text-xs text-slate-500 font-medium">
              Quản lý kho đa API Key, cấu hình nhà cung cấp AI và môi trường lưu trữ
            </p>
          </div>
        </div>

        <button
          onClick={fetchKeys}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Làm mới</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <span className="font-medium">{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs underline">
            Đóng
          </button>
        </div>
      )}

      {/* SECTION 1: QUẢN LÝ ĐA API KEY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-edu-50 text-edu-600 rounded-xl">
                <Key className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Kho Đa API Key (Google Gemini)</h2>
            </div>
            <p className="text-xs text-slate-500">
              Hệ thống tự động xoay vòng (Key Rotation) và chuyển khóa thông minh khi gặp giới hạn hạn mức (Rate Limit 429).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
              {stats.active} Đang hoạt động
            </span>
            {stats.cooldown > 0 && (
              <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                {stats.cooldown} Đang tạm nghẽn
              </span>
            )}
          </div>
        </div>

        {/* Lời giải thích sư phạm */}
        <div className="p-4 rounded-xl bg-edu-50/70 border border-edu-200 flex items-start gap-3 text-edu-950 text-xs leading-relaxed">
          <Info className="w-5 h-5 text-edu-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Vì sao thầy/cô nên nhập nhiều API Key?</p>
            <p>
              Google Gemini miễn phí giới hạn 15 lượt gọi mỗi phút (RPM). Khi nhập từ 2 đến 5 API Key, hệ thống sẽ
              <strong> tự động luân phiên</strong> chia đều tải và <strong>tự động chuyển sang key khác</strong> nếu có
              key bị tạm khóa, giúp toàn bộ quá trình đọc tài liệu và dựng kịch bản diễn ra liền mạch không bao giờ bị gián đoạn.
            </p>
          </div>
        </div>

        {/* Biểu mẫu thêm danh sách API Key */}
        <form onSubmit={handleSaveKeys} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Nhập hoặc dán các API Key của bạn (Mỗi dòng một key)
          </label>
          <textarea
            value={keysInput}
            onChange={(e) => setKeysInput(e.target.value)}
            placeholder="AIzaSyA...
AIzaSyB...
AIzaSyC..."
            rows={4}
            className="w-full p-3 font-mono text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-edu-500 bg-slate-50/50"
          />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Chấp nhận định dạng phân tách bằng xuống dòng hoặc dấu phẩy.</span>
            <div className="flex gap-2">
              {keys.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-edu-600 hover:bg-edu-700 text-white font-bold rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{isSaving ? "Đang lưu..." : "Lưu danh sách API Key"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Danh sách các Key đang được quản lý */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Danh sách khóa hiện có ({keys.length})
          </h3>

          {isLoading ? (
            <div className="py-6 text-center text-xs text-slate-400">Đang tải danh sách khóa...</div>
          ) : keys.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Key className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">Chưa có API Key nào được lưu trong kho</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Ứng dụng hiện đang dùng chế độ <strong>PROMPT_ONLY</strong> hoặc key từ biến môi trường máy chủ.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {keys.map((k) => (
                <div
                  key={k.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        k.status === "ACTIVE"
                          ? "bg-emerald-500"
                          : k.status === "COOLDOWN"
                          ? "bg-amber-500 animate-ping"
                          : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="font-mono font-semibold text-slate-800">{k.maskedKey}</p>
                      <p className="text-[10px] text-slate-400">
                        {k.status === "ACTIVE"
                          ? "Sẵn sàng hoạt động"
                          : k.status === "COOLDOWN"
                          ? "Đang tạm dừng hạn mức"
                          : "Không hợp lệ"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveKey(k.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                    title="Xóa khóa này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: CHẾ ĐỘ VIDEO & MÔI TRƯỜNG */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Chế độ tạo Video</h3>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Chế độ: PROMPT_ONLY (Khuyến nghị)</span>
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Tạo kịch bản, bảng phân cảnh Storyboard và câu lệnh Prompt độc lập tối ưu cho Google Flow, Google Veo và
              Google Vids hoàn toàn miễn phí.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-edu-600" />
            <h3 className="text-base font-bold text-slate-900">Môi trường lưu trữ</h3>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cơ chế: FileSystem + Resilient Serverless Cache</span>
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Tự động lưu trữ cục bộ và tương thích với cả môi trường máy chủ đám mây (Vercel / Cloud Functions) qua thư
              mục tạm an toàn, không lo lỗi quyền ghi đĩa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
