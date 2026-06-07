import { hasColorCells } from "@textil/core";
import type { AsciiGrid } from "@textil/core";

export async function renderGridToPng(grid: AsciiGrid): Promise<Blob> {
  const lineHeight = 18;
  const font = "14px 'Courier New', monospace";
  const defaultFg = "#d4d4d8";

  const scratch = document.createElement("canvas");
  scratch.width = 100;
  scratch.height = 20;
  const scratchCtx = scratch.getContext("2d");
  if (!scratchCtx) throw new Error("Could not get 2d context");
  scratchCtx.font = font;
  const charWidth = scratchCtx.measureText("M").width;

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(grid.width * charWidth);
  canvas.height = grid.height * lineHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2d context");

  ctx.font = font;
  ctx.fillStyle = "#18181b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textBaseline = "top";

  const colored = hasColorCells(grid);

  for (let row = 0; row < grid.height; row++) {
    const cells = grid.cells[row];
    if (!cells) continue;

    if (colored) {
      for (let col = 0; col < cells.length; col++) {
        const cell = cells[col];
        if (!cell) continue;
        const fg = cell.fg;
        ctx.fillStyle = fg ? `rgb(${fg[0]},${fg[1]},${fg[2]})` : defaultFg;
        ctx.fillText(cell.char, col * charWidth, row * lineHeight);
      }
    } else {
      ctx.fillStyle = defaultFg;
      ctx.fillText(cells.map((c) => c.char).join(""), 0, row * lineHeight);
    }
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas toBlob returned null"));
    }, "image/png");
  });
}
