"use client";

import { SliderField } from "./SliderField";

interface ImageControlsProps {
  contrast: number;
  threshold: number;
  onContrastChange: (value: number) => void;
  onThresholdChange: (value: number) => void;
}

const fmt = (v: number) => v.toFixed(2);

export function ImageControls({
  contrast,
  threshold,
  onContrastChange,
  onThresholdChange,
}: ImageControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      <SliderField
        id="studio-contrast-slider"
        label="Contrast"
        min={-1}
        max={1}
        step={0.05}
        value={contrast}
        onChange={onContrastChange}
        format={fmt}
      />
      <SliderField
        id="studio-threshold-slider"
        label="Threshold"
        min={0}
        max={1}
        step={0.05}
        value={threshold}
        onChange={onThresholdChange}
        format={fmt}
      />
    </div>
  );
}
