# EXPECTED SOURCE CODE STRUCTURE

```text
edu-video-director-pro/
├── docs/
│   └── [copy PROJECT PACK docs]
├── public/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── projects/
│   │   ├── api/
│   │   └── settings/
│   ├── components/
│   │   ├── ui/
│   │   ├── project/
│   │   ├── datapack/
│   │   ├── storyboard/
│   │   └── assets/
│   ├── features/
│   │   ├── projects/
│   │   ├── sources/
│   │   ├── datapack/
│   │   ├── concepts/
│   │   ├── scripts/
│   │   ├── continuity/
│   │   ├── scenes/
│   │   ├── generation/
│   │   ├── safety/
│   │   ├── qc/
│   │   └── export/
│   ├── ai/
│   │   ├── agents/
│   │   ├── prompts/
│   │   ├── schemas/
│   │   └── providers/
│   ├── server/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── jobs/
│   │   └── storage/
│   ├── db/
│   │   ├── schema/
│   │   └── migrations/
│   ├── lib/
│   └── types/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── package.json
└── README.md
```

# Rules
- Không đặt prompt trong UI component.
- Không đặt secret trong source.
- Không gom tất cả logic vào một file.
- Domain type dùng chung ở `types` hoặc feature domain.
- Agent schemas tái sử dụng backend validation.
