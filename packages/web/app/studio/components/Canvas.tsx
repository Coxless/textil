"use client";

import { useEffect, useRef } from "react";
import { normSel, useStudio } from "../state/useStudio";
import styles from "../studio.module.css";

const TOOLS = [
  { id: "select" as const, label: "Select", key: "V", icon: "M4 4l7 16 2-7 7-2z" },
  {
    id: "pencil" as const,
    label: "Pencil",
    key: "B",
    icon: "M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z",
  },
  {
    id: "eraser" as const,
    label: "Eraser",
    key: "E",
    icon: "M20 20H7L3 16a2 2 0 010-3l9-9 8 8-6 6",
  },
  {
    id: "fill" as const,
    label: "Fill",
    key: "G",
    icon: "M19 11l-8-8-7 7a2 2 0 000 3l5 5a2 2 0 003 0zM5 13h13M19 16s2 2.5 2 4a2 2 0 11-4 0c0-1.5 2-4 2-4z",
  },
  { id: "text" as const, label: "Type", key: "T", icon: "M4 7V5h16v2M9 19h6M12 5v14" },
] as const;

export default function Canvas() {
  const {
    grid,
    cols,
    rows,
    tool,
    char,
    zoom,
    cursor,
    sel,
    caret,
    sRef,
    cellRef,
    patch,
    setCell,
    setCells,
    floodFill,
    pushHist,
    setTool,
    undo,
    redo,
    hist,
    hpos,
    setChar,
  } = useStudio();

  const sheetRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const dragModeRef = useRef<"paint" | "rect" | "move" | null>(null);
  const moveStartRef = useRef<{ x: number; y: number } | null>(null);
  const moveSnapRef = useRef<string[] | null>(null);
  const moveOrigRef = useRef<{ x0: number; y0: number; x1: number; y1: number } | null>(null);

  const hasContent = grid.length > 0 && !(grid.length === 1 && grid[0]?.join("").trim() === "");

  // Uses sRef.current to avoid stale closure in global handlers
  function cellFromEvent(e: MouseEvent | React.MouseEvent) {
    if (!sheetRef.current) return { x: 0, y: 0 };
    const rect = sheetRef.current.getBoundingClientRect();
    const { W, H } = cellRef.current;
    const cur = sRef.current;
    return {
      x: Math.max(0, Math.min(cur.cols - 1, Math.floor((e.clientX - rect.left) / W))),
      y: Math.max(0, Math.min(cur.rows - 1, Math.floor((e.clientY - rect.top) / H))),
    };
  }

  const handleSheetMouseDown = (e: React.MouseEvent) => {
    if (!hasContent) return;
    const p = cellFromEvent(e);
    const cur = sRef.current;
    draggingRef.current = true;

    if (cur.tool === "pencil") {
      dragModeRef.current = "paint";
      setCell(p.x, p.y, cur.char);
    } else if (cur.tool === "eraser") {
      dragModeRef.current = "paint";
      setCell(p.x, p.y, " ");
    } else if (cur.tool === "fill") {
      floodFill(p.x, p.y, cur.char);
      pushHist();
      draggingRef.current = false;
    } else if (cur.tool === "text") {
      patch({ caret: { x: p.x, y: p.y } });
      draggingRef.current = false;
    } else if (cur.tool === "select") {
      if (cur.sel) {
        const n = normSel(cur.sel);
        if (p.x >= n.x0 && p.x <= n.x1 && p.y >= n.y0 && p.y <= n.y1) {
          dragModeRef.current = "move";
          moveStartRef.current = p;
          moveSnapRef.current = cur.grid.map((r) => r.join(""));
          moveOrigRef.current = n;
          return;
        }
      }
      dragModeRef.current = "rect";
      patch({ sel: { x0: p.x, y0: p.y, x1: p.x, y1: p.y } });
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: cellFromEvent captures sRef/cellRef via closure; cellRef is listed because reading .current inside effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sheetRef.current) return;
      const cur = sRef.current;
      if (!cur.grid.length) return;
      const p = cellFromEvent(e);
      patch({ cursor: p });
      if (!draggingRef.current) return;

      if (dragModeRef.current === "paint") {
        setCell(p.x, p.y, cur.tool === "eraser" ? " " : cur.char);
      } else if (dragModeRef.current === "rect" && cur.sel) {
        patch({ sel: { ...cur.sel, x1: p.x, y1: p.y } });
      } else if (
        dragModeRef.current === "move" &&
        moveSnapRef.current &&
        moveOrigRef.current &&
        moveStartRef.current
      ) {
        const snap = moveSnapRef.current;
        const orig = moveOrigRef.current;
        const dx = p.x - moveStartRef.current.x;
        const dy = p.y - moveStartRef.current.y;
        const pairs: Array<[number, number, string]> = [];
        // First restore snapshot
        for (let ry = 0; ry < snap.length; ry++) {
          const row = (snap[ry] ?? "").split("");
          for (let cx = 0; cx < row.length; cx++) {
            pairs.push([cx, ry, row[cx] ?? " "]);
          }
        }
        // Clear original region
        for (let ry = orig.y0; ry <= orig.y1; ry++) {
          for (let cx = orig.x0; cx <= orig.x1; cx++) {
            pairs.push([cx, ry, " "]);
          }
        }
        // Write to new position
        for (let ry = orig.y0; ry <= orig.y1; ry++) {
          for (let cx = orig.x0; cx <= orig.x1; cx++) {
            const ch = (snap[ry] ?? "")[cx] ?? " ";
            pairs.push([cx + dx, ry + dy, ch]);
          }
        }
        setCells(pairs);
        patch({ sel: { x0: orig.x0 + dx, y0: orig.y0 + dy, x1: orig.x1 + dx, y1: orig.y1 + dy } });
      }
    };

    const handleMouseUp = () => {
      if (
        draggingRef.current &&
        (dragModeRef.current === "paint" || dragModeRef.current === "move")
      ) {
        pushHist();
      }
      draggingRef.current = false;
      dragModeRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [sRef, cellRef, patch, setCell, setCells, pushHist]);

  const { W, H } = cellRef.current;
  const fs = 14 * zoom;
  const normS = sel ? normSel(sel) : null;
  const sheetCursorClass =
    tool === "text" ? styles.toolText : tool === "select" ? styles.toolSelect : "";

  return (
    <main className={styles.canvasArea}>
      <div className={styles.canvasScroll}>
        <div className={styles.sheetWrap}>
          {hasContent && (
            <div
              ref={sheetRef}
              className={`${styles.sheet} ${sheetCursorClass}`}
              style={{
                width: `${cols * W}px`,
                height: `${rows * H}px`,
                backgroundSize: `${W}px ${H}px`,
              }}
              onMouseDown={handleSheetMouseDown}
            >
              <pre className={styles.glyphs} style={{ fontSize: `${fs}px`, lineHeight: `${H}px` }}>
                {grid.map((r) => r.join("")).join("\n")}
              </pre>

              {cols >= 80 && <div className={styles.col80} style={{ left: `${80 * W}px` }} />}

              {cursor && tool !== "text" && (
                <div
                  className={styles.cursorCell}
                  style={{
                    left: `${cursor.x * W}px`,
                    top: `${cursor.y * H}px`,
                    width: `${W}px`,
                    height: `${H}px`,
                  }}
                />
              )}

              {normS && (
                <div
                  className={styles.selRect}
                  style={{
                    left: `${normS.x0 * W}px`,
                    top: `${normS.y0 * H}px`,
                    width: `${(normS.x1 - normS.x0 + 1) * W}px`,
                    height: `${(normS.y1 - normS.y0 + 1) * H}px`,
                  }}
                />
              )}

              {caret && tool === "text" && (
                <div
                  className={styles.caret}
                  style={{
                    left: `${caret.x * W}px`,
                    top: `${caret.y * H + 2}px`,
                    height: `${H - 4}px`,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {!hasContent && (
        <div className={styles.empty}>
          <div className={styles.big}>{"  ___  ___  ___\n |   ||   ||   |\n |___||___||___|"}</div>
          <div>
            <div className={styles.h}>Start with a source</div>
            <div className={styles.p}>
              テキストを打つか画像を落とすと、ここにアスキーアートが生まれます。そのまま
              <b style={{ color: "var(--cloud-dim)" }}>直接編集</b>できます。
            </div>
          </div>
        </div>
      )}

      {/* Floating tool dock */}
      <div className={styles.dock}>
        {TOOLS.map(({ id, label, key, icon }) => (
          <button
            key={id}
            type="button"
            className={`${styles.tool}${tool === id ? ` ${styles.on}` : ""}`}
            onClick={() => setTool(id)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <title>{label}</title>
              <path d={icon} />
            </svg>
            <span className={styles.tip}>
              {label}
              <kbd>{key}</kbd>
            </span>
          </button>
        ))}

        <span className={styles.dockDiv} />

        <input
          id="charChip"
          className={styles.charChip}
          value={char}
          maxLength={1}
          title="描画する文字"
          onChange={(e) => {
            const v = e.target.value;
            if (v) setChar(v);
          }}
        />

        <span className={styles.dockDiv} />

        <button type="button" className={styles.mini} disabled={hpos <= 0} onClick={undo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <title>Undo</title>
            <path d="M9 14L4 9l5-5M4 9h11a5 5 0 010 10h-3" />
          </svg>
        </button>
        <button
          type="button"
          className={styles.mini}
          disabled={hpos >= hist.length - 1}
          onClick={redo}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <title>Redo</title>
            <path d="M15 14l5-5-5-5M20 9H9a5 5 0 000 10h3" />
          </svg>
        </button>
      </div>
    </main>
  );
}
