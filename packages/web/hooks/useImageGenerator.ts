"use client";

import { type AsciiGrid, generateImage } from "@textil/core";
import { useEffect, useState } from "react";

interface ImageGeneratorResult {
  grid: AsciiGrid | null;
  error: string | null;
  isLoading: boolean;
}

export function useImageGenerator(
  imageData: ArrayBuffer | null,
  charset: string,
  contrast: number,
  threshold: number,
  width: number,
): ImageGeneratorResult {
  const [result, setResult] = useState<ImageGeneratorResult>({
    grid: null,
    error: null,
    isLoading: false,
  });

  useEffect(() => {
    if (!imageData) {
      setResult({ grid: null, error: null, isLoading: false });
      return;
    }

    setResult((prev) => ({ ...prev, isLoading: true }));
    let cancelled = false;

    const id = setTimeout(() => {
      generateImage(imageData, { charset, contrast, threshold, width })
        .then((grid) => {
          if (!cancelled) setResult({ grid, error: null, isLoading: false });
        })
        .catch((err) => {
          if (!cancelled)
            setResult((prev) => ({
              ...prev,
              error: err instanceof Error ? err.message : String(err),
              isLoading: false,
            }));
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [imageData, charset, contrast, threshold, width]);

  return result;
}
