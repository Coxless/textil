import type { AsciiGrid } from "../types/grid.js";
import type { ExportResult } from "../types/options.js";
import { cellsToLines } from "./utils.js";

export function exportPlain(grid: AsciiGrid): ExportResult {
  return { output: cellsToLines(grid.cells).join("\n"), warnings: [] };
}
