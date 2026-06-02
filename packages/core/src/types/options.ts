export interface GenerateOptions {
  font?: string;
  width?: number;
  charset?: string;
  contrast?: number;
  threshold?: number;
  edgeDetect?: boolean;
}

export type ExportTarget = "plain" | "github" | "ansi" | "json";
