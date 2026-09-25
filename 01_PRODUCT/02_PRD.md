# PRD — PRODUCT REQUIREMENTS DOCUMENT
## EDU VIDEO DIRECTOR PRO

## 1. Tầm nhìn
Một giáo viên có thể tải một bài học hoặc nhập một chủ đề, sau đó nhận được gói video hoàn chỉnh mà không cần biết kỹ thuật prompt, dựng phim hay cấu trúc API.

## 2. Người dùng
### Persona A — Giáo viên ít rành công nghệ
- Muốn thao tác theo nút.
- Cần câu chữ rõ ràng.
- Không muốn nhìn JSON.
- Cần hệ thống tự đề xuất.

### Persona B — Giáo viên yêu công nghệ
- Muốn chỉnh prompt, storyboard, scene.
- Muốn copy prompt.
- Muốn chọn provider.
- Muốn export dữ liệu.

### Persona C — Tổ chuyên môn
- Muốn dùng lại project/template.
- Muốn chuẩn hóa đầu ra.
- Muốn lưu trữ bài theo môn/lớp.

## 3. Hai nghiệp vụ bắt buộc

### TASK A — Video bài học
Input:
- PDF;
- ảnh;
- nội dung dán;
- metadata tùy chọn.

Output:
- DATA PACK;
- 3 concept;
- selected mode;
- video brief;
- script;
- character lock;
- location lock;
- storyboard;
- prompts;
- assets;
- QC;
- export.

### TASK B — Video truyền thông giáo dục
Input:
- chủ đề;
- đối tượng;
- thời lượng;
- phong cách tùy chọn.

Output:
- policy report;
- safe concept;
- script;
- cast;
- storyboard;
- prompts;
- QC;
- export.

## 4. Chức năng MVP

### 4.1 Project
- Tạo project.
- Đặt tên.
- Chọn TASK A/TASK B.
- Lưu tự động.
- Mở lại.

### 4.2 Source
- Upload PDF/JPG/PNG.
- Xóa/đổi file.
- Hiển thị trạng thái đọc file.
- Source check.

### 4.3 DATA PACK
- Tạo tự động.
- Hiển thị dạng form.
- Có source/page.
- Sửa từng trường.
- Confirm.
- Không cho script dùng DATA PACK chưa confirm, trừ chế độ Auto.

### 4.4 Concept
- Đề xuất 3 concept.
- Hiển thị MODE, Hook, mục tiêu, lý do.
- Chọn 1.
- Regenerate concepts.

### 4.5 Script
- Timeline.
- Lời thoại/voiceover.
- Câu hỏi cuối.
- Edit.
- Rebuild from DATA PACK.

### 4.6 Continuity
- Character Master Lock.
- Location Master Lock.
- Visual Style Lock.
- Cho phép sửa nhưng ghi version.

### 4.7 Storyboard
- Danh sách Scene.
- Duration.
- Purpose.
- Action.
- Camera.
- Dialogue/VO.
- Prompt.
- Asset.

### 4.8 Scene Editor
Mỗi Scene có:
- Preview;
- nội dung;
- Image Prompt;
- Video Prompt;
- voice;
- SFX;
- copy;
- regenerate;
- generate;
- status.

### 4.9 Video Provider
Hai mode:
- `PROMPT_ONLY`;
- `API_PROVIDER`.

Không có API key vẫn phải dùng được app.

### 4.10 Assets
- Image.
- Video.
- Audio/reference.
- Asset gắn với Scene.
- Không xóa asset đang được scene chọn mà không cảnh báo.

### 4.11 TASK B Safety
- Policy Gate.
- Safe Rewrite.
- Safety summary.
- Không có tính năng bypass.

### 4.12 QC
- Source QC.
- Pedagogy QC.
- Continuity QC.
- Video QC.
- Safety QC.

### 4.13 Export
- Production Pack Markdown.
- DATA PACK JSON.
- Storyboard JSON/Markdown.
- Prompt Pack.
- ZIP project package.

## 5. Yêu cầu phi chức năng
- UI tiếng Việt.
- Responsive desktop/tablet; mobile dùng được các tác vụ cơ bản.
- Autosave.
- Không mất project khi reload.
- Không lộ API key xuống client.
- Error message dễ hiểu.
- Unicode tiếng Việt chuẩn.
- Có loading/progress.
- AI error không làm mất dữ liệu đã duyệt.

## 6. Tiêu chí UX
Người mới phải hoàn thành TASK A bằng tối đa các bước lớn:
1. Upload.
2. Xác nhận DATA PACK.
3. Chọn ý tưởng.
4. Tạo Production Pack.
5. Tạo/copy từng Scene.
6. Export.

## 7. Thành công của MVP
Một giáo viên mới có thể từ PDF đến bộ prompt từng Scene mà không cần đọc tài liệu kỹ thuật.
