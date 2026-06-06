"use client";

import { useState } from "react";

interface FindReplacePanelProps {
  onFindReplace: (find: string, replace: string) => number;
  onClose: () => void;
}

export function FindReplacePanel({ onFindReplace, onClose }: FindReplacePanelProps) {
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [lastCount, setLastCount] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!find) return;
    const count = onFindReplace(find[0], replace[0] ?? " ");
    setLastCount(count);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 py-2"
    >
      <span className="text-xs font-medium text-zinc-500">Find & Replace</span>
      <input
        type="text"
        maxLength={1}
        placeholder="Find char"
        value={find}
        onChange={(e) => {
          setFind(e.target.value);
          setLastCount(null);
        }}
        className="w-20 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 font-mono text-sm text-zinc-100 placeholder-zinc-600"
      />
      <span className="text-xs text-zinc-600">→</span>
      <input
        type="text"
        maxLength={1}
        placeholder="Replace"
        value={replace}
        onChange={(e) => {
          setReplace(e.target.value);
          setLastCount(null);
        }}
        className="w-20 rounded border border-zinc-700 bg-zinc-800 px-2 py-1 font-mono text-sm text-zinc-100 placeholder-zinc-600"
      />
      <button
        type="submit"
        disabled={!find}
        className="rounded bg-zinc-700 px-3 py-1 text-xs font-medium text-zinc-100 transition-colors hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Replace All
      </button>
      {lastCount !== null && (
        <span className="text-xs text-zinc-500">
          {lastCount === 0 ? "No matches" : `Replaced ${lastCount}`}
        </span>
      )}
      <button
        type="button"
        onClick={onClose}
        className="ml-auto text-lg leading-none text-zinc-500 hover:text-zinc-300"
        aria-label="Close find & replace"
      >
        ×
      </button>
    </form>
  );
}
