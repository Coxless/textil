"use client";

import { CharsetSelector } from "@/components/studio/CharsetSelector";
import { FontPicker } from "@/components/studio/FontPicker";
import { ImageControls } from "@/components/studio/ImageControls";
import { ImageUploader } from "@/components/studio/ImageUploader";
import { Preview } from "@/components/studio/Preview";
import { TextInput } from "@/components/studio/TextInput";
import { WidthSlider } from "@/components/studio/WidthSlider";
import { useGenerator } from "@/hooks/useGenerator";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { type AvailableFontName, DEFAULT_FONT } from "@textil/core";
import { useState } from "react";

export default function StudioPage() {
  const [mode, setMode] = useState<"text" | "image">("text");

  const [text, setText] = useState("textil");
  const [font, setFont] = useState<AvailableFontName>(DEFAULT_FONT);
  const [width, setWidth] = useState(80);

  const [imageData, setImageData] = useState<ArrayBuffer | null>(null);
  const [charset, setCharset] = useState("standard");
  const [contrast, setContrast] = useState(0);
  const [threshold, setThreshold] = useState(0.5);
  const [imageWidth, setImageWidth] = useState(80);

  const textResult = useGenerator(text, font, width);
  const imageResult = useImageGenerator(imageData, charset, contrast, threshold, imageWidth);

  const { grid, error } = mode === "text" ? textResult : imageResult;
  const isLoading = mode === "image" ? imageResult.isLoading : false;

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-900">
      <aside className="flex w-80 shrink-0 flex-col gap-6 overflow-y-auto border-r border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-zinc-100">textil</span>
          <span className="text-xs text-zinc-600">studio</span>
        </div>

        <div className="flex overflow-hidden rounded-md border border-zinc-700">
          {(["text", "image"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 text-xs font-medium capitalize transition-colors ${
                m === mode
                  ? "bg-zinc-700 text-zinc-100"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-750 hover:text-zinc-300"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {mode === "text" ? (
          <>
            <TextInput value={text} onChange={setText} />
            <WidthSlider value={width} onChange={setWidth} />
            <FontPicker value={font} onChange={setFont} />
          </>
        ) : (
          <>
            <ImageUploader onImageLoad={setImageData} onClear={() => setImageData(null)} />
            <WidthSlider value={imageWidth} onChange={setImageWidth} />
            <CharsetSelector value={charset} onChange={setCharset} />
            <ImageControls
              contrast={contrast}
              threshold={threshold}
              onContrastChange={setContrast}
              onThresholdChange={setThreshold}
            />
          </>
        )}
      </aside>

      <main className="flex-1 overflow-hidden bg-zinc-950">
        <Preview
          grid={grid}
          error={error}
          isLoading={isLoading}
          placeholder={
            mode === "text"
              ? "Type something to generate ASCII art"
              : "Drop an image to generate ASCII art"
          }
        />
      </main>
    </div>
  );
}
