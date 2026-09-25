# APP ARCHITECTURE

## 1. Kiến trúc khuyến nghị
- Frontend: React + TypeScript.
- Framework: Next.js App Router hoặc kiến trúc React full-stack tương đương mà Antigravity hỗ trợ ổn định.
- Styling: Tailwind CSS.
- Validation: schema library (ví dụ Zod).
- Persistence: repository abstraction.
- DB production: PostgreSQL/Supabase hoặc tương đương.
- File storage: provider abstraction.
- AI: Gemini/provider abstraction.
- Video: prompt-only + video provider adapter.
- Async jobs: job records + polling.

## 2. Module boundaries
```text
UI
 ↓
Application Services
 ↓
Domain
 ↓
Repositories / Providers
```

Không để component gọi trực tiếp model API.

## 3. Feature modules
- auth (optional MVP)
- projects
- sources
- datapack
- concepts
- script
- continuity
- storyboard
- scenes
- generation
- assets
- safety
- qc
- export
- settings

## 4. Provider abstraction

### AIProvider
- analyzeSource()
- generateStructured()
- generateText()

### ImageProvider
- generateImage()

### VideoProvider
- createJob()
- getJob()
- cancelJob()

### StorageProvider
- put()
- getSignedUrl()
- delete()

## 5. Video modes
`PROMPT_ONLY`
- no video API required.
- copy/export prompt.

`API_PROVIDER`
- create job.
- poll.
- save result.

## 6. Long-running generation
Không giữ request HTTP mở lâu.
Flow:
1. POST generation job.
2. save external operation id.
3. return job id.
4. UI polls app job.
5. backend polls provider or refreshes status.
6. on success save asset.

## 7. Autosave
- debounce form changes.
- optimistic UI.
- version scenes/data pack.

## 8. Security
- secrets server-side only.
- file type/size validation.
- no arbitrary executable upload.
- signed asset URLs.
- audit minimal generation errors.
