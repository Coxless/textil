"use client";

const CHARSETS = [
  { value: "standard", label: "Standard" },
  { value: "braille", label: "Braille" },
  { value: "block", label: "Block" },
] as const;

interface CharsetSelectorProps {
  value: string;
  onChange: (charset: string) => void;
}

export function CharsetSelector({ value, onChange }: CharsetSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--fg-3)" }}>
        Charset
      </p>
      <div className="flex gap-1.5">
        {CHARSETS.map((cs) => (
          <button
            key={cs.value}
            type="button"
            onClick={() => onChange(cs.value)}
            className="flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors"
            style={
              cs.value === value
                ? { border: "1px solid var(--fg-3)", background: "var(--surf-3)", color: "var(--fg)" }
                : { border: "1px solid var(--bd-2)", background: "var(--surf-2)", color: "var(--fg-3)" }
            }
          >
            {cs.label}
          </button>
        ))}
      </div>
    </div>
  );
}
