import { act, renderHook } from "@testing-library/react";
import type { AsciiGrid } from "@textil/core";
import { describe, expect, it } from "vitest";
import { useGridEditor } from "./useGridEditor";

function makeGrid(width: number, height: number, char = " "): AsciiGrid {
  return {
    width,
    height,
    cells: Array.from({ length: height }, () => Array<string>(width).fill(char)),
  };
}

describe("useGridEditor", () => {
  it("initializes with correct grid dimensions", () => {
    const { result } = renderHook(() => useGridEditor(makeGrid(10, 5)));
    expect(result.current.grid.width).toBe(10);
    expect(result.current.grid.height).toBe(5);
  });

  it("initializes with correct cell content", () => {
    const { result } = renderHook(() => useGridEditor(makeGrid(3, 2, "X")));
    expect(result.current.grid.cells[0][0]).toBe("X");
    expect(result.current.grid.cells[1][2]).toBe("X");
  });

  it("initial state is not undoable (clearHistory was called)", () => {
    const { result } = renderHook(() => useGridEditor(makeGrid(5, 3)));
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("setRegion updates the grid", () => {
    const { result } = renderHook(() => useGridEditor(makeGrid(5, 3)));
    act(() => {
      result.current.setRegion({ row: 0, col: 0, width: 1, height: 1 }, [["X"]]);
    });
    expect(result.current.grid.cells[0][0]).toBe("X");
  });

  it("setRegion makes canUndo true", () => {
    const { result } = renderHook(() => useGridEditor(makeGrid(5, 3)));
    act(() => {
      result.current.setRegion({ row: 0, col: 0, width: 1, height: 1 }, [["X"]]);
    });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("undo reverts setRegion", () => {
    const { result } = renderHook(() => useGridEditor(makeGrid(5, 3)));
    act(() => {
      result.current.setRegion({ row: 0, col: 0, width: 1, height: 1 }, [["X"]]);
    });
    act(() => {
      result.current.undo();
    });
    expect(result.current.grid.cells[0][0]).toBe(" ");
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("redo reapplies undone operation", () => {
    const { result } = renderHook(() => useGridEditor(makeGrid(5, 3)));
    act(() => {
      result.current.setRegion({ row: 0, col: 0, width: 1, height: 1 }, [["X"]]);
    });
    act(() => {
      result.current.undo();
    });
    act(() => {
      result.current.redo();
    });
    expect(result.current.grid.cells[0][0]).toBe("X");
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("fill updates cells in the rect", () => {
    const { result } = renderHook(() => useGridEditor(makeGrid(5, 3)));
    act(() => {
      result.current.fill({ row: 0, col: 0, width: 3, height: 2 }, "*");
    });
    expect(result.current.grid.cells[0][0]).toBe("*");
    expect(result.current.grid.cells[1][2]).toBe("*");
    expect(result.current.grid.cells[0][3]).toBe(" ");
  });

  it("deleteRegion fills rect with spaces", () => {
    const { result } = renderHook(() => useGridEditor(makeGrid(5, 3, "X")));
    act(() => {
      result.current.deleteRegion({ row: 0, col: 0, width: 2, height: 2 });
    });
    expect(result.current.grid.cells[0][0]).toBe(" ");
    expect(result.current.grid.cells[0][2]).toBe("X");
  });

  it("findReplace returns count and updates grid", () => {
    const cells = Array.from({ length: 3 }, () => ["a", "b", "a"]);
    const grid: AsciiGrid = { width: 3, height: 3, cells };
    const { result } = renderHook(() => useGridEditor(grid));
    let count = 0;
    act(() => {
      count = result.current.findReplace("a", "X");
    });
    expect(count).toBe(6);
    expect(result.current.grid.cells[0][0]).toBe("X");
    expect(result.current.grid.cells[0][1]).toBe("b");
  });

  it("findReplace returns 0 and does not bump canUndo when no match", () => {
    const { result } = renderHook(() => useGridEditor(makeGrid(3, 2)));
    let count = 0;
    act(() => {
      count = result.current.findReplace("Z", "X");
    });
    expect(count).toBe(0);
    expect(result.current.canUndo).toBe(false);
  });

  it("resetToGrid replaces editor and clears history", () => {
    const { result } = renderHook(() => useGridEditor(makeGrid(5, 3)));
    act(() => {
      result.current.setRegion({ row: 0, col: 0, width: 1, height: 1 }, [["X"]]);
    });
    act(() => {
      result.current.resetToGrid(makeGrid(4, 2, "#"));
    });
    expect(result.current.grid.width).toBe(4);
    expect(result.current.grid.height).toBe(2);
    expect(result.current.grid.cells[0][0]).toBe("#");
    expect(result.current.canUndo).toBe(false);
  });
});
