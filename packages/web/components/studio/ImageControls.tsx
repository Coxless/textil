"use client";

interface ImageControlsProps {
  contrast: number;
  threshold: number;
  onContrastChange: (value: number) => void;
  onThresholdChange: (value: number) => void;
}

export function ImageControls({
  contrast,
  threshold,
  onContrastChange,
  onThresholdChange,
}: ImageControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="studio-contrast-slider"
            className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
          >
            Contrast
          </label>
          <span className="font-mono text-xs text-zinc-300">{contrast.toFixed(2)}</span>
        </div>
        <input
          id="studio-contrast-slider"
          type="range"
          min={-1}
          max={1}
          step={0.05}
          value={contrast}
          onChange={(e) => onContrastChange(Number(e.target.value))}
          className="w-full accent-zinc-400"
        />
        <div className="flex justify-between text-xs text-zinc-600">
          <span>-1</span>
          <span>1</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="studio-threshold-slider"
            className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
          >
            Threshold
          </label>
          <span className="font-mono text-xs text-zinc-300">{threshold.toFixed(2)}</span>
        </div>
        <input
          id="studio-threshold-slider"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={threshold}
          onChange={(e) => onThresholdChange(Number(e.target.value))}
          className="w-full accent-zinc-400"
        />
        <div className="flex justify-between text-xs text-zinc-600">
          <span>0</span>
          <span>1</span>
        </div>
      </div>
    </div>
  );
}
