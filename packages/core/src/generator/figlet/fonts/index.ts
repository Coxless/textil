import { FONT_DATA as BANNER } from "./banner.js";
import { FONT_DATA as BIG } from "./big.js";
import { FONT_DATA as BLOCK } from "./block.js";
import { FONT_DATA as BUBBLE } from "./bubble.js";
import { FONT_DATA as DIGITAL } from "./digital.js";
import { FONT_DATA as DOOM } from "./doom.js";
import { FONT_DATA as LEAN } from "./lean.js";
import { FONT_DATA as MINI } from "./mini.js";
import { FONT_DATA as SHADOW } from "./shadow.js";
import { FONT_DATA as SLANT } from "./slant.js";
import { FONT_DATA as SMALL } from "./small.js";
// Font data sourced from the figlet npm package (MIT / FIGlet license).
// Fonts are bundled as string constants for isomorphic (browser + Node) use.
import { FONT_DATA as STANDARD } from "./standard.js";

export const DEFAULT_FONT = "standard" as const;

export const AVAILABLE_FONTS = [
  "standard",
  "doom",
  "slant",
  "banner",
  "big",
  "block",
  "bubble",
  "digital",
  "lean",
  "mini",
  "shadow",
  "small",
] as const;

export type AvailableFontName = (typeof AVAILABLE_FONTS)[number];

export const FONTS: Record<string, string> = {
  standard: STANDARD,
  doom: DOOM,
  slant: SLANT,
  banner: BANNER,
  big: BIG,
  block: BLOCK,
  bubble: BUBBLE,
  digital: DIGITAL,
  lean: LEAN,
  mini: MINI,
  shadow: SHADOW,
  small: SMALL,
};
