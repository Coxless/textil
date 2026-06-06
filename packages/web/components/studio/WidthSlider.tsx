"use client";

const MIN = 40;
const MAX = 160;

interface WidthSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function WidthSlider({ value, onChange }: WidthSliderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor="studio-width-slider"
          className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
        >
          Width
        </label>
        <span className="font-mono text-xs text-zinc-300">{value}</span>
      </div>
      <input
        id="studio-width-slider"
        type="range"
        min={MIN}
        max={MAX}
        step={4}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-zinc-400"
      />
      <div className="flex justify-between text-xs text-zinc-600">
        <span>{MIN}</span>
        <span>{MAX}</span>
      </div>
    </div>
  );
}
