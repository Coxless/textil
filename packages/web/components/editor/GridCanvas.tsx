"use client";

import type { AsciiGrid, Cell, Rect } from "@textil/core";

function cellInRect(row: number, col: number, rect: Rect): boolean {
  return (
    row >= rect.row &&
    row < rect.row + rect.height &&
    col >= rect.col &&
    col < rect.col + rect.width
  );
}

interface GridCanvasProps {
  grid: AsciiGrid;
  zoom: number;
  cursor: { row: number; col: number } | null;
  selection: Rect | null;
  selectionInProgress: Rect | null;
  pendingPaint: ReadonlyMap<string, Cell>;
  onPointerDown: (row: number, col: number) => void;
  onPointerEnter: (row: number, col: number) => void;
  onPointerUp: () => void;
}

export function GridCanvas({
  grid,
  zoom,
  cursor,
  selection,
  selectionInProgress,
  pendingPaint,
  onPointerDown,
  onPointerEnter,
  onPointerUp,
}: GridCanvasProps) {
  return (
    <div className="h-full overflow-auto p-6 font-mono text-sm text-zinc-100">
      <div
        style={{
          fontSize: `${zoom}%`,
          lineHeight: "1",
          display: "grid",
          gridTemplateColumns: `repeat(${grid.width}, 1ch)`,
          touchAction: "none",
          userSelect: "none",
        }}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {grid.cells.flatMap((row, r) =>
          row.map((cell, c) => {
            const key = `${r},${c}`;
            const char = pendingPaint.get(key) ?? cell;
            const isCursor = cursor?.row === r && cursor?.col === c;
            const isSelected =
              !isCursor && selection !== null && cellInRect(r, c, selection);
            const isInProgress =
              !isCursor && selectionInProgress !== null && cellInRect(r, c, selectionInProgress);

            let className = "";
            if (isCursor) {
              className = "bg-zinc-600 outline outline-1 -outline-offset-1 outline-zinc-400";
            } else if (isInProgress) {
              className = "bg-zinc-600";
            } else if (isSelected) {
              className = "bg-zinc-700";
            }

            return (
              <div
                key={key}
                data-row={r}
                data-col={c}
                className={className}
                onPointerDown={(e) => {
                  e.preventDefault();
                  onPointerDown(r, c);
                }}
                onPointerEnter={() => onPointerEnter(r, c)}
              >
                {char === " " ? " " : char}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );
}
