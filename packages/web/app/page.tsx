"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { GridEditorPanel } from "@/components/editor/GridEditorPanel";
import Link from "next/link";
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
import { type AsciiGrid, type AvailableFontName, DEFAULT_FONT, type RGBColor } from "@textil/core";
import { useEffect, useState } from "react";

function Divider() {
  return <div className="h-px -mx-5" style={{ background: "var(--bd)" }} />;
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
  const [editedGrid, setEditedGrid] = useState<AsciiGrid | null>(null);
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
    setEditedGrid(null);
  }, [grid]);

  const displayGrid = editedGrid ?? grid;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className="flex w-72 shrink-0 flex-col backdrop-blur-xl"
        style={{
          background: "var(--surf)",
          borderRight: "1px solid var(--bd)",
        }}
      >
        {/* Brand */}
        <div
          className="flex items-center gap-2.5 px-5 py-4"
          style={{ borderBottom: "1px solid var(--bd)" }}
        >
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
          <span
            className="text-[11px] px-1.5 py-0.5 rounded font-mono uppercase tracking-[0.15em]"
            style={{ background: "var(--surf-2)", color: "var(--fg-3)" }}
          >
            studio
          </span>
          <ThemeToggle />
        </div>

        <div className="scrollbar-thin flex flex-col gap-4 p-5 flex-1 overflow-y-auto min-h-0">
          {/* Mode toggle */}
          <div
            className="flex p-0.5 rounded-lg"
            style={{ background: "var(--surf-2)", border: "1px solid var(--bd)" }}
          >
            {(["text", "image"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className="flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize cursor-pointer"
                style={
                  m === mode
                    ? {
                        background: "var(--surf-3)",
                        color: "var(--fg)",
                        boxShadow: "0 1px 2px var(--bd)",
                      }
                    : { color: "var(--fg-3)" }
                }
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
          {displayGrid && !editMode && (
            <div className="mt-auto flex flex-col gap-2 pt-4">
              <Divider />
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditMode(true)}
                  className="w-full rounded-lg py-2 text-xs font-medium transition-all cursor-pointer"
                  style={{
                    border: "1px solid var(--bd-2)",
                    background: "var(--surf-2a)",
                    color: "var(--fg-3)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--surf-3)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--fg)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "var(--surf-2a)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--fg-3)";
                  }}
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
        {/* Footer */}
        <div
          className="shrink-0 flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--bd)" }}
        >
          <a
            href="https://github.com/Coxless/textil"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: "var(--fg-3)" }}
            title="View source on GitHub"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
            </svg>
            GitHub
          </a>
          <Link
            href="/privacy"
            className="text-xs transition-colors"
            style={{ color: "var(--fg-3)" }}
          >
            Privacy
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-hidden dot-grid">
        {editMode && displayGrid ? (
          <GridEditorPanel
            initialGrid={displayGrid}
            onExitEdit={(g) => {
              setEditedGrid(g);
              setEditMode(false);
            }}
          />
        ) : (
          <Preview
            grid={displayGrid}
            error={error}
            isLoading={isLoading}
            width={mode === "text" ? width : imageWidth}
            placeholder={
              mode === "text"
                ? "Type something to generate ASCII art"
                : "Drop an image to generate ASCII art"
            }
          />
        )}
      </main>

      {showExport && displayGrid && (
        <ExportModal grid={displayGrid} onClose={() => setShowExport(false)} />
      )}
    </div>
  );
}
