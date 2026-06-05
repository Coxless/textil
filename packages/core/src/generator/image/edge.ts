import type { GrayscaleMap } from "./types.js";

const Gx = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
];

const Gy = [
  [1, 2, 1],
  [0, 0, 0],
  [-1, -2, -1],
];

/**
 * Apply Sobel edge detection to a grayscale map.
 * Returns a new GrayscaleMap with normalized edge magnitudes [0, 1].
 * Border pixels are set to 0.
 */
export function sobelEdgeDetect(map: GrayscaleMap, width: number, height: number): GrayscaleMap {
  const result = new Float32Array(width * height);
  let maxMag = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0;
      let gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const val = map[(y + ky) * width + (x + kx)];
          gx += val * Gx[ky + 1][kx + 1];
          gy += val * Gy[ky + 1][kx + 1];
        }
      }
      const mag = Math.sqrt(gx * gx + gy * gy);
      result[y * width + x] = mag;
      if (mag > maxMag) maxMag = mag;
    }
  }

  if (maxMag > 0) {
    for (let i = 0; i < result.length; i++) {
      result[i] /= maxMag;
    }
  }

  return result;
}
