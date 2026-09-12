import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAiStream } from "@/features/ai/use-ai-stream";
vi.mock("@/main-axios", () => ({ authApi: { defaults: { baseURL: "/api" } } }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
const input = { message: "hello", providerId: 1 };
function response(events: unknown[]) {
  return {
    ok: true,
    body: new ReadableStream({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(
            events
              .map((event) => `data: ${JSON.stringify(event)}\n\n`)
              .join(""),
          ),
        );
        controller.close();
      },
    }),
  };
}
describe("useAiStream", () => {
  it("reports truncated streams instead of claiming completion", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(response([{ type: "token", text: "partial" }])),
    );
    const complete = vi.fn();
    const { result } = renderHook(useAiStream);
    await act(async () => {
      await result.current.send({ ...input, onComplete: complete });
    });
    expect(result.current.state.error).toMatch(/closed before/);
    expect(result.current.state.assistantText).toBe("partial");
    expect(complete).not.toHaveBeenCalled();
  });
  it("completes only on done and preserves errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          response([{ type: "token", text: "ok" }, { type: "done" }]),
        )
        .mockResolvedValueOnce(
          response([{ type: "error", message: "Model unavailable" }]),
        ),
    );
    const complete = vi.fn();
    const { result } = renderHook(useAiStream);
    await act(async () => {
      await result.current.send({ ...input, onComplete: complete });
    });
    expect(complete).toHaveBeenCalledExactlyOnceWith(null, "ok");
    await act(async () => {
      await result.current.send({ ...input, onComplete: complete });
    });
    expect(complete).toHaveBeenCalledTimes(1);
    expect(result.current.state.error).toBe("Model unavailable");
  });
  it("an old request cannot stop its replacement", async () => {
    let rejectOld: (error: Error) => void;
    let finishNew: (value: unknown) => void;
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((_, reject) => {
              rejectOld = reject;
            }),
        )
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              finishNew = resolve;
            }),
        ),
    );
    const { result } = renderHook(useAiStream);
    let old: Promise<void>;
    let next: Promise<void>;
    act(() => {
      old = result.current.send(input);
      next = result.current.send(input);
    });
    await act(async () => {
      rejectOld(new Error("aborted"));
      await old;
    });
    expect(result.current.state.streaming).toBe(true);
    await act(async () => {
      finishNew(response([{ type: "done" }]));
      await next;
    });
    expect(result.current.state.error).toBeNull();
  });
  it("times out a provider that never responds", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockImplementation(
          (_, init) =>
            new Promise((_, reject) =>
              init.signal.addEventListener("abort", () =>
                reject(new Error("aborted")),
              ),
            ),
        ),
    );
    const { result } = renderHook(useAiStream);
    let pending: Promise<void>;
    act(() => {
      pending = result.current.send(input);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(120_000);
      await pending;
    });
    expect(result.current.state.streaming).toBe(false);
    expect(result.current.state.error).toMatch(/2 minutes/);
  });
});
