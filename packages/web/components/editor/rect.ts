import type { Rect } from "@textil/core";

export function cellInRect(row: number, col: number, rect: Rect): boolean {
  return (
    row >= rect.row &&
    row < rect.row + rect.height &&
    col >= rect.col &&
    col < rect.col + rect.width
  );
}

export function normalizeRect(r1: number, c1: number, r2: number, c2: number): Rect {
  return {
    row: Math.min(r1, r2),
    col: Math.min(c1, c2),
    height: Math.abs(r2 - r1) + 1,
    width: Math.abs(c2 - c1) + 1,
  };
}
