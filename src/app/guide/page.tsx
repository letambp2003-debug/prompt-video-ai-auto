"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Key,
  ShieldCheck,
  Film,
  Layers,
  Award,
  Download,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Brain,
  Video,
  FileText,
  Lightbulb,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "Tôi có cần biết kỹ năng quay dựng phim chuyên nghiệp để sử dụng không?",
    answer:
      "Hoàn toàn không. Hệ thống đã tự động hóa 100% việc chuyển đổi kiến thức từ Sách giáo khoa thành kịch bản phân cảnh chuẩn điện ảnh, góc quay camera, lời bình và prompt video. Thầy cô chỉ cần nạp tài liệu và 1-Click sao chép prompt dán vào Google Flow hoặc Veo.",
  },
  {
    question: "Làm sao để đảm bảo video bài giảng đúng chuẩn chương trình GDPT 2018?",
    answer:
      "Ngay từ Bước 2, hệ thống trích xuất DATA PACK chuẩn hóa: Yêu cầu cần đạt (YCCD), Kiến thức trọng tâm (KT) và các hiểu lầm thường gặp (SAI) khớp theo từng trang SGK. Bước 7 hệ thống có Cổng kiểm định QC Gate 5 chiều chấm điểm (tối thiểu 90/100) để đảm bảo tính sư phạm chuẩn mực.",
  },
  {
    question: "Làm thế nào để lấy nhiều Gemini API Key miễn phí để hệ thống chạy nhanh hơn?",
    answer:
      "Thầy cô có thể truy cập aistudio.google.com, đăng nhập tài khoản Google (Gmail) và bấm 'Get API key'. Sau đó dán vào mục Cài đặt hệ thống. Hệ thống hỗ trợ nhập nhiều API Key và tự động xoay vòng thông minh (Load Balancing) để không bao giờ bị giới hạn tốc độ (Rate Limit).",
  },
  {
    question: "Làm sao để nhân vật học sinh trong video không bị biến dạng giữa các cảnh?",
    answer:
      "Hệ thống ứng dụng công nghệ 'Master Continuity Locks' (Khóa liên tục nhân vật & bối cảnh). Mỗi phân cảnh trong Storyboard đều được nhúng sẵn diện mạo nhân vật (tuổi, trang phục, đồng phục học sinh, biểu cảm) và bối cảnh lớp học giúp các mô hình AI như Google Veo giữ tính nhất quán tuyệt đối.",
  },
  {
    question: "Dữ liệu sách và tài liệu bài giảng tôi tải lên có được an toàn không?",
    answer:
      "Hệ thống chạy trên cơ chế cục bộ (Local Storage & Dedicated API), toàn bộ dữ liệu tài liệu, bài giảng và kịch bản chỉ lưu trên trình duyệt của thầy cô và được truyền trực tiếp đến Gemini API thông qua khóa bí mật cá nhân của thầy cô, không chia sẻ với bên thứ ba.",
  },
];

const STEPS_DATA = [
  {
    step: "1",
    title: "Kết nối tài liệu bài học",
    badge: "Học liệu SGK & Tài liệu",
    desc: "Tải lên các trang Sách giáo khoa, file PDF hoặc ảnh chụp tư liệu bài dạy. AI Gemini 2.5 Multimodal sẽ đọc sâu từng trang, quét chữ và hình ảnh minh họa.",
    icon: BookOpen,
  },
  {
    step: "2",
    title: "Thẩm định DATA PACK",
    badge: "Chuẩn GDPT 2018",
    desc: "Hệ thống trích xuất tri thức chuẩn: Yêu cầu cần đạt (YCCD), Kiến thức trọng tâm (KT), Thuật ngữ (TN), Hiểu lầm học sinh (SAI) và Ý tưởng Video Hook.",
    icon: Brain,
  },
  {
    step: "3",
    title: "Lựa chọn MODE Sư phạm",
    badge: "10 Khuôn mẫu dạy học",
    desc: "Chọn 1 trong 10 MODE Sư phạm hiện đại (Tình huống có vấn đề, AI đố học sinh, Đúng hay sai, Tranh luận...) để định hình phong cách dẫn dắt bài giảng.",
    icon: Lightbulb,
  },
  {
    step: "4",
    title: "Kịch bản Timeline phân đoạn",
    badge: "Kịch bản chuẩn thời lượng",
    desc: "Tạo cấu trúc 4 phân cảnh với thời lượng chuẩn xác, mục tiêu sư phạm cụ thể, lời thoại/voiceover truyền cảm và mô tả thị giác chi tiết.",
    icon: FileText,
  },
  {
    step: "5",
    title: "Storyboard & Prompts Veo/Flow",
    badge: "Khóa Master Continuity",
    desc: "Tạo 4 phân cảnh độc lập kèm Prompt Video điện ảnh tối ưu cho Google Flow & Veo 2, khóa diện mạo nhân vật và bối cảnh không bị méo lệch.",
    icon: Film,
  },
  {
    step: "6",
    title: "Kiểm tra chính sách học đường",
    badge: "Safe Rewrite",
    desc: "Quét 12 tiêu chí an toàn trường học của Policy Gate. Tự động viết lại an toàn (Safe Rewrite) nếu có tình huống nhạy cảm, bảo vệ học sinh tuyệt đối.",
    icon: ShieldCheck,
  },
  {
    step: "7",
    title: "Cổng kiểm định QC Gate 5 chiều",
    badge: "Thẩm định chất lượng",
    desc: "Đánh giá 5 chiều: Khớp nguồn học liệu, Tính sư phạm, Khóa liên tục nhân vật, Khả thi kỹ thuật video và An toàn học đường. Đạt điểm 90-100/100.",
    icon: Award,
  },
  {
    step: "8",
    title: "Xuất bản Production Pack",
    badge: "Hoàn tất quy trình 100%",
    desc: "Tải về Hồ sơ giáo án (Markdown), Bộ Prompt 1-Click sao chép sang Veo/Flow/Kling và Gói dữ liệu kỹ thuật JSON để lưu trữ hoặc chia sẻ đồng nghiệp.",
    icon: Download,
  },
];

const MODES_DATA = [
  {
    id: "EDU-01",
    name: "Tình huống có vấn đề",
    fit: "Toán, Vật lí, Hóa học, Lịch sử",
    desc: "Đưa ra nghịch lý hoặc câu đố thực tiễn ở giây đầu tiên, buộc học sinh phải huy động kiến thức bài học để giải quyết.",
  },
  {
    id: "EDU-02",
    name: "AI đố học sinh",
    fit: "KHTN, Địa lí, Sinh học, Ngoại ngữ",
    desc: "Nhân vật AI hoặc giáo viên đưa ra câu hỏi trắc nghiệm tương tác nhanh kèm đồng hồ đếm ngược kích thích phản xạ.",
  },
  {
    id: "EDU-03",
    name: "Đúng hay sai (Mythbuster)",
    fit: "Sinh học, Vật lí, GDCD, Đời sống",
    desc: "Nêu lên hiểu lầm phổ biến mà nhiều học sinh thường mắc phải, sau đó dùng thực nghiệm hoặc chứng cứ khoa học để đính chính.",
  },
  {
    id: "EDU-04",
    name: "Tranh luận hai quan điểm",
    fit: "Lịch sử, Địa lí, GDCD, Ngữ văn",
    desc: "Hai nhân vật đại diện cho hai góc nhìn khác nhau đối thoại lịch sự, rèn luyện cho học sinh tư duy phản biện đa chiều.",
  },
  {
    id: "EDU-05",
    name: "Chuyện đời thường",
    fit: "Toán học, Hóa học, Công nghệ",
    desc: "Bắt đầu bằng một hoạt động quen thuộc trong đời sống hàng ngày (nấu ăn, bóng đá, mua sắm) để dẫn dắt vào bài học.",
  },
  {
    id: "EDU-06",
    name: "Chuyện gì sẽ xảy ra?",
    fit: "Địa lí, Thiên văn, Vật lí, Môi trường",
    desc: "Đặt ra giả định khoa học kỳ thú (Nếu Trái Đất ngừng quay? Nếu không có lực ma sát?) để kích thích trí tưởng tượng.",
  },
];

export default function GuidePage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="space-y-8 py-2 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-edu-50 text-edu-700 border border-edu-200 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-edu-600" />
            CẨM NANG SƯ PHẠM & HƯỚNG DẪN SỬ DỤNG
          </span>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Quy Trình 8 Bước Thiết Kế Video Bài Giảng Chuẩn GDPT 2018
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            Hệ thống trợ lý AI chuyên biệt dành cho giáo viên Việt Nam, giúp chuyển hóa tài liệu Sách giáo khoa thành kịch bản phân cảnh chuẩn điện ảnh và bộ Prompts 1-Click đưa vào sản xuất trên Google Flow & Veo 2.
          </p>
        </div>

        <div className="pt-2 flex flex-wrap items-center gap-3">
          <Link
            href="/projects/new"
            className="px-5 py-2.5 rounded-xl bg-edu-600 hover:bg-edu-700 text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Bắt đầu thiết kế bài học ngay</span>
          </Link>
          <Link
            href="/assets"
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Film className="w-4 h-4 text-slate-400" />
            <span>Khám phá Kho tài nguyên & Prompt mẫu</span>
          </Link>
          <Link
            href="/settings"
            className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Key className="w-4 h-4 text-slate-400" />
            <span>Cài đặt Gemini API Key</span>
          </Link>
        </div>
      </div>

      {/* PHẦN 1: QUY TRÌNH 8 BƯỚC SƯ PHẠM */}
      <div className="space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-edu-600" />
            <span>Chi tiết quy trình sư phạm 8 bước khép kín</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Được thiết kế bám sát Thông tư 32/2018/TT-BGDĐT và tối ưu hóa cho các mô hình AI tạo video thế hệ mới.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {STEPS_DATA.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-edu-300 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-edu-600 text-white font-black text-xs flex items-center justify-center shadow-sm">
                      {s.step}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {s.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{s.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-edu-700 font-semibold">
                  <Icon className="w-4 h-4 text-edu-600" />
                  <span>Bước {s.step} trong quy trình</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PHẦN 2: CẨM NANG 10 MODE SƯ PHẠM */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Cẩm nang 10 MODE Sư Phạm GDPT 2018</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Mỗi MODE kích hoạt một dạng tư duy khác nhau của học sinh theo thang đo Bloom.
            </p>
          </div>
          <Link
            href="/assets"
            className="text-xs font-bold text-edu-600 hover:text-edu-700 flex items-center gap-1"
          >
            <span>Xem prompt mẫu của từng MODE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODES_DATA.map((m) => (
            <div
              key={m.id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-edu-700 bg-edu-50 px-2 py-0.5 rounded border border-edu-200">
                  {m.id}
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">{m.fit}</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{m.name}</h4>
              <p className="text-slate-600 leading-relaxed">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PHẦN 3: CÔNG THỨC PROMPT CHUẨN ĐIỆN ẢNH VEO & FLOW */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 md:p-8 shadow-sm space-y-5">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            BÍ QUYẾT SẢN XUẤT 1-CLICK
          </span>
          <h2 className="text-xl font-bold tracking-tight text-white mt-2">
            Công Thức 5 Thành Phần Vàng Cho Prompt Video Sư Phạm
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
            Để Google Veo, Kling hoặc Runway tạo ra thước phim bài giảng chuẩn xác, không bị méo nhân vật và ánh sáng hài hòa, hệ thống tự động áp dụng công thức 5 thành phần sau trong từng phân cảnh:
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
            <span className="font-bold text-emerald-400">1. Master Continuity Lock</span>
            <p className="text-slate-300">Đồng bộ nhân vật học sinh Việt Nam, tuổi, nét mặt và đồng phục học đường.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
            <span className="font-bold text-sky-400">2. Bối Cảnh Lớp Học</span>
            <p className="text-slate-300">Phòng học thoáng đãng, bàn ghế gỗ, bảng xanh hoặc phòng thí nghiệm an toàn.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
            <span className="font-bold text-amber-400">3. Hành Động Sư Phạm</span>
            <p className="text-slate-300">Học sinh làm thí nghiệm, thảo luận sôi nổi, quan sát sơ đồ trực quan.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
            <span className="font-bold text-purple-400">4. Chuyển Động Camera</span>
            <p className="text-slate-300">Góc máy lướt chậm (Slow push-in), flycam bay ngang (Drone pan), macro cận cảnh.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1.5">
            <span className="font-bold text-pink-400">5. Phong Cách Điện Ảnh</span>
            <p className="text-slate-300">Ánh sáng tự nhiên 8k, phong cách bán thực tế Pixar 3D hoặc phim tài liệu khoa học.</p>
          </div>
        </div>
      </div>

      {/* PHẦN 4: HƯỚNG DẪN KẾT NỐI GEMINI API KEY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-edu-600" />
          <h2 className="text-lg font-black text-slate-900">
            Hướng dẫn lấy và nạp nhiều Gemini API Key miễn phí
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Chỉ mất 2 phút để kích hoạt hệ thống với khóa API hoàn toàn miễn phí từ Google AI Studio.
        </p>

        <div className="grid md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <span className="w-6 h-6 rounded-full bg-edu-600 text-white font-bold flex items-center justify-center">1</span>
            <h4 className="font-bold text-slate-900">Truy cập Google AI Studio</h4>
            <p className="text-slate-600 leading-relaxed">
              Mở trang <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-edu-600 underline font-bold">aistudio.google.com</a> và đăng nhập tài khoản Gmail.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <span className="w-6 h-6 rounded-full bg-edu-600 text-white font-bold flex items-center justify-center">2</span>
            <h4 className="font-bold text-slate-900">Nhấn Get API key</h4>
            <p className="text-slate-600 leading-relaxed">
              Bấm nút <strong>Create API key</strong> và sao chép chuỗi mã khóa bắt đầu bằng <code>AIzaSy...</code>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <span className="w-6 h-6 rounded-full bg-edu-600 text-white font-bold flex items-center justify-center">3</span>
            <h4 className="font-bold text-slate-900">Nạp vào Cài đặt hệ thống</h4>
            <p className="text-slate-600 leading-relaxed">
              Chuyển đến trang <Link href="/settings" className="text-edu-600 underline font-bold">Cài đặt hệ thống</Link>, dán API Key vào ô và bấm Thêm khóa.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <span className="w-6 h-6 rounded-full bg-edu-600 text-white font-bold flex items-center justify-center">4</span>
            <h4 className="font-bold text-slate-900">Tự động xoay vòng thông minh</h4>
            <p className="text-slate-600 leading-relaxed">
              Thầy cô có thể thêm từ 2-5 API key để hệ thống tự động cân bằng tải và xử lý tài liệu không bị gián đoạn.
            </p>
          </div>
        </div>
      </div>

      {/* PHẦN 5: CÂU HỎI THƯỜNG GẶP (FAQ) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-edu-600" />
          <h2 className="text-lg font-black text-slate-900">Câu hỏi thường gặp của giáo viên</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {FAQS.map((faq, idx) => (
            <div key={idx} className="py-3.5 space-y-2">
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-left font-bold text-sm text-slate-800 hover:text-edu-600 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                {openFaqIndex === idx ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>
              {openFaqIndex === idx && (
                <p className="text-xs text-slate-600 leading-relaxed pl-1 pt-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
