import type { AsciiGrid, Cell, GridSnapshot, Rect } from "../types/grid.js";
import { type Command, History } from "./History.js";
import { cloneCells, fill, findReplace, textInsert } from "./operations.js";

function makeGrid(width: number, height: number, char: Cell = " "): Cell[][] {
  return Array.from({ length: height }, () => Array<Cell>(width).fill(char));
}

class SnapshotCommand implements Command {
  constructor(
    private readonly cells: Cell[][],
    private readonly before: Cell[][],
    private readonly after: Cell[][],
  ) {}

  execute(): void {
    apply(this.cells, this.after);
  }

  undo(): void {
    apply(this.cells, this.before);
  }
}

function apply(target: Cell[][], source: Cell[][]): void {
  for (let r = 0; r < target.length; r++) {
    for (let c = 0; c < target[r].length; c++) {
      target[r][c] = source[r][c];
    }
  }
}

export class GridEditor {
  private readonly cells: Cell[][];
  private readonly history = new History();
  readonly width: number;
  readonly height: number;

  constructor(width: number, height: number, initialChar: Cell = " ") {
    this.width = width;
    this.height = height;
    this.cells = makeGrid(width, height, initialChar);
  }

  getCell(row: number, col: number): Cell {
    this.assertBounds(row, col);
    return this.cells[row][col];
  }

  setCell(row: number, col: number, char: Cell): void {
    this.assertBounds(row, col);
    const before = cloneCells(this.cells);
    const after = cloneCells(this.cells);
    after[row][col] = char;
    this.history.push(new SnapshotCommand(this.cells, before, after));
  }

  getRegion(rect: Rect): Cell[][] {
    const result: Cell[][] = [];
    for (let r = rect.row; r < rect.row + rect.height; r++) {
      const row: Cell[] = [];
      for (let c = rect.col; c < rect.col + rect.width; c++) {
        if (this.inBounds(r, c)) {
          row.push(this.cells[r][c]);
        } else {
          row.push(" ");
        }
      }
      result.push(row);
    }
    return result;
  }

  setRegion(rect: Rect, regionCells: Cell[][]): void {
    const before = cloneCells(this.cells);
    const after = cloneCells(this.cells);
    this.applyRegionInto(after, rect, regionCells);
    this.history.push(new SnapshotCommand(this.cells, before, after));
  }

  fill(rect: Rect, char: Cell): void {
    const before = cloneCells(this.cells);
    const after = cloneCells(this.cells);
    fill(after, rect, char);
    this.history.push(new SnapshotCommand(this.cells, before, after));
  }

  findReplace(find: string, replace: string): number {
    const before = cloneCells(this.cells);
    const after = cloneCells(this.cells);
    const count = findReplace(after, find, replace);
    if (count > 0) {
      this.history.push(new SnapshotCommand(this.cells, before, after));
    }
    return count;
  }

  textInsert(row: number, col: number, text: string): void {
    const before = cloneCells(this.cells);
    const after = cloneCells(this.cells);
    textInsert(after, row, col, text);
    this.history.push(new SnapshotCommand(this.cells, before, after));
  }

  copyRegion(srcRect: Rect, dstRow: number, dstCol: number): void {
    const region = this.getRegion(srcRect);
    const dstRect: Rect = {
      row: dstRow,
      col: dstCol,
      width: srcRect.width,
      height: srcRect.height,
    };
    this.setRegion(dstRect, region);
  }

  moveRegion(srcRect: Rect, dstRow: number, dstCol: number): void {
    const region = this.getRegion(srcRect);
    const before = cloneCells(this.cells);
    const after = cloneCells(this.cells);
    fill(after, srcRect, " ");
    const dstRect: Rect = { row: dstRow, col: dstCol, width: srcRect.width, height: srcRect.height };
    this.applyRegionInto(after, dstRect, region);
    this.history.push(new SnapshotCommand(this.cells, before, after));
  }

  undo(): boolean {
    return this.history.undo();
  }

  redo(): boolean {
    return this.history.redo();
  }

  canUndo(): boolean {
    return this.history.canUndo();
  }

  canRedo(): boolean {
    return this.history.canRedo();
  }

  toGrid(): AsciiGrid {
    return {
      width: this.width,
      height: this.height,
      cells: cloneCells(this.cells),
    };
  }

  snapshot(): GridSnapshot {
    return {
      cells: cloneCells(this.cells),
      timestamp: Date.now(),
    };
  }

  private applyRegionInto(buffer: Cell[][], rect: Rect, regionCells: Cell[][]): void {
    for (let r = 0; r < rect.height; r++) {
      for (let c = 0; c < rect.width; c++) {
        const tr = rect.row + r;
        const tc = rect.col + c;
        if (this.inBounds(tr, tc) && regionCells[r] !== undefined && regionCells[r][c] !== undefined) {
          buffer[tr][tc] = regionCells[r][c];
        }
      }
    }
  }

  private assertBounds(row: number, col: number): void {
    if (!this.inBounds(row, col)) {
      throw new RangeError(
        `Cell (${row}, ${col}) is out of bounds for grid ${this.height}x${this.width}`,
      );
    }
  }

  private inBounds(row: number, col: number): boolean {
    return row >= 0 && row < this.height && col >= 0 && col < this.width;
  }
}
