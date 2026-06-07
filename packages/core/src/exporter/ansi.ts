import type { AsciiGrid, Cell, RGBColor } from "../types/grid.js";
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

function densityCode(char: string): string {
  if (char === " ") return "";
  if (DENSE.has(char)) return "\x1b[1m";
  if (LIGHT.has(char)) return "\x1b[2m";
  return "";
}

function fgEscape(color: RGBColor): string {
  return `\x1b[38;2;${color[0]};${color[1]};${color[2]}m`;
}

function bgEscape(color: RGBColor): string {
  return `\x1b[48;2;${color[0]};${color[1]};${color[2]}m`;
}

function cellCode(cell: Cell): string {
  if (cell.fg !== undefined || cell.bg !== undefined) {
    const fg = cell.fg ? fgEscape(cell.fg) : "";
    const bg = cell.bg ? bgEscape(cell.bg) : "";
    return `${fg}${bg}${cell.char}`;
  }
  return `${densityCode(cell.char)}${cell.char}`;
}

export function exportAnsi(grid: AsciiGrid): ExportResult {
  const lines = grid.cells.map((row) => {
    const coded = row.map((cell) => cellCode(cell)).join("");
    return `${coded}\x1b[0m`;
  });
  return { output: lines.join("\n"), warnings: [] };
}
