# ENVIRONMENT CONFIG

## .env.example

```bash
# App
APP_URL=http://localhost:3000

# AI text / document provider
AI_PROVIDER=gemini
GEMINI_API_KEY=

# Generation mode
VIDEO_MODE=PROMPT_ONLY
IMAGE_MODE=PROMPT_ONLY

# Optional video provider
VIDEO_PROVIDER=
VIDEO_API_KEY=

# Database
DATABASE_URL=

# Storage
STORAGE_PROVIDER=local
STORAGE_BUCKET=

# Optional auth
AUTH_MODE=none
```

## Rules
- Commit `.env.example`.
- Không commit `.env.local`.
- API key chỉ dùng server-side.
- Khi thiếu API key:
  - app vẫn mở;
  - chuyển provider về PROMPT_ONLY;
  - hiển thị hướng dẫn trong Settings.

## Settings UI
Hiển thị:
- AI provider status.
- Video mode.
- Storage status.
- Không hiển thị full secret sau khi lưu.
