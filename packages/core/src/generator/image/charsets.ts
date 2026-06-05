export const STANDARD_CHARSET = " .:-=+*#%@";
export const BLOCK_CHARS = [" ", "▀", "▄", "█"] as const;
export const AVAILABLE_CHARSETS = ["standard", "braille", "block"] as const;

/**
 * Map a normalized brightness [0, 1] to a character from a charset string.
 * Lower brightness → earlier character (sparse/space), higher → later (dense/filled).
 */
export function brightnessToChar(brightness: number, charset: string): string {
	const clamped = Math.max(0, Math.min(1, brightness));
	const index = Math.round(clamped * (charset.length - 1));
	return charset[index];
}

/**
 * Map two vertically-stacked pixel brightnesses to one block character.
 * Uses Unicode half-block elements: space=none, ▀=top, ▄=bottom, █=both.
 */
export function brightnessToBlock(
	topBrightness: number,
	bottomBrightness: number,
	threshold: number,
): string {
	const top = topBrightness > threshold;
	const bottom = bottomBrightness > threshold;
	if (top && bottom) return "█";
	if (top) return "▀";
	if (bottom) return "▄";
	return " ";
}

/**
 * Map a 2×4 pixel block to one Braille Unicode character (U+2800–U+28FF).
 * pixels[col][row] where col ∈ {0,1} and row ∈ {0,1,2,3}.
 *
 * Braille dot bit layout:
 *   dot1(col0,row0)=bit0  dot4(col1,row0)=bit3
 *   dot2(col0,row1)=bit1  dot5(col1,row1)=bit4
 *   dot3(col0,row2)=bit2  dot6(col1,row2)=bit5
 *   dot7(col0,row3)=bit6  dot8(col1,row3)=bit7
 */
export function pixelsToBraille(pixels: readonly boolean[][]): string {
	let offset = 0;
	if (pixels[0]?.[0]) offset |= 1 << 0;
	if (pixels[0]?.[1]) offset |= 1 << 1;
	if (pixels[0]?.[2]) offset |= 1 << 2;
	if (pixels[1]?.[0]) offset |= 1 << 3;
	if (pixels[1]?.[1]) offset |= 1 << 4;
	if (pixels[1]?.[2]) offset |= 1 << 5;
	if (pixels[0]?.[3]) offset |= 1 << 6;
	if (pixels[1]?.[3]) offset |= 1 << 7;
	return String.fromCodePoint(0x2800 + offset);
}
