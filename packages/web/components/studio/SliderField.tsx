"use client";

interface SliderFieldProps {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  format?: (v: number) => string;
}

export function SliderField({
  id,
  label,
  min,
  max,
  step,
  value,
  onChange,
  format,
}: SliderFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color: "var(--fg-3)" }}
        >
          {label}
        </label>
        <span className="font-mono text-xs" style={{ color: "var(--fg-2)" }}>
          {format ? format(value) : value}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
        style={{ accentColor: "var(--fg-3)" }}
      />
      <div className="flex justify-between text-xs" style={{ color: "var(--fg-5)" }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
