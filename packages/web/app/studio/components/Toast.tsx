"use client";

import { useStudio } from "../state/useStudio";
import styles from "../studio.module.css";

export default function Toast() {
  const { toast } = useStudio();
  return (
    <div className={`${styles.toast}${toast.visible ? ` ${styles.on}` : ""}`}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <title>Success</title>
        <path d="M20 6L9 17l-5-5" />
      </svg>
      <span>{toast.msg}</span>
    </div>
  );
}
