import type { AsciiGrid, Cell } from "../../types/grid.js";

export function makeFilledGrid(width: number, height: number, char = "x"): AsciiGrid {
  const cell: Cell = { char };
  return {
    width,
    height,
    cells: Array.from({ length: height }, () => Array<Cell>(width).fill(cell)),
  };
}
