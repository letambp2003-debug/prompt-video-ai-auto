# UI/UX SPEC

## 1. Triết lý giao diện
- Giáo viên nhìn thấy ngôn ngữ sư phạm, không nhìn thấy thuật ngữ backend.
- Một màn hình = một quyết định chính.
- Nút chính luôn rõ.
- Advanced options thu gọn.
- Không bắt người dùng đọc JSON.

## 2. Layout
Desktop:
- Sidebar trái.
- Main content.
- Right Inspector cho Scene Editor.

Tablet:
- Sidebar collapse.
- Inspector thành drawer.

Mobile:
- hỗ trợ xem/sửa cơ bản;
- các thao tác prompt/scene theo tab.

## 3. Navigation
Sidebar:
1. Dashboard
2. Projects
3. New Video
4. Assets
5. Templates
6. Settings

Trong Project:
1. Nguồn
2. DATA PACK
3. Ý tưởng
4. Kịch bản
5. Storyboard
6. Tài nguyên
7. Kiểm tra
8. Xuất

## 4. Dashboard
Hero:
- “Hôm nay thầy/cô muốn tạo gì?”

Cards:
- Video bài học.
- Video truyền thông.

Recent projects.

## 5. Upload screen
- drag & drop.
- accepted file types.
- preview.
- trạng thái.
- nút `PHÂN TÍCH BÀI HỌC`.

## 6. DATA PACK screen
Dùng cards/form:
- Thông tin bài.
- YCCD.
- Kiến thức.
- Công thức.
- Hình.
- Sai lầm.
- Liên hệ.
- Hook candidates.

Mỗi item có:
- code;
- content;
- source;
- edit.

Bottom sticky action:
- `LƯU`
- `XÁC NHẬN DATA PACK`

## 7. Concepts
3 cards đặt cạnh nhau:
- Mode.
- Hook.
- Vì sao phù hợp.
- Câu hỏi kết.
- Duration.
- Button Chọn.

Concept được chọn có badge `ĐANG CHỌN`.

## 8. Script
Timeline cards.
Toggle:
- lời thoại;
- voiceover.
Có edit inline.

## 9. Storyboard/Scene Editor
Scene list bên trái.
Center: Preview.
Right:
- Purpose
- Action
- Camera
- Dialogue
- Image prompt
- Video prompt
- Asset status

Actions:
- Copy
- Save
- Regenerate
- Generate image
- Generate video

Không bắt user rời màn hình để sửa scene.

## 10. Job states
Badge:
- Chờ
- Đang tạo
- Hoàn thành
- Lỗi
- Bị chặn
- Đã hủy

## 11. Safety
Không dùng thông báo đáng sợ.
Ví dụ:
“Cảnh này đã được điều chỉnh để an toàn và dễ tạo hơn.”
Có nút “Xem thay đổi”.

## 12. Empty states
Mỗi màn hình phải giải thích bước kế tiếp.

## 13. Accessibility
- contrast tốt;
- font tối thiểu 14px;
- button có label;
- focus states;
- keyboard usable;
- không phụ thuộc chỉ vào màu.

## 14. Ngôn ngữ nút
Dùng:
- Phân tích bài học
- Xác nhận dữ liệu
- Tạo ý tưởng
- Tạo kịch bản
- Tạo lại cảnh này
- Sao chép prompt
- Kiểm tra
- Xuất dự án

Tránh:
- Execute
- Run pipeline
- Invoke model
trong UI dành cho giáo viên.
