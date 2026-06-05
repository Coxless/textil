export function cellsToLines(cells: string[][]): string[] {
  return cells.map((row) => row.join(""));
}
