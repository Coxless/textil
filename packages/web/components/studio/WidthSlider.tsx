"use client";

import { SliderField } from "./SliderField";

const MIN = 40;
const MAX = 160;

interface WidthSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function WidthSlider({ value, onChange }: WidthSliderProps) {
  return (
    <SliderField
      id="studio-width-slider"
      label="Width"
      min={MIN}
      max={MAX}
      step={4}
      value={value}
      onChange={onChange}
    />
  );
}
