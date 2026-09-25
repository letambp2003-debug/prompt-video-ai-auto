# TEST CASES

## TC01 — Create project
Given dashboard
When tạo TASK A
Then project được lưu và mở đúng.

## TC02 — Upload PDF
Upload PDF hợp lệ.
Then source status SOURCE_UPLOADED.

## TC03 — Upload image
JPG/PNG hợp lệ.

## TC04 — File invalid
EXE hoặc file không hỗ trợ → báo rõ.

## TC05 — Data pack
PDF mẫu → data pack có subject/grade/lesson/keyKnowledge/source.

## TC06 — Missing data
Trang mờ → missingData, không đoán.

## TC07 — Approve
Approve data pack → immutable version.

## TC08 — Concept
Tạo đúng 3 concept.

## TC09 — Select mode
Chọn EDU-07 → project selected mode cập nhật.

## TC10 — Storyboard
Tạo scene có duration/action/camera/prompts.

## TC11 — Scene regenerate
Regenerate Scene 04 → Scene 01–03,05... không đổi.

## TC12 — Continuity
Regenerate scene vẫn dùng locks.

## TC13 — Prompt-only
Không API video → copy prompt hoạt động.

## TC14 — Generation job
Có provider mock → QUEUED → PROCESSING → SUCCEEDED.

## TC15 — Generation failed
FAILED không làm mất prompt.

## TC16 — Safety rewrite
TASK B rủi ro → REWRITE + safe alternative.

## TC17 — No bypass
Input yêu cầu bypass → app không tạo workflow bypass.

## TC18 — QC
QC report hiển thị PASS/NEED_FIX.

## TC19 — Refresh
Reload browser → project còn state.

## TC20 — Export
Export Markdown + JSON + ZIP.

## TC21 — Vietnamese
Unicode chuẩn.

## TC22 — Responsive
Desktop/tablet không vỡ layout.

## TC23 — Autosave
Sửa scene → reload → còn dữ liệu.

## TC24 — Stale warning
Approve data pack version mới → script cũ cảnh báo stale.

## TC25 — Large source
Nhiều ảnh → progress và không treo UI.
