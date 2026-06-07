"use client";

import { renderGridToPng } from "@/lib/export/png";
import { exportGrid, hasColorCells } from "@textil/core";
import type { AsciiGrid } from "@textil/core";
import { useCallback, useEffect, useRef } from "react";
import { TargetCard } from "./TargetCard";

interface ExportModalProps {
  grid: AsciiGrid;
  onClose: () => void;
}

const COLOR_WARNING = "Grid contains color data — will export as monochrome.";

function reactComponentTemplate(plainText: string): string {
  const escaped = plainText.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  return `export default function AsciiArt() {
  return (
    <pre style={{ fontFamily: "monospace", lineHeight: 1.2, whiteSpace: "pre" }}>
{\`${escaped}\`}
    </pre>
  );
}
`;
}

export function ExportModal({ grid, onClose }: ExportModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) dialogRef.current?.close();
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key === "Escape") dialogRef.current?.close();
  }, []);

  const isColored = hasColorCells(grid);

  const plain = exportGrid(grid, "plain");
  const github = exportGrid(grid, "github");
  const ansi = exportGrid(grid, "ansi");

  const discordWarnings: string[] = [];
  if (plain.output.length > 2000) {
    discordWarnings.push(
      `Output is ${plain.output.length.toLocaleString()} characters — exceeds Discord/Slack's 2000-character limit.`,
    );
  }
  if (isColored) discordWarnings.push(COLOR_WARNING);

  const reactWarnings = isColored ? [COLOR_WARNING] : [];

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      className="m-auto max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-950 p-6 text-zinc-100 backdrop:bg-black/60"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-semibold">Export</h2>
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-100"
        >
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TargetCard
          label="Plain text"
          description="Raw ASCII art, no formatting"
          output={plain.output}
          warnings={plain.warnings}
        />
        <TargetCard
          label="GitHub"
          description="Markdown code block for READMEs"
          output={github.output}
          warnings={github.warnings}
        />
        <TargetCard
          label="Terminal"
          description="ANSI color codes — paste into a terminal"
          output={ansi.output}
          warnings={ansi.warnings}
        />
        <TargetCard
          label="Discord / Slack"
          description="Plain text with character limit check"
          output={plain.output}
          warnings={discordWarnings}
        />
        <TargetCard
          label="PNG"
          description="Download as an image"
          getBlob={() => renderGridToPng(grid)}
          filename="ascii-art.png"
        />
        <TargetCard
          label="React Component"
          description="Download as a .tsx file"
          output={reactComponentTemplate(plain.output)}
          filename="AsciiArt.tsx"
          warnings={reactWarnings}
        />
      </div>
    </dialog>
  );
}
