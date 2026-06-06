"use client";

import type { AsciiGrid, Cell, Rect } from "@textil/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { useGridEditor } from "@/hooks/useGridEditor";
import { FindReplacePanel } from "./FindReplacePanel";
import { GridCanvas } from "./GridCanvas";
import type { EditorTool } from "./Toolbar";
import { Toolbar } from "./Toolbar";
import { ZoomControl } from "./ZoomControl";

interface GridEditorPanelProps {
  initialGrid: AsciiGrid;
  onExitEdit: () => void;
}

function cellInRect(row: number, col: number, rect: Rect): boolean {
  return (
    row >= rect.row &&
    row < rect.row + rect.height &&
    col >= rect.col &&
    col < rect.col + rect.width
  );
}

function normalizeRect(r1: number, c1: number, r2: number, c2: number): Rect {
  return {
    row: Math.min(r1, r2),
    col: Math.min(c1, c2),
    height: Math.abs(r2 - r1) + 1,
    width: Math.abs(c2 - c1) + 1,
  };
}

export function GridEditorPanel({ initialGrid, onExitEdit }: GridEditorPanelProps) {
  const { grid, setRegion, textInsert, moveRegion, deleteRegion, findReplace, undo, redo, canUndo, canRedo } =
    useGridEditor(initialGrid);

  const [tool, setTool] = useState<EditorTool>("pencil");
  const [zoom, setZoom] = useState(100);
  const [penChar, setPenChar] = useState("*");
  const [findReplaceOpen, setFindReplaceOpen] = useState(false);
  const [cursor, setCursor] = useState<{ row: number; col: number } | null>(null);
  const [selection, setSelection] = useState<Rect | null>(null);
  const [selectionInProgress, setSelectionInProgress] = useState<Rect | null>(null);
  const [movePreviewRect, setMovePreviewRect] = useState<Rect | null>(null);

  // Drag state — refs to avoid stale closures in event handlers
  const isPaintingRef = useRef(false);
  const pendingPaintMapRef = useRef(new Map<string, Cell>());
  const [paintVersion, setPaintVersion] = useState(0);
  const selectionStartRef = useRef<{ row: number; col: number } | null>(null);
  const isMoveRef = useRef(false);
  const moveStartRef = useRef<{ row: number; col: number } | null>(null);
  const currentPosRef = useRef<{ row: number; col: number } | null>(null);

  // Latest-value refs for keyboard handler (avoids stale closures)
  const toolRef = useRef(tool);
  toolRef.current = tool;
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const gridRef = useRef(grid);
  gridRef.current = grid;

  const bumpPaint = () => setPaintVersion((v) => v + 1);

  const changeTool = useCallback((t: EditorTool) => {
    setTool(t);
    setCursor(null);
    setSelection(null);
    setSelectionInProgress(null);
    setMovePreviewRect(null);
    isPaintingRef.current = false;
    pendingPaintMapRef.current.clear();
    isMoveRef.current = false;
    selectionStartRef.current = null;
  }, []);

  // Global keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
        return;
      }

      const currentTool = toolRef.current;
      const currentCursor = cursorRef.current;
      const inTextMode = currentTool === "text" && currentCursor !== null;

      if (!inTextMode) {
        if (e.key === "p") { changeTool("pencil"); return; }
        if (e.key === "e") { changeTool("eraser"); return; }
        if (e.key === "s") { changeTool("select"); return; }
        if (e.key === "t") { setTool("text"); return; }
      }

      if (currentTool === "text" && currentCursor !== null) {
        if (e.key === "Escape") { setCursor(null); return; }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          setCursor((c) => c && { row: c.row, col: Math.min(c.col + 1, gridRef.current.width - 1) });
          return;
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          setCursor((c) => c && { row: c.row, col: Math.max(c.col - 1, 0) });
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setCursor((c) => c && { row: Math.min(c.row + 1, gridRef.current.height - 1), col: c.col });
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setCursor((c) => c && { row: Math.max(c.row - 1, 0), col: c.col });
          return;
        }
        if (e.key === "Enter") {
          setCursor((c) => c && { row: Math.min(c.row + 1, gridRef.current.height - 1), col: 0 });
          return;
        }
        if (e.key === "Tab") {
          e.preventDefault();
          setCursor((c) => c && { row: c.row, col: Math.min(c.col + 4, gridRef.current.width - 1) });
          return;
        }
        if (e.key === "Backspace") {
          e.preventDefault();
          const newCol = Math.max(currentCursor.col - 1, 0);
          setRegion({ row: currentCursor.row, col: newCol, width: 1, height: 1 }, [[" "]]);
          setCursor((c) => c && { ...c, col: newCol });
          return;
        }
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          textInsert(currentCursor.row, currentCursor.col, e.key);
          setCursor((c) => c && { row: c.row, col: Math.min(c.col + 1, gridRef.current.width - 1) });
          return;
        }
      }

      if (currentTool === "select" && selectionRef.current !== null) {
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          deleteRegion(selectionRef.current);
        }
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [undo, redo, changeTool, setRegion, textInsert, deleteRegion]);

  const handlePointerDown = useCallback(
    (row: number, col: number) => {
      currentPosRef.current = { row, col };

      if (tool === "pencil" || tool === "eraser") {
        isPaintingRef.current = true;
        pendingPaintMapRef.current.clear();
        pendingPaintMapRef.current.set(`${row},${col}`, tool === "pencil" ? penChar : " ");
        bumpPaint();
      } else if (tool === "select") {
        if (selection !== null && cellInRect(row, col, selection)) {
          isMoveRef.current = true;
          moveStartRef.current = { row, col };
        } else {
          isMoveRef.current = false;
          moveStartRef.current = null;
          selectionStartRef.current = { row, col };
          setSelectionInProgress({ row, col, width: 1, height: 1 });
          setSelection(null);
          setMovePreviewRect(null);
        }
      } else if (tool === "text") {
        setCursor({ row, col });
      }
    },
    [tool, penChar, selection],
  );

  const handlePointerEnter = useCallback(
    (row: number, col: number) => {
      currentPosRef.current = { row, col };

      if (tool === "pencil" || tool === "eraser") {
        if (!isPaintingRef.current) return;
        pendingPaintMapRef.current.set(`${row},${col}`, tool === "pencil" ? penChar : " ");
        bumpPaint();
      } else if (tool === "select") {
        if (isMoveRef.current && moveStartRef.current !== null && selection !== null) {
          const dr = row - moveStartRef.current.row;
          const dc = col - moveStartRef.current.col;
          const newRow = Math.max(0, Math.min(selection.row + dr, grid.height - selection.height));
          const newCol = Math.max(0, Math.min(selection.col + dc, grid.width - selection.width));
          setMovePreviewRect({ row: newRow, col: newCol, width: selection.width, height: selection.height });
        } else if (selectionStartRef.current !== null) {
          setSelectionInProgress(normalizeRect(selectionStartRef.current.row, selectionStartRef.current.col, row, col));
        }
      }
    },
    [tool, penChar, selection, grid.height, grid.width],
  );

  const handlePointerUp = useCallback(() => {
    if (tool === "pencil" || tool === "eraser") {
      if (!isPaintingRef.current) return;
      isPaintingRef.current = false;

      const batch = pendingPaintMapRef.current;
      if (batch.size === 0) return;

      let minRow = Infinity, minCol = Infinity, maxRow = -Infinity, maxCol = -Infinity;
      for (const key of batch.keys()) {
        const [r, c] = key.split(",").map(Number);
        if (r < minRow) minRow = r;
        if (r > maxRow) maxRow = r;
        if (c < minCol) minCol = c;
        if (c > maxCol) maxCol = c;
      }

      const rect: Rect = { row: minRow, col: minCol, height: maxRow - minRow + 1, width: maxCol - minCol + 1 };
      const regionCells: Cell[][] = [];
      for (let r = minRow; r <= maxRow; r++) {
        const row: Cell[] = [];
        for (let c = minCol; c <= maxCol; c++) {
          row.push(batch.get(`${r},${c}`) ?? grid.cells[r]?.[c] ?? " ");
        }
        regionCells.push(row);
      }

      setRegion(rect, regionCells);
      pendingPaintMapRef.current.clear();
      bumpPaint();
    } else if (tool === "select") {
      if (isMoveRef.current && moveStartRef.current !== null && selection !== null) {
        const pos = currentPosRef.current ?? moveStartRef.current;
        const dr = pos.row - moveStartRef.current.row;
        const dc = pos.col - moveStartRef.current.col;
        const newRow = Math.max(0, Math.min(selection.row + dr, grid.height - selection.height));
        const newCol = Math.max(0, Math.min(selection.col + dc, grid.width - selection.width));
        moveRegion(selection, newRow, newCol);
        setSelection({ ...selection, row: newRow, col: newCol });
        isMoveRef.current = false;
        moveStartRef.current = null;
        setMovePreviewRect(null);
      } else if (selectionStartRef.current !== null) {
        if (selectionInProgress !== null) {
          setSelection(selectionInProgress);
        }
        selectionStartRef.current = null;
        setSelectionInProgress(null);
      }
    }
  }, [tool, grid, setRegion, moveRegion, selection, selectionInProgress]);

  // During a move drag: hide original selection, show preview rect as selection-in-progress
  const displaySelection = isMoveRef.current ? null : selection;
  const displaySelectionInProgress = isMoveRef.current ? movePreviewRect : selectionInProgress;

  // Suppress unused variable warning for paintVersion (used only to trigger re-renders)
  void paintVersion;

  return (
    <div className="flex h-full flex-col">
      <Toolbar
        tool={tool}
        onToolChange={changeTool}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onExitEdit={onExitEdit}
        findReplaceOpen={findReplaceOpen}
        onToggleFindReplace={() => setFindReplaceOpen((o) => !o)}
        penChar={penChar}
        onPenCharChange={setPenChar}
      />
      {findReplaceOpen && (
        <FindReplacePanel
          onFindReplace={findReplace}
          onClose={() => setFindReplaceOpen(false)}
        />
      )}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <GridCanvas
            grid={grid}
            zoom={zoom}
            cursor={cursor}
            selection={displaySelection}
            selectionInProgress={displaySelectionInProgress}
            pendingPaint={pendingPaintMapRef.current}
            onPointerDown={handlePointerDown}
            onPointerEnter={handlePointerEnter}
            onPointerUp={handlePointerUp}
          />
        </div>
        <div className="w-48 shrink-0 border-l border-zinc-800 bg-zinc-900 p-4">
          <ZoomControl zoom={zoom} onChange={setZoom} />
        </div>
      </div>
    </div>
  );
}
