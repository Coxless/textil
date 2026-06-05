import { describe, expect, it } from "vitest";
import { AVAILABLE_FONTS, DEFAULT_FONT, FONTS } from "../../generator/figlet/fonts/index.js";
import { parseFont } from "../../generator/figlet/parser.js";

describe("bundled fonts", () => {
  it("FONTS has exactly 12 entries", () => {
    expect(Object.keys(FONTS)).toHaveLength(12);
  });

  it("AVAILABLE_FONTS has 12 entries", () => {
    expect(AVAILABLE_FONTS).toHaveLength(12);
  });

  it("AVAILABLE_FONTS entries match FONTS keys", () => {
    for (const name of AVAILABLE_FONTS) {
      expect(FONTS).toHaveProperty(name);
    }
  });

  it("DEFAULT_FONT is 'standard'", () => {
    expect(DEFAULT_FONT).toBe("standard");
  });

  it("every FONTS entry is a non-empty string starting with flf2a", () => {
    for (const [name, data] of Object.entries(FONTS)) {
      expect(typeof data, `${name} should be a string`).toBe("string");
      expect(data.length, `${name} should be non-empty`).toBeGreaterThan(0);
      expect(data.startsWith("flf2a"), `${name} should start with flf2a`).toBe(true);
    }
  });

  it("every font parses without throwing", () => {
    for (const [name, data] of Object.entries(FONTS)) {
      expect(() => parseFont(data), `${name} should parse cleanly`).not.toThrow();
    }
  });
});
