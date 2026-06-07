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

function Divider() {
  return <div className="h-px bg-white/[0.05] -mx-5" />;
}

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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="scrollbar-thin flex w-72 shrink-0 flex-col overflow-y-auto border-r border-white/[0.06] bg-zinc-900/95 backdrop-blur-xl">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
          <span
            className="font-mono text-base font-bold"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            textil
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 font-mono uppercase tracking-[0.15em]">
            studio
          </span>
        </div>

        <div className="flex flex-col gap-4 p-5 flex-1">
          {/* Mode toggle */}
          <div className="flex p-0.5 rounded-lg bg-zinc-800/60 border border-white/[0.04]">
            {(["text", "image"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize cursor-pointer ${
                  m === mode
                    ? "bg-zinc-700 text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <Divider />

          {mode === "text" ? (
            <>
              <TextInput value={text} onChange={setText} />
              <WidthSlider value={width} onChange={setWidth} />
              <Divider />
              <ColorPicker value={textColor} onChange={setTextColor} />
              <FontPicker value={font} onChange={setFont} />
            </>
          ) : (
            <>
              <ImageUploader onImageLoad={setImageData} onClear={() => setImageData(null)} />
              <WidthSlider value={imageWidth} onChange={setImageWidth} />
              <Divider />
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

          {/* Action buttons */}
          {grid && !editMode && (
            <div className="mt-auto flex flex-col gap-2 pt-4">
              <Divider />
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="w-full rounded-lg border border-zinc-700/80 bg-zinc-800/60 py-2 text-xs font-medium text-zinc-400 transition-all hover:bg-zinc-700/80 hover:text-zinc-200 hover:border-zinc-600 cursor-pointer"
                >
                  Edit grid
                </button>
                <button
                  type="button"
                  onClick={() => setShowExport(true)}
                  className="w-full rounded-lg py-2 text-xs font-semibold text-white transition-all cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)",
                    boxShadow: "0 0 20px rgba(124, 58, 237, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 28px rgba(124, 58, 237, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(124, 58, 237, 0.25)";
                  }}
                >
                  Export ✦
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden dot-grid">
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
