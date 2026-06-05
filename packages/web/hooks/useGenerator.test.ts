import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGenerator } from "./useGenerator";

describe("useGenerator", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null grid for empty text", () => {
    const { result } = renderHook(() => useGenerator("", "standard", 80));
    expect(result.current.grid).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("returns null grid for whitespace-only text", () => {
    const { result } = renderHook(() => useGenerator("   ", "standard", 80));
    expect(result.current.grid).toBeNull();
  });

  it("generates a grid after 150ms debounce", async () => {
    const { result } = renderHook(() => useGenerator("Hi", "standard", 80));

    expect(result.current.grid).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.grid).not.toBeNull();
    expect(result.current.grid?.width).toBe(80);
    expect(result.current.error).toBeNull();
  });

  it("does not generate before 150ms", async () => {
    const { result } = renderHook(() => useGenerator("Hi", "standard", 80));

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.grid).toBeNull();
  });

  it("generates grid for each available font", async () => {
    const { result } = renderHook(() => useGenerator("A", "doom", 40));

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.grid).not.toBeNull();
    expect(result.current.grid?.cells.length).toBeGreaterThan(0);
  });

  it("respects width option in returned grid", async () => {
    const { result } = renderHook(() => useGenerator("Hi", "standard", 60));

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.grid?.width).toBe(60);
  });
});
