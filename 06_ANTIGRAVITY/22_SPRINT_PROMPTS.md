# SPRINT PROMPTS

# SPRINT 0 — Bootstrap
Mục tiêu:
- đọc docs;
- tạo project;
- source tree;
- env example;
- UI shell;
- architecture README.

Không triển khai AI thật.

Prompt:
```text
Thực hiện SPRINT 0.
Chỉ bootstrap và architecture.
Tạo app chạy localhost.
Không làm Sprint 1.
Cuối sprint chạy typecheck/lint và báo cáo.
```

# SPRINT 1 — Project + Upload
- Dashboard.
- New project.
- TASK A/B selector.
- Upload UI.
- persistence mock/local.
- project state.

Prompt:
```text
Thực hiện SPRINT 1 theo PRD, USER_FLOW và UI_UX_SPEC.
Hoàn thành Dashboard + Project + Upload.
Dùng repository abstraction.
Chưa gọi AI.
Chạy test và dừng.
```

# SPRINT 2 — Source Analyzer + DATA PACK
- source analysis service;
- schemas;
- Data Pack UI;
- approve/version.

Prompt:
```text
Thực hiện SPRINT 2.
Ưu tiên structured output và validation.
Nếu chưa có API key, cung cấp mock mode.
DATA PACK phải sửa, lưu, approve và version.
Chạy TC05–TC07.
```

# SPRINT 3 — Concepts + 10 MODE + Script
- Mode Selector.
- concepts.
- select.
- script.
- locks.

Prompt:
```text
Thực hiện SPRINT 3.
Tích hợp 10 MODE.
Tạo 3 concept từ approved DATA PACK.
Tạo Script + Character/Location/Style locks.
Chạy tests liên quan.
```

# SPRINT 4 — Storyboard + Scene Editor
- storyboard.
- scene entity.
- scene editor.
- copy prompt.
- regenerate scene.

Prompt:
```text
Thực hiện SPRINT 4.
Scene là entity độc lập.
Regenerate Scene 04 không được thay đổi Scene khác.
Có autosave.
Chạy TC10–TC13.
```

# SPRINT 5 — Generation + Assets
- Prompt-only.
- provider adapter.
- job state.
- assets.

Prompt:
```text
Thực hiện SPRINT 5.
Bắt buộc PROMPT_ONLY trước.
Sau đó tạo VideoProvider abstraction và mock provider.
Không hardcode provider cụ thể trong UI.
Generation phải dùng job record.
Chạy TC14–TC15.
```

# SPRINT 6 — TASK B + Safety
- Task B input.
- Policy Gate.
- Safe Rewrite.
- safe cast.
- safety report.

Prompt:
```text
Thực hiện SPRINT 6.
Không tạo bypass.
Dùng SAFETY_POLICY và SAFE_REWRITE_RULES.
Chạy TC16–TC17.
```

# SPRINT 7 — QC + Export + Polish
- QC.
- export.
- ZIP.
- responsive.
- errors.
- acceptance.

Prompt:
```text
Thực hiện SPRINT 7.
Hoàn thiện QC + Export + UI polish.
Chạy toàn bộ TC01–TC25.
Đối chiếu ACCEPTANCE_CRITERIA.
Không báo DONE nếu còn blocker.
```
