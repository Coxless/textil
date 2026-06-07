import type { AsciiGrid, Cell } from "../types/grid.js";

export function cellsToLines(cells: Cell[][]): string[] {
  return cells.map((row) => row.map((c) => c.char).join(""));
}

export function hasColorCells(grid: AsciiGrid): boolean {
  return grid.cells.some((row) => row.some((c) => c.fg !== undefined || c.bg !== undefined));
}
