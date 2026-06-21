"use client";

import { useStudio } from "../state/useStudio";
import styles from "../studio.module.css";

export default function Header() {
  const { grid, rows, clearCanvas, openDeploy } = useStudio();
  const hasContent = grid.length > 0 && rows > 0;

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.mark}>
          text<b>il</b>
        </span>
        <span className={styles.tag}>ascii studio</span>
      </div>

      <nav className={styles.flow}>
        <div className={`${styles.step} ${styles.on}`}>
          <span className={styles.num}>01</span>
          <span className={styles.dot} />
          Generate
        </div>
        <span className={styles.arr}>→</span>
        <div className={`${styles.step}${hasContent ? ` ${styles.on}` : ""}`}>
          <span className={styles.num}>02</span>
          <span className={styles.dot} />
          Edit
        </div>
        <span className={styles.arr}>→</span>
        <div className={`${styles.step}${hasContent ? ` ${styles.on}` : ""}`}>
          <span className={styles.num}>03</span>
          <span className={styles.dot} />
          Deploy
        </div>
      </nav>

      <div className={styles.spacer} />

      <button type="button" className={styles.ghostBtn} onClick={clearCanvas}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          width={14}
          height={14}
        >
          <title>Clear canvas</title>
          <path d="M3 6h18M8 6V4h8v2m-9 0v14a1 1 0 001 1h8a1 1 0 001-1V6" />
        </svg>
        Clear
      </button>

      <button type="button" className={styles.deployBtn} onClick={openDeploy}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
          <title>Deploy</title>
          <path d="M12 3v13m0-13l-4 4m4-4l4 4M5 21h14" />
        </svg>
        Deploy
      </button>
    </header>
  );
}
