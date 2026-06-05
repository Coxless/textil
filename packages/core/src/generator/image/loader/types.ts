import type { RawImage } from "../types.js";

/** Structural type matching the browser's ImageData interface. */
export interface ImageDataLike {
  readonly width: number;
  readonly height: number;
  readonly data: Uint8ClampedArray;
}

export type ImageSource = Uint8Array | ArrayBuffer | ImageDataLike;

export type ImageLoader = (source: ImageSource) => Promise<RawImage>;
