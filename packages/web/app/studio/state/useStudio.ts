"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────

export type Tool = "select" | "pencil" | "eraser" | "fill" | "text";
export type Mode = "text" | "image";
export type FontId = "block" | "slim" | "round" | "mono";
export type Charset = "standard" | "block" | "braille";
export type TargetId = "github" | "terminal" | "discord" | "png" | "react" | "plain";

export interface Pos {
  x: number;
  y: number;
}
export interface Sel {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface StudioState {
  mode: Mode;
  textInput: string;
  font: FontId;
  image: HTMLImageElement | null;
  charset: Charset;
  contrast: number;
  threshold: number;
  invert: boolean;
  width: number;
  grid: string[][];
  cols: number;
  rows: number;
  tool: Tool;
  char: string;
  zoom: number;
  cursor: Pos | null;
  sel: Sel | null;
  caret: Pos | null;
  hist: string[][];
  hpos: number;
  target: TargetId;
  isDeployOpen: boolean;
  toast: { msg: string; visible: boolean };
}

export interface StudioActions {
  patch: (update: Partial<StudioState>) => void;
  setTool: (t: Tool) => void;
  setChar: (ch: string) => void;
  setZoom: (z: number) => void;
  regen: () => void;
  setCell: (x: number, y: number, ch: string) => void;
  setCells: (cells: Array<[number, number, string]>) => void;
  floodFill: (x: number, y: number, ch: string) => void;
  pushHist: (reset?: boolean) => void;
  undo: () => void;
  redo: () => void;
  showToast: (msg: string) => void;
  openDeploy: () => void;
  closeDeploy: () => void;
  clearCanvas: () => void;
  findReplace: (find: string, replace: string) => number;
  cellRef: React.MutableRefObject<{ W: number; H: number }>;
  sRef: React.MutableRefObject<StudioState>;
}

export type StudioCtx = StudioState & StudioActions;

// ── Constants ─────────────────────────────────────────────────────────

const RAMPS = {
  standard: " .:-=+*#%@",
  block: " ░▒▓█",
  braille: " ⠁⠉⠛⠿⣿",
} as const;

const FONT_DEFS: Record<FontId, { weight: number; family: string }> = {
  block: { weight: 900, family: '"Arial Black",Arial,sans-serif' },
  slim: { weight: 700, family: "Georgia,serif" },
  round: { weight: 800, family: '"Trebuchet MS",sans-serif' },
  mono: { weight: 700, family: '"JetBrains Mono",monospace' },
};

const HIST_MAX = 120;

const INITIAL: StudioState = {
  mode: "text",
  textInput: "textil",
  font: "block",
  image: null,
  charset: "standard",
  contrast: 0,
  threshold: 0.5,
  invert: false,
  width: 72,
  grid: [],
  cols: 0,
  rows: 0,
  tool: "select",
  char: "#",
  zoom: 1,
  cursor: null,
  sel: null,
  caret: null,
  hist: [],
  hpos: -1,
  target: "github",
  isDeployOpen: false,
  toast: { msg: "", visible: false },
};

// ── Context ───────────────────────────────────────────────────────────

const Ctx = createContext<StudioCtx>(null as unknown as StudioCtx);
export const useStudio = () => useContext(Ctx);
export const StudioContext = Ctx;

// ── Generation helpers ────────────────────────────────────────────────

function lumaToChar(
  l: number,
  ramp: string,
  contrast: number,
  threshold: number,
  invert: boolean,
): string {
  let v = l;
  v = (v - 0.5) * (1 + contrast) + 0.5;
  v = v < threshold ? v * 0.85 : v;
  v = Math.max(0, Math.min(1, v));
  if (invert) v = 1 - v;
  const idx = Math.round((1 - v) * (ramp.length - 1));
  return ramp[idx] ?? " ";
}

function trimGrid(g: string[][]): string[][] {
  let top = 0;
  let bot = g.length - 1;
  const empty = (r: number) => g[r].every((c) => c === " ");
  while (top < bot && empty(top)) top++;
  while (bot > top && empty(bot)) bot--;
  const trimmed = g.slice(top, bot + 1);
  return trimmed.length ? trimmed : [[" "]];
}

function rasterToGrid(
  getPixels: (cols: number, rows: number) => Uint8ClampedArray,
  srcW: number,
  srcH: number,
  opts: Pick<StudioState, "width" | "charset" | "contrast" | "threshold" | "invert">,
): string[][] {
  const { width, charset, contrast, threshold, invert } = opts;
  const charAspect = 0.5;
  let rows = Math.max(1, Math.round(width * (srcH / srcW) * charAspect));
  rows = Math.min(rows, 200);
  const ramp = RAMPS[charset];
  const px = getPixels(width, rows);
  const g: string[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: string[] = [];
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const a = (px[i + 3] ?? 255) / 255;
      const lum =
        (0.299 * (px[i] ?? 0) + 0.587 * (px[i + 1] ?? 0) + 0.114 * (px[i + 2] ?? 0)) / 255;
      const l = lum * a + (1 - a);
      row.push(a < 0.06 ? " " : lumaToChar(l, ramp, contrast, threshold, invert));
    }
    g.push(row);
  }
  return trimGrid(g);
}

function genFromTextSync(
  textInput: string,
  fontId: FontId,
  opts: Pick<StudioState, "width" | "charset" | "contrast" | "threshold" | "invert">,
): string[][] {
  if (!textInput.trim()) return [];
  const f = FONT_DEFS[fontId];
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  if (!ctx) return [];
  const fs = 140;
  ctx.font = `${f.weight} ${fs}px ${f.family}`;
  const lines = textInput.split("\n");
  let w = 10;
  for (const l of lines) w = Math.max(w, ctx.measureText(l).width);
  const lh = fs * 1.12;
  c.width = Math.ceil(w + fs * 0.3);
  c.height = Math.ceil(lh * lines.length + fs * 0.3);
  const x = c.getContext("2d");
  if (!x) return [];
  x.fillStyle = "#fff";
  x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = "#000";
  x.textBaseline = "top";
  x.font = `${f.weight} ${fs}px ${f.family}`;
  for (let i = 0; i < lines.length; i++) {
    x.fillText(lines[i] ?? "", fs * 0.15, fs * 0.15 + i * lh);
  }
  return rasterToGrid(
    (cols, rows) => {
      const t = document.createElement("canvas");
      t.width = cols;
      t.height = rows;
      const tc = t.getContext("2d");
      if (!tc) return new Uint8ClampedArray(cols * rows * 4);
      tc.imageSmoothingEnabled = true;
      tc.drawImage(c, 0, 0, cols, rows);
      return tc.getImageData(0, 0, cols, rows).data;
    },
    c.width,
    c.height,
    opts,
  );
}

function genFromImageSync(
  img: HTMLImageElement,
  opts: Pick<StudioState, "width" | "charset" | "contrast" | "threshold" | "invert">,
): string[][] {
  return rasterToGrid(
    (cols, rows) => {
      const t = document.createElement("canvas");
      t.width = cols;
      t.height = rows;
      const tc = t.getContext("2d");
      if (!tc) return new Uint8ClampedArray(cols * rows * 4);
      tc.imageSmoothingEnabled = true;
      tc.drawImage(img, 0, 0, cols, rows);
      return tc.getImageData(0, 0, cols, rows).data;
    },
    img.width,
    img.height,
    opts,
  );
}

function finalizeGrid(rawGrid: string[][]): Pick<StudioState, "grid" | "cols" | "rows"> {
  if (!rawGrid.length) return { grid: [], cols: 0, rows: 0 };
  const cols = Math.max(...rawGrid.map((r) => r.length));
  const grid = rawGrid.map((r) => {
    while (r.length < cols) r.push(" ");
    return r;
  });
  return { grid, cols, rows: grid.length };
}

function snapshot(grid: string[][]): string[] {
  return grid.map((r) => r.join(""));
}

function restoreSnapshot(snap: string[]): Pick<StudioState, "grid" | "cols" | "rows"> {
  const grid = snap.map((l) => l.split(""));
  const cols = Math.max(1, ...grid.map((r) => r.length));
  const padded = grid.map((r) => {
    while (r.length < cols) r.push(" ");
    return r;
  });
  return { grid: padded, cols, rows: padded.length };
}

// ── Provider hook ─────────────────────────────────────────────────────

export function useStudioProvider(): StudioCtx {
  const [s, setS] = useState<StudioState>(INITIAL);
  const sRef = useRef<StudioState>(s);
  sRef.current = s;

  const cellRef = useRef({ W: 8, H: 16.52 });
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const patch = useCallback((update: Partial<StudioState>) => {
    setS((prev) => ({ ...prev, ...update }));
  }, []);

  // Measure cell dimensions from DOM (JetBrains Mono at current zoom)
  const remeasure = useCallback(() => {
    if (typeof document === "undefined") return;
    const probe = document.createElement("span");
    probe.style.cssText =
      "position:absolute;visibility:hidden;font-family:var(--f-mono,'JetBrains Mono',monospace);white-space:pre";
    probe.style.fontSize = `${14 * sRef.current.zoom}px`;
    probe.textContent = "0".repeat(10);
    document.body.appendChild(probe);
    const w = probe.getBoundingClientRect().width / 10;
    probe.remove();
    cellRef.current = { W: w, H: 14 * sRef.current.zoom * 1.18 };
  }, []);

  // Re-measure when zoom changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: s.zoom is needed to trigger re-measure when zoom changes
  useEffect(() => {
    remeasure();
  }, [s.zoom, remeasure]);

  const showToast = useCallback(
    (msg: string) => {
      patch({ toast: { msg, visible: true } });
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => {
        patch({ toast: { msg: "", visible: false } });
      }, 1900);
    },
    [patch],
  );

  const pushHist = useCallback((reset = false) => {
    setS((prev) => {
      const snap = snapshot(prev.grid);
      let hist = reset ? [] : prev.hist.slice(0, prev.hpos + 1);
      hist = [...hist, snap];
      if (hist.length > HIST_MAX) hist = hist.slice(hist.length - HIST_MAX);
      return { ...prev, hist, hpos: hist.length - 1 };
    });
  }, []);

  const undo = useCallback(() => {
    setS((prev) => {
      if (prev.hpos <= 0) return prev;
      const hpos = prev.hpos - 1;
      const restored = restoreSnapshot(prev.hist[hpos] ?? []);
      return { ...prev, ...restored, hpos };
    });
  }, []);

  const redo = useCallback(() => {
    setS((prev) => {
      if (prev.hpos >= prev.hist.length - 1) return prev;
      const hpos = prev.hpos + 1;
      const restored = restoreSnapshot(prev.hist[hpos] ?? []);
      return { ...prev, ...restored, hpos };
    });
  }, []);

  const setCell = useCallback((x: number, y: number, ch: string) => {
    setS((prev) => {
      if (y < 0 || y >= prev.rows || x < 0 || x >= prev.cols) return prev;
      const grid = prev.grid.map((row, ry) =>
        ry === y ? row.map((c, cx) => (cx === x ? ch : c)) : row,
      );
      return { ...prev, grid };
    });
  }, []);

  const setCells = useCallback((cells: Array<[number, number, string]>) => {
    setS((prev) => {
      const grid = prev.grid.map((r) => [...r]);
      for (const [x, y, ch] of cells) {
        if (y >= 0 && y < prev.rows && x >= 0 && x < prev.cols) {
          (grid[y] as string[])[x] = ch;
        }
      }
      return { ...prev, grid };
    });
  }, []);

  const floodFill = useCallback((x: number, y: number, ch: string) => {
    setS((prev) => {
      const target = prev.grid[y]?.[x];
      if (target === undefined || target === ch) return prev;
      const grid = prev.grid.map((r) => [...r]);
      const stack: [number, number][] = [[x, y]];
      while (stack.length) {
        const top = stack.pop();
        if (!top) break;
        const [cx, cy] = top;
        if (cx < 0 || cy < 0 || cx >= prev.cols || cy >= prev.rows) continue;
        if ((grid[cy] as string[])[cx] !== target) continue;
        (grid[cy] as string[])[cx] = ch;
        stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
      return { ...prev, grid };
    });
  }, []);

  const findReplace = useCallback((find: string, replace: string): number => {
    let count = 0;
    setS((prev) => {
      const grid = prev.grid.map((r) => [...r]);
      for (let ry = 0; ry < grid.length; ry++) {
        for (let cx = 0; cx < (grid[ry]?.length ?? 0); cx++) {
          if ((grid[ry] as string[])[cx] === find) {
            (grid[ry] as string[])[cx] = replace;
            count++;
          }
        }
      }
      return { ...prev, grid };
    });
    return count;
  }, []);

  const regen = useCallback(() => {
    const cur = sRef.current;
    const genOpts = {
      width: cur.width,
      charset: cur.charset,
      contrast: cur.contrast,
      threshold: cur.threshold,
      invert: cur.invert,
    };
    if (cur.mode === "text") {
      const rawGrid = genFromTextSync(cur.textInput, cur.font, genOpts);
      const result = finalizeGrid(rawGrid);
      setS((prev) => {
        const snap = snapshot(result.grid);
        return {
          ...prev,
          ...result,
          sel: null,
          cursor: null,
          caret: null,
          hist: [snap],
          hpos: 0,
        };
      });
    } else if (cur.image) {
      const rawGrid = genFromImageSync(cur.image, genOpts);
      const result = finalizeGrid(rawGrid);
      setS((prev) => {
        const snap = snapshot(result.grid);
        return {
          ...prev,
          ...result,
          sel: null,
          cursor: null,
          caret: null,
          hist: [snap],
          hpos: 0,
        };
      });
    }
  }, []);

  const setTool = useCallback(
    (t: Tool) => {
      patch({
        tool: t,
        sel: t !== "select" ? null : sRef.current.sel,
        caret: t !== "text" ? null : sRef.current.caret,
      });
    },
    [patch],
  );

  const setChar = useCallback(
    (ch: string) => {
      patch({ char: ch });
    },
    [patch],
  );

  const setZoom = useCallback(
    (z: number) => {
      const clamped = Math.max(0.5, Math.min(4, Math.round(z * 4) / 4));
      patch({ zoom: clamped });
    },
    [patch],
  );

  const openDeploy = useCallback(() => {
    if (!sRef.current.grid.length) {
      showToast("先にアートを生成してください");
      return;
    }
    patch({ isDeployOpen: true });
  }, [patch, showToast]);

  const closeDeploy = useCallback(() => {
    patch({ isDeployOpen: false });
  }, [patch]);

  const clearCanvas = useCallback(() => {
    setS((prev) => ({
      ...prev,
      grid: [],
      cols: 0,
      rows: 0,
      image: null,
      sel: null,
      caret: null,
      textInput: "",
      hist: [],
      hpos: -1,
    }));
  }, []);

  // Debounce text regen
  // biome-ignore lint/correctness/useExhaustiveDependencies: sRef is a stable ref, timerRef is imperative
  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (sRef.current.mode === "text") regen();
    }, 150);
  }, [s.textInput, s.font, s.width, regen]);

  // Debounce image regen
  // biome-ignore lint/correctness/useExhaustiveDependencies: sRef is a stable ref, timerRef is imperative
  useEffect(() => {
    if (s.mode !== "image" || !s.image) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (sRef.current.mode === "image") regen();
    }, 150);
  }, [s.mode, s.image, s.charset, s.contrast, s.threshold, s.invert, s.width, regen]);

  // Initial text generation on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-time init
  useEffect(() => {
    remeasure();
    regen();
  }, []);

  // Keyboard bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const cur = sRef.current;
      const typingField =
        e.target instanceof HTMLElement &&
        /INPUT|TEXTAREA/.test(e.target.tagName) &&
        (e.target as HTMLInputElement).id !== "charChip";

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (typingField) return;

      // Text tool typing
      if (cur.tool === "text" && cur.caret && !e.ctrlKey && !e.metaKey) {
        if (e.key.length === 1) {
          const { x, y } = cur.caret;
          setCell(x, y, e.key);
          const newX = Math.min(cur.cols - 1, x + 1);
          patch({ caret: { x: newX, y } });
          pushHist();
          e.preventDefault();
          return;
        }
        if (e.key === "Backspace") {
          const newX = Math.max(0, cur.caret.x - 1);
          setCell(newX, cur.caret.y, " ");
          patch({ caret: { x: newX, y: cur.caret.y } });
          pushHist();
          e.preventDefault();
          return;
        }
        if (e.key === "Enter") {
          const newY = Math.min(cur.rows - 1, cur.caret.y + 1);
          patch({ caret: { x: cur.caret.x, y: newY } });
          e.preventDefault();
          return;
        }
        if (e.key === "ArrowLeft") {
          patch({ caret: { x: Math.max(0, cur.caret.x - 1), y: cur.caret.y } });
          e.preventDefault();
          return;
        }
        if (e.key === "ArrowRight") {
          patch({ caret: { x: Math.min(cur.cols - 1, cur.caret.x + 1), y: cur.caret.y } });
          e.preventDefault();
          return;
        }
        if (e.key === "ArrowUp") {
          patch({ caret: { x: cur.caret.x, y: Math.max(0, cur.caret.y - 1) } });
          e.preventDefault();
          return;
        }
        if (e.key === "ArrowDown") {
          patch({ caret: { x: cur.caret.x, y: Math.min(cur.rows - 1, cur.caret.y + 1) } });
          e.preventDefault();
          return;
        }
        if (e.key === "Escape") {
          patch({ caret: null });
          setTool("select");
          return;
        }
      }

      // Select tool delete
      if (cur.tool === "select" && cur.sel && (e.key === "Delete" || e.key === "Backspace")) {
        const { x0, y0, x1, y1 } = normSel(cur.sel);
        const cells: Array<[number, number, string]> = [];
        for (let ry = y0; ry <= y1; ry++) {
          for (let cx = x0; cx <= x1; cx++) cells.push([cx, ry, " "]);
        }
        setCells(cells);
        pushHist();
        e.preventDefault();
        return;
      }

      // Tool hotkeys
      if (!cur.grid.length) return;
      const map: Record<string, Tool> = {
        v: "select",
        b: "pencil",
        e: "eraser",
        g: "fill",
        t: "text",
      };
      const t = map[e.key.toLowerCase()];
      if (t) setTool(t);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, setCell, setCells, pushHist, setTool, patch]);

  return {
    ...s,
    sRef,
    cellRef,
    patch,
    setTool,
    setChar,
    setZoom,
    regen,
    setCell,
    setCells,
    floodFill,
    pushHist,
    undo,
    redo,
    showToast,
    openDeploy,
    closeDeploy,
    clearCanvas,
    findReplace,
  };
}

export function normSel(sel: Sel): { x0: number; y0: number; x1: number; y1: number } {
  return {
    x0: Math.min(sel.x0, sel.x1),
    y0: Math.min(sel.y0, sel.y1),
    x1: Math.max(sel.x0, sel.x1),
    y1: Math.max(sel.y0, sel.y1),
  };
}
