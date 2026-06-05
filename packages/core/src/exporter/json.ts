import type { AsciiGrid } from "../types/grid.js";
import type { ExportResult } from "../types/options.js";
import { cellsToLines } from "./utils.js";

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
    rows: cellsToLines(grid.cells),
  };
  return { output: JSON.stringify(payload, null, 2), warnings: [] };
}
