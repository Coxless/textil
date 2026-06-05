import { describe, expect, it } from "vitest";
import {
  STANDARD_CHARSET,
  brightnessToBlock,
  brightnessToChar,
  pixelsToBraille,
} from "../../generator/image/charsets.js";

describe("brightnessToChar", () => {
  it("maps 0 to the first character (darkest)", () => {
    expect(brightnessToChar(0, STANDARD_CHARSET)).toBe(" ");
  });

  it("maps 1 to the last character (brightest)", () => {
    expect(brightnessToChar(1, STANDARD_CHARSET)).toBe("@");
  });

  it("maps midpoint to the middle character", () => {
    const mid = STANDARD_CHARSET[Math.round((STANDARD_CHARSET.length - 1) / 2)];
    expect(brightnessToChar(0.5, STANDARD_CHARSET)).toBe(mid);
  });

  it("clamps values below 0", () => {
    expect(brightnessToChar(-1, STANDARD_CHARSET)).toBe(" ");
  });

  it("clamps values above 1", () => {
    expect(brightnessToChar(2, STANDARD_CHARSET)).toBe("@");
  });

  it("works with single-character charset", () => {
    expect(brightnessToChar(0.5, "X")).toBe("X");
  });
});

describe("brightnessToBlock", () => {
  it("returns space when both pixels are below threshold", () => {
    expect(brightnessToBlock(0.1, 0.2, 0.5)).toBe(" ");
  });

  it("returns ▀ when only top pixel is above threshold", () => {
    expect(brightnessToBlock(0.8, 0.1, 0.5)).toBe("▀");
  });

  it("returns ▄ when only bottom pixel is above threshold", () => {
    expect(brightnessToBlock(0.1, 0.8, 0.5)).toBe("▄");
  });

  it("returns █ when both pixels are above threshold", () => {
    expect(brightnessToBlock(0.8, 0.9, 0.5)).toBe("█");
  });
});

describe("pixelsToBraille", () => {
  const makeGrid = (val: boolean): boolean[][] => [
    [val, val, val, val],
    [val, val, val, val],
  ];

  it("returns U+2800 (blank braille) when all pixels are off", () => {
    const result = pixelsToBraille(makeGrid(false));
    expect(result.codePointAt(0)).toBe(0x2800);
  });

  it("returns U+28FF (full braille) when all pixels are on", () => {
    const result = pixelsToBraille(makeGrid(true));
    expect(result.codePointAt(0)).toBe(0x28ff);
  });

  it("encodes dot1 (col0, row0) as bit 0", () => {
    const pixels = makeGrid(false);
    pixels[0][0] = true;
    const result = pixelsToBraille(pixels);
    expect(result.codePointAt(0)).toBe(0x2800 + 1);
  });

  it("encodes dot4 (col1, row0) as bit 3", () => {
    const pixels = makeGrid(false);
    pixels[1][0] = true;
    const result = pixelsToBraille(pixels);
    expect(result.codePointAt(0)).toBe(0x2800 + 8);
  });

  it("encodes dot7 (col0, row3) as bit 6", () => {
    const pixels = makeGrid(false);
    pixels[0][3] = true;
    const result = pixelsToBraille(pixels);
    expect(result.codePointAt(0)).toBe(0x2800 + 64);
  });

  it("encodes dot8 (col1, row3) as bit 7", () => {
    const pixels = makeGrid(false);
    pixels[1][3] = true;
    const result = pixelsToBraille(pixels);
    expect(result.codePointAt(0)).toBe(0x2800 + 128);
  });

  it("returns a single code point", () => {
    expect([...pixelsToBraille(makeGrid(true))]).toHaveLength(1);
  });
});
