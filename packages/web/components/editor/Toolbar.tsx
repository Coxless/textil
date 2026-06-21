"use client";

import type { RGBColor } from "@textil/core";

export type EditorTool = "pencil" | "eraser" | "select" | "text";

const TOOLS: { id: EditorTool; label: string; shortcut: string }[] = [
  { id: "pencil", label: "Pencil", shortcut: "P" },
  { id: "eraser", label: "Eraser", shortcut: "E" },
  { id: "select", label: "Select", shortcut: "S" },
  { id: "text", label: "Text", shortcut: "T" },
];

function rgbToHex([r, g, b]: RGBColor): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function hexToRgb(hex: string): RGBColor {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

interface ToolbarProps {
  tool: EditorTool;
  onToolChange: (tool: EditorTool) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onExitEdit: () => void;
  findReplaceOpen: boolean;
  onToggleFindReplace: () => void;
  penChar: string;
  onPenCharChange: (char: string) => void;
  penColor: RGBColor | undefined;
  onPenColorChange: (color: RGBColor | undefined) => void;
}

export function Toolbar({
  tool,
  onToolChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onExitEdit,
  findReplaceOpen,
  onToggleFindReplace,
  penChar,
  onPenCharChange,
  penColor,
  onPenColorChange,
}: ToolbarProps) {
  const colorHex = penColor ? rgbToHex(penColor) : "#d4d4d8";

  return (
    <div
      className="flex shrink-0 items-center gap-3 px-4 py-2"
      style={{ borderBottom: "1px solid var(--bd)", background: "var(--surf)" }}
    >
      <div className="flex overflow-hidden rounded-md" style={{ border: "1px solid var(--bd-2)" }}>
        {TOOLS.map(({ id, label, shortcut }) => (
          <button
            key={id}
            type="button"
            onClick={() => onToolChange(id)}
            title={`${label} (${shortcut})`}
            className="px-3 py-1.5 text-xs font-medium transition-colors"
            style={
              id === tool
                ? { background: "var(--surf-3)", color: "var(--fg)" }
                : { background: "var(--surf-2)", color: "var(--fg-3)" }
            }
          >
            {label} <kbd style={{ color: "var(--fg-4)", fontFamily: "monospace" }}>{shortcut}</kbd>
          </button>
        ))}
      </div>

      {tool === "pencil" && (
        <div className="flex items-center gap-1.5">
          <label htmlFor="pen-char" style={{ fontSize: "0.75rem", color: "var(--fg-4)" }}>
            char
          </label>
          <input
            id="pen-char"
            type="text"
            maxLength={1}
            value={penChar}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length > 0) onPenCharChange(val[val.length - 1]);
            }}
            className="w-8 rounded px-1.5 py-1 text-center font-mono text-sm"
            style={{
              border: "1px solid var(--bd-2)",
              background: "var(--surf-2)",
              color: "var(--fg)",
            }}
          />
        </div>
      )}

      {(tool === "pencil" || tool === "text") && (
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: "0.75rem", color: "var(--fg-4)" }}>color</span>
          <input
            type="color"
            value={colorHex}
            onChange={(e) => onPenColorChange(hexToRgb(e.target.value))}
            className="h-6 w-8 cursor-pointer rounded p-0.5"
            style={{ border: "1px solid var(--bd-2)", background: "var(--surf-2)" }}
          />
          {penColor && (
            <button
              type="button"
              onClick={() => onPenColorChange(undefined)}
              className="text-xs transition-colors"
              style={{ color: "var(--fg-4)" }}
            >
              ×
            </button>
          )}
        </div>
      )}

      <div className="flex-1" />

      <button
        type="button"
        onClick={onToggleFindReplace}
        className="rounded px-3 py-1.5 text-xs font-medium transition-colors"
        style={
          findReplaceOpen
            ? { background: "var(--surf-3)", color: "var(--fg)" }
            : { color: "var(--fg-3)" }
        }
      >
        Find & Replace
      </button>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="rounded px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          style={{ color: "var(--fg-3)" }}
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="rounded px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          style={{ color: "var(--fg-3)" }}
        >
          Redo
        </button>
      </div>

      <button
        type="button"
        onClick={onExitEdit}
        className="rounded px-3 py-1.5 text-xs font-medium transition-colors"
        style={{ color: "var(--fg-3)" }}
      >
        ← Preview
      </button>
    </div>
  );
}
