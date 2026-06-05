import { describe, expect, it } from "vitest";
import { runCli } from "./helpers/run.js";

describe("textil export", () => {
  it("round-trips plain text through export", () => {
    const { stdout: plainOut } = runCli(["text", "Hi"]);
    const { stdout, exitCode } = runCli(["export", "--target", "plain"], { stdin: plainOut });
    expect(exitCode).toBe(0);
    expect(stdout.trim().length).toBeGreaterThan(0);
  });

  it("round-trips JSON through export to plain", () => {
    const { stdout: jsonOut } = runCli(["text", "Hi", "--target", "json"]);
    const { stdout, exitCode } = runCli(["export", "--target", "plain"], { stdin: jsonOut });
    expect(exitCode).toBe(0);
    expect(stdout.trim().length).toBeGreaterThan(0);
  });

  it("converts JSON to github markdown", () => {
    const { stdout: jsonOut } = runCli(["text", "Hi", "--target", "json"]);
    const { stdout, exitCode } = runCli(["export", "--target", "github"], { stdin: jsonOut });
    expect(exitCode).toBe(0);
    expect(stdout).toContain("```");
  });

  it("converts plain text to json", () => {
    const { stdout: plainOut } = runCli(["text", "Hi"]);
    const { stdout, exitCode } = runCli(["export", "--target", "json"], { stdin: plainOut });
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout) as { version: number; rows: unknown };
    expect(parsed.version).toBe(1);
  });

  it("preserves content when round-tripping JSON → plain → JSON", () => {
    const { stdout: jsonOut } = runCli(["text", "Hello", "--target", "json"]);
    const { stdout: plainOut } = runCli(["export", "--target", "plain"], { stdin: jsonOut });
    const { stdout: jsonOut2 } = runCli(["export", "--target", "json"], { stdin: plainOut });
    const a = JSON.parse(jsonOut) as { rows: string[] };
    const b = JSON.parse(jsonOut2) as { rows: string[] };
    expect(b.rows).toEqual(a.rows);
  });
});
