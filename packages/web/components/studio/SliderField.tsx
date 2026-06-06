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
        <label htmlFor={id} className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          {label}
        </label>
        <span className="font-mono text-xs text-zinc-300">{format ? format(value) : value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-zinc-400"
      />
      <div className="flex justify-between text-xs text-zinc-600">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
