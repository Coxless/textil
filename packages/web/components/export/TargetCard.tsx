"use client";

import { useCallback, useState } from "react";

interface TargetCardProps {
  label: string;
  description: string;
  output?: string;
  getBlob?: () => Promise<Blob>;
  filename?: string;
  warnings?: string[];
}

export function TargetCard({
  label,
  description,
  output,
  getBlob,
  filename,
  warnings,
}: TargetCardProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "loading">("idle");

  const preview = output
    ? (() => {
        const lines = output.split("\n");
        return lines.slice(0, 5).join("\n") + (lines.length > 5 ? "\n…" : "");
      })()
    : null;

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = output;
      ta.style.cssText = "position:fixed;opacity:0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setStatus("copied");
    setTimeout(() => setStatus("idle"), 1500);
  }, [output]);

  const handleDownload = useCallback(async () => {
    setStatus("loading");
    try {
      let blob: Blob;
      if (getBlob) {
        blob = await getBlob();
      } else if (output) {
        blob = new Blob([output], { type: "text/plain" });
      } else {
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename ?? "export";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setStatus("idle");
    }
  }, [getBlob, output, filename]);

  const isDownload = !!getBlob || !!filename;

  return (
    <div
      className="flex flex-col gap-3 rounded-lg p-4"
      style={{ border: "1px solid var(--bd)", background: "var(--surf)" }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium" style={{ color: "var(--fg)" }}>
            {label}
          </div>
          <div className="mt-0.5 text-xs" style={{ color: "var(--fg-4)" }}>
            {description}
          </div>
        </div>
        {warnings && warnings.length > 0 && (
          <span className="shrink-0 rounded bg-amber-900/40 px-2 py-0.5 text-xs text-amber-400">
            ⚠ warning
          </span>
        )}
      </div>
      {warnings && warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((w) => (
            <p key={w} className="text-xs text-amber-400">
              {w}
            </p>
          ))}
        </div>
      )}
      {preview !== null && (
        <pre
          className="overflow-hidden rounded p-2 text-xs leading-tight"
          style={{ maxHeight: "5.5rem", background: "var(--bg)", color: "var(--fg-3)" }}
        >
          {preview}
        </pre>
      )}
      <button
        type="button"
        onClick={isDownload ? handleDownload : handleCopy}
        disabled={status === "loading"}
        className="mt-auto w-full rounded-md py-1.5 text-xs font-medium transition-colors disabled:opacity-50"
        style={{ background: "var(--surf-2)", color: "var(--fg-2)" }}
      >
        {status === "copied"
          ? "Copied!"
          : status === "loading"
            ? "Generating…"
            : isDownload
              ? "Download"
              : "Copy"}
      </button>
    </div>
  );
}
