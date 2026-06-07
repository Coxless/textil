import type { RGBColor } from "./grid.js";

export interface GenerateOptions {
  font?: string;
  width?: number;
  charset?: string;
  contrast?: number;
  threshold?: number;
  edgeDetect?: boolean;
  colorMode?: "color" | "mono";
  color?: RGBColor;
}

export type ExportTarget = "plain" | "github" | "ansi" | "json";

export interface ExportResult {
  output: string;
  warnings: string[];
}

export type ExportColorSupport = Record<ExportTarget, boolean>;
