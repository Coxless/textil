"use client";

import { type TargetId, useStudio } from "../state/useStudio";
import styles from "../studio.module.css";

interface TargetDef {
  id: TargetId;
  t: string;
  d: string;
  badge: string;
  icon: string;
}

const TARGETS: TargetDef[] = [
  {
    id: "github",
    t: "GitHub README",
    d: "```text フェンス付き Markdown",
    badge: ".md",
    icon: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 00-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0019 4.8 4.8 4.8 0 0018.9 1S17.7.6 15 2.5a13.4 13.4 0 00-7 0C5.3.6 4.1 1 4.1 1A4.8 4.8 0 004 4.8 5.2 5.2 0 002.7 8.4c0 5.2 3.2 6.4 6.2 6.7A3.4 3.4 0 008 17.6V21",
  },
  {
    id: "terminal",
    t: "Terminal / CLI",
    d: "echo ワンライナー",
    badge: ".sh",
    icon: "M3 4h18v16H3zM7 9l3 3-3 3M13 15h4",
  },
  {
    id: "discord",
    t: "Discord / Slack",
    d: "コードブロック・2000字チェック",
    badge: "txt",
    icon: "M18 5a16 16 0 00-4-1l-.3.5a14 14 0 014 1.3 13 13 0 00-11.4 0A14 14 0 0110.3 4.5L10 4a16 16 0 00-4 1C3 9 2.5 13 3 17a16 16 0 005 2l1-1.6a10 10 0 01-2-1l.5-.3a11 11 0 009 0l.5.3a10 10 0 01-2 1L16 19a16 16 0 005-2c.5-4.5-.5-8.5-3-12z",
  },
  {
    id: "png",
    t: "PNG image",
    d: "monospaceで画像化（X / SNS）",
    badge: ".png",
    icon: "M3 3h18v18H3zM8.5 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM21 15l-5-5L5 21",
  },
  {
    id: "react",
    t: "React component",
    d: "<pre> ラップの .tsx",
    badge: ".tsx",
    icon: "M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0M12 12m-10 0a10 4 0 1020 0 10 4 0 10-20 0",
  },
  {
    id: "plain",
    t: "Plain text",
    d: "そのままコピー / .txt",
    badge: ".txt",
    icon: "M4 7V5h16v2M9 19h6M12 5v14",
  },
];

function gridText(grid: string[][]): string {
  return grid.map((r) => r.join("").replace(/\s+$/, "")).join("\n");
}

function buildOutput(id: TargetId, grid: string[][]): string {
  const t = gridText(grid);
  switch (id) {
    case "github":
      return `\`\`\`text\n${t}\n\`\`\``;
    case "terminal":
      return `cat <<'EOF'\n${t}\nEOF`;
    case "discord":
      return `\`\`\`\n${t}\n\`\`\``;
    case "plain":
      return t;
    case "react":
      return `export function AsciiArt() {\n  return (\n    <pre style={{fontFamily:"monospace",lineHeight:1.1}}>\n{\`\n${t}\n\`}\n    </pre>\n  );\n}`;
    case "png":
      return t;
  }
}

function exportPng(grid: string[][], cols: number, rows: number) {
  const fs = 16;
  const pad = 24;
  const lh = fs * 1.12;
  const c = document.createElement("canvas");
  const ctx = c.getContext("2d");
  if (!ctx) return;
  ctx.font = `${fs}px "JetBrains Mono",monospace`;
  const cw = ctx.measureText("0").width;
  c.width = Math.ceil(cols * cw + pad * 2);
  c.height = Math.ceil(rows * lh + pad * 2);
  const x = c.getContext("2d");
  if (!x) return;
  x.fillStyle = "#18181b";
  x.fillRect(0, 0, c.width, c.height);
  x.font = `${fs}px "JetBrains Mono",monospace`;
  x.fillStyle = "#d4d4d8";
  x.textBaseline = "top";
  for (let i = 0; i < grid.length; i++) {
    x.fillText((grid[i] ?? []).join(""), pad, pad + i * lh);
  }
  c.toBlob((b) => {
    if (!b) return;
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u;
    a.download = "ascii-art.png";
    a.click();
    URL.revokeObjectURL(u);
  });
}

function download(name: string, text: string) {
  const b = new Blob([text], { type: "text/plain" });
  const u = URL.createObjectURL(b);
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  URL.revokeObjectURL(u);
}

export default function DeploySheet() {
  const { grid, cols, rows, target, isDeployOpen, patch, closeDeploy, showToast } = useStudio();

  const text = gridText(grid);
  const chars = text.length;
  const out = buildOutput(target, grid);
  const preview = target === "png" ? text : out;

  const showDl = target === "png" || target === "react" || target === "plain";

  let warn = "";
  if (target === "discord" && chars > 2000) {
    warn = `Discord/Slackの2000字制限を${(chars - 2000).toLocaleString()}字超えています。幅を下げるか分割してください。`;
  }
  if (target === "github" && cols > 80) {
    warn = `幅が${cols}列。READMEでは80列を超えると折り返す場合があります（ガイド線参照）。`;
  }

  const handleCopy = async () => {
    if (target === "png") {
      exportPng(grid, cols, rows);
      showToast("Downloaded ascii-art.png");
      return;
    }
    try {
      await navigator.clipboard.writeText(out);
      showToast("Copied to clipboard");
    } catch {
      showToast("コピーできませんでした（HTTPS必須）");
    }
  };

  const handleDownload = () => {
    if (target === "png") {
      exportPng(grid, cols, rows);
      showToast("Downloaded ascii-art.png");
      return;
    }
    if (target === "react") {
      download("AsciiArt.tsx", out);
      showToast("Downloaded AsciiArt.tsx");
      return;
    }
    download("ascii-art.txt", out);
    showToast("Downloaded ascii-art.txt");
  };

  return (
    <>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: overlay backdrop is a visual dismiss affordance, not interactive for keyboard users */}
      <div
        className={`${styles.overlay}${isDeployOpen ? ` ${styles.on}` : ""}`}
        onClick={closeDeploy}
      />
      <div className={`${styles.deploy}${isDeployOpen ? ` ${styles.on}` : ""}`}>
        <div className={styles.deployHead}>
          <div>
            <h2>Deploy</h2>
            <p>貼り付け先を選ぶと、最適な形式に整えて書き出します。</p>
          </div>
          <button type="button" className={styles.x} onClick={closeDeploy}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              width={16}
              height={16}
            >
              <title>Close</title>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.deployBody}>
          <div className={styles.targets}>
            {TARGETS.map((tgt) => (
              <button
                key={tgt.id}
                type="button"
                className={`${styles.target}${target === tgt.id ? ` ${styles.on}` : ""}`}
                onClick={() => patch({ target: tgt.id })}
              >
                <div className={styles.ic}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                    <title>{tgt.t}</title>
                    <path d={tgt.icon} />
                  </svg>
                </div>
                <div className={styles.tx}>
                  <div className={styles.t}>{tgt.t}</div>
                  <div className={styles.d}>{tgt.d}</div>
                </div>
                <span className={styles.badge}>{tgt.badge}</span>
              </button>
            ))}
          </div>

          {warn && (
            <div className={styles.warn}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <title>Warning</title>
                <path d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
              </svg>
              {warn}
            </div>
          )}

          <div className={styles.previewBox}>
            <div className={styles.ph}>
              <span>Preview</span>
              <b>
                {cols}×{rows} · {chars.toLocaleString()} chars
              </b>
            </div>
            <pre>{preview}</pre>
          </div>
        </div>

        <div className={styles.deployFoot}>
          {showDl && (
            <button
              type="button"
              className={styles.btnLine}
              style={{ flex: "0 0 auto", width: "auto", padding: "10px 16px" }}
              onClick={handleDownload}
            >
              Download
            </button>
          )}
          <button type="button" className={styles.btnAmber} onClick={handleCopy}>
            Copy to clipboard
          </button>
        </div>
      </div>
    </>
  );
}
