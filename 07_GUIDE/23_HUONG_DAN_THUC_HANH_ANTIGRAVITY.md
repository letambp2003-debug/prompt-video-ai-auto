# HƯỚNG DẪN THỰC HÀNH ANTIGRAVITY
## Xây EDU VIDEO DIRECTOR PRO từ Project Pack

Tài liệu này dành cho người không phải lập trình viên chuyên nghiệp nhưng muốn dùng Antigravity để triển khai app theo từng bước.

---

# PHẦN 1 — CHUẨN BỊ

## 1. Giải nén Project Pack
Thư mục phải có:
- 00_START
- 01_PRODUCT
- 02_AI_BRAIN
- 03_SAFETY
- 04_ENGINEERING
- 05_TEST
- 06_ANTIGRAVITY
- 07_GUIDE

Không đổi tên file trong giai đoạn đầu.

## 2. Tạo thư mục code riêng
Ví dụ:
`edu-video-director-pro-app`

Có thể để Project Pack trong:
`edu-video-director-pro-app/docs/project-pack`

## 3. Mở folder trong Antigravity
Mở folder gốc, không mở riêng một file.

---

# PHẦN 2 — LẦN ĐẦU LÀM VIỆC VỚI ANTIGRAVITY

## Bước 1
Mở:
`06_ANTIGRAVITY/21_ANTIGRAVITY_MASTER_PROMPT.md`

Copy toàn bộ prompt.

## Bước 2
Dán vào Agent chính.

## Bước 3
Yêu cầu:
“Đọc toàn bộ tài liệu trước khi code.”

## Bước 4
Kiểm tra Antigravity có nhắc đủ:
- TASK A;
- TASK B;
- DATA PACK;
- 10 MODE;
- Scene;
- Safety;
- QC;
- Prompt-only.

Nếu thiếu, chưa cho code.

---

# PHẦN 3 — SPRINT 0

Mục tiêu duy nhất:
**app khởi động được**.

Antigravity nên tạo:
- package project;
- TypeScript;
- Tailwind;
- source folders;
- env example;
- app shell;
- README kỹ thuật.

Sau khi agent báo xong:

## Kiểm tra
1. Mở terminal.
2. Cài dependencies nếu agent chưa làm.
3. Chạy lệnh dev được ghi trong README/package.
4. Mở localhost.
5. Thấy trang EDU VIDEO DIRECTOR PRO.

Nếu trang trắng:
- copy lỗi terminal;
- gửi lại Antigravity;
- yêu cầu sửa Sprint 0;
- không chạy Sprint 1.

---

# PHẦN 4 — SPRINT 1: DASHBOARD + UPLOAD

Dùng prompt Sprint 1.

Kết quả cần thấy:
- 2 nút lớn:
  - VIDEO BÀI HỌC
  - VIDEO TRUYỀN THÔNG
- tạo project;
- trang upload;
- project còn sau refresh.

## Nghiệm thu
Thử:
1. tạo project A;
2. refresh;
3. project vẫn còn;
4. upload file mẫu;
5. UI hiển thị tên file.

Nếu chưa đạt, yêu cầu:
“Chỉ sửa lỗi Sprint 1. Không triển khai AI.”

---

# PHẦN 5 — SPRINT 2: DATA PACK

Đây là Sprint quan trọng nhất.

Khi chưa có API key:
- bắt agent làm MOCK MODE;
- UI vẫn phải chạy.

Khi có API key:
- nhập qua `.env.local`;
- không dán secret vào source hoặc chat log nếu không cần.

## Kết quả cần thấy
Sau upload:
- Phân tích bài học.
- Data Pack Review.
- edit.
- approve.

## Test thủ công
Sửa KT-01.
Save.
Refresh.
KT-01 vẫn giữ.

Approve.
Sau đó sửa lại:
app phải tạo version hoặc yêu cầu tạo bản mới, không âm thầm sửa approved version.

---

# PHẦN 6 — SPRINT 3: 10 MODE + SCRIPT

Sau Data Pack:
- bấm tạo ý tưởng;
- app hiện đúng 3 concept;
- mỗi concept có Mode, Hook, Reason, câu hỏi kết.

Chọn 1.

Tạo script.

Kết quả cần thấy:
- video brief;
- script;
- character lock;
- location lock;
- visual style.

---

# PHẦN 7 — SPRINT 4: STORYBOARD

Đây là màn hình người dùng sẽ dùng nhiều nhất.

Mỗi Scene cần có:
- số cảnh;
- duration;
- purpose;
- action;
- camera;
- voice;
- image prompt;
- video prompt.

## Test bắt buộc
Ghi nội dung Scene 01 ra giấy.
Regenerate Scene 04.
Kiểm tra Scene 01 không thay đổi.

Nếu thay đổi:
đây là lỗi kiến trúc.
Phải sửa trước Sprint 5.

---

# PHẦN 8 — SPRINT 5: VIDEO GENERATION

Bắt đầu bằng Prompt-only.

## Prompt-only
Nút:
- Copy Image Prompt
- Copy Video Prompt

Thử copy và paste sang Notepad.
Phải đúng nội dung Scene.

## Sau đó mới nối provider
Provider phải nằm sau interface/adapter.

Không cho UI gọi trực tiếp external video API.

## Job
Bấm Generate:
- Chờ;
- Đang tạo;
- Hoàn thành/lỗi.

Refresh trong lúc job chạy:
project không mất.

---

# PHẦN 9 — SPRINT 6: VIDEO TRUYỀN THÔNG

Tạo project TASK B.

Nhập thử:
“An toàn khi người lạ nhờ học sinh mang đồ.”

Kết quả:
- policy gate;
- safe cast;
- 3 concept;
- script;
- scenes;
- prompts.

Thử một input có cảnh nguy hiểm.
App phải đề xuất Safe Rewrite.
Không được có nút “bypass filter”.

---

# PHẦN 10 — SPRINT 7: QC + EXPORT

QC phải chia ít nhất:
- Source;
- Pedagogy;
- Continuity;
- Safety.

Export:
- JSON;
- Markdown;
- ZIP.

Giải nén ZIP.
Phải có dữ liệu project có thể đọc lại.

---

# PHẦN 11 — CÁCH BÁO LỖI CHO ANTIGRAVITY

Không nói:
“App không chạy, sửa giúp.”

Hãy dùng mẫu:

```text
SPRINT:
Sprint 4

MÀN HÌNH:
Storyboard

THAO TÁC:
Tôi regenerate Scene 04.

KẾT QUẢ MONG MUỐN:
Chỉ Scene 04 thay đổi.

KẾT QUẢ THỰC TẾ:
Scene 01–03 cũng đổi.

YÊU CẦU:
Tìm root cause.
Chỉ sửa lỗi này.
Không thêm chức năng mới.
Chạy test hồi quy trước khi kết thúc.
```

---

# PHẦN 12 — KHI ANTIGRAVITY MUỐN LÀM QUÁ NHIỀU

Nếu Agent tự làm Sprint tiếp:
dán:

```text
DỪNG.
Chỉ thực hiện phạm vi Sprint hiện tại.
Không thêm feature ngoài Sprint.
Hãy rollback hoặc cô lập các thay đổi ngoài scope nếu chúng gây rủi ro.
Chạy test Sprint hiện tại và chờ nghiệm thu.
```

---

# PHẦN 13 — FILE CẦN BẢO VỆ

Không cho agent tự ý đổi nghiệp vụ trong:
- PRD
- USER_FLOW
- DATA_PACK_SCHEMA
- VIDEO_MODES
- SAFETY_POLICY
- ACCEPTANCE_CRITERIA

Nếu cần đổi:
- cập nhật docs trước;
- sau đó mới sửa code.

---

# PHẦN 14 — SAU KHI MVP CHẠY

Chỉ sau Acceptance Criteria mới thêm:
- đăng nhập;
- Supabase production;
- cloud storage;
- templates;
- chia sẻ project;
- team;
- analytics;
- payment;
- deployment.

---

# PHẦN 15 — QUY TẮC VÀNG

**Docs trước → Sprint nhỏ → chạy được → test → nghiệm thu → Sprint tiếp.**

Không:
**Ý tưởng lớn → một prompt → hàng trăm file → không biết lỗi ở đâu.**
