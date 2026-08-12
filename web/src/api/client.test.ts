import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, apiRequest, login } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API errors", () => {
  it.each([401, 422])("shows one safe message when login returns %s", async (status) => {
    const detail = status === 401
      ? "用户名或密码错误"
      : [{ type: "string_too_short", loc: ["body", "password"], msg: "String should have at least 6 characters" }];
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail }), {
      status,
      headers: { "Content-Type": "application/json" }
    })));

    await expect(login("runner", "bad")).rejects.toMatchObject({
      status,
      message: "用户名或密码错误"
    });
  });

  it("does not stringify structured API errors as object text", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      detail: [{ msg: "字段内容不正确" }]
    }), {
      status: 422,
      headers: { "Content-Type": "application/json" }
    })));

    const request = apiRequest("/api/v1/example");
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({ message: "字段内容不正确" });
  });
});
