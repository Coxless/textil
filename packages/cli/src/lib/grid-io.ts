import type { AsciiGrid, AsciiGridJson } from "@textil/core";

function isAsciiGridJson(v: unknown): v is AsciiGridJson {
  if (typeof v !== "object" || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    obj["version"] === 1 &&
    Array.isArray(obj["rows"]) &&
    typeof obj["width"] === "number" &&
    typeof obj["height"] === "number"
  );
}

export function parseGridFromJson(json: AsciiGridJson): AsciiGrid {
  const cells = json.rows.map((row) => [...row]);
  return { width: json.width, height: json.height, cells };
}

export function parseGridFromPlainText(text: string): AsciiGrid {
  const lines = text.split("\n");
  if (lines[lines.length - 1] === "") lines.pop();
  const cells = lines.map((line) => [...line]);
  const width = cells.length > 0 ? Math.max(0, ...cells.map((r) => r.length)) : 0;
  for (const row of cells) {
    while (row.length < width) row.push(" ");
  }
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
