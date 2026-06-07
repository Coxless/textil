export type RGBColor = [number, number, number];

export interface Cell {
  char: string;
  fg?: RGBColor;
  bg?: RGBColor;
}

export interface AsciiGrid {
  width: number;
  height: number;
  cells: Cell[][];
}

export interface GridSnapshot {
  cells: Cell[][];
  timestamp: number;
}

export interface Rect {
  row: number;
  col: number;
  width: number;
  height: number;
}
