import type { AsciiGrid, Cell, RGBColor } from "@textil/core";
import type { ReactNode } from "react";
import { ArtFrames, GITHUB_COLS } from "./ArtFrames";

interface PreviewProps {
  grid: AsciiGrid | null;
  error: string | null;
  isLoading?: boolean;
  placeholder?: string;
  width?: number;
}

function CenteredMessage({ text, style }: { text: string; style?: React.CSSProperties }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="font-mono text-sm" style={style}>
        {text}
      </p>
    </div>
  );
}

function rgbKey(fg?: RGBColor): string {
  return fg ? `${fg[0]},${fg[1]},${fg[2]}` : "";
}

function renderColoredRow(row: Cell[]): ReactNode {
  type Span = { fg?: RGBColor; text: string };
  const spans: Span[] = [];
  for (const cell of row) {
    const last = spans[spans.length - 1];
    if (last && rgbKey(last.fg) === rgbKey(cell.fg)) {
      last.text += cell.char;
    } else {
      spans.push({ fg: cell.fg, text: cell.char });
    }
  }
  return spans.map((span, i) => {
    const style = span.fg ? { color: `rgb(${span.fg[0]},${span.fg[1]},${span.fg[2]})` } : undefined;
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: spans are derived from a fixed grid row, order never changes
      <span key={i} style={style}>
        {span.text}
      </span>
    );
  });
}

export function Preview({
  grid,
  error,
  isLoading,
  placeholder = "Type something to generate ASCII art",
  width,
}: PreviewProps) {
  if (error) return <CenteredMessage text={error} style={{ color: "#f87171" }} />;

  if (!grid && isLoading)
    return <CenteredMessage text="Generating…" style={{ color: "var(--fg-4)" }} />;

  if (!grid) return <CenteredMessage text={placeholder} style={{ color: "var(--fg-5)" }} />;

  const hasColor = grid.cells.some((row) => row.some((c) => c.fg !== undefined));
  const displayWidth = width ?? grid.width;
  // Extend the container to always show both limit markers
  const containerMinWidth = Math.max(displayWidth, GITHUB_COLS) + 2;

  return (
    <div className="h-full overflow-auto p-6 pt-12">
      <div
        className="relative inline-block font-mono text-sm leading-tight"
        style={{ minWidth: `${containerMinWidth}ch` }}
      >
        {hasColor ? (
          <pre className="whitespace-pre" style={{ color: "var(--fg)" }}>
            {grid.cells.map((row, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: grid rows are positionally stable
              <span key={i}>
                {renderColoredRow(row)}
                {i < grid.cells.length - 1 ? "\n" : ""}
              </span>
            ))}
          </pre>
        ) : (
          <pre className="whitespace-pre" style={{ color: "var(--fg)" }}>
            {grid.cells.map((row) => row.map((c) => c.char).join("")).join("\n")}
          </pre>
        )}
        <ArtFrames gridWidth={displayWidth} />
      </div>
    </div>
  );
}
