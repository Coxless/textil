import type { Command } from "commander";
import { ExportTarget, exportGrid } from "@textil/core";
import { readStdin } from "../lib/stdin.js";
import { tryParseGrid } from "../lib/grid-io.js";
import { printResult } from "../lib/print.js";

export function registerExport(program: Command): void {
  program
    .command("export")
    .description("Re-export a grid from stdin to a different format")
    .option("-t, --target <format>", "export format: plain|github|ansi|json", "plain")
    .action(async (opts: { target: string }) => {
      const buf = await readStdin();
      const grid = tryParseGrid(buf.toString("utf8"));
      const result = exportGrid(grid, opts.target as ExportTarget);
      printResult(result);
    });
}
