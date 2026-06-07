import { describe, expect, it } from "vitest";
import { GridEditor } from "../../editor/GridEditor.js";
import type { Cell } from "../../types/grid.js";

const c = (char: string): Cell => ({ char });

describe("GridEditor", () => {
  describe("getCell / setCell", () => {
    it("reads and writes a cell", () => {
      const editor = new GridEditor(5, 5);
      editor.setCell(2, 3, c("X"));
      expect(editor.getCell(2, 3)).toEqual(c("X"));
    });

    it("initializes all cells with the provided character", () => {
      const editor = new GridEditor(3, 3, c("."));
      expect(editor.getCell(0, 0)).toEqual(c("."));
      expect(editor.getCell(2, 2)).toEqual(c("."));
    });

    it("throws on out-of-bounds access", () => {
      const editor = new GridEditor(5, 5);
      expect(() => editor.getCell(5, 0)).toThrow(RangeError);
      expect(() => editor.setCell(-1, 0, c("X"))).toThrow(RangeError);
    });
  });

  describe("undo / redo", () => {
    it("undoes setCell", () => {
      const editor = new GridEditor(5, 5);
      editor.setCell(0, 0, c("A"));
      expect(editor.undo()).toBe(true);
      expect(editor.getCell(0, 0)).toEqual(c(" "));
    });

    it("redoes after undo", () => {
      const editor = new GridEditor(5, 5);
      editor.setCell(0, 0, c("A"));
      editor.undo();
      expect(editor.redo()).toBe(true);
      expect(editor.getCell(0, 0)).toEqual(c("A"));
    });

    it("returns false when nothing to undo", () => {
      const editor = new GridEditor(5, 5);
      expect(editor.undo()).toBe(false);
    });

    it("returns false when nothing to redo", () => {
      const editor = new GridEditor(5, 5);
      editor.setCell(0, 0, c("A"));
      expect(editor.redo()).toBe(false);
    });

    it("handles 100-step undo boundary", () => {
      const editor = new GridEditor(20, 20);
      for (let i = 0; i < 101; i++) {
        editor.setCell(0, 0, c(String.fromCharCode(65 + (i % 26))));
      }
      let undoCount = 0;
      while (editor.undo()) undoCount++;
      expect(undoCount).toBe(100);
    });
  });

  describe("fill", () => {
    it("fills a rectangle", () => {
      const editor = new GridEditor(10, 10);
      editor.fill({ row: 1, col: 1, width: 3, height: 2 }, c("#"));
      expect(editor.getCell(1, 1)).toEqual(c("#"));
      expect(editor.getCell(2, 3)).toEqual(c("#"));
      expect(editor.getCell(0, 0)).toEqual(c(" "));
    });

    it("can undo fill", () => {
      const editor = new GridEditor(5, 5);
      editor.fill({ row: 0, col: 0, width: 5, height: 5 }, c("X"));
      editor.undo();
      expect(editor.getCell(0, 0)).toEqual(c(" "));
    });
  });

  describe("getRegion / setRegion", () => {
    it("reads a rectangular region", () => {
      const editor = new GridEditor(5, 5, c("."));
      editor.setCell(1, 1, c("A"));
      const region = editor.getRegion({ row: 1, col: 1, width: 2, height: 1 });
      expect(region[0][0]).toEqual(c("A"));
      expect(region[0][1]).toEqual(c("."));
    });

    it("writes a rectangular region", () => {
      const editor = new GridEditor(5, 5);
      editor.setRegion({ row: 0, col: 0, width: 2, height: 2 }, [
        [c("A"), c("B")],
        [c("C"), c("D")],
      ]);
      expect(editor.getCell(0, 0)).toEqual(c("A"));
      expect(editor.getCell(1, 1)).toEqual(c("D"));
    });
  });

  describe("copyRegion", () => {
    it("copies cells to the destination", () => {
      const editor = new GridEditor(10, 5);
      editor.fill({ row: 0, col: 0, width: 3, height: 1 }, c("X"));
      editor.copyRegion({ row: 0, col: 0, width: 3, height: 1 }, 2, 5);
      expect(editor.getCell(2, 5)).toEqual(c("X"));
      expect(editor.getCell(2, 7)).toEqual(c("X"));
      expect(editor.getCell(0, 0)).toEqual(c("X")); // src unchanged
    });
  });

  describe("moveRegion", () => {
    it("moves cells and clears source", () => {
      const editor = new GridEditor(10, 5);
      editor.fill({ row: 0, col: 0, width: 3, height: 1 }, c("X"));
      editor.moveRegion({ row: 0, col: 0, width: 3, height: 1 }, 2, 5);
      expect(editor.getCell(2, 5)).toEqual(c("X"));
      expect(editor.getCell(0, 0)).toEqual(c(" ")); // src cleared
    });
  });

  describe("findReplace", () => {
    it("replaces and returns count", () => {
      const editor = new GridEditor(5, 5, c("a"));
      const count = editor.findReplace("a", "Z");
      expect(count).toBe(25);
      expect(editor.getCell(0, 0)).toEqual(c("Z"));
    });

    it("does not push to history when no matches", () => {
      const editor = new GridEditor(3, 3);
      editor.findReplace("X", "Y");
      expect(editor.canUndo()).toBe(false);
    });
  });

  describe("textInsert", () => {
    it("inserts text at position", () => {
      const editor = new GridEditor(20, 5);
      editor.textInsert(0, 0, "Hello");
      expect(editor.getCell(0, 0)).toEqual(c("H"));
      expect(editor.getCell(0, 4)).toEqual(c("o"));
    });
  });

  describe("toGrid / snapshot", () => {
    it("toGrid returns a copy", () => {
      const editor = new GridEditor(3, 3, c("A"));
      const grid = editor.toGrid();
      expect(grid.width).toBe(3);
      expect(grid.height).toBe(3);
      expect(grid.cells[0][0]).toEqual(c("A"));
      grid.cells[0][0] = c("Z");
      expect(editor.getCell(0, 0)).toEqual(c("A")); // original unaffected
    });

    it("snapshot includes timestamp", () => {
      const editor = new GridEditor(3, 3);
      const snap = editor.snapshot();
      expect(snap.timestamp).toBeGreaterThan(0);
      expect(snap.cells).toBeDefined();
    });
  });
});
