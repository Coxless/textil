import { describe, expect, it } from "vitest";
import { exportJson } from "../../exporter/json.js";
import type { AsciiGridJson } from "../../exporter/json.js";
import type { AsciiGrid } from "../../types/grid.js";

function makeGrid(width: number, height: number, char = "x"): AsciiGrid {
  return {
    width,
    height,
    cells: Array.from({ length: height }, () => Array<string>(width).fill(char)),
  };
}

describe("exportJson", () => {
  it("output is valid JSON", () => {
    expect(() => JSON.parse(exportJson(makeGrid(3, 2)).output)).not.toThrow();
  });

  it("parsed object has version: 1", () => {
    const parsed = JSON.parse(exportJson(makeGrid(3, 2)).output) as AsciiGridJson;
    expect(parsed.version).toBe(1);
  });

  it("width and height match grid", () => {
    const parsed = JSON.parse(exportJson(makeGrid(5, 3)).output) as AsciiGridJson;
    expect(parsed.width).toBe(5);
    expect(parsed.height).toBe(3);
  });

  it("rows length equals grid height", () => {
    const parsed = JSON.parse(exportJson(makeGrid(4, 3)).output) as AsciiGridJson;
    expect(parsed.rows).toHaveLength(3);
  });

  it("each row string length equals grid width", () => {
    const parsed = JSON.parse(exportJson(makeGrid(6, 2)).output) as AsciiGridJson;
    for (const row of parsed.rows) {
      expect(row.length).toBe(6);
    }
  });

  it("round-trip: rows preserve original cell content", () => {
    const grid: AsciiGrid = {
      width: 3,
      height: 2,
      cells: [
        ["a", "b", "c"],
        ["d", "e", "f"],
      ],
    };
    const parsed = JSON.parse(exportJson(grid).output) as AsciiGridJson;
    expect(parsed.rows[0]).toBe("abc");
    expect(parsed.rows[1]).toBe("def");
  });

  it("warnings is always empty", () => {
    expect(exportJson(makeGrid(200, 1)).warnings).toEqual([]);
  });
});
