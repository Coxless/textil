"use client";

import { type AsciiGrid, type AvailableFontName, generateText } from "@textil/core";
import { useEffect, useState } from "react";

interface GeneratorResult {
  grid: AsciiGrid | null;
  error: string | null;
}

export function useGenerator(
  text: string,
  font: AvailableFontName,
  width: number,
): GeneratorResult {
  const [result, setResult] = useState<GeneratorResult>({
    grid: null,
    error: null,
  });

  useEffect(() => {
    if (!text.trim()) {
      setResult({ grid: null, error: null });
      return;
    }

    const id = setTimeout(() => {
      try {
        const grid = generateText(text, { font, width });
        setResult({ grid, error: null });
      } catch (err) {
        setResult({
          grid: null,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }, 150);

    return () => clearTimeout(id);
  }, [text, font, width]);

  return result;
}
