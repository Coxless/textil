import type { AsciiGrid, Cell } from "../types/grid.js";
import type { GenerateOptions } from "../types/options.js";
import { DEFAULT_FONT, FONTS } from "./figlet/fonts/index.js";
import { parseFont } from "./figlet/parser.js";
import { renderText } from "./figlet/renderer.js";
import type { FigFont } from "./figlet/types.js";

const fontCache = new Map<string, FigFont>();

function getFont(name: string): FigFont {
  const cached = fontCache.get(name);
  if (cached !== undefined) return cached;

  const flfString = FONTS[name];
  if (flfString === undefined) {
    throw new Error(`Unknown font "${name}". Available fonts: ${Object.keys(FONTS).join(", ")}`);
  }
  const parsed = parseFont(flfString);
  fontCache.set(name, parsed);
  return parsed;
}

function applyWidth(rows: Cell[][], targetWidth: number): Cell[][] {
  return rows.map((row) => {
    if (row.length > targetWidth) return row.slice(0, targetWidth);
    return [...row, ...Array(targetWidth - row.length).fill(" " as Cell)];
  });
}

function naturalLineWidth(font: FigFont, line: string): number {
  if (!line) return 0;
  const rendered = renderText(font, line);
  return Math.max(0, ...rendered.map((r) => r.length));
}

function wrapToWidth(font: FigFont, line: string, targetWidth: number): string[] {
  const words = line.split(" ");
  const result: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && naturalLineWidth(font, candidate) > targetWidth) {
      result.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) result.push(current);
  return result.length > 0 ? result : [""];
}

/**
 * Render `text` as ASCII art using FIGlet.
 *
 * - `options.font`: bundled font name (default: "standard").
 * - `options.width`: wrap words to fit within this column count.
 * - Newlines in `text` produce separate renders stacked vertically.
 */
export function generateText(text: string, options?: GenerateOptions): AsciiGrid {
  const fontName = options?.font ?? DEFAULT_FONT;
  const targetWidth = options?.width;
  const font = getFont(fontName);
  const { height } = font.header;

  const rawLines = text.split("\n");
  const inputLines = targetWidth
    ? rawLines.flatMap((line) => (line === "" ? [""] : wrapToWidth(font, line, targetWidth)))
    : rawLines;

  const sections: Cell[][][] = inputLines.map((line) => {
    if (line === "") {
      return Array.from({ length: height }, () => [] as Cell[]);
    }
    return renderText(font, line);
  });

  const naturalWidth = Math.max(0, ...sections.flatMap((s) => s.map((r) => r.length)));
  const finalWidth = targetWidth ?? naturalWidth;
  const allRows = sections.flatMap((section) =>
    finalWidth > 0 ? applyWidth(section, finalWidth) : section,
  );

  return { width: finalWidth, height: allRows.length, cells: allRows };
}
