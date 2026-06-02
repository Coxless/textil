import { describe, expect, it, vi } from "vitest";
import { History } from "../../editor/History.js";
import type { Command } from "../../editor/History.js";

function makeCommand(label: string, log: string[]): Command {
  return {
    execute: () => log.push(`exec:${label}`),
    undo: () => log.push(`undo:${label}`),
  };
}

describe("History", () => {
  it("executes command on push", () => {
    const history = new History();
    const log: string[] = [];
    history.push(makeCommand("A", log));
    expect(log).toEqual(["exec:A"]);
  });

  it("undoes the last command", () => {
    const history = new History();
    const log: string[] = [];
    history.push(makeCommand("A", log));
    history.push(makeCommand("B", log));
    expect(history.undo()).toBe(true);
    expect(log).toEqual(["exec:A", "exec:B", "undo:B"]);
  });

  it("redoes after undo", () => {
    const history = new History();
    const log: string[] = [];
    history.push(makeCommand("A", log));
    history.undo();
    expect(history.redo()).toBe(true);
    expect(log).toContain("exec:A");
  });

  it("returns false when nothing to undo", () => {
    const history = new History();
    expect(history.undo()).toBe(false);
  });

  it("returns false when nothing to redo", () => {
    const history = new History();
    const log: string[] = [];
    history.push(makeCommand("A", log));
    expect(history.redo()).toBe(false);
  });

  it("clears redo stack on new push after undo", () => {
    const history = new History();
    const log: string[] = [];
    history.push(makeCommand("A", log));
    history.push(makeCommand("B", log));
    history.undo();
    history.push(makeCommand("C", log));
    expect(history.canRedo()).toBe(false);
  });

  it("drops oldest command when exceeding 100 steps", () => {
    const history = new History();
    const executed: number[] = [];
    const undone: number[] = [];

    for (let i = 0; i < 101; i++) {
      const id = i;
      history.push({
        execute: () => executed.push(id),
        undo: () => undone.push(id),
      });
    }

    // 100 undos should be possible (oldest i=0 was dropped)
    let undoCount = 0;
    while (history.undo()) undoCount++;
    expect(undoCount).toBe(100);
    expect(undone).not.toContain(0); // command 0 was dropped
    expect(undone).toContain(1);
  });

  it("canUndo and canRedo reflect state correctly", () => {
    const history = new History();
    const log: string[] = [];
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
    history.push(makeCommand("A", log));
    expect(history.canUndo()).toBe(true);
    expect(history.canRedo()).toBe(false);
    history.undo();
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(true);
  });

  it("clear resets state", () => {
    const history = new History();
    const log: string[] = [];
    history.push(makeCommand("A", log));
    history.clear();
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });
});
