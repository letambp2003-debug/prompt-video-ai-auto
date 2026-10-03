"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderHeart,
  Sparkles,
  Film,
  Copy,
  Check,
  ExternalLink,
  Search,
  BookOpen,
  Layers,
  ArrowRight,
  ShieldCheck,
  Video,
  Download,
  Users,
  Compass,
} from "lucide-react";
import { Project } from "@/types";
import { getProjectsLocal } from "@/utils/projectStorage";

interface SamplePrompt {
  id: string;
  mode: string;
  modeTitle: string;
  subject: string;
  title: string;
  duration: string;
  camera: string;
  videoPrompt: string;
  imagePrompt: string;
  voiceover: string;
  pedagogicalNote: string;
}

const SAMPLE_PROMPTS: SamplePrompt[] = [
  {
    id: "sp-1",
    mode: "EDU-01",
    modeTitle: "Tình huống có vấn đề",
    subject: "Lịch sử & Địa lí",
    title: "Bí mật hào nước và thành ốc Cổ Loa thời An Dương Vương",
    duration: "15s",
    camera: "Aerial sweeping drone shot, slow smooth downward tilt",
    videoPrompt:
      "Veo 2 cinematic aerial shot of ancient Vietnamese spiral fortress Co Loa in 3rd century BC, 3 concentric spiral earthen ramparts, wide defensive moats filled with calm reflective water, misty golden morning light, historical realism, 4k 24fps.",
    imagePrompt:
      "Aerial concept art of ancient Vietnamese Co Loa citadel, concentric walls, defensive water moat, historical accuracy, archaeological reconstruction, cinematic lighting, 8k resolution.",
    voiceover:
      "Hơn 2000 năm trước, một kỳ quan quân sự độc nhất vô nhị đã được xây dựng. Tại sao nỏ thần và hào nước thành ốc lại khiến quân thù khiếp sợ?",
    pedagogicalNote: "Kích hoạt sự tò mò của học sinh về trí tuệ quân sự thời dựng nước.",
  },
  {
    id: "sp-2",
    mode: "EDU-02",
    modeTitle: "AI đố học sinh",
    subject: "Khoa học tự nhiên",
    title: "Đố vui: Tại sao lá cây có màu xanh lục?",
    duration: "15s",
    camera: "Extreme macro push-in camera moving inside plant cell",
    videoPrompt:
      "Extreme close-up macro cinematic camera gliding smoothly into a vibrant green plant leaf cell, microscopic chloroplasts actively absorbing sunlight and circulating cytoplasmic streaming, glowing energy particles, scientific visualization, clean photorealistic 4k.",
    imagePrompt:
      "Microscopic botanical view of plant leaf cell, luminous green chloroplast organelles, sunlight ray refraction, high school biology textbook illustration style, 8k.",
    voiceover:
      "Bạn có biết: Nếu không có chất diệp lục hấp thụ quang năng, sự sống trên Trái Đất sẽ ra sao? Hãy thử đoán xem màu sắc nào của ánh sáng bị lá cây phản xạ nhiều nhất?",
    pedagogicalNote: "Khuyến khích học sinh tương tác phản xạ và kiểm tra kiến thức quang hợp.",
  },
  {
    id: "sp-3",
    mode: "EDU-03",
    modeTitle: "Đúng hay sai",
    subject: "Vật lí",
    title: "Phá vỡ hiểu lầm: Vật nặng rơi nhanh hơn vật nhẹ trong chân không?",
    duration: "15s",
    camera: "Eye-level slow motion camera tracking falling objects side by side",
    videoPrompt:
      "Cinematic slow-motion 120fps side-by-side drop test inside an advanced modern transparent vacuum chamber, a heavy bowling ball and a light white feather falling at exact identical speeds and landing simultaneously on soft platform, science laboratory, 4k.",
    imagePrompt:
      "Scientific physics laboratory setup, glass vacuum chamber with bowling ball and feather side by side, Galileo free fall experiment, pristine lighting, 8k.",
    voiceover:
      "Nhiều người nghĩ vật nặng luôn rơi nhanh hơn vật nhẹ. Nhưng nhìn xem! Trong ống chân không không có lực cản không khí, cả hai chạm đất cùng một tích tắc!",
    pedagogicalNote: "Đập tan quan niệm trực giác sai lầm của học sinh về định luật rơi tự do.",
  },
  {
    id: "sp-4",
    mode: "EDU-04",
    modeTitle: "Tranh luận hai quan điểm",
    subject: "Hóa học",
    title: "Năng lượng hạt nhân: Giải pháp năng lượng sạch hay rủi ro tiềm ẩn?",
    duration: "15s",
    camera: "Split screen dynamic transition with smooth pan",
    videoPrompt:
      "Split-screen cinematic view: Left side showing modern green clean city powered by zero-emission nuclear cooling towers with clear blue sky; Right side showing industrial protective barriers and hazardous waste storage caution, balanced educational perspective, 4k.",
    imagePrompt:
      "Modern clean nuclear power plant beside eco-city, contrasting with safety monitoring systems, balanced educational documentary style, 8k.",
    voiceover:
      "Không phát thải khí nhà kính nhưng lại đòi hỏi quy trình xử lý chất thải nghiêm ngặt. Nếu là nhà hoạch định tương lai, bạn chọn giải pháp nào?",
    pedagogicalNote: "Rèn luyện tư duy phản biện đa chiều và đánh giá tác động công nghệ đối với xã hội.",
  },
  {
    id: "sp-5",
    mode: "EDU-05",
    modeTitle: "Chuyện đời thường",
    subject: "Toán học",
    title: "Tam giác đồng dạng trong đo chiều cao cây cổ thụ mà không cần trèo",
    duration: "15s",
    camera: "Low-angle tracking shot from ground to tree top",
    videoPrompt:
      "Two Vietnamese high school students in modern school uniforms using a 1-meter vertical wooden stick and sunlight shadows on the schoolyard ground to calculate the height of a giant flamboyant tree, clean geometry overlay lines drawn in soft glowing light, 4k.",
    imagePrompt:
      "Vietnamese sunny schoolyard, students measuring tree shadow with geometry diagram overlay, educational mathematics in real life, bright daytime aesthetic, 8k.",
    voiceover:
      "Chỉ với một cây cọc và bóng nắng mặt trời, các nhà toán học xưa đã đo được chiều cao của kim tự tháp! Hãy xem định lý Thales làm nên điều kỳ diệu này như thế nào.",
    pedagogicalNote: "Gắn liền toán học trừu tượng với các bài toán đo đạc thực tiễn đời sống.",
  },
  {
    id: "sp-6",
    mode: "EDU-06",
    modeTitle: "Chuyện gì sẽ xảy ra?",
    subject: "Địa lí",
    title: "Chuyện gì sẽ xảy ra nếu Trái Đất ngừng quay trong 5 giây?",
    duration: "15s",
    camera: "Epic wide cinematic space orbit shot slowly tracking Earth",
    videoPrompt:
      "Cinematic orbital view of planet Earth from space, atmosphere and ocean currents dramatically swirling as hypothetical centrifugal forces shift, dynamic educational VFX simulation, safe scientific visualization, hyper-detailed cosmic lighting, 4k.",
    imagePrompt:
      "Planet Earth from orbit, scientifically simulated oceanic tidal shift visualization, space documentary aesthetic, 8k.",
    voiceover:
      "Tốc độ quay của Trái Đất tại xích đạo lên đến 1670 km/h. Nếu đột ngột dừng lại, quán tính sẽ cuốn phăng mọi thứ ra sao?",
    pedagogicalNote: "Ứng dụng tình huống giả định khoa học để làm rõ khái niệm lực quán tính và chuyển động tự quay.",
  },
];

const AI_TOOLS = [
  {
    name: "Google Veo 2 / Google Flow",
    provider: "Google DeepMind",
    badge: "Khuyến nghị số 1",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    description:
      "Mô hình tạo video điện ảnh độ phân giải cao, hiểu sâu sắc cấu trúc không gian 3D và các chỉ lệnh camera chuẩn xác.",
    bestFor: "Sinh video bài giảng phân cảnh 4 cảnh, mô phỏng khoa học và bối cảnh lịch sử.",
    url: "https://deepmind.google/technologies/veo/",
  },
  {
    name: "Kling AI",
    provider: "Kuaishou Technology",
    badge: "Chuyển động chân thực",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    description:
      "Công nghệ mô phỏng vật lý chân thực và thời lượng sinh clip lên tới 10 giây với độ mượt mà vượt trội.",
    bestFor: "Phân cảnh nhân vật tương tác, cử chỉ biểu cảm giáo viên và hoạt cảnh đời thường.",
    url: "https://klingai.org/",
  },
  {
    name: "Midjourney v6",
    provider: "Midjourney Inc",
    badge: "Keyframe chuẩn",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    description:
      "Tạo ảnh tĩnh minh họa đỉnh cao, đóng vai trò Keyframe định vị phong cách nghệ thuật và bố cục trước khi sinh video.",
    bestFor: "Concept art, sơ đồ khoa học minh họa và áp phích mở đầu video bài học.",
    url: "https://www.midjourney.com/",
  },
  {
    name: "ElevenLabs Voice AI",
    provider: "ElevenLabs",
    badge: "Giọng đọc sư phạm",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description:
      "Hệ thống lồng tiếng tự nhiên với âm điệu truyền cảm, ngữ điệu sư phạm chuẩn mực và khả năng đồng bộ nhịp thở.",
    bestFor: "Thuyết minh voiceover bài giảng, đối thoại nhân vật học sinh trong kịch bản.",
    url: "https://elevenlabs.io/",
  },
];

export default function AssetsPage() {
  const [activeTab, setActiveTab] = useState<"PROMPTS" | "PROJECTS" | "LOCKS" | "TOOLS">("PROMPTS");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);

  useEffect(() => {
    const list = getProjectsLocal();
    setUserProjects(list);
  }, []);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      // Fallback
    }
  };

  const filteredPrompts = SAMPLE_PROMPTS.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.modeTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.videoPrompt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = selectedSubject === "ALL" || p.subject === selectedSubject;
    return matchSearch && matchSubject;
  });

  return (
    <div className="space-y-6 py-2">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-edu-50 text-edu-700 border border-edu-200 flex items-center gap-1">
              <FolderHeart className="w-3.5 h-3.5 text-edu-600" />
              KHO TÀI NGUYÊN SỐ & PROMPT SƯ PHẠM
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Thư Viện Tài Nguyên Video Bài Giảng Chuẩn GDPT 2018
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Bộ sưu tập Prompt mẫu 10 MODE, bộ khóa nhân vật & bối cảnh, cùng công cụ sản xuất 1-Click cho Google Veo & Flow.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/projects/new"
            className="px-4 py-2 rounded-xl bg-edu-600 hover:bg-edu-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tạo dự án mới với mẫu</span>
          </Link>
          <Link
            href="/guide"
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Cẩm nang giáo viên</span>
          </Link>
        </div>
      </div>

      {/* Thống kê nhanh */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prompts Mẫu Sư Phạm</div>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
            <span>50+</span>
            <span className="text-xs font-semibold text-emerald-600">Đã kiểm định</span>
          </div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khuôn Mẫu Sư Phạm</div>
          <div className="text-2xl font-black text-edu-600 mt-1 flex items-baseline gap-1.5">
            <span>10 / 10</span>
            <span className="text-xs font-semibold text-slate-500">MODE Chuẩn</span>
          </div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tương Thích Video AI</div>
          <div className="text-2xl font-black text-emerald-600 mt-1 flex items-baseline gap-1.5">
            <span>100%</span>
            <span className="text-xs font-semibold text-slate-500">Veo & Flow</span>
          </div>
        </div>
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dự Án Của Thầy Cô</div>
          <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
            <span>{userProjects.length}</span>
            <span className="text-xs font-semibold text-slate-500">Đang lưu</span>
          </div>
        </div>
      </div>

      {/* Tabs chuyển đổi kho tài nguyên */}
      <div className="flex border-b border-slate-200 gap-2 pb-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab("PROMPTS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "PROMPTS"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Thư viện Prompts mẫu 10 MODE</span>
        </button>

        <button
          onClick={() => setActiveTab("PROJECTS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "PROJECTS"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FolderHeart className="w-4 h-4" />
          <span>Tài nguyên từ Dự án của tôi ({userProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("LOCKS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "LOCKS"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Khóa nhân vật & bối cảnh mẫu</span>
        </button>

        <button
          onClick={() => setActiveTab("TOOLS")}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "TOOLS"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ExternalLink className="w-4 h-4" />
          <span>Bộ công cụ AI kết nối (Veo, Flow, Kling)</span>
        </button>
      </div>

      {/* TAB 1: THƯ VIỆN PROMPTS MẪU */}
      {activeTab === "PROMPTS" && (
        <div className="space-y-4">
          {/* Thanh tìm kiếm và bộ lọc */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm prompt theo tên bài, môn học, từ khóa..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-edu-500 text-xs text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Môn học:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-edu-500"
              >
                <option value="ALL">Tất cả môn học</option>
                <option value="Lịch sử & Địa lí">Lịch sử & Địa lí</option>
                <option value="Khoa học tự nhiên">Khoa học tự nhiên</option>
                <option value="Vật lí">Vật lí</option>
                <option value="Hóa học">Hóa học</option>
                <option value="Toán học">Toán học</option>
                <option value="Địa lí">Địa lí</option>
              </select>
            </div>
          </div>

          {/* Danh sách thẻ Prompt mẫu */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredPrompts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-edu-300 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-edu-50 text-edu-700 border border-edu-200">
                      {p.mode} • {p.modeTitle}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{p.subject} • {p.duration}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{p.title}</h3>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-700">Góc máy:</span>{" "}
                      <span className="text-slate-600">{p.camera}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Lời bình gợi ý:</span>{" "}
                      <span className="text-slate-600 italic">"{p.voiceover}"</span>
                    </div>
                    <div>
                      <span className="font-bold text-emerald-700">Ghi chú sư phạm:</span>{" "}
                      <span className="text-emerald-900">{p.pedagogicalNote}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700">Video Prompt (Google Flow & Veo):</span>
                      <button
                        onClick={() => handleCopy(p.id, p.videoPrompt)}
                        className="text-edu-600 hover:text-edu-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === p.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 text-[11px]">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span className="text-[11px]">Chép Prompt</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed">
                      {p.videoPrompt}
                    </pre>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] text-slate-400">Chuẩn hóa cho Veo 2 / Runway Gen-3</span>
                  <Link
                    href={`/projects/new?title=${encodeURIComponent(p.title)}&subject=${encodeURIComponent(p.subject)}&mode=${p.mode}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-edu-600 hover:text-edu-700"
                  >
                    <span>Dùng mẫu này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TÀI NGUYÊN TỪ DỰ ÁN CỦA TÔI */}
      {activeTab === "PROJECTS" && (
        <div className="space-y-4">
          {userProjects.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-edu-50 text-edu-600 flex items-center justify-center mx-auto">
                <FolderHeart className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Chưa có tài nguyên nào được tạo</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Khi thầy cô hoàn thành các bước thiết kế video bài giảng, toàn bộ Kịch bản, Storyboard và Bộ Prompt xuất bản sẽ tự động lưu trữ tại đây.
                </p>
              </div>
              <Link
                href="/projects/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-edu-600 hover:bg-edu-700 text-white font-bold text-xs shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Bắt đầu thiết kế bài học đầu tiên</span>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-edu-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {proj.subject || "Bài học GDPT"}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(proj.updatedAt || proj.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                      {proj.title}
                    </h4>

                    <div className="text-xs text-slate-500 space-y-1">
                      <p>Khối lớp: <strong>{proj.targetGrade || "Chưa xác định"}</strong></p>
                      <p>Thời lượng: <strong>{proj.durationSeconds || 60} giây</strong></p>
                      <p>MODE Sư phạm: <strong>{proj.selectedMode || "EDU-01"}</strong></p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {proj.status === "COMPLETED" ? "Đã xuất bản" : "Đang làm việc"}
                    </span>
                    <Link
                      href={`/projects/${proj.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-edu-600 hover:text-edu-700"
                    >
                      <span>Mở dự án</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MASTER CONTINUITY LOCKS */}
      {activeTab === "LOCKS" && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Khóa Nhân Vật Đại Diện (Character Master Lock)</h3>
                <p className="text-xs text-slate-500">Giữ nguyên diện mạo học sinh và giáo viên xuyên suốt 4 cảnh.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
              <p className="font-bold text-slate-700">Mẫu nhân vật học sinh Việt Nam:</p>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed">
{`"A fictional 12-year-old Vietnamese middle school student named An, friendly curious face, neat black short hair, wearing a clean crisp white collared school uniform shirt with a red pioneer scarf, expressive respectful eyes, consistent anime-realism 3D Pixar rendering style."`}
              </pre>
              <div className="flex justify-end">
                <button
                  onClick={() =>
                    handleCopy(
                      "lock-char",
                      `A fictional 12-year-old Vietnamese middle school student named An, friendly curious face, neat black short hair, wearing a clean crisp white collared school uniform shirt with a red pioneer scarf, expressive respectful eyes, consistent anime-realism 3D Pixar rendering style.`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === "lock-char" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Sao chép Character Lock</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Khóa Bối Cảnh Lớp Học (Location Master Lock)</h3>
                <p className="text-xs text-slate-500">Không gian trường lớp thân thiện, chuẩn văn hóa học đường Việt Nam.</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
              <p className="font-bold text-slate-700">Mẫu không gian lớp học hiện đại:</p>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono whitespace-pre-wrap leading-relaxed">
{`"A bright, well-ventilated modern Vietnamese high school science classroom, wooden student desks arranged neatly, green chalkboard with clear handwriting, large windows with natural sunlight and tropical green trees outside, clean pedagogical ambiance, 8k."`}
              </pre>
              <div className="flex justify-end">
                <button
                  onClick={() =>
                    handleCopy(
                      "lock-loc",
                      `A bright, well-ventilated modern Vietnamese high school science classroom, wooden student desks arranged neatly, green chalkboard with clear handwriting, large windows with natural sunlight and tropical green trees outside, clean pedagogical ambiance, 8k.`
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === "lock-loc" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>Sao chép Location Lock</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BỘ CÔNG CỤ AI LIÊN KẾT */}
      {activeTab === "TOOLS" && (
        <div className="grid md:grid-cols-2 gap-4">
          {AI_TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-edu-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${tool.badgeColor}`}>
                    {tool.badge}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{tool.provider}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{tool.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{tool.description}</p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Tối ưu nhất cho:</span>{" "}
                  <span className="text-slate-600">{tool.bestFor}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>Truy cập công cụ</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
