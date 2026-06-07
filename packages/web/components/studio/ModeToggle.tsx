interface ModeToggleProps {
  value: "color" | "mono";
  onChange: (value: "color" | "mono") => void;
}

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-zinc-400">Color mode</div>
      <div className="flex overflow-hidden rounded-md border border-zinc-700">
        {(["mono", "color"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={`flex-1 py-1.5 text-xs font-medium capitalize transition-colors ${
              m === value
                ? "bg-zinc-700 text-zinc-100"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-750 hover:text-zinc-300"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
