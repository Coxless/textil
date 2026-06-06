"use client";

import { SliderField } from "@/components/studio/SliderField";

interface ZoomControlProps {
  zoom: number;
  onChange: (zoom: number) => void;
}

export function ZoomControl({ zoom, onChange }: ZoomControlProps) {
  return (
    <SliderField
      id="zoom"
      label="Zoom"
      min={50}
      max={400}
      step={25}
      value={zoom}
      onChange={onChange}
      format={(v) => `${v}%`}
    />
  );
}
