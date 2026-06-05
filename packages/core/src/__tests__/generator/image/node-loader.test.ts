import { describe, expect, it } from "vitest";
import type { ImageDataLike } from "../../../generator/image/loader/types.js";
import { loadImageNode } from "../../../generator/image/loader/node.js";
import { makeGradientPng, makeSolidPng } from "./helpers.js";

describe("loadImageNode", () => {
	it("loads a solid-color PNG and returns correct dimensions", async () => {
		const png = makeSolidPng(10, 8, 200, 100, 50);
		const image = await loadImageNode(png);
		expect(image.width).toBe(10);
		expect(image.height).toBe(8);
	});

	it("returns RGBA data of correct length", async () => {
		const png = makeSolidPng(5, 3, 128, 128, 128);
		const image = await loadImageNode(png);
		expect(image.data).toHaveLength(5 * 3 * 4);
	});

	it("decodes solid-color pixels correctly", async () => {
		const png = makeSolidPng(2, 2, 255, 0, 128);
		const image = await loadImageNode(png);
		expect(image.data[0]).toBe(255); // R
		expect(image.data[1]).toBe(0);   // G
		expect(image.data[2]).toBe(128); // B
		expect(image.data[3]).toBe(255); // A
	});

	it("loads a gradient PNG", async () => {
		const png = makeGradientPng(8, 4);
		const image = await loadImageNode(png);
		expect(image.width).toBe(8);
		expect(image.height).toBe(4);
	});

	it("accepts ArrayBuffer input", async () => {
		const png = makeSolidPng(4, 4, 64, 128, 192);
		const image = await loadImageNode(png.buffer);
		expect(image.width).toBe(4);
		expect(image.height).toBe(4);
	});

	it("throws when given an ImageDataLike object (browser-only input)", async () => {
		const fakeImageData: ImageDataLike = { width: 2, height: 2, data: new Uint8ClampedArray(16) };
		await expect(loadImageNode(fakeImageData)).rejects.toThrow();
	});
});
