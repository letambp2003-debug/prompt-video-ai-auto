import React from "react";
import { Sparkles, Settings, Video } from "lucide-react";
import Link from "next/link";

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-edu-600 text-white flex items-center justify-center font-bold shadow-sm">
          <Video className="w-5 h-5" />
        </div>
        <div>
          <span className="font-bold text-slate-900 tracking-tight text-lg">
            EDU VIDEO DIRECTOR <span className="text-edu-600 text-sm font-extrabold uppercase px-1.5 py-0.5 bg-edu-50 rounded border border-edu-200">PRO</span>
          </span>
          <p className="text-xs text-slate-500 font-medium">Trợ lý sản xuất video bài học & truyền thông học đường</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Badge chế độ PROMPT-ONLY */}
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Chế độ: PROMPT ONLY (An toàn)</span>
        </div>

        {/* Nút cài đặt */}
        <Link
          href="/settings"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Cài đặt hệ thống"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
};
