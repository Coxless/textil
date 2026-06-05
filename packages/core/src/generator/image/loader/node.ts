import type { RawImage } from "../types.js";
import type { ImageSource } from "./types.js";

export async function loadImageNode(source: ImageSource): Promise<RawImage> {
	if (!(source instanceof Uint8Array) && !(source instanceof ArrayBuffer)) {
		throw new TypeError(
			"ImageData is not supported in Node.js — pass a Uint8Array or Buffer instead",
		);
	}

	const { default: sharp } = await import("sharp");
	const buffer =
		source instanceof Uint8Array
			? Buffer.from(source.buffer, source.byteOffset, source.byteLength)
			: Buffer.from(new Uint8Array(source));

	const { data, info } = await sharp(buffer)
		.ensureAlpha()
		.raw()
		.toBuffer({ resolveWithObject: true });

	return {
		width: info.width,
		height: info.height,
		data: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
	};
}
