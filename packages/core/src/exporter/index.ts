import type { AsciiGrid } from "../types/grid.js";
import type { ExportResult, ExportTarget } from "../types/options.js";
import { exportAnsi } from "./ansi.js";
import { exportGithub } from "./github.js";
import { exportJson } from "./json.js";
import { exportPlain } from "./plain.js";

export function exportGrid(grid: AsciiGrid, target: ExportTarget): ExportResult {
  switch (target) {
    case "plain":
      return exportPlain(grid);
    case "github":
      return exportGithub(grid);
    case "ansi":
      return exportAnsi(grid);
    case "json":
      return exportJson(grid);
  }
}

export { exportPlain } from "./plain.js";
export { exportGithub } from "./github.js";
export { exportAnsi } from "./ansi.js";
export { exportJson, type AsciiGridJson } from "./json.js";
