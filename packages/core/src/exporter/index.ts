import type { AsciiGrid } from "../types/grid.js";
import type { ExportResult, ExportTarget } from "../types/options.js";
import { exportAnsi } from "./ansi.js";
import { exportGithub } from "./github.js";
import { exportJson } from "./json.js";
import { exportPlain } from "./plain.js";

const exporters: Record<ExportTarget, (grid: AsciiGrid) => ExportResult> = {
  plain: exportPlain,
  github: exportGithub,
  ansi: exportAnsi,
  json: exportJson,
};

export function exportGrid(grid: AsciiGrid, target: ExportTarget): ExportResult {
  return exporters[target](grid);
}

export { exportPlain } from "./plain.js";
export { exportGithub } from "./github.js";
export { exportAnsi } from "./ansi.js";
export { exportJson, type AsciiGridJson } from "./json.js";
