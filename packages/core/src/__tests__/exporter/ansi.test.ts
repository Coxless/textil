import { describe, expect, it } from "vitest";
import { exportAnsi } from "../../exporter/ansi.js";
import type { AsciiGrid } from "../../types/grid.js";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

function makeGrid(cells: string[][]): AsciiGrid {
  return { width: cells[0].length, height: cells.length, cells };
}

describe("exportAnsi", () => {
  it("each row ends with ANSI reset", () => {
    const grid = makeGrid([["a", "b"]]);
    const { output } = exportAnsi(grid);
    for (const line of output.split("\n")) {
      expect(line.endsWith(RESET)).toBe(true);
    }
  });

  it("output contains all original characters", () => {
    const grid = makeGrid([["@", " ", "."]]);
    const { output } = exportAnsi(grid);
    expect(output).toContain("@");
    expect(output).toContain(" ");
    expect(output).toContain(".");
  });

  it("space character has no ANSI prefix code", () => {
    const grid = makeGrid([[" "]]);
    const { output } = exportAnsi(grid);
    expect(output.startsWith(" ") || output.startsWith(RESET)).toBe(true);
    expect(output.startsWith(BOLD)).toBe(false);
    expect(output.startsWith(DIM)).toBe(false);
  });

  it("dense characters get bold prefix", () => {
    const grid = makeGrid([["@"]]);
    const { output } = exportAnsi(grid);
    expect(output).toContain(`${BOLD}@`);
  });

  it("light characters get dim prefix", () => {
    const grid = makeGrid([["."]]);
    const { output } = exportAnsi(grid);
    expect(output).toContain(`${DIM}.`);
  });

  it("output has correct number of newlines (height - 1)", () => {
    const grid = makeGrid([["a"], ["b"], ["c"]]);
    const { output } = exportAnsi(grid);
    expect(output.split("\n")).toHaveLength(3);
  });

  it("warnings is always empty", () => {
    expect(exportAnsi(makeGrid([["x"]])).warnings).toEqual([]);
  });
});
