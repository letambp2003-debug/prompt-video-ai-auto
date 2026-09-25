# STATE MACHINE

## Project state
```text
NEW
→ SOURCE_UPLOADED
→ ANALYZING_SOURCE
→ DATA_PACK_READY
→ DATA_PACK_APPROVED
→ CONCEPTS_READY
→ MODE_SELECTED
→ SCRIPT_READY
→ STORYBOARD_READY
→ PROMPTS_READY
→ ASSETS_IN_PROGRESS
→ ASSETS_READY
→ QC_READY
→ COMPLETED
```

Có thể:
- ERROR_RECOVERABLE
- ARCHIVED

## Generation job state
```text
QUEUED
→ PROCESSING
→ SUCCEEDED

QUEUED/PROCESSING
→ FAILED
→ BLOCKED
→ CANCELLED
```

## Rules
- Script không chạy nếu TASK A chưa có approved data pack, trừ explicit auto workflow.
- Storyboard cần script.
- Generate video cần scene video prompt.
- QC có thể chạy bất cứ lúc nào sau script, nhưng final QC sau assets.
- Regenerate scene không đổi selected mode/data pack.
- New data pack version có thể làm script/storyboard thành `STALE`; UI phải cảnh báo.
