import type { AsciiGrid, Cell, RGBColor } from "@textil/core";
import type { ReactNode } from "react";

const GITHUB_COLS = 99;
const DISCORD_COLS = 66;

interface PreviewProps {
  grid: AsciiGrid | null;
  error: string | null;
  isLoading?: boolean;
  placeholder?: string;
  width?: number;
}

function CenteredMessage({ text, className }: { text: string; className: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className={`font-mono text-sm ${className}`}>{text}</p>
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

function ArtFrames({ gridWidth }: { gridWidth: number }) {
  return (
    <>
      {/* Current editable range frame */}
      <div
        className="absolute top-0 left-0 bottom-0 border border-white/[0.15] pointer-events-none"
        style={{ width: `${gridWidth}ch` }}
      />
      {/* Width label — top-right inside the frame */}
      <span
        className="absolute top-1 font-sans text-[9px] leading-none text-zinc-500/70 pointer-events-none whitespace-nowrap"
        style={{ left: `${gridWidth}ch`, transform: "translateX(-100%)", paddingRight: "4px" }}
      >
        {gridWidth}
      </span>

      {/* Discord limit line */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: `${DISCORD_COLS}ch`, borderLeft: "1px dashed rgba(167,139,250,0.45)" }}
      />
      <span
        className="absolute -top-5 font-sans text-[9px] leading-none text-purple-400/70 pointer-events-none whitespace-nowrap"
        style={{ left: `${DISCORD_COLS}ch`, marginLeft: "3px" }}
      >
        Discord {DISCORD_COLS}
      </span>

      {/* GitHub limit line */}
      <div
        className="absolute top-0 bottom-0 pointer-events-none"
        style={{ left: `${GITHUB_COLS}ch`, borderLeft: "1px dashed rgba(96,165,250,0.45)" }}
      />
      <span
        className="absolute -top-5 font-sans text-[9px] leading-none text-blue-400/70 pointer-events-none whitespace-nowrap"
        style={{ left: `${GITHUB_COLS}ch`, marginLeft: "3px" }}
      >
        GitHub {GITHUB_COLS}
      </span>
    </>
  );
}

export function Preview({
  grid,
  error,
  isLoading,
  placeholder = "Type something to generate ASCII art",
  width,
}: PreviewProps) {
  if (error) return <CenteredMessage text={error} className="text-red-400" />;

  if (!grid && isLoading) return <CenteredMessage text="Generating…" className="text-zinc-500" />;

  if (!grid) return <CenteredMessage text={placeholder} className="text-zinc-600" />;

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
          <pre className="text-zinc-100 whitespace-pre">
            {grid.cells.map((row, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: grid rows are positionally stable
              <span key={i}>
                {renderColoredRow(row)}
                {i < grid.cells.length - 1 ? "\n" : ""}
              </span>
            ))}
          </pre>
        ) : (
          <pre className="text-zinc-100 whitespace-pre">
            {grid.cells.map((row) => row.map((c) => c.char).join("")).join("\n")}
          </pre>
        )}
        <ArtFrames gridWidth={displayWidth} />
      </div>
    </div>
  );
}
