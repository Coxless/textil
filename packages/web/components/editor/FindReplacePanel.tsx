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
      className="flex shrink-0 items-center gap-3 px-4 py-2"
      style={{ borderBottom: "1px solid var(--bd)", background: "var(--surf)" }}
    >
      <span className="text-xs font-medium" style={{ color: "var(--fg-4)" }}>
        Find & Replace
      </span>
      <input
        type="text"
        maxLength={1}
        placeholder="Find char"
        value={find}
        onChange={(e) => {
          setFind(e.target.value);
          setLastCount(null);
        }}
        className="w-20 rounded px-2 py-1 font-mono text-sm"
        style={{
          border: "1px solid var(--bd-2)",
          background: "var(--surf-2)",
          color: "var(--fg)",
        }}
      />
      <span className="text-xs" style={{ color: "var(--fg-5)" }}>
        →
      </span>
      <input
        type="text"
        maxLength={1}
        placeholder="Replace"
        value={replace}
        onChange={(e) => {
          setReplace(e.target.value);
          setLastCount(null);
        }}
        className="w-20 rounded px-2 py-1 font-mono text-sm"
        style={{
          border: "1px solid var(--bd-2)",
          background: "var(--surf-2)",
          color: "var(--fg)",
        }}
      />
      <button
        type="submit"
        disabled={!find}
        className="rounded px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        style={{ background: "var(--surf-3)", color: "var(--fg)" }}
      >
        Replace All
      </button>
      {lastCount !== null && (
        <span className="text-xs" style={{ color: "var(--fg-4)" }}>
          {lastCount === 0 ? "No matches" : `Replaced ${lastCount}`}
        </span>
      )}
      <button
        type="button"
        onClick={onClose}
        className="ml-auto text-lg leading-none transition-colors"
        style={{ color: "var(--fg-4)" }}
        aria-label="Close find & replace"
      >
        ×
      </button>
    </form>
  );
}
