import type { RGBColor } from "@textil/core";
import { useCallback } from "react";

interface ColorPickerProps {
  value: RGBColor | undefined;
  onChange: (color: RGBColor | undefined) => void;
  label?: string;
}

function rgbToHex([r, g, b]: RGBColor): string {
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function hexToRgb(hex: string): RGBColor {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

export function ColorPicker({ value, onChange, label = "Text color" }: ColorPickerProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(hexToRgb(e.target.value));
    },
    [onChange],
  );

  const handleClear = useCallback(() => onChange(undefined), [onChange]);

  const hex = value ? rgbToHex(value) : "#d4d4d8";

  return (
    <div>
      <div className="mb-1 text-xs font-medium" style={{ color: "var(--fg-3)" }}>
        {label}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={handleChange}
          className="h-7 w-10 cursor-pointer rounded p-0.5"
          style={{ border: "1px solid var(--bd-2)", background: "var(--surf-2)" }}
        />
        <span className="font-mono text-xs" style={{ color: "var(--fg-3)" }}>
          {hex}
        </span>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-auto text-xs transition-colors"
            style={{ color: "var(--fg-4)" }}
          >
            clear
          </button>
        )}
      </div>
    </div>
  );
}
