import type { AsciiGrid } from "../types/grid.js";
import type { ExportResult } from "../types/options.js";
import { cellsToLines, hasColorCells } from "./utils.js";

export function exportPlain(grid: AsciiGrid): ExportResult {
  const warnings: string[] = [];
  if (hasColorCells(grid)) {
    warnings.push("Grid contains color data — plain text export does not support color.");
  }
  return { output: cellsToLines(grid.cells).join("\n"), warnings };
}
