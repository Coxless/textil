import { describe, expect, it } from "vitest";
import { exportAnsi } from "../../exporter/ansi.js";
import { exportGithub } from "../../exporter/github.js";
import { exportGrid } from "../../exporter/index.js";
import { exportJson } from "../../exporter/json.js";
import { exportPlain } from "../../exporter/plain.js";
import type { AsciiGrid } from "../../types/grid.js";

const grid: AsciiGrid = {
  width: 3,
  height: 2,
  cells: [
    ["a", "b", "c"],
    ["d", "e", "f"],
  ],
};

describe("exportGrid", () => {
  it('delegates "plain" to exportPlain', () => {
    expect(exportGrid(grid, "plain")).toEqual(exportPlain(grid));
  });

  it('delegates "github" to exportGithub', () => {
    expect(exportGrid(grid, "github")).toEqual(exportGithub(grid));
  });

  it('delegates "ansi" to exportAnsi', () => {
    expect(exportGrid(grid, "ansi")).toEqual(exportAnsi(grid));
  });

  it('delegates "json" to exportJson', () => {
    expect(exportGrid(grid, "json")).toEqual(exportJson(grid));
  });

  it("all targets return { output: string, warnings: string[] }", () => {
    for (const target of ["plain", "github", "ansi", "json"] as const) {
      const result = exportGrid(grid, target);
      expect(typeof result.output).toBe("string");
      expect(Array.isArray(result.warnings)).toBe(true);
    }
  });
});
