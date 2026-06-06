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
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Charset</p>
      <div className="flex gap-1.5">
        {CHARSETS.map((cs) => (
          <button
            key={cs.value}
            type="button"
            onClick={() => onChange(cs.value)}
            className={`flex-1 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
              cs.value === value
                ? "border-zinc-400 bg-zinc-700 text-zinc-100"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
            }`}
          >
            {cs.label}
          </button>
        ))}
      </div>
    </div>
  );
}
