"use client";

import { useStudio } from "../state/useStudio";
import styles from "../studio.module.css";

const TARGETS_DISPLAY: Record<string, string> = {
  github: "GitHub README",
  terminal: "Terminal / CLI",
  discord: "Discord / Slack",
  png: "PNG image",
  react: "React component",
  plain: "Plain text",
};

export default function StatusBar() {
  const { grid, cols, rows, cursor, target, zoom, setZoom } = useStudio();
  const hasContent = grid.length > 0 && rows > 0;

  return (
    <div className={styles.status}>
      <div className={styles.st}>
        <span className={styles.dotg} />
        <b>{hasContent ? `${cols}×${rows}` : "—"}</b>
      </div>
      <div className={styles.st}>
        cursor <b>{cursor ? `${cursor.x},${cursor.y}` : "—"}</b>
      </div>
      <div className={styles.st}>
        chars <b>{hasContent ? (cols * rows).toLocaleString() : "0"}</b>
      </div>

      <div className={styles.spacer} />

      <div className={styles.st}>
        target <b>{TARGETS_DISPLAY[target] ?? target}</b>
      </div>
      <div className={styles.z}>
        <button type="button" onClick={() => setZoom(zoom - 0.25)}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            width={14}
            height={14}
          >
            <title>Zoom out</title>
            <path d="M5 12h14" />
          </svg>
        </button>
        <b style={{ color: "var(--cloud-dim)", width: "38px", textAlign: "center" }}>
          {Math.round(zoom * 100)}%
        </b>
        <button type="button" onClick={() => setZoom(zoom + 0.25)}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            width={14}
            height={14}
          >
            <title>Zoom in</title>
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>
    </div>
  );
}
