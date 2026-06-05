import type { AsciiGrid, Cell } from "../types/grid.js";
import type { GenerateOptions } from "../types/options.js";
import {
	STANDARD_CHARSET,
	brightnessToBlock,
	brightnessToChar,
	pixelsToBraille,
} from "./image/charsets.js";
import { sobelEdgeDetect } from "./image/edge.js";
import type { ImageSource } from "./image/loader/types.js";
import {
	applyContrast,
	sampleBlockGrid,
	sampleBrailleGrid,
	sampleGrid,
	toGrayscale,
} from "./image/sampler.js";
import type { RawImage } from "./image/types.js";

const DEFAULT_CHAR_WIDTH = 80;
const DEFAULT_THRESHOLD = 0.5;

const _loaderPromise =
	typeof process !== "undefined" && process.versions?.node != null
		? import("./image/loader/node.js").then((m) => m.loadImageNode)
		: import("./image/loader/browser.js").then((m) => m.loadImageBrowser);

async function loadImage(source: ImageSource): Promise<RawImage> {
	return (await _loaderPromise)(source);
}

/**
 * Convert an image to an ASCII art grid.
 *
 * - `source`: Uint8Array/ArrayBuffer (Node) or ImageData (browser).
 * - `options.width`: target character columns (default: 80).
 * - `options.charset`: "standard" | "braille" | "block" | custom string (default: "standard").
 * - `options.contrast`: contrast adjustment [-1, 1] (default: 0).
 * - `options.threshold`: on/off threshold for braille/block modes [0, 1] (default: 0.5).
 * - `options.edgeDetect`: apply Sobel filter before character mapping (default: false).
 */
export async function generateImage(
	source: ImageSource,
	options?: GenerateOptions,
): Promise<AsciiGrid> {
	const charWidth = options?.width ?? DEFAULT_CHAR_WIDTH;
	const charset = options?.charset ?? "standard";
	const contrast = options?.contrast ?? 0;
	const threshold = options?.threshold ?? DEFAULT_THRESHOLD;
	const edgeDetect = options?.edgeDetect ?? false;

	const raw = await loadImage(source);
	let gray = toGrayscale(raw);

	if (contrast !== 0) {
		gray = applyContrast(gray, contrast);
	}

	if (edgeDetect) {
		gray = sobelEdgeDetect(gray, raw.width, raw.height);
	}

	let cells: Cell[][];

	if (charset === "braille") {
		const blocks = sampleBrailleGrid(gray, raw.width, raw.height, charWidth, threshold);
		cells = blocks.map((row) => row.map((block) => pixelsToBraille(block)));
	} else if (charset === "block") {
		const blocks = sampleBlockGrid(gray, raw.width, raw.height, charWidth);
		cells = blocks.map((row) => row.map(([top, bottom]) => brightnessToBlock(top, bottom, threshold)));
	} else {
		const cs = charset === "standard" ? STANDARD_CHARSET : charset;
		const grid = sampleGrid(gray, raw.width, raw.height, charWidth);
		cells = grid.map((row) => row.map((brightness) => brightnessToChar(brightness, cs)));
	}

	return { width: charWidth, height: cells.length, cells };
}
