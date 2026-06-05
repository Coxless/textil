import { readFile } from "node:fs/promises";
import type { Command } from "commander";
import { ExportTarget, exportGrid, generateImage } from "@textil/core";
import { readStdin } from "../lib/stdin.js";
import { printResult } from "../lib/print.js";

export function registerGenerate(program: Command): void {
  program
    .command("generate [file]")
    .description("Generate ASCII art from an image file or stdin")
    .option("-w, --width <n>", "output width in columns", parseInt)
    .option("-c, --charset <name>", "character set: standard|braille|block", "standard")
    .option("--contrast <n>", "contrast adjustment [-1, 1]", parseFloat)
    .option("--threshold <n>", "binary threshold [0, 1]", parseFloat)
    .option("--edge-detect", "apply Sobel edge detection")
    .option("-t, --target <format>", "export format: plain|github|ansi|json", "plain")
    .action(
      async (
        file: string | undefined,
        opts: {
          width?: number;
          charset: string;
          contrast?: number;
          threshold?: number;
          edgeDetect?: boolean;
          target: string;
        },
      ) => {
        let bytes: Uint8Array;
        if (!file || file === "-") {
          const buf = await readStdin();
          bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
        } else {
          const buf = await readFile(file);
          bytes = new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
        }

        const grid = await generateImage(bytes, {
          width: opts.width,
          charset: opts.charset,
          contrast: opts.contrast,
          threshold: opts.threshold,
          edgeDetect: opts.edgeDetect,
        });
        const result = exportGrid(grid, opts.target as ExportTarget);
        printResult(result);
      },
    );
}
