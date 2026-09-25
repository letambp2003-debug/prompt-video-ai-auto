import { Project, SourceFile, DataPack, Concept, Script, Storyboard, Scene, GenerationJob, Asset, SafetyReport, QCReport } from "@/types";

export interface IProjectRepository {
  // Project
  createProject(project: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project>;
  getProjectById(id: string): Promise<Project | null>;
  listProjects(): Promise<Project[]>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<boolean>;

  // Source Files
  addSourceFile(sourceFile: Omit<SourceFile, "id" | "createdAt">): Promise<SourceFile>;
  getSourceFilesByProjectId(projectId: string): Promise<SourceFile[]>;
  deleteSourceFile(sourceFileId: string): Promise<boolean>;

  // DataPack
  saveDataPack(dataPack: DataPack): Promise<DataPack>;
  getDataPackByProjectId(projectId: string): Promise<DataPack | null>;

  // Concepts
  saveConcepts(projectId: string, concepts: Concept[]): Promise<Concept[]>;
  getConceptsByProjectId(projectId: string): Promise<Concept[]>;
  selectConcept(projectId: string, conceptId: string): Promise<Concept | null>;

  // Script
  saveScript(script: Script): Promise<Script>;
  getScriptByProjectId(projectId: string): Promise<Script | null>;

  // Storyboard & Scenes
  saveStoryboard(storyboard: Storyboard): Promise<Storyboard>;
  getStoryboardByProjectId(projectId: string): Promise<Storyboard | null>;
  getScenesByProjectId(projectId: string): Promise<Scene[]>;
  getSceneById(sceneId: string): Promise<Scene | null>;
  updateScene(sceneId: string, updates: Partial<Scene>): Promise<Scene>;

  // Generation Jobs
  createJob(job: Omit<GenerationJob, "id" | "createdAt" | "updatedAt">): Promise<GenerationJob>;
  getJobById(jobId: string): Promise<GenerationJob | null>;
  updateJob(jobId: string, updates: Partial<GenerationJob>): Promise<GenerationJob>;

  // Assets
  saveAsset(asset: Asset): Promise<Asset>;
  getAssetsBySceneId(sceneId: string): Promise<Asset[]>;

  // Safety & QC
  saveSafetyReport(report: SafetyReport): Promise<SafetyReport>;
  getLatestSafetyReport(projectId: string): Promise<SafetyReport | null>;
  saveQCReport(report: QCReport): Promise<QCReport>;
  getLatestQCReport(projectId: string): Promise<QCReport | null>;
}
