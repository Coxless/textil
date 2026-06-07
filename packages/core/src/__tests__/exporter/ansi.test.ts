import { describe, expect, it } from "vitest";
import { exportAnsi } from "../../exporter/ansi.js";
import type { AsciiGrid, Cell } from "../../types/grid.js";

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

const c = (char: string): Cell => ({ char });

function makeGrid(cells: Cell[][]): AsciiGrid {
  return { width: cells[0].length, height: cells.length, cells };
}

describe("exportAnsi", () => {
  it("each row ends with ANSI reset", () => {
    const grid = makeGrid([[c("a"), c("b")]]);
    const { output } = exportAnsi(grid);
    for (const line of output.split("\n")) {
      expect(line.endsWith(RESET)).toBe(true);
    }
  });

  it("output contains all original characters", () => {
    const grid = makeGrid([[c("@"), c(" "), c(".")]]);
    const { output } = exportAnsi(grid);
    expect(output).toContain("@");
    expect(output).toContain(" ");
    expect(output).toContain(".");
  });

  it("space character has no ANSI prefix code", () => {
    const grid = makeGrid([[c(" ")]]);
    const { output } = exportAnsi(grid);
    expect(output.startsWith(" ") || output.startsWith(RESET)).toBe(true);
    expect(output.startsWith(BOLD)).toBe(false);
    expect(output.startsWith(DIM)).toBe(false);
  });

  it("dense characters get bold prefix", () => {
    const grid = makeGrid([[c("@")]]);
    const { output } = exportAnsi(grid);
    expect(output).toContain(`${BOLD}@`);
  });

  it("light characters get dim prefix", () => {
    const grid = makeGrid([[c(".")]]);
    const { output } = exportAnsi(grid);
    expect(output).toContain(`${DIM}.`);
  });

  it("output has correct number of newlines (height - 1)", () => {
    const grid = makeGrid([[c("a")], [c("b")], [c("c")]]);
    const { output } = exportAnsi(grid);
    expect(output.split("\n")).toHaveLength(3);
  });

  it("warnings is always empty", () => {
    expect(exportAnsi(makeGrid([[c("x")]])).warnings).toEqual([]);
  });

  it("TrueColor fg escape for colored cell", () => {
    const grid = makeGrid([[{ char: "X", fg: [255, 128, 0] }]]);
    const { output } = exportAnsi(grid);
    expect(output).toContain("\x1b[38;2;255;128;0m");
    expect(output).toContain("X");
  });

  it("TrueColor bg escape for cell with bg", () => {
    const grid = makeGrid([[{ char: "X", bg: [0, 0, 255] }]]);
    const { output } = exportAnsi(grid);
    expect(output).toContain("\x1b[48;2;0;0;255m");
  });

  it("colored cell does not emit density-based codes", () => {
    const grid = makeGrid([[{ char: "@", fg: [100, 100, 100] }]]);
    const { output } = exportAnsi(grid);
    expect(output).not.toContain(BOLD);
    expect(output).not.toContain(DIM);
  });
});
