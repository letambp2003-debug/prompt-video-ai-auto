# EDU VIDEO DIRECTOR PRO — ANTIGRAVITY PROJECT PACK

## ĐỌC FILE NÀY TRƯỚC

Đây là bộ tài liệu điều khiển Antigravity xây dựng webapp **EDU VIDEO DIRECTOR PRO** dành cho giáo viên.

Webapp có đúng **2 luồng nghiệp vụ chính**:

### TASK A — VIDEO BÀI HỌC
`PDF/Ảnh SGK → DATA PACK → 3 ý tưởng → chọn MODE → kịch bản → storyboard → prompt ảnh → prompt Veo/Flow → tài nguyên → QC → export`

### TASK B — VIDEO TRUYỀN THÔNG GIÁO DỤC
`Chủ đề → Policy Gate → Safe Cast → concept → kịch bản → storyboard → prompt ảnh/video → QC → export`

---

# THỨ TỰ ANTIGRAVITY PHẢI ĐỌC

Antigravity phải đọc tài liệu theo đúng thứ tự:

1. `00_START/00_README_FIRST.md`
2. `00_START/01_PROJECT_MANIFEST.md`
3. `01_PRODUCT/02_PRD.md`
4. `01_PRODUCT/03_USER_FLOW.md`
5. `01_PRODUCT/04_UI_UX_SPEC.md`
6. `02_AI_BRAIN/05_MASTER_INSTRUCTIONS.md`
7. `02_AI_BRAIN/06_SKILL_EDU_VIDEO_DIRECTOR_SAFE.md`
8. `02_AI_BRAIN/07_DATA_PACK_SCHEMA.md`
9. `02_AI_BRAIN/08_VIDEO_MODES.md`
10. `02_AI_BRAIN/09_AGENTS.md`
11. `02_AI_BRAIN/10_PROMPT_LIBRARY.md`
12. `03_SAFETY/11_SAFETY_POLICY.md`
13. `03_SAFETY/12_SAFE_REWRITE_RULES.md`
14. `04_ENGINEERING/13_APP_ARCHITECTURE.md`
15. `04_ENGINEERING/14_DATABASE_SCHEMA.md`
16. `04_ENGINEERING/15_API_CONTRACT.md`
17. `04_ENGINEERING/16_STATE_MACHINE.md`
18. `04_ENGINEERING/17_FILE_STRUCTURE.md`
19. `04_ENGINEERING/18_ENV_CONFIG.md`
20. `05_TEST/19_TEST_CASES.md`
21. `05_TEST/20_ACCEPTANCE_CRITERIA.md`
22. `06_ANTIGRAVITY/21_ANTIGRAVITY_MASTER_PROMPT.md`
23. `06_ANTIGRAVITY/22_SPRINT_PROMPTS.md`
24. `07_GUIDE/23_HUONG_DAN_THUC_HANH_ANTIGRAVITY.md`
25. `07_GUIDE/24_HUONG_DAN_GIAO_VIEN_SU_DUNG_WEBAPP.md`
26. `07_GUIDE/25_CHECKLIST_TRIEN_KHAI.md`

---

# NGUYÊN TẮC TRIỂN KHAI

- Không yêu cầu Antigravity viết toàn bộ app trong một lượt.
- Xây theo Sprint.
- Mỗi Sprint phải chạy và kiểm thử trước khi sang Sprint tiếp theo.
- Không hardcode API key.
- Prompt phải nằm ngoài UI/source component.
- DATA PACK là nguồn sự thật của TASK A.
- Mỗi Scene là một entity độc lập.
- Phải có nút tạo lại riêng từng Scene.
- Video generation là job bất đồng bộ.
- Phải có `PROMPT_ONLY` mode nếu chưa cấu hình API tạo video.
- Không tìm cách vượt bộ lọc an toàn.
- Không khẳng định video chắc chắn được dịch vụ bên ngoài chấp nhận.
- Giao diện ưu tiên giáo viên ít rành công nghệ.

---

# CÁCH BẮT ĐẦU NHANH

1. Mở thư mục project này trong Antigravity.
2. Mở `06_ANTIGRAVITY/21_ANTIGRAVITY_MASTER_PROMPT.md`.
3. Copy toàn bộ nội dung vào Agent/Chat điều khiển chính.
4. Cho Antigravity đọc toàn bộ file theo danh sách trên.
5. Chỉ cho phép thực hiện **Sprint 0 + Sprint 1**.
6. Chạy app localhost.
7. Nghiệm thu Sprint 1.
8. Sau đó dùng `22_SPRINT_PROMPTS.md` để làm từng Sprint.

> Không bỏ qua bước nghiệm thu.
