import { describe, expect, it } from "vitest";
import { AVAILABLE_FONTS } from "../../generator/figlet/fonts/index.js";
import { generateText } from "../../generator/text.js";

describe("generateText", () => {
  it("completion criterion: Hello in doom at width 80", () => {
    const grid = generateText("Hello", { font: "doom", width: 80 });
    expect(grid.width).toBe(80);
    expect(grid.height).toBe(8); // doom font height is 8
    expect(grid.cells).toHaveLength(8);
    expect(grid.cells[0]).toHaveLength(80);
    // Every cell must be a single character
    for (const row of grid.cells) {
      for (const cell of row) {
        expect(cell.char).toHaveLength(1);
      }
    }
    // No hardblank characters ($) in output
    const allCells = grid.cells.flat();
    expect(allCells.every((c) => c.char !== "$")).toBe(true);
  });

  it("default font (no options) returns AsciiGrid", () => {
    const grid = generateText("A");
    expect(grid.cells.length).toBeGreaterThan(0);
    expect(grid.width).toBeGreaterThan(0);
  });

  it("throws on unknown font name with helpful message", () => {
    expect(() => generateText("A", { font: "nonexistent" })).toThrow("Unknown font");
  });

  it("width truncation: rows are clipped when natural width exceeds target", () => {
    const grid = generateText("Hello World", { font: "doom", width: 20 });
    expect(grid.width).toBe(20);
    for (const row of grid.cells) {
      expect(row).toHaveLength(20);
    }
  });

  it("width padding: rows are padded with spaces when natural width is less", () => {
    const grid = generateText("Hi", { font: "mini", width: 200 });
    expect(grid.width).toBe(200);
    for (const row of grid.cells) {
      expect(row).toHaveLength(200);
    }
  });

  it("no width option: width equals natural rendered width", () => {
    const a = generateText("A", { font: "mini" });
    const aa = generateText("AA", { font: "mini" });
    expect(aa.width).toBeGreaterThan(a.width);
  });

  it("empty string: returns grid with height = font height, width = 0", () => {
    const grid = generateText("", { font: "mini" });
    expect(grid.height).toBeGreaterThan(0);
    expect(grid.width).toBe(0);
  });

  it("single newline: produces two font-height sections stacked", () => {
    const grid = generateText("\n", { font: "mini" });
    const single = generateText("", { font: "mini" });
    expect(grid.height).toBe(single.height * 2);
  });

  it("Hello\\nWorld: height = 2x font height", () => {
    const grid = generateText("Hello\nWorld", { font: "mini" });
    const single = generateText("Hello", { font: "mini" });
    expect(grid.height).toBe(single.height * 2);
  });

  it("all 12 bundled fonts render 'A' to a valid AsciiGrid", () => {
    for (const font of AVAILABLE_FONTS) {
      const grid = generateText("A", { font });
      expect(grid.width, `${font} width`).toBeGreaterThan(0);
      expect(grid.height, `${font} height`).toBeGreaterThan(0);
      expect(grid.cells, `${font} cells`).toHaveLength(grid.height);
      for (const row of grid.cells) {
        expect(row, `${font} row length`).toHaveLength(grid.width);
        for (const cell of row) {
          expect(cell.char, `${font} cell char`).toHaveLength(1);
        }
      }
    }
  });

  it("color option: all cells get fg set", () => {
    const color: [number, number, number] = [255, 0, 0];
    const grid = generateText("A", { font: "mini", color });
    for (const row of grid.cells) {
      for (const cell of row) {
        expect(cell.fg).toEqual(color);
      }
    }
  });

  it("no color option: cells have no fg", () => {
    const grid = generateText("A", { font: "mini" });
    for (const row of grid.cells) {
      for (const cell of row) {
        expect(cell.fg).toBeUndefined();
      }
    }
  });
});
