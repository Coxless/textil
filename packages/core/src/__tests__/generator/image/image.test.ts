import { describe, expect, it } from "vitest";
import { generateImage } from "../../../generator/image.js";
import { makeGradientPng, makeSolidPng } from "./helpers.js";

describe("generateImage", () => {
	describe("completion criterion", () => {
		it("pngBuffer → AsciiGrid at width 40, charset braille", async () => {
			const png = makeSolidPng(100, 100, 128, 128, 128);
			const grid = await generateImage(png, { width: 40, charset: "braille" });
			expect(grid.width).toBe(40);
			expect(grid.height).toBeGreaterThan(0);
			expect(grid.cells).toHaveLength(grid.height);
			for (const row of grid.cells) {
				expect(row).toHaveLength(40);
				for (const cell of row) {
					expect([...cell]).toHaveLength(1);
					const cp = cell.codePointAt(0)!;
					expect(cp).toBeGreaterThanOrEqual(0x2800);
					expect(cp).toBeLessThanOrEqual(0x28ff);
				}
			}
		});
	});

	describe("standard charset", () => {
		it("returns a grid with the specified width", async () => {
			const png = makeSolidPng(50, 50, 200, 200, 200);
			const grid = await generateImage(png, { width: 20, charset: "standard" });
			expect(grid.width).toBe(20);
			for (const row of grid.cells) expect(row).toHaveLength(20);
		});

		it("defaults to standard charset when none specified", async () => {
			const png = makeSolidPng(20, 20, 100, 100, 100);
			const grid = await generateImage(png, { width: 10 });
			expect(grid.cells.flat().every((c) => typeof c === "string" && c.length === 1)).toBe(true);
		});

		it("uses a custom charset string", async () => {
			const png = makeSolidPng(20, 20, 0, 0, 0); // black image
			const grid = await generateImage(png, { width: 10, charset: "AB" });
			// Black → brightness 0 → first char "A"
			expect(grid.cells[0][0]).toBe("A");
		});

		it("maps a pure white image to the last charset character", async () => {
			const png = makeSolidPng(20, 20, 255, 255, 255);
			const grid = await generateImage(png, { width: 10, charset: "standard" });
			expect(grid.cells[0][0]).toBe("@");
		});

		it("maps a pure black image to space", async () => {
			const png = makeSolidPng(20, 20, 0, 0, 0);
			const grid = await generateImage(png, { width: 10, charset: "standard" });
			expect(grid.cells[0][0]).toBe(" ");
		});
	});

	describe("block charset", () => {
		it("returns a grid with block characters", async () => {
			const png = makeSolidPng(40, 40, 255, 255, 255);
			const grid = await generateImage(png, { width: 20, charset: "block" });
			expect(grid.width).toBe(20);
			const blockChars = new Set([" ", "▀", "▄", "█"]);
			for (const row of grid.cells) {
				for (const cell of row) {
					expect(blockChars.has(cell)).toBe(true);
				}
			}
		});
	});

	describe("options", () => {
		it("defaults width to 80 when not specified", async () => {
			const png = makeSolidPng(10, 10, 128, 128, 128);
			const grid = await generateImage(png);
			expect(grid.width).toBe(80);
		});

		it("applies edge detection without throwing", async () => {
			const png = makeGradientPng(40, 40);
			const grid = await generateImage(png, { width: 20, edgeDetect: true });
			expect(grid.width).toBe(20);
		});

		it("applies contrast adjustment without throwing", async () => {
			const png = makeGradientPng(30, 30);
			const grid = await generateImage(png, { width: 15, contrast: 0.5 });
			expect(grid.width).toBe(15);
		});
	});

	describe("output dimensions", () => {
		it("derives height from aspect ratio with 0.5 correction", async () => {
			const png = makeSolidPng(100, 100, 128, 128, 128);
			const grid = await generateImage(png, { width: 40, charset: "standard" });
			// Square image at width 40: charHeight = round(100/100 * 40 * 0.5) = 20
			expect(grid.height).toBe(20);
		});

		it("cells array length matches reported height", async () => {
			const png = makeSolidPng(80, 60, 128, 128, 128);
			const grid = await generateImage(png, { width: 30 });
			expect(grid.cells).toHaveLength(grid.height);
		});
	});
});
