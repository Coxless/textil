"use client";

import { useEffect, useRef } from "react";

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextInput({ value, onChange }: TextInputProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="studio-text-input"
        className="text-xs font-medium text-zinc-400 uppercase tracking-wider"
      >
        Text
      </label>
      <textarea
        id="studio-text-input"
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-zinc-100 placeholder-zinc-600 focus:border-zinc-500 focus:outline-none"
        placeholder="Enter text…"
      />
    </div>
  );
}
