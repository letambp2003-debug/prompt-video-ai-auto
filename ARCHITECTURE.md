# EDU VIDEO DIRECTOR PRO — ARCHITECTURE DOCUMENTATION

## 1. Giới thiệu tổng quan
**EDU VIDEO DIRECTOR PRO** là nền tảng webapp hỗ trợ giáo viên chuyển đổi bài học (SGK/PDF/Ảnh) hoặc chủ đề truyền thông học đường thành bộ tài nguyên sản xuất video hoàn chỉnh (**Video Production Pack**) tương thích với các công cụ tạo video AI hiện đại như Google Flow / Veo và Google Vids.

## 2. Các tầng kiến trúc (Architectural Layers)

```text
[ GIAO DIỆN NGƯỜI DÙNG (UI/UX) ]
       │  Tiếng Việt sư phạm, Accordion nâng cao, không lộ JSON thô
       ▼
[ TẦNG DỊCH VỤ ỨNG DỤNG (APPLICATION SERVICES) ]
       │  ProjectService, DataPackService, SceneService, SafetyService...
       ▼
[ HỆ THỐNG AGENTS AI (AI AGENT LAYER) ]
       │  11 Agents chuyên trách, Prompt độc lập tại src/ai/prompts/
       ▼
[ LỚP TRỪU TƯỢNG HÓA NHÀ CUNG CẤP & LƯU TRỮ (ABSTRACTION LAYER) ]
       ├── IProjectRepository (FileStorage / SQLite / Supabase)
       ├── IAIProvider (Gemini / Mock)
       ├── IVideoProvider (Veo Adapter / Mock)
       └── IStorageProvider (Local File / Cloud)
```

## 3. Hai luồng nghiệp vụ cốt lõi

### TASK A — Video Bài Học
- **Input:** PDF, ảnh SGK, slide hoặc nội dung văn bản.
- **Quy trình:**
  `Source File → Source Check → DATA PACK → Duyệt DATA PACK → 3 Concept (10 MODE) → Kịch bản → Khóa nhân vật & bối cảnh → Storyboard → Prompt ảnh & video từng cảnh → Google Vids Pack → QC → Export`.
- **Nguyên tắc:** DATA PACK là nguồn sự thật duy nhất (`single source of truth`). Không suy đoán kiến thức khi tài liệu mờ (`THIEU_DU_LIEU`).

### TASK B — Video Truyền Thông An Toàn
- **Input:** Chủ đề, đối tượng, thời lượng, phong cách.
- **Quy trình:**
  `Chủ đề → Policy Gate (12 tiêu chí) → Safe Cast → Safe Rewrite → Concept an toàn → Kịch bản → Storyboard → Prompt sản xuất → Safety QC → Export`.
- **Nguyên tắc:** Tuyệt đối không tạo tính năng bypass; biến đổi tình huống nguy hiểm thành tình huống suýt xảy ra & hành động phòng ngừa an toàn.

## 4. Các quyết định kỹ thuật quan trọng (ADRs)

1. **TypeScript Strict:** Bật chế độ `strict: true` ở cấp độ trình biên dịch để đảm bảo 100% dữ liệu tuân thủ schema.
2. **Cô lập thực thể Scene:** Mỗi cảnh (`Scene`) trong Storyboard là một thực thể độc lập. Khi giáo viên nhấn "Tạo lại cảnh này" (Regenerate Scene), chỉ cảnh được chỉ định thay đổi, các cảnh khác và các Master Lock được bảo toàn tuyệt đối.
3. **Phiên bản hóa DATA PACK:** Khi giáo viên cập nhật DATA PACK sau khi đã duyệt, hệ thống tăng số phiên bản và gắn cờ cảnh báo `STALE` cho kịch bản/storyboard cũ.
4. **Tách biệt Prompt khỏi UI:** 100% System Prompts và User Prompts được đặt độc lập trong thư mục `src/ai/prompts/`, không bao giờ hardcode trong React component.
5. **Chế độ PROMPT_ONLY:** Khi chưa cấu hình API Key tạo video, toàn bộ tính năng vẫn hoạt động 100%, cho phép giáo viên sao chép Prompt độc lập cho từng cảnh sang Google Flow / Veo mà không gặp lỗi.
6. **Xử lý tác vụ Bất đồng bộ (Async Job):** Việc tạo video/ảnh được quản lý bằng Job Table và Polling định kỳ (`GET /api/jobs/:id`), không giữ kết nối HTTP treo lâu.
