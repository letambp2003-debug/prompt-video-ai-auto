# USER FLOW

# FLOW 0 — DASHBOARD
Dashboard:
- Nút `TẠO VIDEO BÀI HỌC`
- Nút `VIDEO TRUYỀN THÔNG`
- Danh sách project gần đây
- Search
- New project

---

# FLOW A — VIDEO BÀI HỌC

## A1. New Project
User:
1. Chọn “Video bài học”.
2. Nhập tên project hoặc để hệ thống tự đặt.
3. Upload PDF/ảnh.

System:
- Tạo project.
- Lưu source file.
- status = `SOURCE_UPLOADED`.

## A2. Analyze Source
User bấm:
`PHÂN TÍCH BÀI HỌC`

System:
- source check;
- parse/extract;
- DATA PACK;
- status = `DATA_PACK_READY`.

UI chuyển sang Data Pack Review.

## A3. Data Pack Review
User thấy:
- môn;
- lớp;
- bài;
- trang;
- YCCD;
- KT;
- CT;
- hình;
- sai lầm;
- liên hệ thực tế.

User:
- sửa nếu cần;
- bấm `XÁC NHẬN DATA PACK`.

System:
- freeze data pack version;
- status = `DATA_PACK_APPROVED`.

## A4. Concept
System:
- tạo 3 concept;
- mỗi concept có Mode + Hook + Reason + Final Question.

User:
- chọn 1;
hoặc
- bấm `AI TỰ CHỌN`.

System:
- status = `MODE_SELECTED`.

## A5. Generate Script
User bấm:
`TẠO KỊCH BẢN`

System tạo:
- brief;
- script;
- character;
- location;
- style;
- storyboard;
- prompts.

status:
`STORYBOARD_READY`.

## A6. Scene Workspace
User làm từng Scene:
- xem nội dung;
- sửa;
- copy Image Prompt;
- copy Video Prompt;
- tạo asset nếu provider khả dụng;
- regenerate riêng scene.

## A7. QC
User bấm:
`KIỂM TRA TOÀN BỘ`

System:
- source;
- pedagogy;
- continuity;
- safety.

## A8. Export
- Markdown;
- JSON;
- ZIP.

---

# FLOW B — VIDEO TRUYỀN THÔNG

## B1. Input
User nhập:
- chủ đề;
- đối tượng;
- duration;
- style.

## B2. Policy Gate
System:
- kiểm tra;
- nếu cần rewrite → tạo safe alternative.

## B3. Concepts
Tạo 3 concept.

## B4. Generate
- script;
- cast;
- storyboard;
- prompts.

## B5. Scenes
Giống FLOW A.

## B6. QC
Safety QC là bắt buộc.

## B7. Export

---

# FLOW SỬA SCENE
User:
- mở Scene 04;
- sửa prompt/nội dung;
- bấm Save.

Nếu bấm `TẠO LẠI CẢNH`:
- chỉ scene này thay đổi;
- scene khác giữ nguyên;
- continuity lock giữ nguyên;
- tạo version mới.

---

# FLOW LỖI
Nếu AI/API lỗi:
- không xóa output cũ;
- hiển thị error rõ;
- nút retry;
- lưu request ID/log kỹ thuật ở Advanced Details.

---

# FLOW PROMPT-ONLY
Nếu chưa có video API:
- nút `TẠO VIDEO` đổi thành `COPY PROMPT CHO FLOW/VEO`;
- app vẫn hoạt động 100% ở mức tạo Production Pack.
