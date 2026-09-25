/**
 * EDU VIDEO DIRECTOR PRO - Cốt lõi Type System
 * Định nghĩa toàn bộ thực thể, máy trạng thái, schema hợp đồng
 */

// ==========================================
// 1. PROJECT & WORKFLOW
// ==========================================

export type TaskType = "LESSON" | "CAMPAIGN";

export type ProjectStatus =
  | "NEW"
  | "TOPIC_ENTERED"
  | "POLICY_CHECKING"
  | "POLICY_APPROVED"
  | "SOURCE_UPLOADED"
  | "ANALYZING_SOURCE"
  | "DATA_PACK_READY"
  | "DATA_PACK_APPROVED"
  | "CONCEPTS_READY"
  | "MODE_SELECTED"
  | "SCRIPT_READY"
  | "STORYBOARD_READY"
  | "PROMPTS_READY"
  | "ASSETS_IN_PROGRESS"
  | "ASSETS_READY"
  | "QC_READY"
  | "COMPLETED"
  | "ERROR_RECOVERABLE"
  | "ARCHIVED";

export interface Project {
  id: string;
  userId?: string;
  title: string;
  taskType: TaskType;
  status: ProjectStatus;
  selectedMode?: PedagogicalMode | null;
  targetGrade?: string;
  subject?: string;
  topic?: string;
  targetAudience?: string;
  durationSeconds?: number;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. SOURCE FILES
// ==========================================

export type ParseStatus = "PENDING" | "PARSED" | "FAILED";

export interface SourceFile {
  id: string;
  projectId: string;
  filename: string;
  mimeType: string;
  storageKey: string;
  sizeBytes: number;
  pageCount?: number;
  parseStatus: ParseStatus;
  extractedText?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface SourceCheckResult {
  readable: "YES" | "PARTIAL" | "NO";
  subject?: string;
  grade?: string;
  lessonTitle?: string;
  sourcePages: string[];
  missingAreas: string[];
  notes?: string;
}

// ==========================================
// 3. DATA PACK SCHEMA (TASK A)
// ==========================================

export type DataPackStatus = "DRAFT" | "REVIEWED" | "APPROVED" | "SUPERSEDED";

export interface DataPackItemSource {
  fileId?: string;
  page?: string | number;
}

export interface DataPackItem {
  id: string;
  content: string;
  source?: DataPackItemSource | null;
}

export interface FigureItem {
  id: string;
  description: string;
  pedagogicalRole?: string;
  source?: DataPackItemSource | null;
}

export interface MisconceptionItem {
  id: string;
  misconception: string;
  correctionReference?: string;
  relatedKnowledgeId?: string;
}

export interface RealLifeConnectionItem {
  id: string;
  connection: string;
  relatedKnowledgeIds?: string[];
  uses?: string;
}

export interface VideoHookCandidate {
  id: string;
  mode: PedagogicalMode;
  idea: string;
  uses?: string[];
}

export interface DataPackPayload {
  packId: string;
  version: number;
  subject: string;
  grade: string;
  bookSeries?: string | null;
  lessonTitle: string;
  sourcePages: string[];
  lessonType: string[];
  learningOutcomes: DataPackItem[]; // YCCD-xx
  keyKnowledge: DataPackItem[];     // KT-xx
  terms: DataPackItem[];            // TN-xx
  formulas: DataPackItem[];         // CT-xx
  data: DataPackItem[];             // DL-xx
  figures: FigureItem[];            // HINH-xx
  examples: DataPackItem[];         // VD-xx
  misconceptions: MisconceptionItem[]; // SAI-xx
  realLifeConnections: RealLifeConnectionItem[]; // TT-xx
  videoHookCandidates: VideoHookCandidate[];   // HK-xx
  missingData: string[];
  safetyFlags: string[];
}

export interface DataPack {
  id: string;
  projectId: string;
  version: number;
  status: DataPackStatus;
  payload: DataPackPayload;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 4. 10 PEDAGOGICAL MODES & CONCEPTS
// ==========================================

export type PedagogicalMode =
  | "EDU-01" // Tình huống có vấn đề
  | "EDU-02" // AI đố học sinh
  | "EDU-03" // Đúng hay sai
  | "EDU-04" // Tranh luận hai quan điểm
  | "EDU-05" // Chuyện đời thường
  | "EDU-06" // Chuyện gì sẽ xảy ra?
  | "EDU-07" // Phát hiện lỗi sai
  | "EDU-08" // Nhân vật cần giúp đỡ
  | "EDU-09" // Bí ẩn mở đầu bài học
  | "EDU-10"; // Prompt tổng / Video tình huống hoàn chỉnh

export interface PedagogicalModeMetadata {
  code: PedagogicalMode;
  name: string;
  description: string;
  recommendedDuration: string;
  defaultEndingQuestion: string;
}

export interface Concept {
  id: string;
  projectId: string;
  mode: PedagogicalMode;
  title: string;
  hook: string;
  reason: string;
  finalQuestion: string;
  uses: string[];
  isSelected: boolean;
  createdAt: string;
}

// ==========================================
// 5. VIDEO BRIEF & SCRIPT
// ==========================================

export interface VideoBrief {
  title: string;
  subject: string;
  grade: string;
  lesson: string;
  objective: string;
  selectedMode: PedagogicalMode;
  durationSeconds: number;
  aspectRatio: "16:9" | "9:16";
  targetPlatform: string;
  hook: string;
  unresolvedQuestion: string;
}

export interface ScriptTimelineItem {
  sceneNumber: number;
  timeRange: string;
  purpose: string;
  visualSummary: string;
  action: string;
  dialogueOrVoiceover: string;
  sfxOrMusic: string;
}

export interface ScriptPayload {
  brief: VideoBrief;
  timeline: ScriptTimelineItem[];
  fullTextNarration?: string;
}

export interface Script {
  id: string;
  projectId: string;
  version: number;
  payload: ScriptPayload;
  isStale?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. MASTER CONTINUITY LOCKS
// ==========================================

export interface CharacterMasterLock {
  id: string;
  role: string;
  fictional: true;
  ageGroup: string;
  nationality: string;
  face: string;
  hair: string;
  body: string;
  clothing: string;
  accessories: string;
  personality: string;
  voice: string;
  forbiddenChanges: string[];
}

export interface LocationMasterLock {
  id: string;
  place: string;
  time: string;
  weather: string;
  architecture: string;
  importantObjects: string[];
  objectPositions: string;
  lighting: string;
  cameraWorldOrientation: string;
  colorPalette: string;
}

export interface VisualStyleLock {
  id: string;
  styleName: string;
  description: string;
  lightingMood: string;
  colorGrading: string;
  artStyleTags: string[];
}

export interface ContinuityLocks {
  id: string;
  projectId: string;
  version: number;
  characterLock?: CharacterMasterLock;
  locationLock?: LocationMasterLock;
  styleLock: VisualStyleLock;
  updatedAt: string;
}

// ==========================================
// 7. STORYBOARD & INDEPENDENT SCENE
// ==========================================

export type SceneStatus =
  | "DRAFT"
  | "READY"
  | "GENERATING"
  | "COMPLETED"
  | "FAILED"
  | "BLOCKED";

export interface Scene {
  id: string;
  projectId: string;
  storyboardId: string;
  sceneNumber: number;
  title: string;
  durationSeconds: number;
  purpose: string;
  visual: string;
  action: string;
  camera: string;
  dialogue: string;
  voice: string;
  sfx: string;
  transition: string;
  imagePrompt: string;
  videoPrompt: string;
  status: SceneStatus;
  version: number;
  selectedAssetId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Storyboard {
  id: string;
  projectId: string;
  version: number;
  totalDurationSeconds: number;
  scenes: Scene[];
  isStale?: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 8. ASYNC GENERATION JOBS & ASSETS
// ==========================================

export type GenerationJobType = "IMAGE" | "VIDEO";
export type GenerationJobStatus =
  | "QUEUED"
  | "PROCESSING"
  | "SUCCEEDED"
  | "FAILED"
  | "BLOCKED"
  | "CANCELLED";

export interface GenerationJob {
  id: string;
  projectId: string;
  sceneId: string;
  type: GenerationJobType;
  provider: string;
  externalOperationId?: string | null;
  status: GenerationJobStatus;
  progressPercent?: number;
  errorCode?: string | null;
  errorMessage?: string | null;
  resultAssetId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Asset {
  id: string;
  projectId: string;
  sceneId: string;
  jobId?: string | null;
  type: "IMAGE" | "VIDEO" | "AUDIO";
  storageKey: string;
  url: string;
  mimeType: string;
  metadata?: Record<string, unknown>;
  isSelected: boolean;
  createdAt: string;
}

// ==========================================
// 9. SAFETY & SAFE REWRITE (TASK B & QC)
// ==========================================

export type PolicyGateAction =
  | "PASS"
  | "REWRITE"
  | "NEUTRALIZE"
  | "BLOCK_PROJECT_STEP";

export interface PolicyGateEvaluation {
  realPersonOrPublicFigure: "PASS" | "REWRITE";
  minorSensitiveContext: "PASS" | "REWRITE";
  sexualContent: "PASS" | "REWRITE";
  graphicViolence: "PASS" | "REWRITE";
  selfHarm: "PASS" | "REWRITE";
  dangerousInstruction: "PASS" | "REWRITE";
  illegalInstruction: "PASS" | "REWRITE";
  hateOrHarassment: "PASS" | "REWRITE";
  privacyOrBiometrics: "PASS" | "REWRITE";
  impersonationOrDeception: "PASS" | "REWRITE";
  copyrightedCharacter: "PASS" | "REWRITE";
  politicalPersuasion: "PASS" | "NEUTRALIZE";
  action: PolicyGateAction;
  reasons: string[];
}

export interface SafeRewriteOutput {
  originalRisk: string;
  whyRisky: string;
  educationalGoal: string;
  safeAlternative: string;
  sceneChanges: string[];
}

export interface SafetyReport {
  id: string;
  projectId: string;
  sceneId?: string | null;
  version: number;
  policyGate: PolicyGateEvaluation;
  safeRewrite?: SafeRewriteOutput | null;
  createdAt: string;
}

// ==========================================
// 10. QC REPORT & EXPORT
// ==========================================

export type QCCheckCategory =
  | "SOURCE"
  | "PEDAGOGY"
  | "CONTINUITY"
  | "VIDEO"
  | "SAFETY";

export type QCCheckStatus = "PASS" | "WARNING" | "FAIL";

export interface QCCheckItem {
  id: string;
  category: QCCheckCategory;
  label: string;
  status: QCCheckStatus;
  message?: string;
  suggestedFix?: string;
}

export interface QCReport {
  id: string;
  projectId: string;
  version: number;
  overallStatus: "PASS" | "NEED_FIX";
  checks: QCCheckItem[];
  createdAt: string;
}

export type ExportType =
  | "MARKDOWN_PRODUCTION_PACK"
  | "DATA_PACK_JSON"
  | "STORYBOARD_JSON"
  | "PROMPT_PACK"
  | "ZIP_BUNDLE";

export interface ProjectExport {
  id: string;
  projectId: string;
  type: ExportType;
  filename: string;
  downloadUrl: string;
  storageKey: string;
  sizeBytes: number;
  createdAt: string;
}

// ==========================================
// 11. API ENVELOPE
// ==========================================

export type ApiResponse<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    };
