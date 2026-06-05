import type { AsciiGrid } from "../../types/grid.js";

export function makeFilledGrid(width: number, height: number, char = "x"): AsciiGrid {
  return {
    width,
    height,
    cells: Array.from({ length: height }, () => Array<string>(width).fill(char)),
  };
}
