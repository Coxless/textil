import { describe, expect, it } from "vitest";
import { exportPlain } from "../../exporter/plain.js";
import type { AsciiGrid, Cell } from "../../types/grid.js";
import { makeFilledGrid } from "./helpers.js";

const c = (char: string): Cell => ({ char });
const makeGrid = (width: number, height: number, char = " ") => makeFilledGrid(width, height, char);

describe("exportPlain", () => {
  it("single row: joins cells without separator", () => {
    const grid: AsciiGrid = { width: 3, height: 1, cells: [[c("a"), c("b"), c("c")]] };
    expect(exportPlain(grid).output).toBe("abc");
  });

  it("multi-row: rows joined with newline", () => {
    const grid: AsciiGrid = {
      width: 2,
      height: 2,
      cells: [
        [c("a"), c("b")],
        [c("c"), c("d")],
      ],
    };
    expect(exportPlain(grid).output).toBe("ab\ncd");
  });

  it("1x1 grid: single character", () => {
    const grid: AsciiGrid = { width: 1, height: 1, cells: [[c("X")]] };
    expect(exportPlain(grid).output).toBe("X");
  });

  it("space-only grid: preserves spaces", () => {
    const grid = makeGrid(3, 2, " ");
    expect(exportPlain(grid).output).toBe("   \n   ");
  });

  it("no warning for monochrome grid", () => {
    expect(exportPlain(makeGrid(100, 1)).warnings).toEqual([]);
  });

  it("emits color warning for colored grid", () => {
    const grid: AsciiGrid = {
      width: 1,
      height: 1,
      cells: [[{ char: "X", fg: [255, 0, 0] }]],
    };
    expect(exportPlain(grid).warnings).toHaveLength(1);
    expect(exportPlain(grid).warnings[0]).toContain("color");
  });

  it("does not mutate original cells", () => {
    const grid: AsciiGrid = { width: 2, height: 1, cells: [[c("a"), c("b")]] };
    exportPlain(grid);
    expect(grid.cells[0][0]).toEqual(c("a"));
    expect(grid.cells[0][1]).toEqual(c("b"));
  });
});
