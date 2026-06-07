"use client";

import { GridEditor } from "@textil/core";
import type { AsciiGrid, Cell, Rect } from "@textil/core";
import { useCallback, useRef, useState } from "react";

export interface UseGridEditorResult {
  grid: AsciiGrid;
  setRegion: (rect: Rect, cells: Cell[][]) => void;
  fill: (rect: Rect, char: Cell) => void;
  textInsert: (row: number, col: number, text: string) => void;
  copyRegion: (srcRect: Rect, dstRow: number, dstCol: number) => void;
  moveRegion: (srcRect: Rect, dstRow: number, dstCol: number) => void;
  deleteRegion: (rect: Rect) => void;
  findReplace: (find: string, replace: string) => number;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  resetToGrid: (grid: AsciiGrid) => void;
}

function seedEditor(grid: AsciiGrid): GridEditor {
  return new GridEditor(grid.width, grid.height, grid.cells);
}

export function useGridEditor(initialGrid: AsciiGrid): UseGridEditorResult {
  // useRef's initial value is only used on first render; subsequent renders discard it.
  // Typed as GridEditor (non-nullable) so callbacks need no null checks or assertions.
  const editorRef = useRef(seedEditor(initialGrid));
  const [, setVersion] = useState(0);
  const bumpVersion = useCallback(() => setVersion((v) => v + 1), []);

  const setRegion = useCallback(
    (rect: Rect, cells: Cell[][]) => {
      editorRef.current.setRegion(rect, cells);
      bumpVersion();
    },
    [bumpVersion],
  );

  const fill = useCallback(
    (rect: Rect, char: Cell) => {
      editorRef.current.fill(rect, char);
      bumpVersion();
    },
    [bumpVersion],
  );

  const textInsert = useCallback(
    (row: number, col: number, text: string) => {
      editorRef.current.textInsert(row, col, text);
      bumpVersion();
    },
    [bumpVersion],
  );

  const copyRegion = useCallback(
    (srcRect: Rect, dstRow: number, dstCol: number) => {
      editorRef.current.copyRegion(srcRect, dstRow, dstCol);
      bumpVersion();
    },
    [bumpVersion],
  );

  const moveRegion = useCallback(
    (srcRect: Rect, dstRow: number, dstCol: number) => {
      editorRef.current.moveRegion(srcRect, dstRow, dstCol);
      bumpVersion();
    },
    [bumpVersion],
  );

  const deleteRegion = useCallback(
    (rect: Rect) => {
      editorRef.current.fill(rect, { char: " " });
      bumpVersion();
    },
    [bumpVersion],
  );

  const findReplace = useCallback(
    (find: string, replace: string): number => {
      const count = editorRef.current.findReplace(find, replace);
      if (count > 0) bumpVersion();
      return count;
    },
    [bumpVersion],
  );

  const undo = useCallback(() => {
    editorRef.current.undo();
    bumpVersion();
  }, [bumpVersion]);

  const redo = useCallback(() => {
    editorRef.current.redo();
    bumpVersion();
  }, [bumpVersion]);

  const resetToGrid = useCallback(
    (newGrid: AsciiGrid) => {
      editorRef.current = seedEditor(newGrid);
      bumpVersion();
    },
    [bumpVersion],
  );

  const editor = editorRef.current;
  return {
    grid: editor.toGrid(),
    setRegion,
    fill,
    textInsert,
    copyRegion,
    moveRegion,
    deleteRegion,
    findReplace,
    undo,
    redo,
    canUndo: editor.canUndo(),
    canRedo: editor.canRedo(),
    resetToGrid,
  };
}
