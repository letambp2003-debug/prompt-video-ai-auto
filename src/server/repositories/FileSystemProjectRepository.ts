import fs from "fs/promises";
import path from "path";
import os from "os";
import {
  Project,
  SourceFile,
  DataPack,
  Concept,
  Script,
  Storyboard,
  Scene,
  GenerationJob,
  Asset,
  SafetyReport,
  QCReport,
} from "@/types";
import { IProjectRepository } from "./IProjectRepository";

export function resolveBaseDir(customBaseDir?: string): string {
  if (customBaseDir) return customBaseDir;
  if (process.env.DATA_DIR) return process.env.DATA_DIR;

  // Kiểm tra môi trường Serverless (Vercel, AWS Lambda, hoặc /var/task read-only)
  const isServerless =
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
    (typeof process.cwd === "function" && process.cwd().startsWith("/var/task"));

  if (isServerless) {
    return path.join(os.tmpdir(), "edu_video_director_data", "projects");
  }

  return path.join(process.cwd(), "data", "projects");
}

export function getProjectUploadDir(projectId: string, customBaseDir?: string): string {
  const base = resolveBaseDir(customBaseDir);
  return path.join(base, projectId, "files");
}

export class FileSystemProjectRepository implements IProjectRepository {
  private baseDir: string;

  // In-memory cache đảm bảo không bao giờ lỗi ENOENT kể cả trên Serverless read-only
  private memoryProjects = new Map<string, Project>();
  private memorySources = new Map<string, SourceFile[]>();
  private memoryDataPacks = new Map<string, DataPack>();
  private memoryConcepts = new Map<string, Concept[]>();
  private memoryScripts = new Map<string, Script>();
  private memoryStoryboards = new Map<string, Storyboard>();
  private memoryJobs = new Map<string, GenerationJob>();
  private memoryAssets = new Map<string, Asset[]>();
  private memorySafety = new Map<string, SafetyReport>();
  private memoryQC = new Map<string, QCReport>();

  constructor(customBaseDir?: string) {
    this.baseDir = resolveBaseDir(customBaseDir);
  }

  private async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch {
      // Nếu không thể tạo thư mục do quyền ghi (ví dụ /var/task), chuyển baseDir sang /tmp
      if (!this.baseDir.includes(os.tmpdir())) {
        this.baseDir = path.join(os.tmpdir(), "edu_video_director_data", "projects");
        try {
          await fs.mkdir(path.join(this.baseDir, path.basename(dirPath)), { recursive: true });
        } catch {
          // Bỏ qua nếu môi trường hoàn toàn chỉ đọc; in-memory cache sẽ đảm nhiệm
        }
      }
    }
  }

  private getProjectDir(projectId: string): string {
    return path.join(this.baseDir, projectId);
  }

  private async readJsonFile<T>(filePath: string): Promise<T | null> {
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  private async writeJsonFile<T>(filePath: string, data: T): Promise<void> {
    try {
      const dir = path.dirname(filePath);
      await this.ensureDir(dir);
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      // Nếu ghi file thất bại (do read-only filesystem), in-memory cache đã lưu trữ dữ liệu an toàn
      try {
        // Thử ghi vào thư mục tạm /tmp
        const tmpFallback = path.join(os.tmpdir(), "edu_video_director_data", path.basename(filePath));
        await fs.mkdir(path.dirname(tmpFallback), { recursive: true });
        await fs.writeFile(tmpFallback, JSON.stringify(data, null, 2), "utf-8");
      } catch {
        // Dữ liệu vẫn được bảo toàn trong memory
      }
    }
  }

  // ==========================================
  // 1. PROJECT
  // ==========================================

  async createProject(projectData: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project> {
    const id = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const project: Project = {
      ...projectData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Lưu vào memory cache
    this.memoryProjects.set(id, project);

    // 2. Lưu vào đĩa (với cơ chế an toàn)
    const projectDir = this.getProjectDir(id);
    await this.writeJsonFile(path.join(projectDir, "project.json"), project);
    return project;
  }

  async getProjectById(id: string): Promise<Project | null> {
    // Ưu tiên đọc từ memory cache
    if (this.memoryProjects.has(id)) {
      return this.memoryProjects.get(id)!;
    }

    const projectDir = this.getProjectDir(id);
    const diskProject = await this.readJsonFile<Project>(path.join(projectDir, "project.json"));
    if (diskProject) {
      this.memoryProjects.set(id, diskProject);
    }
    return diskProject;
  }

  async listProjects(): Promise<Project[]> {
    const projectsMap = new Map<string, Project>();

    // 1. Nạp từ memory cache
    for (const [id, p] of this.memoryProjects.entries()) {
      projectsMap.set(id, p);
    }

    // 2. Nạp từ đĩa
    try {
      await this.ensureDir(this.baseDir);
      const entries = await fs.readdir(this.baseDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory() && !projectsMap.has(entry.name)) {
          const project = await this.getProjectById(entry.name);
          if (project) {
            projectsMap.set(project.id, project);
          }
        }
      }
    } catch {
      // Sử dụng danh sách từ memory
    }

    const projects = Array.from(projectsMap.values());
    // Sắp xếp mới nhất lên đầu
    return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const existing = await this.getProjectById(id);
    if (!existing) {
      throw new Error(`Project with ID ${id} not found`);
    }

    const updated: Project = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.memoryProjects.set(id, updated);
    const projectDir = this.getProjectDir(id);
    await this.writeJsonFile(path.join(projectDir, "project.json"), updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    this.memoryProjects.delete(id);
    this.memorySources.delete(id);
    this.memoryDataPacks.delete(id);
    this.memoryConcepts.delete(id);
    this.memoryScripts.delete(id);
    this.memoryStoryboards.delete(id);

    const projectDir = this.getProjectDir(id);
    try {
      await fs.rm(projectDir, { recursive: true, force: true });
      return true;
    } catch {
      return true;
    }
  }

  // ==========================================
  // 2. SOURCE FILES
  // ==========================================

  async addSourceFile(sourceData: Omit<SourceFile, "id" | "createdAt">): Promise<SourceFile> {
    const id = `src_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sourceFile: SourceFile = {
      ...sourceData,
      id,
      createdAt: new Date().toISOString(),
    };

    const existingSources = (await this.getSourceFilesByProjectId(sourceFile.projectId)) || [];
    existingSources.push(sourceFile);
    this.memorySources.set(sourceFile.projectId, existingSources);

    const projectDir = this.getProjectDir(sourceFile.projectId);
    const sourcesPath = path.join(projectDir, "sources.json");
    await this.writeJsonFile(sourcesPath, existingSources);

    // Cập nhật trạng thái project thành SOURCE_UPLOADED nếu đang ở trạng thái ban đầu
    const project = await this.getProjectById(sourceFile.projectId);
    if (project && (project.status === "NEW" || project.status === "SOURCE_UPLOADED")) {
      await this.updateProject(sourceFile.projectId, { status: "SOURCE_UPLOADED" });
    }

    return sourceFile;
  }

  async getSourceFilesByProjectId(projectId: string): Promise<SourceFile[]> {
    if (this.memorySources.has(projectId)) {
      return this.memorySources.get(projectId)!;
    }

    const projectDir = this.getProjectDir(projectId);
    const sourcesPath = path.join(projectDir, "sources.json");
    const sources = (await this.readJsonFile<SourceFile[]>(sourcesPath)) || [];
    this.memorySources.set(projectId, sources);
    return sources;
  }

  async deleteSourceFile(sourceFileId: string): Promise<boolean> {
    const projects = await this.listProjects();
    for (const project of projects) {
      const sources = await this.getSourceFilesByProjectId(project.id);
      const target = sources.find((s) => s.id === sourceFileId);
      if (target) {
        const remaining = sources.filter((s) => s.id !== sourceFileId);
        this.memorySources.set(project.id, remaining);

        const sourcesPath = path.join(this.getProjectDir(project.id), "sources.json");
        await this.writeJsonFile(sourcesPath, remaining);

        // Xóa file vật lý nếu có
        try {
          if (target.storageKey) {
            await fs.unlink(target.storageKey);
          }
        } catch {
          // Bỏ qua nếu không thể xóa
        }

        // Nếu hết file nguồn thì chuyển trạng thái về NEW
        if (remaining.length === 0 && project.status === "SOURCE_UPLOADED") {
          await this.updateProject(project.id, { status: "NEW" });
        }
        return true;
      }
    }
    return false;
  }

  // ==========================================
  // 3. DATA PACK
  // ==========================================

  async saveDataPack(dataPack: DataPack): Promise<DataPack> {
    this.memoryDataPacks.set(dataPack.projectId, dataPack);
    const projectDir = this.getProjectDir(dataPack.projectId);
    await this.writeJsonFile(path.join(projectDir, "datapack.json"), dataPack);
    return dataPack;
  }

  async getDataPackByProjectId(projectId: string): Promise<DataPack | null> {
    if (this.memoryDataPacks.has(projectId)) {
      return this.memoryDataPacks.get(projectId)!;
    }
    const projectDir = this.getProjectDir(projectId);
    const dp = await this.readJsonFile<DataPack>(path.join(projectDir, "datapack.json"));
    if (dp) this.memoryDataPacks.set(projectId, dp);
    return dp;
  }

  // ==========================================
  // 4. CONCEPTS
  // ==========================================

  async saveConcepts(projectId: string, concepts: Concept[]): Promise<Concept[]> {
    this.memoryConcepts.set(projectId, concepts);
    const projectDir = this.getProjectDir(projectId);
    await this.writeJsonFile(path.join(projectDir, "concepts.json"), concepts);
    return concepts;
  }

  async getConceptsByProjectId(projectId: string): Promise<Concept[]> {
    if (this.memoryConcepts.has(projectId)) {
      return this.memoryConcepts.get(projectId)!;
    }
    const projectDir = this.getProjectDir(projectId);
    const concepts = (await this.readJsonFile<Concept[]>(path.join(projectDir, "concepts.json"))) || [];
    this.memoryConcepts.set(projectId, concepts);
    return concepts;
  }

  async selectConcept(projectId: string, conceptId: string): Promise<Concept | null> {
    const concepts = await this.getConceptsByProjectId(projectId);
    let selected: Concept | null = null;

    const updated = concepts.map((c) => {
      if (c.id === conceptId) {
        selected = { ...c, isSelected: true };
        return selected;
      }
      return { ...c, isSelected: false };
    });

    if (selected) {
      await this.saveConcepts(projectId, updated);
      await this.updateProject(projectId, {
        selectedMode: (selected as Concept).mode,
        status: "MODE_SELECTED",
      });
    }

    return selected;
  }

  // ==========================================
  // 5. SCRIPT
  // ==========================================

  async saveScript(script: Script): Promise<Script> {
    this.memoryScripts.set(script.projectId, script);
    const projectDir = this.getProjectDir(script.projectId);
    await this.writeJsonFile(path.join(projectDir, "script.json"), script);
    return script;
  }

  async getScriptByProjectId(projectId: string): Promise<Script | null> {
    if (this.memoryScripts.has(projectId)) {
      return this.memoryScripts.get(projectId)!;
    }
    const projectDir = this.getProjectDir(projectId);
    const s = await this.readJsonFile<Script>(path.join(projectDir, "script.json"));
    if (s) this.memoryScripts.set(projectId, s);
    return s;
  }

  // ==========================================
  // 6. STORYBOARD & SCENES
  // ==========================================

  async saveStoryboard(storyboard: Storyboard): Promise<Storyboard> {
    this.memoryStoryboards.set(storyboard.projectId, storyboard);
    const projectDir = this.getProjectDir(storyboard.projectId);
    await this.writeJsonFile(path.join(projectDir, "storyboard.json"), storyboard);
    return storyboard;
  }

  async getStoryboardByProjectId(projectId: string): Promise<Storyboard | null> {
    if (this.memoryStoryboards.has(projectId)) {
      return this.memoryStoryboards.get(projectId)!;
    }
    const projectDir = this.getProjectDir(projectId);
    const sb = await this.readJsonFile<Storyboard>(path.join(projectDir, "storyboard.json"));
    if (sb) this.memoryStoryboards.set(projectId, sb);
    return sb;
  }

  async getScenesByProjectId(projectId: string): Promise<Scene[]> {
    const storyboard = await this.getStoryboardByProjectId(projectId);
    return storyboard ? storyboard.scenes : [];
  }

  async getSceneById(sceneId: string): Promise<Scene | null> {
    const projects = await this.listProjects();
    for (const p of projects) {
      const storyboard = await this.getStoryboardByProjectId(p.id);
      if (storyboard) {
        const scene = storyboard.scenes.find((s) => s.id === sceneId);
        if (scene) return scene;
      }
    }
    return null;
  }

  async updateScene(sceneId: string, updates: Partial<Scene>): Promise<Scene> {
    const projects = await this.listProjects();
    for (const p of projects) {
      const storyboard = await this.getStoryboardByProjectId(p.id);
      if (storyboard) {
        const sceneIndex = storyboard.scenes.findIndex((s) => s.id === sceneId);
        if (sceneIndex !== -1) {
          const updatedScene: Scene = {
            ...storyboard.scenes[sceneIndex],
            ...updates,
            updatedAt: new Date().toISOString(),
          };
          storyboard.scenes[sceneIndex] = updatedScene;
          await this.saveStoryboard(storyboard);
          return updatedScene;
        }
      }
    }
    throw new Error(`Scene with ID ${sceneId} not found`);
  }

  // ==========================================
  // 7. GENERATION JOBS
  // ==========================================

  async createJob(jobData: Omit<GenerationJob, "id" | "createdAt" | "updatedAt">): Promise<GenerationJob> {
    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const job: GenerationJob = {
      ...jobData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.memoryJobs.set(id, job);
    const projectDir = this.getProjectDir(job.projectId);
    const jobsPath = path.join(projectDir, "jobs.json");
    const existing = (await this.readJsonFile<GenerationJob[]>(jobsPath)) || [];
    existing.push(job);
    await this.writeJsonFile(jobsPath, existing);
    return job;
  }

  async getJobById(jobId: string): Promise<GenerationJob | null> {
    if (this.memoryJobs.has(jobId)) {
      return this.memoryJobs.get(jobId)!;
    }
    const projects = await this.listProjects();
    for (const p of projects) {
      const jobsPath = path.join(this.getProjectDir(p.id), "jobs.json");
      const jobs = (await this.readJsonFile<GenerationJob[]>(jobsPath)) || [];
      const job = jobs.find((j) => j.id === jobId);
      if (job) {
        this.memoryJobs.set(jobId, job);
        return job;
      }
    }
    return null;
  }

  async updateJob(jobId: string, updates: Partial<GenerationJob>): Promise<GenerationJob> {
    const existing = await this.getJobById(jobId);
    if (!existing) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    const updated: GenerationJob = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.memoryJobs.set(jobId, updated);

    const projectDir = this.getProjectDir(updated.projectId);
    const jobsPath = path.join(projectDir, "jobs.json");
    const jobs = (await this.readJsonFile<GenerationJob[]>(jobsPath)) || [];
    const idx = jobs.findIndex((j) => j.id === jobId);
    if (idx !== -1) {
      jobs[idx] = updated;
    } else {
      jobs.push(updated);
    }
    await this.writeJsonFile(jobsPath, jobs);
    return updated;
  }

  // ==========================================
  // 8. ASSETS
  // ==========================================

  async saveAsset(asset: Asset): Promise<Asset> {
    const existing = this.memoryAssets.get(asset.projectId) || [];
    existing.push(asset);
    this.memoryAssets.set(asset.projectId, existing);

    const projectDir = this.getProjectDir(asset.projectId);
    const assetsPath = path.join(projectDir, "assets.json");
    await this.writeJsonFile(assetsPath, existing);
    return asset;
  }

  async getAssetsBySceneId(sceneId: string): Promise<Asset[]> {
    for (const assets of this.memoryAssets.values()) {
      const filtered = assets.filter((a) => a.sceneId === sceneId);
      if (filtered.length > 0) return filtered;
    }

    const projects = await this.listProjects();
    for (const p of projects) {
      const assetsPath = path.join(this.getProjectDir(p.id), "assets.json");
      const assets = (await this.readJsonFile<Asset[]>(assetsPath)) || [];
      const filtered = assets.filter((a) => a.sceneId === sceneId);
      if (filtered.length > 0) return filtered;
    }
    return [];
  }

  // ==========================================
  // 9. SAFETY & QC
  // ==========================================

  async saveSafetyReport(report: SafetyReport): Promise<SafetyReport> {
    this.memorySafety.set(report.projectId, report);
    const projectDir = this.getProjectDir(report.projectId);
    await this.writeJsonFile(path.join(projectDir, "safety.json"), report);
    return report;
  }

  async getLatestSafetyReport(projectId: string): Promise<SafetyReport | null> {
    if (this.memorySafety.has(projectId)) {
      return this.memorySafety.get(projectId)!;
    }
    const projectDir = this.getProjectDir(projectId);
    const rep = await this.readJsonFile<SafetyReport>(path.join(projectDir, "safety.json"));
    if (rep) this.memorySafety.set(projectId, rep);
    return rep;
  }

  async saveQCReport(report: QCReport): Promise<QCReport> {
    this.memoryQC.set(report.projectId, report);
    const projectDir = this.getProjectDir(report.projectId);
    await this.writeJsonFile(path.join(projectDir, "qc.json"), report);
    return report;
  }

  async getLatestQCReport(projectId: string): Promise<QCReport | null> {
    if (this.memoryQC.has(projectId)) {
      return this.memoryQC.get(projectId)!;
    }
    const projectDir = this.getProjectDir(projectId);
    const rep = await this.readJsonFile<QCReport>(path.join(projectDir, "qc.json"));
    if (rep) this.memoryQC.set(projectId, rep);
    return rep;
  }
}
