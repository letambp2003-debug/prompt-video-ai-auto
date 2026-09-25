# PROMPT LIBRARY CONTRACT

## Nguyên tắc
Prompt không được hardcode trong React component.
Tạo file/module riêng cho từng prompt.

Expected runtime tree:
```text
src/ai/prompts/
  source-analyzer.ts
  data-pack.ts
  mode-selector.ts
  script-writer.ts
  continuity.ts
  storyboard.ts
  image-prompt.ts
  video-prompt.ts
  safety-gate.ts
  safe-rewrite.ts
  qc.ts
```

## Prompt variables
Dùng biến rõ:
- {{SOURCE}}
- {{DATA_PACK}}
- {{MODE}}
- {{SCRIPT}}
- {{CHARACTER_LOCK}}
- {{LOCATION_LOCK}}
- {{SCENE}}
- {{USER_OVERRIDES}}

## Output
Mỗi prompt phải yêu cầu JSON/structured output khi có thể.

## Source Analyzer
Mục tiêu:
- không suy đoán phần mờ;
- xác định trang;
- đánh dấu missing.

## Data Pack
Mục tiêu:
- chỉ nội dung nguồn;
- source mapping.

## Mode Selector
Mục tiêu:
- 3 mode;
- reason;
- uses IDs.

## Script
Mục tiêu:
- video 30–90s theo config;
- câu ngắn;
- không lộ đáp án nếu opening.

## Continuity
Mục tiêu:
- fictional cast mặc định;
- stable descriptors.

## Storyboard
Một scene:
- id
- order
- duration
- purpose
- visual
- action
- camera
- dialogue
- sfx
- transition

## Prompt generation
Image/video prompt phải tự chứa đủ continuity để copy độc lập.

## Safety
Không viết prompt bypass.
Nếu rủi ro → safe rewrite.

## QC
Trả:
- checkId
- status
- message
- suggestedFix.
