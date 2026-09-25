import { GenerationJob, GenerationJobStatus, SourceCheckResult } from "@/types";

export interface IAIProvider {
  analyzeSource(fileBuffer: Buffer, filename: string, mimeType: string): Promise<SourceCheckResult>;
  generateStructured<T>(systemPrompt: string, userPrompt: string): Promise<T>;
  generateText(systemPrompt: string, userPrompt: string): Promise<string>;
}

export interface IImageProvider {
  generateImage(prompt: string, options?: { aspectRatio?: string; style?: string }): Promise<{ url: string; storageKey: string }>;
}

export interface IVideoProvider {
  createVideoJob(prompt: string, referenceImageUrl?: string): Promise<{ externalOperationId: string }>;
  checkJobStatus(externalOperationId: string): Promise<{ status: GenerationJobStatus; progress?: number; videoUrl?: string; error?: string }>;
  cancelVideoJob(externalOperationId: string): Promise<boolean>;
}

export interface IStorageProvider {
  saveFile(buffer: Buffer, filename: string, mimeType: string): Promise<{ storageKey: string; url: string }>;
  getFileUrl(storageKey: string): Promise<string>;
  deleteFile(storageKey: string): Promise<boolean>;
}
