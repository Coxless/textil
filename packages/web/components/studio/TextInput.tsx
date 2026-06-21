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
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: "var(--fg-3)" }}
      >
        Text
      </label>
      <textarea
        id="studio-text-input"
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full resize-none rounded-md px-3 py-2 font-mono text-sm focus:outline-none"
        style={{
          border: "1px solid var(--bd-2)",
          background: "var(--surf-2)",
          color: "var(--fg)",
        }}
        placeholder="Enter text…"
      />
    </div>
  );
}
