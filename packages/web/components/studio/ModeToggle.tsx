interface ModeToggleProps {
  value: "color" | "mono";
  onChange: (value: "color" | "mono") => void;
}

export function ModeToggle({ value, onChange }: ModeToggleProps) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium" style={{ color: "var(--fg-3)" }}>
        Color mode
      </div>
      <div className="flex overflow-hidden rounded-md" style={{ border: "1px solid var(--bd-2)" }}>
        {(["mono", "color"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className="flex-1 py-1.5 text-xs font-medium capitalize transition-colors"
            style={
              m === value
                ? { background: "var(--surf-3)", color: "var(--fg)" }
                : { background: "var(--surf-2)", color: "var(--fg-3)" }
            }
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
