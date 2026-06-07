import type { RGBColor } from "../../types/grid.js";
import type { GrayscaleMap, RawImage } from "./types.js";

/** Convert RGBA RawImage to a normalized grayscale map using standard luminance formula. */
export function toGrayscale(image: RawImage): GrayscaleMap {
  const { width, height, data } = image;
  const map = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4] / 255;
    const g = data[i * 4 + 1] / 255;
    const b = data[i * 4 + 2] / 255;
    map[i] = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  return map;
}

/** Apply contrast adjustment in [-1, 1] range. 0 = no change. */
export function applyContrast(map: GrayscaleMap, contrast: number): GrayscaleMap {
  if (contrast === 0) return map;
  const c = Math.max(-1, Math.min(1, contrast)) * 255;
  const factor = (259 * (c + 255)) / (255 * (259 - c));
  const result = new Float32Array(map.length);
  for (let i = 0; i < map.length; i++) {
    result[i] = Math.max(0, Math.min(1, factor * (map[i] - 0.5) + 0.5));
  }
  return result;
}

/**
 * Compute output character height from source dimensions and target char width.
 * charAspectRatio = charCellHeight / charCellWidth (typical monospace: 2.0, so correction = 0.5).
 */
export function charHeight(
  srcWidth: number,
  srcHeight: number,
  charWidth: number,
  charAspectRatio = 0.5,
): number {
  return Math.max(1, Math.round((srcHeight / srcWidth) * charWidth * charAspectRatio));
}

/** Average brightness of a rectangular region in the grayscale map. */
function averageRegion(
  map: GrayscaleMap,
  mapWidth: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): number {
  const cx1 = Math.max(x1, x0 + 1);
  const cy1 = Math.max(y1, y0 + 1);
  let sum = 0;
  let count = 0;
  for (let y = y0; y < cy1; y++) {
    for (let x = x0; x < cx1; x++) {
      sum += map[y * mapWidth + x];
      count++;
    }
  }
  return sum / count;
}

/** Average RGB color of a rectangular region in raw RGBA data. */
export function averageRgbRegion(
  data: Uint8Array,
  imgWidth: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): RGBColor {
  const cx1 = Math.max(x1, x0 + 1);
  const cy1 = Math.max(y1, y0 + 1);
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let y = y0; y < cy1; y++) {
    for (let x = x0; x < cx1; x++) {
      const i = (y * imgWidth + x) * 4;
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
  }
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

/**
 * Sample the grayscale map down to a character grid.
 * Returns a 2D array [outH][outW] of brightness values [0, 1].
 */
export function sampleGrid(
  map: GrayscaleMap,
  srcWidth: number,
  srcHeight: number,
  charWidth: number,
  charAspectRatio = 0.5,
): number[][] {
  const outH = charHeight(srcWidth, srcHeight, charWidth, charAspectRatio);
  const outW = charWidth;
  const grid: number[][] = [];
  for (let row = 0; row < outH; row++) {
    const line: number[] = [];
    const y0 = Math.floor((row / outH) * srcHeight);
    const y1 = Math.floor(((row + 1) / outH) * srcHeight);
    for (let col = 0; col < outW; col++) {
      const x0 = Math.floor((col / outW) * srcWidth);
      const x1 = Math.floor(((col + 1) / outW) * srcWidth);
      line.push(averageRegion(map, srcWidth, x0, y0, x1, y1));
    }
    grid.push(line);
  }
  return grid;
}

/**
 * Sample to a 2×charWidth by 4×charHeight sub-pixel grid for Braille rendering.
 * Returns boolean[][][] indexed [subCol][subRow] per output character cell.
 * Outer array: [charRow][charCol] → inner: boolean[2][4] (braille sub-pixels).
 */
export function sampleBrailleGrid(
  map: GrayscaleMap,
  srcWidth: number,
  srcHeight: number,
  charWidth: number,
  threshold: number,
  charAspectRatio = 0.5,
): boolean[][][][] {
  const outH = charHeight(srcWidth, srcHeight, charWidth, charAspectRatio);
  const outW = charWidth;
  const pixW = outW * 2;
  const pixH = outH * 4;
  const grid: boolean[][][][] = [];
  for (let row = 0; row < outH; row++) {
    const line: boolean[][][] = [];
    for (let col = 0; col < outW; col++) {
      const block: boolean[][] = [
        [false, false, false, false],
        [false, false, false, false],
      ];
      for (let sc = 0; sc < 2; sc++) {
        for (let sr = 0; sr < 4; sr++) {
          const px = col * 2 + sc;
          const py = row * 4 + sr;
          const x0 = Math.floor((px / pixW) * srcWidth);
          const x1 = Math.floor(((px + 1) / pixW) * srcWidth);
          const y0 = Math.floor((py / pixH) * srcHeight);
          const y1 = Math.floor(((py + 1) / pixH) * srcHeight);
          const brightness = averageRegion(map, srcWidth, x0, y0, x1, y1);
          block[sc][sr] = brightness > threshold;
        }
      }
      line.push(block);
    }
    grid.push(line);
  }
  return grid;
}

/**
 * Sample to a charWidth by 2×charHeight sub-pixel grid for Block rendering.
 * Returns number[][][] indexed [charRow][charCol] → [topBrightness, bottomBrightness].
 */
export function sampleBlockGrid(
  map: GrayscaleMap,
  srcWidth: number,
  srcHeight: number,
  charWidth: number,
  charAspectRatio = 0.5,
): number[][][] {
  const outH = charHeight(srcWidth, srcHeight, charWidth, charAspectRatio);
  const outW = charWidth;
  const pixH = outH * 2;
  const grid: number[][][] = [];
  for (let row = 0; row < outH; row++) {
    const line: number[][] = [];
    for (let col = 0; col < outW; col++) {
      const pair: number[] = [];
      for (let sr = 0; sr < 2; sr++) {
        const py = row * 2 + sr;
        const x0 = Math.floor((col / outW) * srcWidth);
        const x1 = Math.floor(((col + 1) / outW) * srcWidth);
        const y0 = Math.floor((py / pixH) * srcHeight);
        const y1 = Math.floor(((py + 1) / pixH) * srcHeight);
        pair.push(averageRegion(map, srcWidth, x0, y0, x1, y1));
      }
      line.push(pair);
    }
    grid.push(line);
  }
  return grid;
}
