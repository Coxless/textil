import type { FigChar, FigFont, FigFontHeader } from "./types.js";

function parseCodePoint(token: string): number | null {
  if (token.startsWith("0x") || token.startsWith("0X")) {
    const n = Number.parseInt(token.slice(2), 16);
    return Number.isNaN(n) ? null : n;
  }
  if (token.startsWith("0") && token.length > 1) {
    const n = Number.parseInt(token.slice(1), 8);
    return Number.isNaN(n) ? null : n;
  }
  const n = Number.parseInt(token, 10);
  return Number.isNaN(n) ? null : n;
}

function stripEndmark(line: string, endmark: string, count: number): string {
  let result = line;
  for (let i = 0; i < count; i++) {
    if (result.endsWith(endmark)) {
      result = result.slice(0, -1);
    }
  }
  return result;
}

function parseFigChar(
  lines: string[],
  lineIndex: number,
  height: number,
  endmark: string,
): FigChar {
  const rows: string[] = [];
  for (let i = 0; i < height; i++) {
    const raw = lines[lineIndex + i] ?? "";
    const stripped =
      i === height - 1 ? stripEndmark(raw, endmark, 2) : stripEndmark(raw, endmark, 1);
    rows.push(stripped);
  }
  const width = Math.max(0, ...rows.map((r) => r.length));
  const paddedRows = rows.map((r) => r.padEnd(width, " "));
  return { rows: paddedRows, width };
}

export function parseFont(flfString: string): FigFont {
  const normalized = flfString.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  // Parse header
  const headerLine = lines[0] ?? "";
  if (!headerLine.startsWith("flf2a")) {
    throw new Error(
      `Invalid FLF file: expected "flf2a" signature, got "${headerLine.slice(0, 10)}"`,
    );
  }

  const hardblank = headerLine[5] ?? "$";
  const headerParts = headerLine.slice(6).trim().split(/\s+/);
  const [heightStr, baselineStr, maxWidthStr, oldLayoutStr, commentLinesStr, ...rest] = headerParts;

  const height = Number.parseInt(heightStr ?? "0", 10);
  const baseline = Number.parseInt(baselineStr ?? "0", 10);
  const maxWidth = Number.parseInt(maxWidthStr ?? "0", 10);
  const oldLayout = Number.parseInt(oldLayoutStr ?? "0", 10);
  const commentLines = Number.parseInt(commentLinesStr ?? "0", 10);

  const header: FigFontHeader = { hardblank, height, baseline, maxWidth, oldLayout, commentLines };

  const optKeys = ["printDirection", "fullLayout", "codetagCount"] as const;
  for (const [i, key] of optKeys.entries()) {
    if (rest[i] !== undefined) header[key] = Number.parseInt(String(rest[i]), 10);
  }

  const chars = new Map<string, FigChar>();

  // Determine endmark: last char of the first row of the space character
  let lineIndex = 1 + commentLines;
  const firstRow = lines[lineIndex] ?? "";
  const endmark = firstRow[firstRow.length - 1] ?? "@";

  // Parse required 95 ASCII characters (code points 32–126)
  for (let cp = 32; cp <= 126; cp++) {
    const figChar = parseFigChar(lines, lineIndex, height, endmark);
    chars.set(String.fromCodePoint(cp), figChar);
    lineIndex += height;
  }

  // Parse optional code-tagged characters
  while (lineIndex < lines.length) {
    const tagLine = lines[lineIndex]?.trim();
    if (tagLine === undefined || tagLine === "") {
      lineIndex++;
      continue;
    }

    // Check if this looks like a tag line (starts with a number or code point indicator)
    const firstToken = tagLine.split(/\s+/)[0] ?? "";
    const cp = parseCodePoint(firstToken);
    if (cp === null) {
      // Not a valid tag line — skip to avoid infinite loop
      lineIndex++;
      continue;
    }

    lineIndex++; // advance past tag line
    if (lineIndex + height > lines.length) break;

    const figChar = parseFigChar(lines, lineIndex, height, endmark);
    chars.set(String.fromCodePoint(cp), figChar);
    lineIndex += height;
  }

  return { header, chars };
}
