import { describe, expect, it } from "vitest";
import { exportGithub } from "../../exporter/github.js";
import type { AsciiGrid } from "../../types/grid.js";

function makeGrid(width: number, height = 1): AsciiGrid {
  return {
    width,
    height,
    cells: Array.from({ length: height }, () => Array<string>(width).fill("x")),
  };
}

describe("exportGithub", () => {
  it("wraps output in fenced code block", () => {
    const { output } = exportGithub(makeGrid(3));
    expect(output).toBe("```\nxxx\n```");
  });

  it("multi-row grid renders all rows in code block", () => {
    const grid: AsciiGrid = {
      width: 2,
      height: 2,
      cells: [
        ["a", "b"],
        ["c", "d"],
      ],
    };
    expect(exportGithub(grid).output).toBe("```\nab\ncd\n```");
  });

  it("width exactly 80: no warning", () => {
    expect(exportGithub(makeGrid(80)).warnings).toEqual([]);
  });

  it("width 81: emits one warning", () => {
    const { warnings } = exportGithub(makeGrid(81));
    expect(warnings).toHaveLength(1);
  });

  it("warning message contains both widths", () => {
    const { warnings } = exportGithub(makeGrid(81));
    expect(warnings[0]).toContain("81");
    expect(warnings[0]).toContain("80");
  });

  it("output is not truncated even when width exceeds limit", () => {
    const grid = makeGrid(90);
    const { output } = exportGithub(grid);
    const body = output.split("\n").slice(1, -1).join("\n");
    expect(body.length).toBe(90);
  });
});
