import { NextRequest, NextResponse } from "next/server";
import { getApiKeyManager } from "@/ai/providers/apiKeyManager";
import { ApiResponse } from "@/types";

export async function GET(): Promise<NextResponse<ApiResponse<{ keys: unknown[]; stats: unknown }>>> {
  try {
    const manager = getApiKeyManager();
    const keys = await manager.getMaskedKeys();
    const stats = await manager.getKeyCount();
    return NextResponse.json({
      ok: true,
      data: { keys, stats },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi lấy danh sách API Key";
    return NextResponse.json(
      { ok: false, error: { code: "GET_KEYS_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ keys: unknown[]; stats: unknown }>>> {
  try {
    const body = await req.json();
    const manager = getApiKeyManager();

    if (Array.isArray(body.keys)) {
      await manager.setKeys(body.keys);
    } else if (typeof body.key === "string" && body.key.trim()) {
      await manager.addKey(body.key.trim());
    } else if (typeof body.keysText === "string") {
      // Cho phép dán văn bản nhiều dòng hoặc phân tách bằng dấu phẩy
      const parsedKeys = body.keysText
        .split(/[\n,;]/)
        .map((k: string) => k.trim())
        .filter((k: string) => k.length > 5);
      await manager.setKeys(parsedKeys);
    } else {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_INPUT", message: "Vui lòng cung cấp danh sách API Key hợp lệ." } },
        { status: 400 }
      );
    }

    const keys = await manager.getMaskedKeys();
    const stats = await manager.getKeyCount();
    return NextResponse.json({
      ok: true,
      data: { keys, stats },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi lưu API Key";
    return NextResponse.json(
      { ok: false, error: { code: "SAVE_KEYS_FAILED", message } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse<ApiResponse<{ success: boolean; stats: unknown }>>> {
  try {
    const manager = getApiKeyManager();
    const { searchParams } = new URL(req.url);
    const keyId = searchParams.get("id");

    if (keyId) {
      await manager.removeKey(keyId);
    } else {
      await manager.clearKeys();
    }

    const stats = await manager.getKeyCount();
    return NextResponse.json({
      ok: true,
      data: { success: true, stats },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi khi xóa API Key";
    return NextResponse.json(
      { ok: false, error: { code: "DELETE_KEY_FAILED", message } },
      { status: 500 }
    );
  }
}
