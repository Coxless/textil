import type { ExportResult } from "@textil/core";

export function printResult(result: ExportResult): void {
  process.stdout.write(result.output);
  if (!result.output.endsWith("\n")) process.stdout.write("\n");
  for (const w of result.warnings) {
    process.stderr.write(`warning: ${w}\n`);
  }
}
