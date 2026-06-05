"use client";

import { type AsciiGrid, type AvailableFontName, generateText } from "@textil/core";
import { useEffect, useRef, useState } from "react";

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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Font and width changes are immediate; text is debounced 150 ms.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setResult({ grid: null, error: null });
      return;
    }

    debounceRef.current = setTimeout(() => {
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

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, font, width]);

  return result;
}
