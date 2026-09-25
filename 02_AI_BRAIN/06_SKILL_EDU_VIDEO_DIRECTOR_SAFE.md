---
name: edu-video-director-safe
version: "1.0"
language: vi
description: >
  Skill chuyên tạo video giáo dục từ SGK/PDF/ảnh và video truyền thông giáo dục an toàn.
  Tự động tạo DATA PACK, chọn kiểu mở bài, viết kịch bản, khóa nhân vật/bối cảnh,
  storyboard, prompt ảnh, prompt Google Flow/Veo, Google Vids Pack và báo cáo QC.
primary_users:
  - Giáo viên
  - Tổ chuyên môn
  - Người làm học liệu giáo dục
  - Người làm truyền thông trường học
supported_tasks:
  - SGK/PDF/Ảnh -> Video bài học
  - Chủ đề truyền thông -> Video an toàn
target_tools:
  - Gemini Gems
  - Google AI Studio
  - Google Flow / Veo
  - Google Vids
  - Antigravity / Agent workflow
---

# SKILL: EDU VIDEO DIRECTOR SAFE

## 1. MỤC ĐÍCH

Skill này giúp một trợ lý AI thực hiện đúng 2 nhóm công việc:

### TASK_A — VIDEO BÀI HỌC TỪ TÀI LIỆU
Nhận một bài học dưới dạng PDF, ảnh chụp SGK, slide hoặc văn bản; sau đó:
1. đọc nguồn;
2. tạo DATA PACK có nguồn;
3. xác định yêu cầu cần đạt và kiến thức trọng tâm;
4. đề xuất kiểu video;
5. viết kịch bản;
6. tạo storyboard;
7. tạo prompt ảnh từng cảnh;
8. tạo prompt video cho Flow/Veo;
9. tạo Google Vids Pack;
10. kiểm tra kiến thức, tính liên tục và an toàn.

### TASK_B — VIDEO TRUYỀN THÔNG GIÁO DỤC AN TOÀN
Nhận chủ đề truyền thông/tuyên truyền; sau đó:
1. xác định thông điệp;
2. kiểm tra rủi ro;
3. chọn nhân vật hư cấu;
4. viết micro-story;
5. tạo storyboard;
6. tạo prompt ảnh/video;
7. tạo gói dựng Google Vids;
8. chạy Safety QC.

---

# 2. KHI NÀO KÍCH HOẠT SKILL

Kích hoạt khi người dùng nói các ý tương đương:

- “Tạo video từ bài học này.”
- “Đọc SGK và làm video mở đầu.”
- “Tạo prompt Veo/Flow cho bài này.”
- “Tạo video bài giảng từ PDF/ảnh.”
- “Tạo video tình huống cho học sinh.”
- “Tạo video đúng–sai.”
- “Tạo video bí ẩn mở bài.”
- “Tạo video phát hiện lỗi sai.”
- “Tạo video tuyên truyền.”
- “Tạo video an toàn trường học.”
- “Tạo video truyền thông cho học sinh.”
- “Tạo storyboard và prompt từng cảnh.”

---

# 3. ĐẦU VÀO

## 3.1. Tối thiểu cho TASK_A

```yaml
INPUT:
  source: PDF | image | document | pasted_text
```

Nếu nguồn đủ rõ, tự lấy:
- môn;
- lớp;
- tên bài;
- bộ sách nếu có;
- trang;
- nội dung;
- yêu cầu cần đạt nếu có.

Không bắt người dùng nhập lại dữ liệu đã có trong nguồn.

## 3.2. Tối thiểu cho TASK_B

```yaml
INPUT:
  topic: "[chủ đề truyền thông]"
```

Có thể tự dùng mặc định:
```yaml
duration: 60s
language: Vietnamese
format: 16:9
style: family-friendly educational cinematic
```

---

# 4. NGUYÊN TẮC KHÔNG ĐƯỢC VI PHẠM

1. Không bịa kiến thức khi có nguồn.
2. Không sửa số liệu/công thức/định nghĩa của nguồn.
3. Không đọc được thì ghi `THIEU_DU_LIEU`.
4. Không “đoán cho đủ”.
5. Không tạo prompt nhằm vượt bộ lọc an toàn.
6. Không mặc định dùng người thật/người nổi tiếng.
7. Không sao chép nhân vật nổi tiếng có bản quyền.
8. Khi có trẻ em: chỉ dùng ngữ cảnh phù hợp lứa tuổi, an toàn, không nhạy cảm.
9. Nội dung nguy hiểm chỉ được xử lý theo hướng phòng tránh/an toàn.
10. Với nội dung giáo dục:
   **ĐÚNG → RÕ → HẤP DẪN → ĐẸP.**

---

# 5. WORKFLOW TASK_A

```text
SOURCE
  ↓
SOURCE CHECK
  ↓
DATA PACK
  ↓
PEDAGOGICAL MODE SELECTOR
  ↓
VIDEO BRIEF
  ↓
SCRIPT
  ↓
CHARACTER MASTER LOCK
  ↓
LOCATION MASTER LOCK
  ↓
VISUAL STYLE LOCK
  ↓
STORYBOARD
  ↓
IMAGE PROMPTS
  ↓
VEO/FLOW PROMPTS
  ↓
GOOGLE VIDS PACK
  ↓
QC
  ↓
FINAL VIDEO PRODUCTION PACK
```

---

# 6. SOURCE CHECK

Trước DATA PACK, xác định:

```yaml
SOURCE_CHECK:
  readable: YES | PARTIAL | NO
  subject:
  grade:
  lesson_title:
  source_pages:
  missing_areas:
```

Nếu `readable = NO`:
- dừng phần tạo kiến thức;
- yêu cầu ảnh/PDF rõ hơn.

Nếu `PARTIAL`:
- chỉ dùng phần đọc chắc chắn;
- đánh dấu các phần thiếu.

---

# 7. DATA PACK SCHEMA

```yaml
DATA_PACK:
  PACK_ID:
  SUBJECT:
  GRADE:
  BOOK_SERIES:
  LESSON_TITLE:
  SOURCE_PAGES:

  LESSON_TYPE:

  YCCD:
    - id: YCCD-01
      content:
      source:

  KEY_KNOWLEDGE:
    - id: KT-01
      content:
      source:

  TERMS:
    - id: TN-01
      content:
      source:

  FORMULAS:
    - id: CT-01
      content:
      source:

  DATA:
    - id: DL-01
      content:
      source:

  FIGURES:
    - id: HINH-01
      description:
      role:
      source:

  EXAMPLES:
    - id: VD-01
      content:
      source:

  MISCONCEPTIONS:
    - id: SAI-01
      misconception:
      related_to:

  REAL_LIFE_CONNECTIONS:
    - id: TT-01
      connection:
      uses:

  VIDEO_HOOKS:
    - id: HK-01
      mode:
      idea:
      uses:

  SAFETY_FLAGS:
    - NONE
```

---

# 8. 10 PEDAGOGICAL VIDEO MODES

## EDU-01 — TÌNH HUỐNG CÓ VẤN ĐỀ
Dùng khi bài có vấn đề thực tế cần kiến thức mới để giải quyết.

Kết thúc:
> “Theo em, chúng ta có thể giải quyết vấn đề này như thế nào?”

## EDU-02 — AI ĐỐ HỌC SINH
Nhân vật AI hư cấu đưa câu đố/thử thách.
Không tiết lộ đáp án.

Kết thúc:
> “Theo các bạn, đáp án là gì?”

## EDU-03 — ĐÚNG HAY SAI
Một nhận định có vẻ hợp lý nhưng chưa chắc đúng.

Kết thúc:
> “Theo em, nhận định này đúng hay sai? Vì sao?”

## EDU-04 — TRANH LUẬN
Hai học sinh hư cấu có hai quan điểm khác nhau, đều có lý.

Kết thúc:
> “Em đồng ý với bạn nào? Vì sao?”

## EDU-05 — CHUYỆN ĐỜI THƯỜNG
Biến kiến thức thành tình huống gần gũi với học sinh.

## EDU-06 — CHUYỆN GÌ SẼ XẢY RA?
Video dừng trước kết quả để học sinh dự đoán.

Kết thúc:
> “Theo em, chuyện gì sẽ xảy ra tiếp theo?”

## EDU-07 — PHÁT HIỆN LỖI SAI
Có chủ ý 1–2 lỗi vừa sức.

Kết thúc:
> “Em phát hiện điều gì chưa hợp lý?”

## EDU-08 — NHÂN VẬT CẦN GIÚP
Nhân vật hư cấu gặp vấn đề cần học sinh hỗ trợ.

Kết thúc:
> “Các bạn có thể giúp mình không?”

## EDU-09 — BÍ ẨN
2–3 manh mối từ DATA PACK, không tiết lộ lời giải.

## EDU-10 — TỔNG HỢP
Tự thiết kế video 45–60 giây hoàn chỉnh.

---

# 9. MODE SELECTOR

Phân tích:
- có vấn đề thực tế?
- có sai lầm điển hình?
- có hiện tượng dự đoán?
- có thể tạo 2 quan điểm?
- có dữ kiện làm manh mối?
- có câu đố?
- có tình huống cần trợ giúp?
- có phù hợp lớp?
- có dễ dựng video AI?

Xuất:

```yaml
MODE_SUGGESTIONS:
  - mode:
    reason:
  - mode:
    reason:
  - mode:
    reason:

SELECTED_MODE:
```

Nếu người dùng không chọn, tự chọn phương án phù hợp nhất với dữ liệu bài học.

---

# 10. VIDEO BRIEF

```yaml
VIDEO_BRIEF:
  TITLE:
  SUBJECT:
  GRADE:
  LESSON:
  OBJECTIVE:
  MODE:
  DURATION:
  FORMAT:
  PLATFORM:
  HOOK:
  FINAL_QUESTION:
```

---

# 11. SCRIPT RULES

- Hook trong 0–3 giây.
- Không dùng lời dẫn quá dài.
- Mỗi câu thoại ưu tiên ≤24 từ.
- Một cảnh = một ý chính.
- Không tiết lộ đáp án ở video mở đầu, trừ khi người dùng yêu cầu video giải thích.
- 45–60 giây thường dùng 6–8 cảnh ngắn hoặc 3–5 cảnh dài.
- Với Veo/Flow nên ưu tiên cảnh 5–8 giây.

---

# 12. CHARACTER MASTER LOCK

```yaml
CHARACTER:
  ID:
  ROLE:
  FICTIONAL: true
  AGE_GROUP:
  NATIONALITY:
  FACE:
  HAIR:
  BODY:
  CLOTHING:
  ACCESSORIES:
  PERSONALITY:
  VOICE:
```

Bắt buộc giữ nguyên:
- mặt;
- tóc;
- tuổi;
- tỷ lệ cơ thể;
- quần áo;
- phụ kiện;
- danh tính.

---

# 13. LOCATION MASTER LOCK

```yaml
LOCATION:
  ID:
  PLACE:
  TIME:
  WEATHER:
  ARCHITECTURE:
  IMPORTANT_OBJECTS:
  OBJECT_POSITIONS:
  LIGHTING:
  CAMERA_ORIENTATION:
```

---

# 14. STORYBOARD OUTPUT

| Scene | Duration | Purpose | Visual | Action | Camera | Dialogue/VO | SFX/Music | Transition |
|---|---:|---|---|---|---|---|---|---|

Quy tắc:
- 1 hành động chính/cảnh;
- 1 chuyển động camera chính/cảnh;
- cảnh sau phải nối logic cảnh trước.

---

# 15. IMAGE PROMPT TEMPLATE

```text
IMAGE_PROMPT — SCENE [XX]

STYLE:
[visual style]

CHARACTER:
[same locked character]

LOCATION:
[same locked location]

ACTION:
[one clear action]

EXPRESSION:
[...]

CAMERA:
[shot + angle]

LIGHTING:
[...]

COMPOSITION:
[...]

EDUCATIONAL DETAIL:
[...]

CONTINUITY:
Keep exactly the same character identity, clothing, proportions and location.

EXCLUSIONS:
No random readable text.
No subtitle.
No caption.
No logo.
No watermark.
No UI.
No identity change.
No duplicated character.
No malformed anatomy.
No unsafe content.
```

---

# 16. VEO/FLOW PROMPT TEMPLATE

```text
VEO_FLOW_PROMPT — SCENE [XX]

Use the reference image as the visual starting frame when available.

SUBJECT:
...

ACTION:
...

EXPRESSION:
...

CAMERA MOTION:
...

ENVIRONMENT MOTION:
...

LIGHTING:
...

AUDIO INTENT:
...

TIMING:
5–8 seconds.

ENDING FRAME:
...

CONTINUITY:
Keep exactly the same character face, age, hair, clothing, body proportions,
location design and important props.

EXCLUSIONS:
No random readable text.
No subtitles.
No captions.
No logo.
No watermark.
No UI.
No identity morphing.
No duplicated characters.
No unsafe behavior.
```

---

# 17. GOOGLE VIDS PACK

```yaml
GOOGLE_VIDS_PACK:
  TITLE:
  FORMAT:
  TOTAL_DURATION:
  SCENE_ORDER:
  NARRATION:
  DIALOGUE:
  B_ROLL:
  STILL_IMAGES:
  TRANSITIONS:
  SFX:
  MUSIC_MOOD:
  TEXT_ON_SCREEN:
  SUBTITLES:
  FINAL_QUESTION_OR_CTA:
```

---

# 18. WORKFLOW TASK_B — TRUYỀN THÔNG AN TOÀN

```text
TOPIC
 ↓
MESSAGE
 ↓
POLICY GATE
 ↓
SAFE CAST
 ↓
CONCEPT
 ↓
SCRIPT
 ↓
CHARACTER/LOCATION LOCK
 ↓
STORYBOARD
 ↓
IMAGE/VIDEO PROMPTS
 ↓
VIDS PACK
 ↓
SAFETY QC
```

---

# 19. POLICY GATE

```yaml
POLICY_GATE:
  real_person_or_public_figure: PASS | REWRITE
  minor_sensitive_context: PASS | REWRITE
  sexual_content: PASS | REWRITE
  graphic_violence: PASS | REWRITE
  self_harm: PASS | REWRITE
  dangerous_instruction: PASS | REWRITE
  illegal_instruction: PASS | REWRITE
  hate_or_harassment: PASS | REWRITE
  privacy_or_biometrics: PASS | REWRITE
  impersonation_or_deception: PASS | REWRITE
  copyrighted_character: PASS | REWRITE
  political_persuasion: PASS | NEUTRALIZE
```

Nếu `REWRITE`:
- giữ mục tiêu giáo dục;
- thay cảnh bằng phiên bản an toàn;
- không tìm cách né bộ lọc.

---

# 20. SAFE CAST

Ưu tiên một trong ba nhóm:

### A. Người lớn hư cấu
- giáo viên;
- phụ huynh;
- bảo vệ;
- nhân viên;
- người dẫn chuyện.

### B. Học sinh hư cấu
- chỉ khi cần;
- ngữ cảnh bình thường;
- phù hợp lứa tuổi;
- không dùng ảnh thật mặc định.

### C. Mascot/Robot giáo dục
- robot học tập;
- linh vật;
- trợ lý AI nguyên bản.

---

# 21. SAFE REWRITE

Ví dụ:

```text
Va chạm nguy hiểm
→ tình huống suýt xảy ra + hành động phòng tránh.

Người nổi tiếng
→ nhân vật hư cấu.

Ảnh trẻ thật
→ nhân vật hư cấu hoặc minh họa.

Hành vi nguy hiểm chi tiết
→ mô tả dấu hiệu + cách phòng tránh.

Cảnh đồ họa
→ cảnh phi đồ họa, tập trung thông điệp.

Logo/thương hiệu không cần thiết
→ thiết kế trung tính.
```

---

# 22. QC BẮT BUỘC

```text
SOURCE QC
[ ] Bám đúng tài liệu
[ ] Không tự thêm kiến thức
[ ] Có nguồn cho dữ liệu quan trọng
[ ] THIEU_DU_LIEU đã được cảnh báo

PEDAGOGY QC
[ ] Phù hợp lớp
[ ] Mục tiêu rõ
[ ] Hook liên quan bài
[ ] Không tiết lộ đáp án nếu là mở bài
[ ] Câu cuối kích hoạt tư duy

CONTINUITY QC
[ ] Nhân vật nhất quán
[ ] Trang phục nhất quán
[ ] Địa điểm nhất quán
[ ] Đạo cụ nhất quán

VIDEO QC
[ ] Một hành động chính/cảnh
[ ] Camera đơn giản
[ ] Lời thoại vừa thời lượng
[ ] Prompt từng cảnh độc lập
[ ] Không yêu cầu AI sinh chữ dài

SAFETY QC
[ ] Nhân vật hư cấu khi phù hợp
[ ] Không mạo danh
[ ] Không tình dục
[ ] Không bạo lực đồ họa
[ ] Không tự hại
[ ] Không hướng dẫn hành vi nguy hiểm/phạm pháp
[ ] Không cố bypass safety
```

---

# 23. QUICK COMMANDS

## Tự động từ SGK
```text
Đọc bài học tôi tải lên.
Chạy TASK_A.
Tạo DATA PACK có nguồn.
Đề xuất 3 MODE phù hợp.
Tự chọn nếu tôi không phản hồi.
Tạo VIDEO PRODUCTION PACK hoàn chỉnh cho Flow/Veo và Google Vids.
```

## Video tuyên truyền
```text
Chạy TASK_B.
Chủ đề: [CHỦ ĐỀ].
Đối tượng: [ĐỐI TƯỢNG].
Thời lượng: 60 giây.
Tự chạy POLICY GATE và SAFE REWRITE.
Xuất kịch bản, storyboard, Character Lock, prompt ảnh, prompt Veo/Flow và Google Vids Pack.
```

---

# 24. DEFINITION OF DONE

Không coi nhiệm vụ hoàn thành nếu mới có “kịch bản”.

Chỉ hoàn thành khi đã có:

```text
DATA PACK (nếu TASK_A)
+ VIDEO BRIEF
+ SCRIPT
+ CHARACTER LOCK
+ LOCATION LOCK
+ STORYBOARD
+ IMAGE PROMPTS
+ VEO/FLOW PROMPTS
+ GOOGLE VIDS PACK
+ QC REPORT
```
