import type { Cell } from "../../types/grid.js";
import type { FigChar, FigFont } from "./types.js";
import { smushColumns } from "./smusher.js";

const FALLBACK_CHAR: FigChar = { rows: [" "], width: 1 };

function getChar(font: FigFont, ch: string): FigChar {
	return font.chars.get(ch) ?? font.chars.get(" ") ?? FALLBACK_CHAR;
}

/** Count trailing spaces in a string (hardblanks are NOT spaces here). */
function trailingSpaces(s: string): number {
	let count = 0;
	for (let i = s.length - 1; i >= 0; i--) {
		if (s[i] === " ") count++;
		else break;
	}
	return count;
}

/** Extract the column at `col` from a row array (one char per row). */
function extractCol(rows: string[], col: number): string[] {
	return rows.map((r) => r[col] ?? " ");
}

type RenderMode = "full-width" | "kerning" | "smush";

function detectMode(font: FigFont, smush: boolean | undefined): RenderMode {
	if (smush === false) return "full-width";
	if (smush === true) return font.header.oldLayout === 0 ? "kerning" : "smush";
	// Auto-detect from font header
	if (font.header.oldLayout < 0) return "full-width";
	if (font.header.oldLayout === 0) return "kerning";
	return "smush";
}

/**
 * Render `text` using `font`. Hardblank characters remain in the output;
 * the caller is responsible for replacing them with spaces.
 */
export function renderText(
	font: FigFont,
	text: string,
	smush?: boolean,
): Cell[][] {
	const { height, hardblank, oldLayout } = font.header;
	const smushBits = oldLayout > 0 ? oldLayout : 0;
	const mode = detectMode(font, smush);

	// Output buffer: one string per row
	const buf: string[] = Array.from({ length: height }, () => "");

	for (const ch of text) {
		const figChar = getChar(font, ch);

		let overlap = 0;

		if (mode === "kerning" || mode === "smush") {
			// Kerning: minimum trailing spaces across all output rows
			const kern = Math.min(
				...buf.map((row, i) => {
					const charLeading = figChar.rows[i]?.search(/\S/) ?? 0;
					return trailingSpaces(row) + (charLeading < 0 ? figChar.width : charLeading);
				}),
			);
			// kern gives how many positions we can move the char left while touching
			overlap = kern;

			if (mode === "smush") {
				// Try to smush one additional column
				const currentWidth = buf[0]?.length ?? 0;
				if (currentWidth > 0 && figChar.width > 0) {
					const leftEdge = extractCol(buf, currentWidth - overlap - 1);
					const rightEdge = extractCol(
						figChar.rows,
						overlap < figChar.width ? overlap : figChar.width - 1,
					);
					const smushed = smushColumns(leftEdge, rightEdge, hardblank, smushBits);
					if (smushed !== null) {
						// Expand overlap by 1 to include the smushed column
						// Merge it: splice in the smushed column
						for (let r = 0; r < height; r++) {
							const row = buf[r] ?? "";
							const insertAt = currentWidth - overlap - 1;
							const rightPart = (figChar.rows[r] ?? "").slice(overlap + 1);
							buf[r] = row.slice(0, insertAt) + (smushed[r] ?? " ") + rightPart;
						}
						continue; // Skip normal append below
					}
				}
			}
		}

		// Normal append with overlap (remove `overlap` chars from right of buf,
		// then append figChar)
		for (let r = 0; r < height; r++) {
			const row = buf[r] ?? "";
			const trimmed = overlap > 0 ? row.slice(0, row.length - overlap) : row;
			buf[r] = trimmed + (figChar.rows[r] ?? "");
		}
	}

	// Replace hardblanks with spaces
	const finalBuf = buf.map((row) => row.replaceAll(hardblank, " "));

	// Convert to Cell[][]
	return finalBuf.map((row) => row.split("").map((ch) => ch as Cell));
}
