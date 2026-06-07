import { describe, expect, it } from "vitest";
import { renderText } from "../../generator/figlet/renderer.js";
import type { FigFont } from "../../generator/figlet/types.js";

/** Build a minimal FigFont for testing (height=2, full-width mode). */
function makeTestFont(oldLayout = -1): FigFont {
  const chars = new Map<string, { rows: string[]; width: number }>();
  chars.set(" ", { rows: ["  ", "  "], width: 2 });
  chars.set("A", { rows: ["AA", "aa"], width: 2 });
  chars.set("B", { rows: ["BB", "bb"], width: 2 });
  chars.set("$", { rows: ["$$", "$$"], width: 2 }); // hardblank char
  return {
    header: {
      hardblank: "$",
      height: 2,
      baseline: 1,
      maxWidth: 2,
      oldLayout,
      commentLines: 0,
    },
    chars,
  };
}

describe("renderText", () => {
  it("single character returns Cell[][] with correct height", () => {
    const font = makeTestFont();
    const result = renderText(font, "A");
    expect(result).toHaveLength(2); // height = 2
  });

  it("empty string returns empty rows (zero width)", () => {
    const font = makeTestFont();
    const result = renderText(font, "");
    expect(result).toHaveLength(2);
    for (const row of result) {
      expect(row).toHaveLength(0);
    }
  });

  it("hardblanks are replaced by spaces in output", () => {
    // hardblank is '$' in our test font
    const font = makeTestFont();
    // Inject a char with hardblanks in its rows
    font.chars.set("X", { rows: ["$X", "$X"], width: 2 });
    const result = renderText(font, "X");
    for (const row of result) {
      for (const cell of row) {
        expect(cell.char).not.toBe("$");
      }
    }
  });

  it("unknown character is treated as space (no throw)", () => {
    const font = makeTestFont();
    expect(() => renderText(font, "ñ")).not.toThrow();
  });

  it("full-width mode: output width equals sum of char widths", () => {
    const font = makeTestFont(-1); // oldLayout < 0 → full-width
    const result = renderText(font, "AB"); // each is width 2 → total 4
    expect(result[0]).toHaveLength(4);
  });

  it("each cell has a single-character char property", () => {
    const font = makeTestFont();
    const result = renderText(font, "AB");
    for (const row of result) {
      for (const cell of row) {
        expect(typeof cell.char).toBe("string");
        expect(cell.char).toHaveLength(1);
      }
    }
  });

  it("row count matches font height regardless of text length", () => {
    const font = makeTestFont();
    expect(renderText(font, "")).toHaveLength(2);
    expect(renderText(font, "A")).toHaveLength(2);
    expect(renderText(font, "AB")).toHaveLength(2);
  });

  it("smush=false forces full-width mode even for kerning fonts", () => {
    const font = makeTestFont(0); // oldLayout=0 normally means kerning
    const full = renderText(font, "AA", false);
    expect(full[0]).toHaveLength(4); // no overlap
  });
});
