/**
 * Minimal PNG encoder for test fixtures.
 * Produces valid PNG files using uncompressed DEFLATE stored blocks.
 * No external dependencies — purely algorithmic.
 */

function crc32(data: Uint8Array): number {
	let crc = 0xffffffff;
	for (const byte of data) {
		crc ^= byte;
		for (let j = 0; j < 8; j++) {
			crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
		}
	}
	return (crc ^ 0xffffffff) >>> 0;
}

function adler32(data: Uint8Array): number {
	let s1 = 1;
	let s2 = 0;
	for (const byte of data) {
		s1 = (s1 + byte) % 65521;
		s2 = (s2 + s1) % 65521;
	}
	return ((s2 << 16) | s1) >>> 0;
}

function uint32BE(n: number): Uint8Array {
	return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
}

function chunk(type: string, data: Uint8Array): Uint8Array {
	const typeBytes = new TextEncoder().encode(type);
	const combined = new Uint8Array(typeBytes.length + data.length);
	combined.set(typeBytes);
	combined.set(data, typeBytes.length);
	const crc = crc32(combined);
	const out = new Uint8Array(4 + 4 + data.length + 4);
	out.set(uint32BE(data.length), 0);
	out.set(typeBytes, 4);
	out.set(data, 8);
	out.set(uint32BE(crc), 8 + data.length);
	return out;
}

function deflateStore(data: Uint8Array): Uint8Array {
	// zlib header (deflate, no dict, default compression)
	const zlibHeader = new Uint8Array([0x78, 0x01]);
	// DEFLATE stored block: BFINAL=1, BTYPE=00
	const len = data.length;
	const nlen = ~len & 0xffff;
	const block = new Uint8Array(5 + len);
	block[0] = 0x01; // BFINAL=1, BTYPE=00
	block[1] = len & 0xff;
	block[2] = (len >> 8) & 0xff;
	block[3] = nlen & 0xff;
	block[4] = (nlen >> 8) & 0xff;
	block.set(data, 5);
	const checksum = adler32(data);
	const zlib = new Uint8Array(zlibHeader.length + block.length + 4);
	zlib.set(zlibHeader, 0);
	zlib.set(block, zlibHeader.length);
	zlib.set(uint32BE(checksum), zlibHeader.length + block.length);
	return zlib;
}

function concat(...arrays: Uint8Array[]): Uint8Array {
	const total = arrays.reduce((s, a) => s + a.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const a of arrays) {
		out.set(a, offset);
		offset += a.length;
	}
	return out;
}

/** Create a minimal valid PNG buffer from an RGBA pixel array (row-major). */
export function encodeRgbaPng(
	width: number,
	height: number,
	rgba: Uint8Array,
): Uint8Array {
	const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

	const ihdrData = concat(
		uint32BE(width),
		uint32BE(height),
		new Uint8Array([8, 6, 0, 0, 0]), // bit depth=8, color=RGBA(6), compression, filter, interlace
	);
	const ihdr = chunk("IHDR", ihdrData);

	// Build raw scanlines (filter byte 0x00 = None + RGBA pixels)
	const scanlineLen = 1 + width * 4;
	const raw = new Uint8Array(height * scanlineLen);
	for (let y = 0; y < height; y++) {
		raw[y * scanlineLen] = 0; // filter type: None
		raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * scanlineLen + 1);
	}
	const idat = chunk("IDAT", deflateStore(raw));

	const iend = chunk("IEND", new Uint8Array(0));

	return concat(signature, ihdr, idat, iend);
}

/** Create a solid-color PNG. */
export function makeSolidPng(
	width: number,
	height: number,
	r: number,
	g: number,
	b: number,
): Uint8Array {
	const rgba = new Uint8Array(width * height * 4);
	for (let i = 0; i < width * height; i++) {
		rgba[i * 4] = r;
		rgba[i * 4 + 1] = g;
		rgba[i * 4 + 2] = b;
		rgba[i * 4 + 3] = 255;
	}
	return encodeRgbaPng(width, height, rgba);
}

/** Create a left-to-right brightness gradient PNG (grayscale). */
export function makeGradientPng(width: number, height: number): Uint8Array {
	const rgba = new Uint8Array(width * height * 4);
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const v = Math.round((x / (width - 1)) * 255);
			const i = (y * width + x) * 4;
			rgba[i] = v;
			rgba[i + 1] = v;
			rgba[i + 2] = v;
			rgba[i + 3] = 255;
		}
	}
	return encodeRgbaPng(width, height, rgba);
}
