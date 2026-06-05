import type { AsciiGrid } from "../types/grid.js";
import type { ExportResult } from "../types/options.js";

export function exportPlain(grid: AsciiGrid): ExportResult {
  const output = grid.cells.map((row) => row.join("")).join("\n");
  return { output, warnings: [] };
}
