"use client";

import { FontPicker } from "@/components/studio/FontPicker";
import { Preview } from "@/components/studio/Preview";
import { TextInput } from "@/components/studio/TextInput";
import { WidthSlider } from "@/components/studio/WidthSlider";
import { useGenerator } from "@/hooks/useGenerator";
import { type AvailableFontName, DEFAULT_FONT } from "@textil/core";
import { useState } from "react";

export default function StudioPage() {
  const [text, setText] = useState("textil");
  const [font, setFont] = useState<AvailableFontName>(DEFAULT_FONT);
  const [width, setWidth] = useState(80);

  const { grid, error } = useGenerator(text, font, width);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-900">
      {/* Controls sidebar */}
      <aside className="flex w-80 shrink-0 flex-col gap-6 overflow-y-auto border-r border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-zinc-100">textil</span>
          <span className="text-xs text-zinc-600">studio</span>
        </div>

        <TextInput value={text} onChange={setText} />
        <WidthSlider value={width} onChange={setWidth} />
        <FontPicker value={font} onChange={setFont} />
      </aside>

      {/* Preview area */}
      <main className="flex-1 overflow-hidden bg-zinc-950">
        <Preview grid={grid} error={error} />
      </main>
    </div>
  );
}
