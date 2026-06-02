import { describe, expect, it } from "vitest";
import { cloneCells, fill, findReplace, textInsert } from "../../editor/operations.js";

function makeGrid(width: number, height: number, char = " "): string[][] {
  return Array.from({ length: height }, () => Array<string>(width).fill(char));
}

describe("cloneCells", () => {
  it("returns a deep copy", () => {
    const cells = makeGrid(2, 2, "a");
    const clone = cloneCells(cells);
    clone[0][0] = "z";
    expect(cells[0][0]).toBe("a");
  });
});

describe("fill", () => {
  it("fills the specified rectangle", () => {
    const cells = makeGrid(5, 5);
    fill(cells, { row: 1, col: 1, width: 3, height: 2 }, "#");
    expect(cells[1][1]).toBe("#");
    expect(cells[1][3]).toBe("#");
    expect(cells[2][1]).toBe("#");
    expect(cells[0][0]).toBe(" ");
    expect(cells[3][1]).toBe(" ");
  });

  it("ignores out-of-bounds cells", () => {
    const cells = makeGrid(3, 3);
    fill(cells, { row: 2, col: 2, width: 5, height: 5 }, "X");
    expect(cells[2][2]).toBe("X");
    expect(cells.length).toBe(3);
  });
});

describe("findReplace", () => {
  it("replaces matching cells and returns count", () => {
    const cells = [
      ["a", "b", "a"],
      ["c", "a", "d"],
    ];
    const count = findReplace(cells, "a", "Z");
    expect(count).toBe(3);
    expect(cells[0][0]).toBe("Z");
    expect(cells[0][2]).toBe("Z");
    expect(cells[1][1]).toBe("Z");
    expect(cells[0][1]).toBe("b");
  });

  it("returns 0 when no match", () => {
    const cells = makeGrid(3, 3, "x");
    expect(findReplace(cells, "y", "z")).toBe(0);
  });
});

describe("textInsert", () => {
  it("writes text at the given position", () => {
    const cells = makeGrid(10, 3);
    textInsert(cells, 1, 2, "Hello");
    expect(cells[1].slice(2, 7).join("")).toBe("Hello");
  });

  it("ignores out-of-bounds row", () => {
    const cells = makeGrid(5, 3);
    textInsert(cells, 99, 0, "X");
    expect(cells.every((row) => row.every((c) => c === " "))).toBe(true);
  });

  it("clips text that extends beyond grid width", () => {
    const cells = makeGrid(5, 1);
    textInsert(cells, 0, 3, "Hello");
    expect(cells[0][3]).toBe("H");
    expect(cells[0][4]).toBe("e");
    expect(cells[0].length).toBe(5);
  });
});
