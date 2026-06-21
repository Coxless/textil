"use client";

import { useState } from "react";
import { useRef } from "react";
import { type FontId, useStudio } from "../state/useStudio";
import styles from "../studio.module.css";

const FONTS: Array<{ id: FontId; nm: string; pv: string }> = [
  { id: "block", nm: "Block", pv: "█▀█ █▀█\n█▀█ █▀▄\n▀ ▀ ▀ ▀" },
  { id: "slim", nm: "Slim", pv: "/\\  |_\n|=| |_)\n     " },
  { id: "round", nm: "Round", pv: "(o)(o)\n |  |\n \\__/" },
  { id: "mono", nm: "Mono", pv: "#=# #=#\n#=# #=#\n# # # #" },
];

export default function SourceRail() {
  const {
    mode,
    textInput,
    font,
    charset,
    contrast,
    threshold,
    invert,
    width,
    image,
    patch,
    regen,
  } = useStudio();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  function loadImage(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        patch({ image: img, mode: "image" });
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  function switchMode(m: typeof mode) {
    patch({ mode: m });
    if (m === "text") regen();
  }

  const thumbSrc = image?.src;

  return (
    <aside className={styles.rail}>
      <div className={styles.railPad}>
        <p className={styles.eyebrow}>
          <span className={styles.n}>01</span> Source
        </p>

        {/* Mode segmented */}
        <div className={styles.seg}>
          <button
            type="button"
            className={mode === "text" ? styles.on : ""}
            onClick={() => switchMode("text")}
          >
            <svg
              className={styles.ic}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <title>Text mode</title>
              <path d="M4 7V5h16v2M9 19h6M12 5v14" />
            </svg>
            Text
          </button>
          <button
            type="button"
            className={mode === "image" ? styles.on : ""}
            onClick={() => switchMode("image")}
          >
            <svg
              className={styles.ic}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <title>Image mode</title>
              <rect x={3} y={3} width={18} height={18} rx={2} />
              <circle cx={8.5} cy={8.5} r={1.5} />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            Image
          </button>
        </div>

        {/* Text panel */}
        {mode === "text" && (
          <div>
            <div className={styles.field}>
              <label htmlFor="bannerText">Banner text</label>
              <textarea
                id="bannerText"
                className={styles.txtIn}
                value={textInput}
                placeholder="MyProject"
                spellCheck={false}
                onChange={(e) => patch({ textInput: e.target.value })}
              />
            </div>
            <div className={styles.field}>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: font picker uses buttons, not form controls */}
              <label>Typeface</label>
              <div className={styles.fonts}>
                {FONTS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`${styles.fontCard}${font === f.id ? ` ${styles.on}` : ""}`}
                    onClick={() => patch({ font: f.id })}
                  >
                    <div className={styles.pv}>{f.pv}</div>
                    <div className={styles.nm}>{f.nm}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Image panel */}
        {mode === "image" && (
          <div>
            <div className={styles.field}>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: dropzone is not a form control */}
              <label>Image</label>
              {!image ? (
                <button
                  type="button"
                  className={`${styles.drop}${isDragOver ? ` ${styles.hot}` : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const file = e.dataTransfer.files[0];
                    if (file) loadImage(file);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6}>
                    <title>Upload image</title>
                    <path d="M12 16V4m0 0L8 8m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" />
                  </svg>
                  <div className={styles.t}>画像をドロップ</div>
                  <div className={styles.s}>PNG / JPG · またはクリックで選択</div>
                </button>
              ) : (
                <div className={styles.thumb}>
                  {thumbSrc && <img src={thumbSrc} alt="Uploaded" />}
                  <button
                    type="button"
                    className={styles.rm}
                    onClick={() => patch({ image: null, grid: [], cols: 0, rows: 0 })}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      width={14}
                      height={14}
                    >
                      <title>Remove image</title>
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) loadImage(file);
                }}
              />
            </div>

            <div className={styles.field}>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: chips are buttons, not form controls */}
              <label>Character set</label>
              <div className={styles.chips}>
                {(["standard", "block", "braille"] as const).map((cs) => (
                  <button
                    key={cs}
                    type="button"
                    className={`${styles.chip}${charset === cs ? ` ${styles.on}` : ""}`}
                    onClick={() => patch({ charset: cs })}
                  >
                    {cs.charAt(0).toUpperCase() + cs.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.sliderRow}>
              <div className={styles.top}>
                <label htmlFor="contrast">Contrast</label>
                <span className={styles.val}>{contrast.toFixed(1)}</span>
              </div>
              <input
                id="contrast"
                type="range"
                min={-1}
                max={1}
                step={0.05}
                value={contrast}
                onChange={(e) => patch({ contrast: Number(e.target.value) })}
              />
            </div>

            <div className={styles.sliderRow}>
              <div className={styles.top}>
                <label htmlFor="imgThreshold">Threshold</label>
                <span className={styles.val}>{threshold.toFixed(2)}</span>
              </div>
              <input
                id="imgThreshold"
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={threshold}
                onChange={(e) => patch({ threshold: Number(e.target.value) })}
              />
            </div>

            <div className={styles.toggleRow}>
              <span>Invert brightness</span>
              <button
                type="button"
                className={`${styles.sw}${invert ? ` ${styles.on}` : ""}`}
                onClick={() => patch({ invert: !invert })}
              />
            </div>
          </div>
        )}

        <div className={styles.divider} />

        {/* Shared: width */}
        <div className={styles.sliderRow}>
          <div className={styles.top}>
            <label htmlFor="outputWidth">Output width</label>
            <span className={styles.val}>{width} cols</span>
          </div>
          <input
            id="outputWidth"
            type="range"
            min={20}
            max={160}
            step={2}
            value={width}
            onChange={(e) => patch({ width: Number(e.target.value) })}
          />
        </div>
      </div>
    </aside>
  );
}
