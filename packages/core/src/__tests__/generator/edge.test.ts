import { describe, expect, it } from "vitest";
import { sobelEdgeDetect } from "../../generator/image/edge.js";

function makeUniformMap(w: number, h: number, val: number): Float32Array {
	return new Float32Array(w * h).fill(val);
}

describe("sobelEdgeDetect", () => {
	it("returns all zeros for a uniform image (no edges)", () => {
		const map = makeUniformMap(10, 10, 0.5);
		const result = sobelEdgeDetect(map, 10, 10);
		for (const v of result) {
			expect(v).toBeCloseTo(0);
		}
	});

	it("returns a Float32Array of the same length as input", () => {
		const map = makeUniformMap(8, 6, 0.3);
		const result = sobelEdgeDetect(map, 8, 6);
		expect(result).toHaveLength(48);
	});

	it("detects a vertical edge between black and white halves", () => {
		const w = 10;
		const h = 10;
		const map = new Float32Array(w * h);
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				map[y * w + x] = x < w / 2 ? 0 : 1;
			}
		}
		const result = sobelEdgeDetect(map, w, h);
		const midCol = Math.floor(w / 2);
		// Pixels adjacent to the vertical edge boundary should be non-zero
		for (let y = 1; y < h - 1; y++) {
			const edgeValue = result[y * w + midCol];
			expect(edgeValue).toBeGreaterThan(0);
		}
	});

	it("normalizes maximum edge magnitude to 1.0", () => {
		const w = 10;
		const h = 10;
		const map = new Float32Array(w * h);
		for (let y = 0; y < h; y++) {
			for (let x = 0; x < w; x++) {
				map[y * w + x] = x < w / 2 ? 0 : 1;
			}
		}
		const result = sobelEdgeDetect(map, w, h);
		const max = Math.max(...result);
		expect(max).toBeCloseTo(1.0);
	});

	it("sets border pixels to 0", () => {
		const w = 6;
		const h = 6;
		const map = new Float32Array(w * h);
		for (let x = 0; x < w; x++) {
			for (let y = 0; y < h; y++) {
				map[y * w + x] = x < 3 ? 0 : 1;
			}
		}
		const result = sobelEdgeDetect(map, w, h);
		for (let x = 0; x < w; x++) {
			expect(result[x]).toBe(0); // top row
			expect(result[(h - 1) * w + x]).toBe(0); // bottom row
		}
		for (let y = 0; y < h; y++) {
			expect(result[y * w]).toBe(0); // left col
			expect(result[y * w + w - 1]).toBe(0); // right col
		}
	});
});
