import { describe, expect, it } from "vitest";
import { exportPlain } from "../../exporter/plain.js";
import type { AsciiGrid } from "../../types/grid.js";
import { makeFilledGrid } from "./helpers.js";

const makeGrid = (width: number, height: number, char = " ") => makeFilledGrid(width, height, char);

describe("exportPlain", () => {
  it("single row: joins cells without separator", () => {
    const grid: AsciiGrid = { width: 3, height: 1, cells: [["a", "b", "c"]] };
    expect(exportPlain(grid).output).toBe("abc");
  });

  it("multi-row: rows joined with newline", () => {
    const grid: AsciiGrid = {
      width: 2,
      height: 2,
      cells: [
        ["a", "b"],
        ["c", "d"],
      ],
    };
    expect(exportPlain(grid).output).toBe("ab\ncd");
  });

  it("1x1 grid: single character", () => {
    const grid: AsciiGrid = { width: 1, height: 1, cells: [["X"]] };
    expect(exportPlain(grid).output).toBe("X");
  });

  it("space-only grid: preserves spaces", () => {
    const grid = makeGrid(3, 2, " ");
    expect(exportPlain(grid).output).toBe("   \n   ");
  });

  it("warnings is always empty", () => {
    expect(exportPlain(makeGrid(100, 1)).warnings).toEqual([]);
  });

  it("does not mutate original cells", () => {
    const grid: AsciiGrid = { width: 2, height: 1, cells: [["a", "b"]] };
    exportPlain(grid);
    expect(grid.cells[0]).toEqual(["a", "b"]);
  });
});
