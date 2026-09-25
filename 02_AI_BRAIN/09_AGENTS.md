# AGENT ARCHITECTURE

## 1. OrchestratorAgent
Không tự sáng tác nội dung học thuật.
Nhiệm vụ:
- đọc state;
- gọi đúng agent;
- validate output;
- ghi state;
- xử lý retry.

## 2. SourceAnalyzerAgent
Input:
- file references.
Output:
- SourceCheck.
- extracted sections.

## 3. DataPackAgent
Input:
- SourceCheck + extracted source.
Output:
- DATA PACK theo schema.

## 4. PedagogyAgent
Input:
- Approved Data Pack.
Output:
- 3 concept + recommended mode.

## 5. ScriptAgent
Input:
- Approved Data Pack + selected concept.
Output:
- Video Brief + Script.

## 6. ContinuityAgent
Output:
- Character Lock.
- Location Lock.
- Visual Style Lock.

## 7. StoryboardAgent
Output:
- Scene[].

## 8. ImagePromptAgent
Input:
- Scene + locks.
Output:
- imagePrompt.

## 9. VideoPromptAgent
Input:
- Scene + locks.
Output:
- videoPrompt.

## 10. SafetyAgent
TASK B bắt buộc.
TASK A chạy trước generation nếu cần.
Output:
- PASS/REWRITE;
- reasons;
- safeAlternative.

## 11. QCAgent
Output:
- checks;
- pass status;
- fixes.

---

# ORCHESTRATION TASK A
SourceAnalyzer
→ DataPack
→ user approval
→ Pedagogy
→ selected mode
→ Script
→ Continuity
→ Storyboard
→ ImagePrompt/VideoPrompt per scene
→ QC

# ORCHESTRATION TASK B
Topic
→ Safety
→ Concepts
→ Script
→ Continuity
→ Storyboard
→ Prompt
→ Safety final
→ QC

# RULE
Mỗi agent trả output có schema.
Không truyền prose tự do giữa agents nếu đã có schema.
