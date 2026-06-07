"use client";

import { GridEditorPanel } from "@/components/editor/GridEditorPanel";
import { ExportModal } from "@/components/export/ExportModal";
import { CharsetSelector } from "@/components/studio/CharsetSelector";
import { ColorPicker } from "@/components/studio/ColorPicker";
import { FontPicker } from "@/components/studio/FontPicker";
import { ImageControls } from "@/components/studio/ImageControls";
import { ImageUploader } from "@/components/studio/ImageUploader";
import { ModeToggle } from "@/components/studio/ModeToggle";
import { Preview } from "@/components/studio/Preview";
import { TextInput } from "@/components/studio/TextInput";
import { WidthSlider } from "@/components/studio/WidthSlider";
import { useGenerator } from "@/hooks/useGenerator";
import { useImageGenerator } from "@/hooks/useImageGenerator";
import { type AvailableFontName, DEFAULT_FONT, type RGBColor } from "@textil/core";
import { useEffect, useState } from "react";

export default function StudioPage() {
  const [mode, setMode] = useState<"text" | "image">("text");

  const [text, setText] = useState("textil");
  const [font, setFont] = useState<AvailableFontName>(DEFAULT_FONT);
  const [width, setWidth] = useState(80);
  const [textColor, setTextColor] = useState<RGBColor | undefined>(undefined);

  const [imageData, setImageData] = useState<ArrayBuffer | null>(null);
  const [charset, setCharset] = useState("standard");
  const [contrast, setContrast] = useState(0);
  const [threshold, setThreshold] = useState(0.5);
  const [imageWidth, setImageWidth] = useState(80);
  const [colorMode, setColorMode] = useState<"color" | "mono">("mono");

  const [editMode, setEditMode] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const textResult = useGenerator(text, font, width, textColor);
  const imageResult = useImageGenerator(
    imageData,
    charset,
    contrast,
    threshold,
    imageWidth,
    colorMode,
  );

  const { grid, error, isLoading } = mode === "text" ? textResult : imageResult;

  // biome-ignore lint/correctness/useExhaustiveDependencies: grid is the change trigger, not read inside
  useEffect(() => {
    setEditMode(false);
  }, [grid]);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-900">
      <aside className="flex w-80 shrink-0 flex-col gap-6 overflow-y-auto border-r border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-zinc-100">textil</span>
          <span className="text-xs text-zinc-600">studio</span>
        </div>

        <div className="flex rounded-md border border-zinc-700">
          {(["text", "image"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 text-xs font-medium capitalize transition-colors first:rounded-l-md last:rounded-r-md ${
                m === mode
                  ? "bg-zinc-700 text-zinc-100"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300"
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
            <ColorPicker value={textColor} onChange={setTextColor} />
            <FontPicker value={font} onChange={setFont} />
          </>
        ) : (
          <>
            <ImageUploader onImageLoad={setImageData} onClear={() => setImageData(null)} />
            <WidthSlider value={imageWidth} onChange={setImageWidth} />
            <CharsetSelector value={charset} onChange={setCharset} />
            <ModeToggle value={colorMode} onChange={setColorMode} />
            <ImageControls
              contrast={contrast}
              threshold={threshold}
              onContrastChange={setContrast}
              onThresholdChange={setThreshold}
            />
          </>
        )}

        {grid && !editMode && (
          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setEditMode(true)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
            >
              Edit grid
            </button>
            <button
              type="button"
              onClick={() => setShowExport(true)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
            >
              Export
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-hidden bg-zinc-950">
        {editMode && grid ? (
          <GridEditorPanel initialGrid={grid} onExitEdit={() => setEditMode(false)} />
        ) : (
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
        )}
      </main>

      {showExport && grid && <ExportModal grid={grid} onClose={() => setShowExport(false)} />}
    </div>
  );
}
