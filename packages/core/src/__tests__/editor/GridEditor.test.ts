import { describe, expect, it } from "vitest";
import { GridEditor } from "../../editor/GridEditor.js";

describe("GridEditor", () => {
  describe("getCell / setCell", () => {
    it("reads and writes a cell", () => {
      const editor = new GridEditor(5, 5);
      editor.setCell(2, 3, "X");
      expect(editor.getCell(2, 3)).toBe("X");
    });

    it("initializes all cells with the provided character", () => {
      const editor = new GridEditor(3, 3, ".");
      expect(editor.getCell(0, 0)).toBe(".");
      expect(editor.getCell(2, 2)).toBe(".");
    });

    it("throws on out-of-bounds access", () => {
      const editor = new GridEditor(5, 5);
      expect(() => editor.getCell(5, 0)).toThrow(RangeError);
      expect(() => editor.setCell(-1, 0, "X")).toThrow(RangeError);
    });
  });

  describe("undo / redo", () => {
    it("undoes setCell", () => {
      const editor = new GridEditor(5, 5);
      editor.setCell(0, 0, "A");
      expect(editor.undo()).toBe(true);
      expect(editor.getCell(0, 0)).toBe(" ");
    });

    it("redoes after undo", () => {
      const editor = new GridEditor(5, 5);
      editor.setCell(0, 0, "A");
      editor.undo();
      expect(editor.redo()).toBe(true);
      expect(editor.getCell(0, 0)).toBe("A");
    });

    it("returns false when nothing to undo", () => {
      const editor = new GridEditor(5, 5);
      expect(editor.undo()).toBe(false);
    });

    it("returns false when nothing to redo", () => {
      const editor = new GridEditor(5, 5);
      editor.setCell(0, 0, "A");
      expect(editor.redo()).toBe(false);
    });

    it("handles 100-step undo boundary", () => {
      const editor = new GridEditor(20, 20);
      for (let i = 0; i < 101; i++) {
        editor.setCell(0, 0, String.fromCharCode(65 + (i % 26)));
      }
      let undoCount = 0;
      while (editor.undo()) undoCount++;
      expect(undoCount).toBe(100);
    });
  });

  describe("fill", () => {
    it("fills a rectangle", () => {
      const editor = new GridEditor(10, 10);
      editor.fill({ row: 1, col: 1, width: 3, height: 2 }, "#");
      expect(editor.getCell(1, 1)).toBe("#");
      expect(editor.getCell(2, 3)).toBe("#");
      expect(editor.getCell(0, 0)).toBe(" ");
    });

    it("can undo fill", () => {
      const editor = new GridEditor(5, 5);
      editor.fill({ row: 0, col: 0, width: 5, height: 5 }, "X");
      editor.undo();
      expect(editor.getCell(0, 0)).toBe(" ");
    });
  });

  describe("getRegion / setRegion", () => {
    it("reads a rectangular region", () => {
      const editor = new GridEditor(5, 5, ".");
      editor.setCell(1, 1, "A");
      const region = editor.getRegion({ row: 1, col: 1, width: 2, height: 1 });
      expect(region[0][0]).toBe("A");
      expect(region[0][1]).toBe(".");
    });

    it("writes a rectangular region", () => {
      const editor = new GridEditor(5, 5);
      editor.setRegion({ row: 0, col: 0, width: 2, height: 2 }, [
        ["A", "B"],
        ["C", "D"],
      ]);
      expect(editor.getCell(0, 0)).toBe("A");
      expect(editor.getCell(1, 1)).toBe("D");
    });
  });

  describe("copyRegion", () => {
    it("copies cells to the destination", () => {
      const editor = new GridEditor(10, 5);
      editor.fill({ row: 0, col: 0, width: 3, height: 1 }, "X");
      editor.copyRegion({ row: 0, col: 0, width: 3, height: 1 }, 2, 5);
      expect(editor.getCell(2, 5)).toBe("X");
      expect(editor.getCell(2, 7)).toBe("X");
      expect(editor.getCell(0, 0)).toBe("X"); // src unchanged
    });
  });

  describe("moveRegion", () => {
    it("moves cells and clears source", () => {
      const editor = new GridEditor(10, 5);
      editor.fill({ row: 0, col: 0, width: 3, height: 1 }, "X");
      editor.moveRegion({ row: 0, col: 0, width: 3, height: 1 }, 2, 5);
      expect(editor.getCell(2, 5)).toBe("X");
      expect(editor.getCell(0, 0)).toBe(" "); // src cleared
    });
  });

  describe("findReplace", () => {
    it("replaces and returns count", () => {
      const editor = new GridEditor(5, 5, "a");
      const count = editor.findReplace("a", "Z");
      expect(count).toBe(25);
      expect(editor.getCell(0, 0)).toBe("Z");
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
      expect(editor.getCell(0, 0)).toBe("H");
      expect(editor.getCell(0, 4)).toBe("o");
    });
  });

  describe("toGrid / snapshot", () => {
    it("toGrid returns a copy", () => {
      const editor = new GridEditor(3, 3, "A");
      const grid = editor.toGrid();
      expect(grid.width).toBe(3);
      expect(grid.height).toBe(3);
      expect(grid.cells[0][0]).toBe("A");
      grid.cells[0][0] = "Z";
      expect(editor.getCell(0, 0)).toBe("A"); // original unaffected
    });

    it("snapshot includes timestamp", () => {
      const editor = new GridEditor(3, 3);
      const snap = editor.snapshot();
      expect(snap.timestamp).toBeGreaterThan(0);
      expect(snap.cells).toBeDefined();
    });
  });
});
