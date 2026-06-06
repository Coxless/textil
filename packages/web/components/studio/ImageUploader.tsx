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

  const handleFile = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      setThumbnailUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
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
    if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    setThumbnailUrl(null);
    if (inputRef.current) inputRef.current.value = "";
    onClear();
  }, [thumbnailUrl, onClear]);

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Image</p>
      {thumbnailUrl ? (
        <div className="relative overflow-hidden rounded-md border border-zinc-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnailUrl} alt="Uploaded preview" className="w-full object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-1.5 top-1.5 rounded bg-zinc-900/80 px-1.5 py-0.5 text-xs text-zinc-300 hover:bg-zinc-900"
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
          className={`flex h-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed transition-colors ${
            isDragActive
              ? "border-zinc-400 bg-zinc-800"
              : "border-zinc-700 bg-zinc-800/50 hover:border-zinc-600"
          }`}
        >
          <span className="text-xs text-zinc-400">Drop image or click to upload</span>
          <span className="text-[10px] text-zinc-600">PNG, JPG, WebP, GIF</span>
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
