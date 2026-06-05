export const SmushMode = {
  EQUAL_CHAR: 1,
  UNDERSCORE: 2,
  HIERARCHY: 4,
  OPPOSITE_PAIR: 8,
  BIG_X: 16,
  HARDBLANK: 32,
} as const;

export interface FigFontHeader {
  hardblank: string;
  height: number;
  baseline: number;
  maxWidth: number;
  /** negative = full-width, 0 = kerning, positive = smushing bitmask */
  oldLayout: number;
  commentLines: number;
  printDirection?: number;
  fullLayout?: number;
  codetagCount?: number;
}

export interface FigChar {
  /** Height-many strings; hardblank character is preserved */
  rows: string[];
  /** max(row.length) after endmark stripping */
  width: number;
}

export interface FigFont {
  header: FigFontHeader;
  /** key = the character itself (String.fromCodePoint) */
  chars: Map<string, FigChar>;
}
