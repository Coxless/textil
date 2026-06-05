import type { AsciiGrid, AsciiGridJson } from "@textil/core";

function isAsciiGridJson(v: unknown): v is AsciiGridJson {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return obj["version"] === 1 && Array.isArray(obj["rows"]);
}

export function parseGridFromJson(json: AsciiGridJson): AsciiGrid {
  const cells = json.rows.map((row) => [...row]);
  const width = cells.length > 0 ? Math.max(...cells.map((r) => r.length)) : 0;
  return { width: json.width ?? width, height: json.height ?? cells.length, cells };
}

export function parseGridFromPlainText(text: string): AsciiGrid {
  const lines = text.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  const width = lines.length > 0 ? Math.max(0, ...lines.map((l) => [...l].length)) : 0;
  const cells = lines.map((line) => {
    const chars = [...line];
    while (chars.length < width) chars.push(" ");
    return chars;
  });
  return { width, height: cells.length, cells };
}

export function tryParseGrid(input: string): AsciiGrid {
  try {
    const parsed = JSON.parse(input) as unknown;
    if (isAsciiGridJson(parsed)) {
      return parseGridFromJson(parsed);
    }
  } catch {
    // fall through
  }
  return parseGridFromPlainText(input);
}
