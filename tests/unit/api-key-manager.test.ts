import { describe, it, expect, beforeEach, afterAll } from "vitest";
import path from "path";
import fs from "fs/promises";
import { ApiKeyManager } from "@/ai/providers/apiKeyManager";

const TEST_SETTINGS_FILE = path.join(process.cwd(), "tests", "fixtures", "test_api_keys.json");

describe("ApiKeyManager - Multi-Key Pool & Rotation Tests", () => {
  let manager: ApiKeyManager;

  beforeEach(async () => {
    try {
      await fs.rm(TEST_SETTINGS_FILE, { force: true });
    } catch {
      // Ignore
    }
    manager = new ApiKeyManager(TEST_SETTINGS_FILE);
  });

  afterAll(async () => {
    try {
      await fs.rm(TEST_SETTINGS_FILE, { force: true });
    } catch {
      // Ignore
    }
  });

  it("thêm danh sách nhiều API Key và che khóa (masking) an toàn", async () => {
    const rawKeys = [
      "AIzaSyDemoKeyNumberOne111111111",
      "AIzaSyDemoKeyNumberTwo222222222",
      "AIzaSyDemoKeyNumberThree33333333",
    ];

    const masked = await manager.setKeys(rawKeys);
    expect(masked).toHaveLength(3);
    expect(masked[0].maskedKey).toBe("AIzaSyD...1111");
    expect(masked[1].maskedKey).toBe("AIzaSyD...2222");

    const counts = await manager.getKeyCount();
    expect(counts.total).toBe(3);
    expect(counts.active).toBe(3);
  });

  it("thực hiện xoay vòng khóa (Round-Robin) giữa các key hoạt động", async () => {
    const key1 = "AIzaSyKeyAlphaAAAAAAAAAAA";
    const key2 = "AIzaSyKeyBetaBBBBBBBBBBBB";

    await manager.setKeys([key1, key2]);

    const first = await manager.getNextActiveKey();
    const second = await manager.getNextActiveKey();
    const third = await manager.getNextActiveKey();

    expect(first).toBe(key1);
    expect(second).toBe(key2);
    expect(third).toBe(key1); // Quay vòng lại key1
  });

  it("tự động chuyển sang key khác khi một key bị đánh dấu Rate Limit (Cooldown)", async () => {
    const key1 = "AIzaSyKeyAlphaAAAAAAAAAAA";
    const key2 = "AIzaSyKeyBetaBBBBBBBBBBBB";

    await manager.setKeys([key1, key2]);

    // Giả lập key1 chạm hạn mức 429
    await manager.markKeyRateLimited(key1, 60);

    const counts = await manager.getKeyCount();
    expect(counts.active).toBe(1);
    expect(counts.cooldown).toBe(1);

    // Lượt gọi tiếp theo phải trả về key2 (bỏ qua key1)
    const nextKey = await manager.getNextActiveKey();
    expect(nextKey).toBe(key2);

    // Lượt gọi tiếp nữa vẫn dùng key2 vì key1 đang cooldown
    const nextKeyAgain = await manager.getNextActiveKey();
    expect(nextKeyAgain).toBe(key2);
  });

  it("xóa từng key hoặc làm trống danh sách key", async () => {
    await manager.setKeys(["KeyA12345678", "KeyB12345678"]);
    const keys = await manager.getMaskedKeys();
    expect(keys).toHaveLength(2);

    await manager.removeKey(keys[0].id);
    const remaining = await manager.getMaskedKeys();
    expect(remaining).toHaveLength(1);

    await manager.clearKeys();
    const empty = await manager.getMaskedKeys();
    expect(empty).toHaveLength(0);
  });
});
