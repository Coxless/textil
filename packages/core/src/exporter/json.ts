import type { AsciiGrid } from "../types/grid.js";
import type { ExportResult } from "../types/options.js";

export interface AsciiGridJson {
  version: 1;
  width: number;
  height: number;
  rows: string[];
}

export function exportJson(grid: AsciiGrid): ExportResult {
  const payload: AsciiGridJson = {
    version: 1,
    width: grid.width,
    height: grid.height,
    rows: grid.cells.map((row) => row.join("")),
  };
  return { output: JSON.stringify(payload, null, 2), warnings: [] };
}
