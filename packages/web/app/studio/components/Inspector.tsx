"use client";

import { useState } from "react";
import { type Tool, useStudio } from "../state/useStudio";
import styles from "../studio.module.css";

const GLYPHS = [
  "#",
  "@",
  "%",
  "*",
  "+",
  "=",
  "-",
  ":",
  ".",
  "█",
  "▓",
  "▒",
  "░",
  "|",
  "/",
  "\\",
  "_",
  "·",
  "◆",
  "○",
  "●",
  " ",
];

const TOOL_META: Record<Tool, { nm: string; ds: string; icon: string }> = {
  select: { nm: "Select", ds: "矩形で選択して移動・削除", icon: "M4 4l7 16 2-7 7-2z" },
  pencil: {
    nm: "Pencil",
    ds: "文字を1セットずつ描く",
    icon: "M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z",
  },
  eraser: { nm: "Eraser", ds: "セルを空白に戻す", icon: "M20 20H7L3 16a2 2 0 010-3l9-9 8 8-6 6" },
  fill: {
    nm: "Fill",
    ds: "同じ文字の領域を一括置換",
    icon: "M19 11l-8-8-7 7a2 2 0 000 3l5 5a2 2 0 003 0z",
  },
  text: { nm: "Type", ds: "キーボードで直接打ち込む", icon: "M4 7V5h16v2M9 19h6M12 5v14" },
};

export default function Inspector() {
  const { tool, char, setChar, findReplace, showToast } = useStudio();
  const [frFind, setFrFind] = useState("@");
  const [frRepl, setFrRepl] = useState("#");
  const meta = TOOL_META[tool];

  const handleReplace = () => {
    const n = findReplace(frFind || " ", frRepl || " ");
    showToast(`${n} cells replaced`);
  };

  return (
    <aside className={styles.insp}>
      <div className={styles.inspPad}>
        {/* Tool header */}
        <div className={styles.toolName}>
          <div className={styles.ic}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <title>{meta.nm}</title>
              <path d={meta.icon} />
            </svg>
          </div>
          <div>
            <h3>{meta.nm}</h3>
            <p>{meta.ds}</p>
          </div>
        </div>

        <div className={styles.hr} />

        {/* Glyph palette for pencil/text */}
        {(tool === "pencil" || tool === "text") && (
          <>
            <p className={styles.eyebrow}>Glyph</p>
            <div className={styles.palette}>
              {GLYPHS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={g === char ? styles.on : ""}
                  onClick={() => setChar(g)}
                >
                  {g === " " ? "·" : g}
                </button>
              ))}
            </div>
            <div className={styles.hr} />
          </>
        )}

        {/* Tool-specific hints */}
        {tool === "select" && (
          <>
            <p className={styles.hint}>
              <b>ドラッグ</b>で範囲選択。選択内をドラッグで<b>移動</b>、
              <kbd
                style={{
                  fontFamily: "var(--f-mono,'JetBrains Mono')",
                  background: "var(--ink)",
                  border: "1px solid var(--line-2)",
                  padding: "1px 6px",
                  borderRadius: "4px",
                }}
              >
                Del
              </kbd>
              で削除。
            </p>
            <div className={styles.hr} />
          </>
        )}
        {tool === "fill" && (
          <>
            <p className={styles.hint}>
              クリックした位置と<b>つながった同じ文字</b>
              をまとめて置き換えます。塗る文字はドック中央のチップで指定。
            </p>
            <div className={styles.hr} />
          </>
        )}
        {tool === "eraser" && (
          <>
            <p className={styles.hint}>
              クリック／ドラッグでセルを空白に戻します。下絵から不要な点を間引くのに。
            </p>
            <div className={styles.hr} />
          </>
        )}

        {/* Find & Replace */}
        <p className={styles.eyebrow}>Find &amp; replace</p>
        <div className={styles.frRow}>
          <input
            className={styles.frIn}
            value={frFind}
            maxLength={1}
            onChange={(e) => setFrFind(e.target.value)}
          />
          <span className={styles.ar}>→</span>
          <input
            className={styles.frIn}
            value={frRepl}
            maxLength={1}
            onChange={(e) => setFrRepl(e.target.value)}
          />
          <button
            type="button"
            className={styles.btnAmber}
            style={{ width: "auto", flex: 1 }}
            onClick={handleReplace}
          >
            Replace all
          </button>
        </div>

        <div className={styles.hr} />

        {/* Shortcuts */}
        <p className={styles.eyebrow}>Shortcuts</p>
        <div className={styles.kbdlist}>
          {[
            ["Select", "V"],
            ["Pencil", "B"],
            ["Eraser", "E"],
            ["Fill", "G"],
            ["Type", "T"],
            ["Undo / Redo", "⌘Z"],
          ].map(([label, key]) => (
            <div key={label}>
              <span>{label}</span>
              <kbd>{key}</kbd>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
