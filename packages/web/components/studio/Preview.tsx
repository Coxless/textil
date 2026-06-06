import type { AsciiGrid } from "@textil/core";

interface PreviewProps {
  grid: AsciiGrid | null;
  error: string | null;
  isLoading?: boolean;
  placeholder?: string;
}

function CenteredMessage({ text, className }: { text: string; className: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className={`font-mono text-sm ${className}`}>{text}</p>
    </div>
  );
}

export function Preview({
  grid,
  error,
  isLoading,
  placeholder = "Type something to generate ASCII art",
}: PreviewProps) {
  if (error) return <CenteredMessage text={error} className="text-red-400" />;

  if (!grid && isLoading) return <CenteredMessage text="Generating…" className="text-zinc-500" />;

  if (!grid) return <CenteredMessage text={placeholder} className="text-zinc-600" />;

  const output = grid.cells.map((row) => row.join("")).join("\n");

  return (
    <div className="h-full overflow-auto p-6">
      <pre className="font-mono text-sm leading-tight text-zinc-100 whitespace-pre">{output}</pre>
    </div>
  );
}
