import React from "react";
import Link from "next/link";
import { LayoutDashboard, FolderKanban, PlusCircle, FolderHeart, BookOpen, Settings } from "lucide-react";

export const Sidebar: React.FC = () => {
  const menuItems = [
    { label: "Bảng điều khiển", icon: LayoutDashboard, href: "/" },
    { label: "Dự án của tôi", icon: FolderKanban, href: "/projects" },
    { label: "Tạo dự án mới", icon: PlusCircle, href: "/projects/new" },
    { label: "Kho tài nguyên", icon: FolderHeart, href: "/assets" },
    { label: "Hướng dẫn giáo viên", icon: BookOpen, href: "/guide" },
    { label: "Cài đặt hệ thống", icon: Settings, href: "/settings" },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Điều hướng chính
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-edu-700 hover:bg-edu-50 transition-colors"
            >
              <Icon className="w-4 h-4 text-slate-400 group-hover:text-edu-600" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Sprint 0 Architecture</p>
        <p className="mt-1">Dành riêng cho giáo viên xây dựng bài giảng đa phương tiện chuẩn Google Flow/Veo.</p>
      </div>
    </aside>
  );
};
