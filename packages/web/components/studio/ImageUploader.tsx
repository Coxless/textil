"use client";

import { useCallback, useRef, useState } from "react";

interface ImageUploaderProps {
  onImageLoad: (data: ArrayBuffer) => void;
  onClear: () => void;
}

export function ImageUploader({ onImageLoad, onClear }: ImageUploaderProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevUrlRef = useRef<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      const url = URL.createObjectURL(file);
      prevUrlRef.current = url;
      setThumbnailUrl(url);
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          onImageLoad(reader.result);
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [onImageLoad],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleClear = useCallback(() => {
    if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
    prevUrlRef.current = null;
    setThumbnailUrl(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  }, [onClear]);

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--fg-3)" }}>
        Image
      </p>
      {thumbnailUrl ? (
        <div
          className="relative overflow-hidden rounded-md"
          style={{ border: "1px solid var(--bd-2)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl} alt="Uploaded preview" className="w-full object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-1.5 top-1.5 rounded px-1.5 py-0.5 text-xs transition-colors"
            style={{ background: "var(--surf-ov)", color: "var(--fg-2)" }}
          >
            Remove
          </button>
        </div>
      ) : (
        <button
          type="button"
          data-testid="upload-dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragActive(true);
          }}
          onDragLeave={() => setIsDragActive(false)}
          onDrop={handleDrop}
          className="flex h-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed transition-colors"
          style={
            isDragActive
              ? { borderColor: "var(--fg-3)", background: "var(--surf-2)" }
              : { borderColor: "var(--bd-2)", background: "var(--surf-2)" }
          }
        >
          <span className="text-xs" style={{ color: "var(--fg-3)" }}>
            Drop image or click to upload
          </span>
          <span className="text-xs" style={{ color: "var(--fg-4)" }}>
            PNG, JPG, WebP, GIF
          </span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        data-testid="upload-input"
      />
    </div>
  );
}
