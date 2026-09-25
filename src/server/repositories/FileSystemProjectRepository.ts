import fs from "fs/promises";
import path from "path";
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

export class FileSystemProjectRepository implements IProjectRepository {
  private baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = customBaseDir || path.join(process.cwd(), "data", "projects");
  }

  private async ensureDir(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch {
      // Ignore if directory already exists
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
    const dir = path.dirname(filePath);
    await this.ensureDir(dir);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
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

    const projectDir = this.getProjectDir(id);
    await this.ensureDir(projectDir);
    await this.writeJsonFile(path.join(projectDir, "project.json"), project);
    return project;
  }

  async getProjectById(id: string): Promise<Project | null> {
    const projectDir = this.getProjectDir(id);
    return this.readJsonFile<Project>(path.join(projectDir, "project.json"));
  }

  async listProjects(): Promise<Project[]> {
    await this.ensureDir(this.baseDir);
    try {
      const entries = await fs.readdir(this.baseDir, { withFileTypes: true });
      const projects: Project[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const project = await this.getProjectById(entry.name);
          if (project) {
            projects.push(project);
          }
        }
      }

      // Sắp xếp mới nhất lên đầu
      return projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } catch {
      return [];
    }
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

    const projectDir = this.getProjectDir(id);
    await this.writeJsonFile(path.join(projectDir, "project.json"), updated);
    return updated;
  }

  async deleteProject(id: string): Promise<boolean> {
    const projectDir = this.getProjectDir(id);
    try {
      await fs.rm(projectDir, { recursive: true, force: true });
      return true;
    } catch {
      return false;
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

    const projectDir = this.getProjectDir(sourceFile.projectId);
    const sourcesPath = path.join(projectDir, "sources.json");
    const existingSources = (await this.readJsonFile<SourceFile[]>(sourcesPath)) || [];

    existingSources.push(sourceFile);
    await this.writeJsonFile(sourcesPath, existingSources);

    // Cập nhật trạng thái project thành SOURCE_UPLOADED nếu đang ở trạng thái ban đầu
    const project = await this.getProjectById(sourceFile.projectId);
    if (project && (project.status === "NEW" || project.status === "SOURCE_UPLOADED")) {
      await this.updateProject(sourceFile.projectId, { status: "SOURCE_UPLOADED" });
    }

    return sourceFile;
  }

  async getSourceFilesByProjectId(projectId: string): Promise<SourceFile[]> {
    const projectDir = this.getProjectDir(projectId);
    const sourcesPath = path.join(projectDir, "sources.json");
    return (await this.readJsonFile<SourceFile[]>(sourcesPath)) || [];
  }

  async deleteSourceFile(sourceFileId: string): Promise<boolean> {
    // Duyệt qua các project để tìm và xóa
    const projects = await this.listProjects();
    for (const project of projects) {
      const sources = await this.getSourceFilesByProjectId(project.id);
      const target = sources.find((s) => s.id === sourceFileId);
      if (target) {
        const remaining = sources.filter((s) => s.id !== sourceFileId);
        const sourcesPath = path.join(this.getProjectDir(project.id), "sources.json");
        await this.writeJsonFile(sourcesPath, remaining);

        // Xóa file vật lý nếu có
        try {
          if (target.storageKey) {
            await fs.unlink(target.storageKey);
          }
        } catch {
          // Bỏ qua lỗi nếu file vật lý không tồn tại
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
    const projectDir = this.getProjectDir(dataPack.projectId);
    await this.writeJsonFile(path.join(projectDir, "datapack.json"), dataPack);
    return dataPack;
  }

  async getDataPackByProjectId(projectId: string): Promise<DataPack | null> {
    const projectDir = this.getProjectDir(projectId);
    return this.readJsonFile<DataPack>(path.join(projectDir, "datapack.json"));
  }

  // ==========================================
  // 4. CONCEPTS
  // ==========================================

  async saveConcepts(projectId: string, concepts: Concept[]): Promise<Concept[]> {
    const projectDir = this.getProjectDir(projectId);
    await this.writeJsonFile(path.join(projectDir, "concepts.json"), concepts);
    return concepts;
  }

  async getConceptsByProjectId(projectId: string): Promise<Concept[]> {
    const projectDir = this.getProjectDir(projectId);
    return (await this.readJsonFile<Concept[]>(path.join(projectDir, "concepts.json"))) || [];
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
    const projectDir = this.getProjectDir(script.projectId);
    await this.writeJsonFile(path.join(projectDir, "script.json"), script);
    return script;
  }

  async getScriptByProjectId(projectId: string): Promise<Script | null> {
    const projectDir = this.getProjectDir(projectId);
    return this.readJsonFile<Script>(path.join(projectDir, "script.json"));
  }

  // ==========================================
  // 6. STORYBOARD & SCENES
  // ==========================================

  async saveStoryboard(storyboard: Storyboard): Promise<Storyboard> {
    const projectDir = this.getProjectDir(storyboard.projectId);
    await this.writeJsonFile(path.join(projectDir, "storyboard.json"), storyboard);
    return storyboard;
  }

  async getStoryboardByProjectId(projectId: string): Promise<Storyboard | null> {
    const projectDir = this.getProjectDir(projectId);
    return this.readJsonFile<Storyboard>(path.join(projectDir, "storyboard.json"));
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

    const projectDir = this.getProjectDir(job.projectId);
    const jobsPath = path.join(projectDir, "jobs.json");
    const existing = (await this.readJsonFile<GenerationJob[]>(jobsPath)) || [];
    existing.push(job);
    await this.writeJsonFile(jobsPath, existing);
    return job;
  }

  async getJobById(jobId: string): Promise<GenerationJob | null> {
    const projects = await this.listProjects();
    for (const p of projects) {
      const jobsPath = path.join(this.getProjectDir(p.id), "jobs.json");
      const jobs = (await this.readJsonFile<GenerationJob[]>(jobsPath)) || [];
      const job = jobs.find((j) => j.id === jobId);
      if (job) return job;
    }
    return null;
  }

  async updateJob(jobId: string, updates: Partial<GenerationJob>): Promise<GenerationJob> {
    const projects = await this.listProjects();
    for (const p of projects) {
      const jobsPath = path.join(this.getProjectDir(p.id), "jobs.json");
      const jobs = (await this.readJsonFile<GenerationJob[]>(jobsPath)) || [];
      const index = jobs.findIndex((j) => j.id === jobId);
      if (index !== -1) {
        const updated: GenerationJob = {
          ...jobs[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
        jobs[index] = updated;
        await this.writeJsonFile(jobsPath, jobs);
        return updated;
      }
    }
    throw new Error(`Job with ID ${jobId} not found`);
  }

  // ==========================================
  // 8. ASSETS
  // ==========================================

  async saveAsset(asset: Asset): Promise<Asset> {
    const projectDir = this.getProjectDir(asset.projectId);
    const assetsPath = path.join(projectDir, "assets.json");
    const assets = (await this.readJsonFile<Asset[]>(assetsPath)) || [];
    assets.push(asset);
    await this.writeJsonFile(assetsPath, assets);
    return asset;
  }

  async getAssetsBySceneId(sceneId: string): Promise<Asset[]> {
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
    const projectDir = this.getProjectDir(report.projectId);
    await this.writeJsonFile(path.join(projectDir, "safety.json"), report);
    return report;
  }

  async getLatestSafetyReport(projectId: string): Promise<SafetyReport | null> {
    const projectDir = this.getProjectDir(projectId);
    return this.readJsonFile<SafetyReport>(path.join(projectDir, "safety.json"));
  }

  async saveQCReport(report: QCReport): Promise<QCReport> {
    const projectDir = this.getProjectDir(report.projectId);
    await this.writeJsonFile(path.join(projectDir, "qc.json"), report);
    return report;
  }

  async getLatestQCReport(projectId: string): Promise<QCReport | null> {
    const projectDir = this.getProjectDir(projectId);
    return this.readJsonFile<QCReport>(path.join(projectDir, "qc.json"));
  }
}
