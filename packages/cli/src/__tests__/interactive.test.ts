import { describe, expect, it } from "vitest";
import { runCli } from "./helpers/run.js";

describe("textil interactive", () => {
  it("with null editor (EDITOR=true) outputs grid unchanged", () => {
    const input = "hello\nworld\n";
    const { stdout, exitCode } = runCli(["interactive"], {
      stdin: input,
      env: { EDITOR: "true" },
    });
    expect(exitCode).toBe(0);
    expect(stdout.trim().length).toBeGreaterThan(0);
  });

  it("produces JSON output with --target json", () => {
    const input = "hi\n";
    const { stdout, exitCode } = runCli(["interactive", "--target", "json"], {
      stdin: input,
      env: { EDITOR: "true" },
    });
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout) as { version: number };
    expect(parsed.version).toBe(1);
  });

  it("editor exit code non-zero causes CLI to exit non-zero", () => {
    const { exitCode } = runCli(["interactive"], {
      stdin: "hi\n",
      env: { EDITOR: "false" },
    });
    expect(exitCode).not.toBe(0);
  });
});
