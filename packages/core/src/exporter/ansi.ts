import type { AsciiGrid } from "../types/grid.js";
import type { ExportResult } from "../types/options.js";

const DENSE = new Set([
  "@",
  "#",
  "%",
  "&",
  "M",
  "W",
  "m",
  "w",
  "0",
  "8",
  "B",
  "Q",
  "N",
  "H",
  "K",
  "R",
]);
const LIGHT = new Set([".", ",", "'", "-", "_", "~", ":", ";", "!", "|", "`"]);

function ansiCode(char: string): string {
  if (char === " ") return "";
  if (DENSE.has(char)) return "\x1b[1m";
  if (LIGHT.has(char)) return "\x1b[2m";
  return "\x1b[0m";
}

export function exportAnsi(grid: AsciiGrid): ExportResult {
  const lines = grid.cells.map((row) => {
    const coded = row.map((cell) => `${ansiCode(cell)}${cell}`).join("");
    return `${coded}\x1b[0m`;
  });
  return { output: lines.join("\n"), warnings: [] };
}
