import type { Cell, Rect } from "../types/grid.js";

export function cloneCells(cells: Cell[][]): Cell[][] {
  return cells.map((row) => [...row]);
}

function gridDims(cells: Cell[][]): [rows: number, cols: number] {
  const rows = cells.length;
  return [rows, rows > 0 ? cells[0].length : 0];
}

export function fill(cells: Cell[][], rect: Rect, char: Cell): void {
  const [rows, cols] = gridDims(cells);
  for (let r = rect.row; r < rect.row + rect.height; r++) {
    for (let c = rect.col; c < rect.col + rect.width; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        cells[r][c] = char;
      }
    }
  }
}

export function findReplace(cells: Cell[][], find: string, replace: string): number {
  let count = 0;
  for (let r = 0; r < cells.length; r++) {
    for (let c = 0; c < cells[r].length; c++) {
      if (cells[r][c] === find) {
        cells[r][c] = replace;
        count++;
      }
    }
  }
  return count;
}

export function textInsert(cells: Cell[][], row: number, col: number, text: string): void {
  const [rows, cols] = gridDims(cells);
  if (row < 0 || row >= rows) return;
  for (let i = 0; i < text.length; i++) {
    const c = col + i;
    if (c >= 0 && c < cols) {
      cells[row][c] = text[i];
    }
  }
}
