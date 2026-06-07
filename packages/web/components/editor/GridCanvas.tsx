"use client";

import { ArtFrames, GITHUB_COLS } from "@/components/studio/ArtFrames";
import type { AsciiGrid, Cell, Rect } from "@textil/core";
import { cellInRect } from "./rect";

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
  const containerMinWidth = Math.max(grid.width, GITHUB_COLS) + 2;

  return (
    <div className="h-full overflow-auto p-6 pt-12 font-mono text-sm text-zinc-100">
      <div
        className="relative inline-block"
        style={{ fontSize: `${zoom}%`, minWidth: `${containerMinWidth}ch` }}
      >
        <div
          style={{
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
              const painted = pendingPaint.get(key);
              const displayCell = painted ?? cell;
              const isCursor = cursor?.row === r && cursor?.col === c;
              const isSelected = !isCursor && selection !== null && cellInRect(r, c, selection);
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

              const fg = displayCell.fg;
              const colorStyle = fg ? { color: `rgb(${fg[0]},${fg[1]},${fg[2]})` } : undefined;

              return (
                <div
                  key={key}
                  data-row={r}
                  data-col={c}
                  className={className}
                  style={colorStyle}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onPointerDown(r, c);
                  }}
                  onPointerEnter={() => onPointerEnter(r, c)}
                >
                  {displayCell.char === " " ? " " : displayCell.char}
                </div>
              );
            }),
          )}
        </div>
        <ArtFrames gridWidth={grid.width} />
      </div>
    </div>
  );
}
