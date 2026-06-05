import type { RawImage } from "../types.js";
import type { ImageSource } from "./types.js";

export async function loadImageBrowser(source: ImageSource): Promise<RawImage> {
	if (!(source instanceof Uint8Array) && !(source instanceof ArrayBuffer)) {
		// ImageDataLike path
		return {
			width: source.width,
			height: source.height,
			data: new Uint8Array(source.data.buffer),
		};
	}

	const bytes = source instanceof Uint8Array ? source : new Uint8Array(source);
	const ab = new ArrayBuffer(bytes.byteLength);
	new Uint8Array(ab).set(bytes);
	const blob = new Blob([ab]);
	const bitmap = await createImageBitmap(blob);
	const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Failed to get 2D context from OffscreenCanvas");
	ctx.drawImage(bitmap, 0, 0);
	const imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height);
	return {
		width: bitmap.width,
		height: bitmap.height,
		data: new Uint8Array(imageData.data.buffer),
	};
}
