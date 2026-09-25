import { IProjectRepository } from "./IProjectRepository";
import { FileSystemProjectRepository } from "./FileSystemProjectRepository";

// Singleton instance cho ứng dụng local / development
let repositoryInstance: IProjectRepository | null = null;

export function getProjectRepository(): IProjectRepository {
  if (!repositoryInstance) {
    repositoryInstance = new FileSystemProjectRepository();
  }
  return repositoryInstance;
}

export * from "./IProjectRepository";
export * from "./FileSystemProjectRepository";
