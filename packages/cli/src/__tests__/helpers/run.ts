import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLI_ENTRY = path.resolve(__dirname, "../../index.ts");

export interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function runCli(
  args: string[],
  options: { stdin?: string | Buffer; env?: Record<string, string> } = {},
): RunResult {
  const result = spawnSync("bun", ["run", CLI_ENTRY, ...args], {
    input: options.stdin,
    encoding: "utf8",
    env: { ...process.env, ...options.env },
    timeout: 30_000,
  });
  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: result.status ?? 1,
  };
}
