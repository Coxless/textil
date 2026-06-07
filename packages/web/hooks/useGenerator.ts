"use client";

import { type AsciiGrid, type AvailableFontName, type RGBColor, generateText } from "@textil/core";
import { useEffect, useState } from "react";

interface GeneratorResult {
  grid: AsciiGrid | null;
  error: string | null;
  isLoading: boolean;
}

export function useGenerator(
  text: string,
  font: AvailableFontName,
  width: number,
  color?: RGBColor,
): GeneratorResult {
  const [result, setResult] = useState<GeneratorResult>({
    grid: null,
    error: null,
    isLoading: false,
  });

  useEffect(() => {
    if (!text.trim()) {
      setResult({ grid: null, error: null, isLoading: false });
      return;
    }

    const id = setTimeout(() => {
      try {
        const grid = generateText(text, { font, width, color });
        setResult({ grid, error: null, isLoading: false });
      } catch (err) {
        setResult({
          grid: null,
          error: err instanceof Error ? err.message : String(err),
          isLoading: false,
        });
      }
    }, 150);

    return () => clearTimeout(id);
  }, [text, font, width, color]);

  return result;
}
