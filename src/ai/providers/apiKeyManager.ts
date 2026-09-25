import fs from "fs/promises";
import path from "path";
import os from "os";

export interface ApiKeyItem {
  id: string;
  key: string;
  maskedKey: string;
  status: "ACTIVE" | "COOLDOWN" | "INVALID";
  lastUsedAt?: string;
  cooldownUntil?: string;
  successCount: number;
  failureCount: number;
}

function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "••••••••";
  const start = key.substring(0, 7);
  const end = key.substring(key.length - 4);
  return `${start}...${end}`;
}

export class ApiKeyManager {
  private keys: ApiKeyItem[] = [];
  private currentIndex = 0;
  private storageFile: string;
  private isInitialized = false;

  constructor(customStorageFile?: string) {
    if (customStorageFile) {
      this.storageFile = customStorageFile;
    } else {
      const isServerless =
        Boolean(process.env.VERCEL) ||
        Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME) ||
        (typeof process.cwd === "function" && process.cwd().startsWith("/var/task"));

      const base = isServerless
        ? path.join(os.tmpdir(), "edu_video_director_data")
        : path.join(process.cwd(), "data");

      this.storageFile = path.join(base, "settings", "api_keys.json");
    }
  }

  private async ensureStorageDir(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.storageFile), { recursive: true });
    } catch {
      // Ignore
    }
  }

  async init(): Promise<void> {
    if (this.isInitialized) return;

    // 1. Đọc từ file lưu trữ nếu có
    try {
      const content = await fs.readFile(this.storageFile, "utf-8");
      const savedKeys = JSON.parse(content) as Array<{ key: string }>;
      if (Array.isArray(savedKeys)) {
        for (const item of savedKeys) {
          if (item.key && typeof item.key === "string") {
            this.addKeyInternal(item.key.trim());
          }
        }
      }
    } catch {
      // File chưa tồn tại hoặc lỗi đọc
    }

    // 2. Nạp thêm từ biến môi trường (GEMINI_API_KEY hoặc GEMINI_API_KEYS)
    const envKeys = [
      process.env.GEMINI_API_KEY,
      ...(process.env.GEMINI_API_KEYS ? process.env.GEMINI_API_KEYS.split(/[\n,]/) : []),
    ].filter(Boolean) as string[];

    for (const rawKey of envKeys) {
      const trimmed = rawKey.trim();
      if (trimmed) {
        this.addKeyInternal(trimmed);
      }
    }

    this.isInitialized = true;
  }

  private addKeyInternal(rawKey: string): void {
    if (!rawKey || this.keys.some((k) => k.key === rawKey)) return;

    this.keys.push({
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: rawKey,
      maskedKey: maskApiKey(rawKey),
      status: "ACTIVE",
      successCount: 0,
      failureCount: 0,
    });
  }

  async setKeys(rawKeys: string[]): Promise<ApiKeyItem[]> {
    await this.init();

    // Giữ lại trạng thái của các key đã có
    const existingMap = new Map(this.keys.map((k) => [k.key, k]));
    const newKeys: ApiKeyItem[] = [];

    for (const raw of rawKeys) {
      const clean = raw.trim();
      if (!clean) continue;

      if (existingMap.has(clean)) {
        newKeys.push(existingMap.get(clean)!);
      } else {
        newKeys.push({
          id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          key: clean,
          maskedKey: maskApiKey(clean),
          status: "ACTIVE",
          successCount: 0,
          failureCount: 0,
        });
      }
    }

    this.keys = newKeys;
    this.currentIndex = 0;
    await this.saveToStorage();
    return this.getMaskedKeys();
  }

  async addKey(rawKey: string): Promise<ApiKeyItem> {
    await this.init();
    const clean = rawKey.trim();
    if (!clean) throw new Error("API Key không được để trống");

    const existing = this.keys.find((k) => k.key === clean);
    if (existing) return existing;

    const newItem: ApiKeyItem = {
      id: `key_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      key: clean,
      maskedKey: maskApiKey(clean),
      status: "ACTIVE",
      successCount: 0,
      failureCount: 0,
    };

    this.keys.push(newItem);
    await this.saveToStorage();
    return newItem;
  }

  async removeKey(id: string): Promise<boolean> {
    await this.init();
    const initialLen = this.keys.length;
    this.keys = this.keys.filter((k) => k.id !== id);
    if (this.keys.length !== initialLen) {
      await this.saveToStorage();
      return true;
    }
    return false;
  }

  async clearKeys(): Promise<void> {
    await this.init();
    this.keys = [];
    this.currentIndex = 0;
    await this.saveToStorage();
  }

  private async saveToStorage(): Promise<void> {
    try {
      await this.ensureStorageDir();
      const dataToSave = this.keys.map((k) => ({ key: k.key }));
      await fs.writeFile(this.storageFile, JSON.stringify(dataToSave, null, 2), "utf-8");
    } catch {
      // Bỏ qua lỗi nếu đĩa không cho ghi; bộ nhớ in-memory vẫn giữ key
    }
  }

  /**
   * Lấy API Key tiếp theo theo cơ chế Round-Robin và tự động bỏ qua key đang Cooldown
   */
  async getNextActiveKey(): Promise<string | null> {
    await this.init();
    if (this.keys.length === 0) return null;

    const now = Date.now();

    // Khôi phục key đã hết thời gian cooldown
    for (const item of this.keys) {
      if (item.status === "COOLDOWN" && item.cooldownUntil) {
        if (new Date(item.cooldownUntil).getTime() <= now) {
          item.status = "ACTIVE";
          item.cooldownUntil = undefined;
        }
      }
    }

    // Tìm key khả dụng
    const availableKeys = this.keys.filter((k) => k.status === "ACTIVE");
    if (availableKeys.length === 0) {
      // Nếu tất cả đều cooldown, trả về key đầu tiên có thời gian chờ ngắn nhất
      return this.keys[0].key;
    }

    const keyItem = availableKeys[this.currentIndex % availableKeys.length];
    this.currentIndex = (this.currentIndex + 1) % availableKeys.length;
    keyItem.lastUsedAt = new Date().toISOString();
    return keyItem.key;
  }

  /**
   * Báo cáo key chạm rate limit (429) để đưa vào cooldown 60 giây và xoay sang key khác
   */
  async markKeyRateLimited(key: string, cooldownSeconds = 60): Promise<void> {
    const item = this.keys.find((k) => k.key === key);
    if (item) {
      item.status = "COOLDOWN";
      item.failureCount += 1;
      const cooldownDate = new Date(Date.now() + cooldownSeconds * 1000);
      item.cooldownUntil = cooldownDate.toISOString();
    }
  }

  async markKeySuccess(key: string): Promise<void> {
    const item = this.keys.find((k) => k.key === key);
    if (item) {
      item.status = "ACTIVE";
      item.successCount += 1;
    }
  }

  async markKeyInvalid(key: string): Promise<void> {
    const item = this.keys.find((k) => k.key === key);
    if (item) {
      item.status = "INVALID";
      item.failureCount += 1;
    }
  }

  async getMaskedKeys(): Promise<ApiKeyItem[]> {
    await this.init();
    // Trả về bản sao an toàn (key gốc không bị lộ trực tiếp ra ngoài API public nếu cần)
    return this.keys.map((k) => ({
      ...k,
      key: maskApiKey(k.key), // Luôn che khi xuất ra UI
    }));
  }

  async getKeyCount(): Promise<{ total: number; active: number; cooldown: number }> {
    await this.init();
    const active = this.keys.filter((k) => k.status === "ACTIVE").length;
    const cooldown = this.keys.filter((k) => k.status === "COOLDOWN").length;
    return {
      total: this.keys.length,
      active,
      cooldown,
    };
  }
}

// Singleton ApiKeyManager
let managerInstance: ApiKeyManager | null = null;

export function getApiKeyManager(): ApiKeyManager {
  if (!managerInstance) {
    managerInstance = new ApiKeyManager();
  }
  return managerInstance;
}
