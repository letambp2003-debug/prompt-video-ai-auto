import { Project, SourceFile } from "@/types";

const STORAGE_KEY_PROJECTS = "edu_projects_store_v1";
const STORAGE_PREFIX_SOURCES = "edu_sources_store_v1_";

/**
 * Lấy danh sách dự án đã lưu trong localStorage của trình duyệt
 */
export function getProjectsLocal(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (!raw) return [];
    const list = JSON.parse(raw) as Project[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Lưu hoặc cập nhật một dự án vào localStorage
 */
export function saveProjectLocal(project: Project): void {
  if (typeof window === "undefined" || !project || !project.id) return;
  try {
    const current = getProjectsLocal();
    const existingIndex = current.findIndex((p) => p.id === project.id);
    if (existingIndex >= 0) {
      current[existingIndex] = { ...current[existingIndex], ...project };
    } else {
      current.unshift(project);
    }
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(current));
  } catch (err) {
    console.warn("Không thể lưu project vào localStorage:", err);
  }
}

/**
 * Lấy thông tin một dự án cụ thể từ localStorage
 */
export function getProjectLocal(id: string): Project | null {
  if (typeof window === "undefined") return null;
  const list = getProjectsLocal();
  return list.find((p) => p.id === id) || null;
}

/**
 * Xóa một dự án khỏi localStorage
 */
export function deleteProjectLocal(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getProjectsLocal();
    const filtered = current.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(filtered));
    localStorage.removeItem(`${STORAGE_PREFIX_SOURCES}${id}`);
  } catch {
    // Ignore
  }
}

/**
 * Lưu danh sách tài liệu nguồn cho dự án
 */
export function saveSourcesLocal(projectId: string, sources: SourceFile[]): void {
  if (typeof window === "undefined" || !projectId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX_SOURCES}${projectId}`, JSON.stringify(sources));
  } catch {
    // Ignore
  }
}

/**
 * Lấy danh sách tài liệu nguồn đã lưu cục bộ
 */
export function getSourcesLocal(projectId: string): SourceFile[] {
  if (typeof window === "undefined" || !projectId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX_SOURCES}${projectId}`);
    if (!raw) return [];
    const list = JSON.parse(raw) as SourceFile[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/**
 * Tự động đồng bộ dự án lên máy chủ (để container serverless nhận diện ngay lập tức)
 */
export async function syncProjectToServer(project: Project, sources?: SourceFile[]): Promise<boolean> {
  try {
    const res = await fetch("/api/projects/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project, sources }),
    });
    const json = await res.json();
    return Boolean(json.ok);
  } catch {
    return false;
  }
}
