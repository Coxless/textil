import type { AsciiGrid } from "../types/grid.js";
import type { ExportResult } from "../types/options.js";
import { cellsToLines, hasColorCells } from "./utils.js";

const WIDTH_LIMIT = 80;

export function exportGithub(grid: AsciiGrid): ExportResult {
  const warnings: string[] = [];
  if (grid.width > WIDTH_LIMIT) {
    warnings.push(
      `Grid width (${grid.width}) exceeds ${WIDTH_LIMIT} columns. The output may not render correctly on GitHub.`,
    );
  }
  if (hasColorCells(grid)) {
    warnings.push("Grid contains color data — GitHub Markdown export does not support color.");
  }
  const body = cellsToLines(grid.cells).join("\n");
  const output = `\`\`\`\n${body}\n\`\`\``;
  return { output, warnings };
}
