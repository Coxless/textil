import { describe, expect, it } from "vitest";
import { smushColumns } from "../../generator/figlet/smusher.js";
import { SmushMode } from "../../generator/figlet/types.js";

const ALL_RULES =
  SmushMode.EQUAL_CHAR |
  SmushMode.UNDERSCORE |
  SmushMode.HIERARCHY |
  SmushMode.OPPOSITE_PAIR |
  SmushMode.BIG_X |
  SmushMode.HARDBLANK;

function col(ch: string): string[] {
  return [ch];
}

describe("smushColumns", () => {
  it("space on left: right character wins", () => {
    expect(smushColumns(col(" "), col("X"), "$", ALL_RULES)).toEqual(["X"]);
  });

  it("space on right: left character wins", () => {
    expect(smushColumns(col("X"), col(" "), "$", ALL_RULES)).toEqual(["X"]);
  });

  it("equal char rule (bit 1): same non-space char merges", () => {
    expect(smushColumns(col("X"), col("X"), "$", SmushMode.EQUAL_CHAR)).toEqual(["X"]);
  });

  it("equal char rule: different chars do not merge", () => {
    expect(smushColumns(col("X"), col("Y"), "$", SmushMode.EQUAL_CHAR)).toBeNull();
  });

  it("underscore rule (bit 2): _ is overwritten by hierarchy char", () => {
    expect(smushColumns(col("_"), col("|"), "$", SmushMode.UNDERSCORE)).toEqual(["|"]);
    expect(smushColumns(col("|"), col("_"), "$", SmushMode.UNDERSCORE)).toEqual(["|"]);
  });

  it("underscore rule: _ does not overwrite non-hierarchy char", () => {
    expect(smushColumns(col("_"), col("A"), "$", SmushMode.UNDERSCORE)).toBeNull();
  });

  it("hierarchy rule (bit 4): higher-class char wins", () => {
    // | (class 0) vs / (class 1) → /
    expect(smushColumns(col("|"), col("/"), "$", SmushMode.HIERARCHY)).toEqual(["/"]);
    expect(smushColumns(col("/"), col("|"), "$", SmushMode.HIERARCHY)).toEqual(["/"]);
  });

  it("hierarchy rule: same class does not merge", () => {
    // | vs | handled by equal char, not hierarchy
    expect(smushColumns(col("|"), col("|"), "$", SmushMode.HIERARCHY)).toBeNull();
  });

  it("opposite pair rule (bit 8): [] → |", () => {
    expect(smushColumns(col("["), col("]"), "$", SmushMode.OPPOSITE_PAIR)).toEqual(["|"]);
    expect(smushColumns(col("]"), col("["), "$", SmushMode.OPPOSITE_PAIR)).toEqual(["|"]);
  });

  it("opposite pair rule: {} → |", () => {
    expect(smushColumns(col("{"), col("}"), "$", SmushMode.OPPOSITE_PAIR)).toEqual(["|"]);
  });

  it("opposite pair rule: () → |", () => {
    expect(smushColumns(col("("), col(")"), "$", SmushMode.OPPOSITE_PAIR)).toEqual(["|"]);
  });

  it("big-X rule (bit 16): /\\ → X", () => {
    expect(smushColumns(col("/"), col("\\"), "$", SmushMode.BIG_X)).toEqual(["X"]);
    expect(smushColumns(col("\\"), col("/"), "$", SmushMode.BIG_X)).toEqual(["X"]);
  });

  it("big-X rule: >< → X", () => {
    expect(smushColumns(col(">"), col("<"), "$", SmushMode.BIG_X)).toEqual(["X"]);
  });

  it("hardblank rule (bit 32): two hardblanks merge to hardblank", () => {
    expect(smushColumns(col("$"), col("$"), "$", SmushMode.HARDBLANK)).toEqual(["$"]);
  });

  it("hardblank + non-hardblank fails when hardblank smush off", () => {
    expect(smushColumns(col("$"), col("X"), "$", SmushMode.EQUAL_CHAR)).toBeNull();
  });

  it("no matching rule returns null", () => {
    expect(smushColumns(col("A"), col("B"), "$", 0)).toBeNull();
  });

  it("all rows must succeed for column smush to succeed", () => {
    // First row: space (passes), second row: A vs B (fails)
    const left = [" ", "A"];
    const right = ["X", "B"];
    expect(smushColumns(left, right, "$", SmushMode.EQUAL_CHAR)).toBeNull();
  });

  it("multi-row smush succeeds when all pairs pass", () => {
    const left = [" ", "X"];
    const right = ["Y", "X"];
    const result = smushColumns(left, right, "$", SmushMode.EQUAL_CHAR);
    expect(result).toEqual(["Y", "X"]);
  });
});
