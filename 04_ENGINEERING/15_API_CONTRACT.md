# API CONTRACT

Prefix: `/api`

## Project
POST `/projects`
GET `/projects`
GET `/projects/:id`
PATCH `/projects/:id`
DELETE `/projects/:id`

## Sources
POST `/projects/:id/sources`
DELETE `/projects/:id/sources/:sourceId`
POST `/projects/:id/analyze-source`

## Data Pack
GET `/projects/:id/data-pack`
PUT `/projects/:id/data-pack`
POST `/projects/:id/data-pack/approve`

## Concepts
POST `/projects/:id/concepts/generate`
GET `/projects/:id/concepts`
POST `/projects/:id/concepts/:conceptId/select`

## Script
POST `/projects/:id/script/generate`
GET `/projects/:id/script`
PUT `/projects/:id/script`

## Continuity
GET `/projects/:id/continuity`
PUT `/projects/:id/continuity`

## Storyboard
POST `/projects/:id/storyboard/generate`
GET `/projects/:id/storyboard`

## Scenes
GET `/projects/:id/scenes`
GET `/scenes/:id`
PUT `/scenes/:id`
POST `/scenes/:id/regenerate`
POST `/scenes/:id/prompts/regenerate`

## Generation
POST `/scenes/:id/generate-image`
POST `/scenes/:id/generate-video`
GET `/jobs/:id`
POST `/jobs/:id/cancel`

## Safety
POST `/projects/:id/safety/check`
POST `/scenes/:id/safety/rewrite`

## QC
POST `/projects/:id/qc`
GET `/projects/:id/qc/latest`

## Export
POST `/projects/:id/export`
GET `/projects/:id/exports`

# Response envelope
Success:
```json
{"ok":true,"data":{}}
```

Error:
```json
{
  "ok":false,
  "error":{
    "code":"DATA_PACK_NOT_APPROVED",
    "message":"Vui lòng xác nhận DATA PACK trước."
  }
}
```

# Idempotency
Generation endpoints nên hỗ trợ idempotency key nếu có thể.
