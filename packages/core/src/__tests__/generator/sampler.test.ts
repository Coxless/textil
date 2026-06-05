import { describe, expect, it } from "vitest";
import type { RawImage } from "../../generator/image/types.js";
import {
	applyContrast,
	charHeight,
	sampleBlockGrid,
	sampleBrailleGrid,
	sampleGrid,
	toGrayscale,
} from "../../generator/image/sampler.js";

function makeRawImage(w: number, h: number, r: number, g: number, b: number): RawImage {
	const data = new Uint8Array(w * h * 4);
	for (let i = 0; i < w * h; i++) {
		data[i * 4] = r;
		data[i * 4 + 1] = g;
		data[i * 4 + 2] = b;
		data[i * 4 + 3] = 255;
	}
	return { width: w, height: h, data };
}

describe("toGrayscale", () => {
	it("converts pure white to 1.0", () => {
		const image = makeRawImage(1, 1, 255, 255, 255);
		const map = toGrayscale(image);
		expect(map[0]).toBeCloseTo(1.0);
	});

	it("converts pure black to 0.0", () => {
		const image = makeRawImage(1, 1, 0, 0, 0);
		const map = toGrayscale(image);
		expect(map[0]).toBeCloseTo(0.0);
	});

	it("produces a uniform map for uniform-color images", () => {
		const image = makeRawImage(4, 4, 128, 128, 128);
		const map = toGrayscale(image);
		const first = map[0];
		for (const val of map) {
			expect(val).toBeCloseTo(first, 5);
		}
	});

	it("returns a Float32Array of length width * height", () => {
		const image = makeRawImage(3, 5, 100, 100, 100);
		expect(toGrayscale(image)).toHaveLength(15);
	});
});

describe("applyContrast", () => {
	it("returns a copy without changes when contrast is 0", () => {
		const map = new Float32Array([0.2, 0.5, 0.8]);
		const result = applyContrast(map, 0);
		expect(result[0]).toBeCloseTo(0.2);
		expect(result[1]).toBeCloseTo(0.5);
		expect(result[2]).toBeCloseTo(0.8);
	});

	it("increases contrast spread for positive values", () => {
		const map = new Float32Array([0.4, 0.5, 0.6]);
		const result = applyContrast(map, 0.5);
		expect(result[0]).toBeLessThan(0.4);
		expect(result[2]).toBeGreaterThan(0.6);
	});

	it("clamps output to [0, 1]", () => {
		const map = new Float32Array([0.0, 0.5, 1.0]);
		const result = applyContrast(map, 1);
		for (const val of result) {
			expect(val).toBeGreaterThanOrEqual(0);
			expect(val).toBeLessThanOrEqual(1);
		}
	});
});

describe("charHeight", () => {
	it("preserves aspect ratio with 0.5 correction for monospace cells", () => {
		const h = charHeight(100, 100, 40, 0.5);
		expect(h).toBe(20);
	});

	it("returns at least 1", () => {
		expect(charHeight(1000, 1, 40)).toBe(1);
	});
});

describe("sampleGrid", () => {
	it("returns a grid with the correct output dimensions", () => {
		const image = makeRawImage(100, 100, 128, 128, 128);
		const map = toGrayscale(image);
		const grid = sampleGrid(map, 100, 100, 40);
		expect(grid).toHaveLength(charHeight(100, 100, 40));
		for (const row of grid) {
			expect(row).toHaveLength(40);
		}
	});

	it("returns uniform brightness for a uniform image", () => {
		const image = makeRawImage(20, 20, 180, 180, 180);
		const map = toGrayscale(image);
		const grid = sampleGrid(map, 20, 20, 10);
		const first = grid[0][0];
		for (const row of grid) {
			for (const val of row) {
				expect(val).toBeCloseTo(first, 4);
			}
		}
	});
});

describe("sampleBrailleGrid", () => {
	it("returns a grid with the correct output dimensions", () => {
		const image = makeRawImage(80, 80, 200, 200, 200);
		const map = toGrayscale(image);
		const grid = sampleBrailleGrid(map, 80, 80, 40, 0.5);
		const expectedH = charHeight(80, 80, 40);
		expect(grid).toHaveLength(expectedH);
		for (const row of grid) {
			expect(row).toHaveLength(40);
			for (const block of row) {
				expect(block).toHaveLength(2);
				for (const col of block) {
					expect(col).toHaveLength(4);
				}
			}
		}
	});
});

describe("sampleBlockGrid", () => {
	it("returns a grid with the correct output dimensions", () => {
		const image = makeRawImage(60, 60, 100, 100, 100);
		const map = toGrayscale(image);
		const grid = sampleBlockGrid(map, 60, 60, 30);
		const expectedH = charHeight(60, 60, 30);
		expect(grid).toHaveLength(expectedH);
		for (const row of grid) {
			expect(row).toHaveLength(30);
			for (const pair of row) {
				expect(pair).toHaveLength(2);
			}
		}
	});
});
