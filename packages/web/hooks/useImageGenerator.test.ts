import { act, renderHook } from "@testing-library/react";
import type { AsciiGrid } from "@textil/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useImageGenerator } from "./useImageGenerator";

vi.mock("@textil/core", () => ({
  generateImage: vi.fn(),
}));

import { generateImage } from "@textil/core";

const mockGrid: AsciiGrid = {
  width: 3,
  height: 2,
  cells: [
    ["A", "B", "C"],
    ["D", "E", "F"],
  ],
};

describe("useImageGenerator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(generateImage).mockResolvedValue(mockGrid);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("returns null grid when imageData is null", () => {
    const { result } = renderHook(() => useImageGenerator(null, "standard", 0, 0.5, 80));
    expect(result.current.grid).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("sets isLoading true immediately when imageData is provided", () => {
    const data = new ArrayBuffer(8);
    const { result } = renderHook(() => useImageGenerator(data, "standard", 0, 0.5, 80));
    expect(result.current.isLoading).toBe(true);
  });

  it("calls generateImage with correct options after 200ms debounce", async () => {
    const data = new ArrayBuffer(8);
    const { result } = renderHook(() => useImageGenerator(data, "braille", 0.2, 0.6, 60));

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(generateImage).toHaveBeenCalledWith(data, {
      charset: "braille",
      contrast: 0.2,
      threshold: 0.6,
      width: 60,
    });
    expect(result.current.grid).toEqual(mockGrid);
    expect(result.current.isLoading).toBe(false);
  });

  it("does not call generateImage before 200ms", async () => {
    const data = new ArrayBuffer(8);
    renderHook(() => useImageGenerator(data, "standard", 0, 0.5, 80));

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(generateImage).not.toHaveBeenCalled();
  });

  it("clears result when imageData becomes null", async () => {
    const data = new ArrayBuffer(8);
    const { result, rerender } = renderHook(
      ({ imageData }: { imageData: ArrayBuffer | null }) =>
        useImageGenerator(imageData, "standard", 0, 0.5, 80),
      { initialProps: { imageData: data } },
    );

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(result.current.grid).toEqual(mockGrid);

    rerender({ imageData: null });

    expect(result.current.grid).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("handles generateImage errors", async () => {
    vi.mocked(generateImage).mockRejectedValue(new Error("Canvas not available"));

    const data = new ArrayBuffer(8);
    const { result } = renderHook(() => useImageGenerator(data, "standard", 0, 0.5, 80));

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(result.current.error).toBe("Canvas not available");
    expect(result.current.grid).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it("keeps existing grid visible while regenerating on slider change", async () => {
    const data = new ArrayBuffer(8);
    const { result, rerender } = renderHook(
      ({ contrast }: { contrast: number }) =>
        useImageGenerator(data, "standard", contrast, 0.5, 80),
      { initialProps: { contrast: 0 } },
    );

    await act(async () => {
      vi.advanceTimersByTime(200);
      await Promise.resolve();
    });

    expect(result.current.grid).toEqual(mockGrid);

    rerender({ contrast: 0.5 });

    expect(result.current.grid).toEqual(mockGrid);
    expect(result.current.isLoading).toBe(true);
  });
});
