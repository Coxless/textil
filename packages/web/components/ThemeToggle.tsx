"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="ml-auto rounded p-1 text-[var(--fg-4)] transition-colors hover:text-[var(--fg-2)]"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
