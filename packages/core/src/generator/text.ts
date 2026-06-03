import type { AsciiGrid, Cell } from "../types/grid.js";
import type { GenerateOptions } from "../types/options.js";
import type { FigFont } from "./figlet/types.js";
import { DEFAULT_FONT, FONTS } from "./figlet/fonts/index.js";
import { parseFont } from "./figlet/parser.js";
import { renderText } from "./figlet/renderer.js";

const fontCache = new Map<string, FigFont>();

function getFont(name: string): FigFont {
	const cached = fontCache.get(name);
	if (cached !== undefined) return cached;

	const flfString = FONTS[name];
	if (flfString === undefined) {
		throw new Error(
			`Unknown font "${name}". Available fonts: ${Object.keys(FONTS).join(", ")}`,
		);
	}
	const parsed = parseFont(flfString);
	fontCache.set(name, parsed);
	return parsed;
}

function applyWidth(rows: Cell[][], targetWidth: number): Cell[][] {
	return rows.map((row) => {
		if (row.length >= targetWidth) return row.slice(0, targetWidth);
		const padded = [...row];
		while (padded.length < targetWidth) padded.push(" " as Cell);
		return padded;
	});
}

/**
 * Render `text` as ASCII art using FIGlet.
 *
 * - `options.font`: bundled font name (default: "standard").
 * - `options.width`: truncate or pad all rows to this column count.
 * - Newlines in `text` produce separate renders stacked vertically.
 */
export function generateText(text: string, options?: GenerateOptions): AsciiGrid {
	const fontName = options?.font ?? DEFAULT_FONT;
	const targetWidth = options?.width;
	const font = getFont(fontName);
	const { height } = font.header;

	const inputLines = text.split("\n");
	const sections: Cell[][][] = inputLines.map((line) => {
		if (line === "") {
			return Array.from({ length: height }, () => [] as Cell[]);
		}
		return renderText(font, line);
	});

	// Natural width = max row length across all sections
	let naturalWidth = 0;
	for (const section of sections) {
		for (const row of section) {
			if (row.length > naturalWidth) naturalWidth = row.length;
		}
	}

	const finalWidth = targetWidth ?? naturalWidth;
	const allRows: Cell[][] = [];
	for (const section of sections) {
		const adjusted = finalWidth > 0 ? applyWidth(section, finalWidth) : section;
		for (const row of adjusted) {
			allRows.push(row);
		}
	}

	return { width: finalWidth, height: allRows.length, cells: allRows };
}
