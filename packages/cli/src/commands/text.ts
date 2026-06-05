import { DEFAULT_FONT, type ExportTarget, exportGrid, generateText } from "@textil/core";
import type { Command } from "commander";
import { printResult } from "../lib/print.js";

export function registerText(program: Command): void {
  program
    .command("text <text>")
    .description("Generate ASCII art from text")
    .option("-f, --font <name>", "FIGlet font name", DEFAULT_FONT)
    .option("-w, --width <n>", "output width in columns", Number.parseInt)
    .option("-t, --target <format>", "export format: plain|github|ansi|json", "plain")
    .action((text: string, opts: { font: string; width?: number; target: string }) => {
      const grid = generateText(text, { font: opts.font, width: opts.width });
      const result = exportGrid(grid, opts.target as ExportTarget);
      printResult(result);
    });
}
