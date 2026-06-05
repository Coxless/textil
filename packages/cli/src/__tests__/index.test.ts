import { describe, expect, it } from "vitest";
import { runCli } from "./helpers/run.js";

describe("textil CLI", () => {
  it("--version outputs version string", () => {
    const { stdout, exitCode } = runCli(["--version"]);
    expect(exitCode).toBe(0);
    expect(stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });

  it("--help outputs usage", () => {
    const { stdout, exitCode } = runCli(["--help"]);
    expect(exitCode).toBe(0);
    expect(stdout).toContain("textil");
  });
});
