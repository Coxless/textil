import { describe, expect, it } from "vitest";
import { parseFont } from "../../generator/figlet/parser.js";

// Minimal hand-crafted FLF fixture (height=2, no smushing)
// endmark is '@'
// Characters: space (32) and 'A' (65)
const FIXTURE = `flf2a$ 2 1 4 0 1
Test font
  @
  @
 _ @
/_\\@@
`;

// Fixture with only the 95 required chars (space + 94 dummies)
function makeMinimalFont(): string {
	const header = "flf2a$ 2 1 4 0 0\n";
	// space char
	let body = "  @\n  @@\n";
	// 94 more chars (! through ~)
	for (let cp = 33; cp <= 126; cp++) {
		body += "X@\nX@@\n";
	}
	return header + body;
}

describe("parseFont", () => {
	it("throws on invalid magic signature", () => {
		expect(() => parseFont("invalid content")).toThrow('expected "flf2a"');
	});

	it("parses header fields correctly", () => {
		const font = parseFont(makeMinimalFont());
		expect(font.header.hardblank).toBe("$");
		expect(font.header.height).toBe(2);
		expect(font.header.baseline).toBe(1);
		expect(font.header.maxWidth).toBe(4);
		expect(font.header.oldLayout).toBe(0);
		expect(font.header.commentLines).toBe(0);
	});

	it("skips comment lines", () => {
		const font = parseFont(FIXTURE);
		// If parsing succeeded, comments were skipped
		expect(font.chars.size).toBeGreaterThanOrEqual(95);
	});

	it("parses all 95 required ASCII chars (32–126)", () => {
		const font = parseFont(makeMinimalFont());
		for (let cp = 32; cp <= 126; cp++) {
			expect(font.chars.has(String.fromCodePoint(cp))).toBe(true);
		}
	});

	it("strips endmark from middle rows (1 strip)", () => {
		const font = parseFont(FIXTURE);
		const space = font.chars.get(" ");
		// space rows should not end with '@'
		expect(space?.rows[0]?.endsWith("@")).toBe(false);
	});

	it("strips endmark from last row (2 strips)", () => {
		const font = parseFont(FIXTURE);
		const space = font.chars.get(" ");
		expect(space?.rows[1]?.endsWith("@")).toBe(false);
	});

	it("rows are padded to uniform width", () => {
		const font = parseFont(makeMinimalFont());
		for (const [, figChar] of font.chars) {
			for (const row of figChar.rows) {
				expect(row.length).toBe(figChar.width);
			}
		}
	});

	it("normalises \\r\\n line endings", () => {
		const crlf = makeMinimalFont().replace(/\n/g, "\r\n");
		const font = parseFont(crlf);
		expect(font.chars.size).toBeGreaterThanOrEqual(95);
	});

	it("parses code-tagged characters when present", () => {
		// Append a code-tagged char (code point 9786 = ☺)
		const base = makeMinimalFont();
		const withTag = `${base}9786 smiley\nO@\nO@@\n`;
		const font = parseFont(withTag);
		expect(font.chars.has("☺")).toBe(true);
	});

	it("silently skips malformed code-tag lines", () => {
		const base = makeMinimalFont();
		const withBadTag = `${base}notanumber bad tag\nO@\nO@@\n`;
		expect(() => parseFont(withBadTag)).not.toThrow();
	});

	it("records correct character width", () => {
		const font = parseFont(FIXTURE);
		// space char rows are "  " (2 spaces), width should be 2
		expect(font.chars.get(" ")?.width).toBe(2);
	});
});
