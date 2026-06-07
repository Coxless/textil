import { spawnSync } from "node:child_process";
import { readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { type AsciiGrid, type ExportTarget, exportGrid } from "@textil/core";
import type { Command } from "commander";
import { parseGridFromPlainText, tryParseGrid } from "../lib/grid-io.js";
import { printResult } from "../lib/print.js";
import { readStdin } from "../lib/stdin.js";

async function resolveInputGrid(file: string | undefined): Promise<AsciiGrid> {
  if (file) {
    const buf = await readFile(file, "utf8");
    return tryParseGrid(buf);
  }
  if (!process.stdin.isTTY) {
    const buf = await readStdin();
    return tryParseGrid(buf.toString("utf8"));
  }
  // blank 80×25 grid
  const cells = Array.from({ length: 25 }, () => Array.from({ length: 80 }, () => ({ char: " " })));
  return { width: 80, height: 25, cells };
}

export function registerInteractive(program: Command): void {
  program
    .command("interactive [file]")
    .description("Open a grid in $EDITOR for editing")
    .option("-t, --target <format>", "export format: plain|github|ansi|json", "plain")
    .action(async (file: string | undefined, opts: { target: string }) => {
      const grid = await resolveInputGrid(file);
      const plainText = exportGrid(grid, "plain").output;

      const tmpPath = path.join(os.tmpdir(), `textil-${process.pid}-${Date.now()}.txt`);
      writeFileSync(tmpPath, plainText, "utf8");

      const editor = process.env.EDITOR ?? process.env.VISUAL ?? "vi";
      const spawnResult = spawnSync(editor, [tmpPath], { stdio: "inherit" });

      if (spawnResult.status !== 0) {
        unlinkSync(tmpPath);
        process.exit(spawnResult.status ?? 1);
      }

      const edited = readFileSync(tmpPath, "utf8");
      unlinkSync(tmpPath);

      const editedGrid = parseGridFromPlainText(edited);
      const exportResult = exportGrid(editedGrid, opts.target as ExportTarget);
      printResult(exportResult);
    });
}
