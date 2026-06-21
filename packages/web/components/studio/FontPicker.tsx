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
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--fg-3)" }}>
        Font
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        {AVAILABLE_FONTS.map((font) => (
          <button
            key={font}
            type="button"
            onClick={() => onChange(font)}
            className="flex flex-col gap-1 rounded-md p-2 text-left transition-colors"
            style={
              font === value
                ? { border: "1px solid var(--fg-3)", background: "var(--surf-3)" }
                : { border: "1px solid var(--bd-2)", background: "var(--surf-2)" }
            }
          >
            <span className="text-xs font-medium" style={{ color: "var(--fg-3)" }}>
              {font}
            </span>
            <div className="overflow-hidden">
              <pre
                className="origin-top-left scale-[0.35] font-mono text-[10px] leading-tight whitespace-pre"
                style={{ color: "var(--fg-2)" }}
              >
                {THUMBNAILS[font]}
              </pre>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
