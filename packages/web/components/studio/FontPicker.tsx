"use client";

import { AVAILABLE_FONTS, type AvailableFontName, generateText } from "@textil/core";

interface FontPickerProps {
  value: AvailableFontName;
  onChange: (font: AvailableFontName) => void;
}

const THUMBNAILS = Object.fromEntries(
  AVAILABLE_FONTS.map((font) => {
    const grid = generateText("Ag", { font, width: 20 });
    return [font, grid.cells.map((row) => row.map((c) => c.char).join("")).join("\n")];
  }),
) as Record<AvailableFontName, string>;

export function FontPicker({ value, onChange }: FontPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Font</p>
      <div className="grid grid-cols-2 gap-1.5">
        {AVAILABLE_FONTS.map((font) => (
          <button
            key={font}
            type="button"
            onClick={() => onChange(font)}
            className={`flex flex-col gap-1 rounded-md border p-2 text-left transition-colors ${
              font === value
                ? "border-zinc-400 bg-zinc-700"
                : "border-zinc-700 bg-zinc-800 hover:border-zinc-600 hover:bg-zinc-750"
            }`}
          >
            <span className="text-[10px] font-medium text-zinc-400">{font}</span>
            <div className="overflow-hidden">
              <pre className="origin-top-left scale-[0.35] font-mono text-[10px] leading-tight text-zinc-300 whitespace-pre">
                {THUMBNAILS[font]}
              </pre>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
