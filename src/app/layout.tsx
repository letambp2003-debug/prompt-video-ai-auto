import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "EDU VIDEO DIRECTOR PRO - Trợ lý video giáo dục dành cho giáo viên",
  description: "Biến tài liệu bài học và chủ đề truyền thông thành Video Production Pack chuẩn Google Flow / Veo & Google Vids",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
