export interface RawImage {
  width: number;
  height: number;
  /** Interleaved RGBA bytes, length = width * height * 4 */
  data: Uint8Array;
}

/** Normalized grayscale values [0, 1], row-major, length = width * height */
export type GrayscaleMap = Float32Array;

export type CharsetName = "standard" | "braille" | "block";
