import { SmushMode } from "./types.js";

const HIERARCHY_CLASSES = ["|", "/\\", "[]", "{}", "()", "<>"] as const;

function hierarchyClass(ch: string): number {
	for (let i = 0; i < HIERARCHY_CLASSES.length; i++) {
		if (HIERARCHY_CLASSES[i]?.includes(ch)) return i;
	}
	return -1;
}

function smushPair(
	left: string,
	right: string,
	hardblank: string,
	smushBits: number,
): string | null {
	// Universal: space passes through
	if (left === " ") return right;
	if (right === " ") return left;

	// Hardblank rule (bit 32)
	if (left === hardblank && right === hardblank && (smushBits & SmushMode.HARDBLANK) !== 0) {
		return hardblank;
	}
	// If either is hardblank but hardblank smush is off, fail
	if (left === hardblank || right === hardblank) return null;

	// Equal char rule (bit 1)
	if ((smushBits & SmushMode.EQUAL_CHAR) !== 0 && left === right) return left;

	// Underscore rule (bit 2)
	if ((smushBits & SmushMode.UNDERSCORE) !== 0) {
		const overwriters = "|/\\[]{}()<>";
		if (left === "_" && overwriters.includes(right)) return right;
		if (right === "_" && overwriters.includes(left)) return left;
	}

	// Hierarchy rule (bit 4)
	if ((smushBits & SmushMode.HIERARCHY) !== 0) {
		const lc = hierarchyClass(left);
		const rc = hierarchyClass(right);
		if (lc >= 0 && rc >= 0 && lc !== rc) {
			return lc > rc ? left : right;
		}
	}

	// Opposite pair rule (bit 8)
	if ((smushBits & SmushMode.OPPOSITE_PAIR) !== 0) {
		const pair = left < right ? left + right : right + left;
		if (pair === "()" || pair === "[]" || pair === "{}") return "|";
	}

	// Big-X rule (bit 16)
	if ((smushBits & SmushMode.BIG_X) !== 0) {
		const pair = left < right ? left + right : right + left;
		if (pair === "/\\" || pair === "<>") return "X";
	}

	return null;
}

/**
 * Attempt to smush one column from `rightCol` into the corresponding column
 * of `leftCol`. Returns the merged column if all row pairs can be smushed,
 * or null if any pair fails.
 */
export function smushColumns(
	leftCol: string[],
	rightCol: string[],
	hardblank: string,
	smushBits: number,
): string[] | null {
	const result: string[] = [];
	for (let i = 0; i < leftCol.length; i++) {
		const l = leftCol[i] ?? " ";
		const r = rightCol[i] ?? " ";
		const merged = smushPair(l, r, hardblank, smushBits);
		if (merged === null) return null;
		result.push(merged);
	}
	return result;
}
