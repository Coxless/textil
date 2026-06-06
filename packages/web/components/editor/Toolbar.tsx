"use client";

export type EditorTool = "pencil" | "eraser" | "select" | "text";

const TOOLS: { id: EditorTool; label: string; shortcut: string }[] = [
  { id: "pencil", label: "Pencil", shortcut: "P" },
  { id: "eraser", label: "Eraser", shortcut: "E" },
  { id: "select", label: "Select", shortcut: "S" },
  { id: "text", label: "Text", shortcut: "T" },
];

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
}: ToolbarProps) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-2">
      <div className="flex overflow-hidden rounded-md border border-zinc-700">
        {TOOLS.map(({ id, label, shortcut }) => (
          <button
            key={id}
            type="button"
            onClick={() => onToolChange(id)}
            title={`${label} (${shortcut})`}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              id === tool
                ? "bg-zinc-700 text-zinc-100"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
            }`}
          >
            {label} <kbd className="font-mono text-zinc-500">{shortcut}</kbd>
          </button>
        ))}
      </div>

      {tool === "pencil" && (
        <div className="flex items-center gap-1.5">
          <label htmlFor="pen-char" className="text-xs text-zinc-500">
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
            className="w-8 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-1 text-center font-mono text-sm text-zinc-100"
          />
        </div>
      )}

      <div className="flex-1" />

      <button
        type="button"
        onClick={onToggleFindReplace}
        className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
          findReplaceOpen
            ? "bg-zinc-700 text-zinc-100"
            : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
        }`}
      >
        Find & Replace
      </button>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
          className="rounded px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
          className="rounded px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Redo
        </button>
      </div>

      <button
        type="button"
        onClick={onExitEdit}
        className="rounded px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
      >
        ← Preview
      </button>
    </div>
  );
}
