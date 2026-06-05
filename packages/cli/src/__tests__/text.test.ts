import { describe, expect, it } from "vitest";
import { runCli } from "./helpers/run.js";

describe("textil text", () => {
  it("renders text to stdout with exit code 0", () => {
    const { stdout, exitCode } = runCli(["text", "Hello"]);
    expect(exitCode).toBe(0);
    expect(stdout.trim().length).toBeGreaterThan(0);
  });

  it("--font changes the output", () => {
    const { stdout: a } = runCli(["text", "Hi", "--font", "standard"]);
    const { stdout: b } = runCli(["text", "Hi", "--font", "doom"]);
    expect(a).not.toBe(b);
  });

  it("--width truncates/pads output rows", () => {
    const { stdout } = runCli(["text", "Hello", "--width", "40"]);
    const lines = stdout.split("\n").filter((l) => l.length > 0);
    for (const line of lines) {
      expect([...line].length).toBeLessThanOrEqual(40);
    }
  });

  it("--target json outputs valid AsciiGridJson", () => {
    const { stdout, exitCode } = runCli(["text", "Hi", "--target", "json"]);
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout) as { version: number; rows: unknown };
    expect(parsed.version).toBe(1);
    expect(Array.isArray(parsed.rows)).toBe(true);
  });

  it("--target github wraps output in a code block", () => {
    const { stdout, exitCode } = runCli(["text", "Hi", "--target", "github"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("```");
  });

  it("--target ansi includes ANSI escape sequences", () => {
    const { stdout, exitCode } = runCli(["text", "Hi", "--target", "ansi"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("\x1b[");
  });

  it("outputs a trailing newline", () => {
    const { stdout } = runCli(["text", "X"]);
    expect(stdout.endsWith("\n")).toBe(true);
  });
});
