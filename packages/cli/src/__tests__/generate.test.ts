import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runCli } from "./helpers/run.js";

// Minimal PNG helper (inline to avoid cross-package imports in CLI tests)
function makeSolidPngBytes(width: number, height: number): Buffer {
  // Build RGBA pixel data
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    rgba[i * 4] = 128;
    rgba[i * 4 + 1] = 128;
    rgba[i * 4 + 2] = 128;
    rgba[i * 4 + 3] = 255;
  }

  function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (const byte of data) {
      crc ^= byte;
      for (let j = 0; j < 8; j++) {
        crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function adler32(data: Uint8Array): number {
    let s1 = 1;
    let s2 = 0;
    for (const byte of data) {
      s1 = (s1 + byte) % 65521;
      s2 = (s2 + s1) % 65521;
    }
    return ((s2 << 16) | s1) >>> 0;
  }

  function u32be(n: number): Uint8Array {
    return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
  }

  function concat(...arrays: Uint8Array[]): Uint8Array {
    const total = arrays.reduce((s, a) => s + a.length, 0);
    const out = new Uint8Array(total);
    let offset = 0;
    for (const a of arrays) {
      out.set(a, offset);
      offset += a.length;
    }
    return out;
  }

  function pngChunk(type: string, data: Uint8Array): Uint8Array {
    const typeBytes = new TextEncoder().encode(type);
    const combined = new Uint8Array(typeBytes.length + data.length);
    combined.set(typeBytes);
    combined.set(data, typeBytes.length);
    const crc = crc32(combined);
    const out = new Uint8Array(4 + 4 + data.length + 4);
    out.set(u32be(data.length), 0);
    out.set(typeBytes, 4);
    out.set(data, 8);
    out.set(u32be(crc), 8 + data.length);
    return out;
  }

  const signature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = concat(
    u32be(width),
    u32be(height),
    new Uint8Array([8, 6, 0, 0, 0]),
  );
  const ihdr = pngChunk("IHDR", ihdrData);

  const scanlineLen = 1 + width * 4;
  const raw = new Uint8Array(height * scanlineLen);
  for (let y = 0; y < height; y++) {
    raw[y * scanlineLen] = 0;
    raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * scanlineLen + 1);
  }

  function deflateStore(data: Uint8Array): Uint8Array {
    const zlibHeader = new Uint8Array([0x78, 0x01]);
    const len = data.length;
    const nlen = ~len & 0xffff;
    const block = new Uint8Array(5 + len);
    block[0] = 0x01;
    block[1] = len & 0xff;
    block[2] = (len >> 8) & 0xff;
    block[3] = nlen & 0xff;
    block[4] = (nlen >> 8) & 0xff;
    block.set(data, 5);
    const checksum = adler32(data);
    const zlib = new Uint8Array(zlibHeader.length + block.length + 4);
    zlib.set(zlibHeader, 0);
    zlib.set(block, zlibHeader.length);
    zlib.set(u32be(checksum), zlibHeader.length + block.length);
    return zlib;
  }

  const idat = pngChunk("IDAT", deflateStore(raw));
  const iend = pngChunk("IEND", new Uint8Array(0));

  const pngBytes = concat(signature, ihdr, idat, iend);
  return Buffer.from(pngBytes);
}

let tmpPng: string;

beforeAll(() => {
  tmpPng = path.join(tmpdir(), `textil-test-${process.pid}.png`);
  writeFileSync(tmpPng, makeSolidPngBytes(16, 8));
});

afterAll(() => {
  try {
    unlinkSync(tmpPng);
  } catch {
    // already removed
  }
});

describe("textil generate", () => {
  it("generates ASCII art from a PNG file", () => {
    const { stdout, exitCode } = runCli(["generate", tmpPng, "--width", "20"]);
    expect(exitCode).toBe(0);
    expect(stdout.trim().length).toBeGreaterThan(0);
  });

  it("generates from stdin (piped bytes)", () => {
    const pngBytes = makeSolidPngBytes(16, 8);
    const { stdout, exitCode } = runCli(["generate", "-", "--width", "20"], { stdin: pngBytes });
    expect(exitCode).toBe(0);
    expect(stdout.trim().length).toBeGreaterThan(0);
  });

  it("--charset braille produces output", () => {
    const { stdout, exitCode } = runCli(["generate", tmpPng, "--width", "20", "--charset", "braille"]);
    expect(exitCode).toBe(0);
    expect(stdout.trim().length).toBeGreaterThan(0);
  });

  it("--target json outputs valid AsciiGridJson", () => {
    const { stdout, exitCode } = runCli(["generate", tmpPng, "--width", "20", "--target", "json"]);
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout) as { version: number; rows: unknown };
    expect(parsed.version).toBe(1);
    expect(Array.isArray(parsed.rows)).toBe(true);
  });
});
