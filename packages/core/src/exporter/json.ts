import type { AsciiGrid, RGBColor } from "../types/grid.js";
import type { ExportResult } from "../types/options.js";
import { cellsToLines, hasColorCells } from "./utils.js";

export interface AsciiGridJson {
  version: 1;
  width: number;
  height: number;
  rows: string[];
  colors?: Array<Array<{ fg?: RGBColor; bg?: RGBColor }>>;
}

export function exportJson(grid: AsciiGrid): ExportResult {
  const payload: AsciiGridJson = {
    version: 1,
    width: grid.width,
    height: grid.height,
    rows: cellsToLines(grid.cells),
  };
  if (hasColorCells(grid)) {
    payload.colors = grid.cells.map((row) =>
      row.map((c) => {
        const entry: { fg?: RGBColor; bg?: RGBColor } = {};
        if (c.fg) entry.fg = c.fg;
        if (c.bg) entry.bg = c.bg;
        return entry;
      }),
    );
  }
  return { output: JSON.stringify(payload, null, 2), warnings: [] };
}
