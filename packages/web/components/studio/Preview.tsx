import type { AsciiGrid } from "@textil/core";

interface PreviewProps {
  grid: AsciiGrid | null;
  error: string | null;
}

export function Preview({ grid, error }: PreviewProps) {
  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!grid) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="font-mono text-sm text-zinc-600">Type something to generate ASCII art</p>
      </div>
    );
  }

  const output = grid.cells.map((row) => row.join("")).join("\n");

  return (
    <div className="h-full overflow-auto p-6">
      <pre className="font-mono text-sm leading-tight text-zinc-100 whitespace-pre">{output}</pre>
    </div>
  );
}
