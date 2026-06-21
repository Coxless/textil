import type { ReactNode } from "react";
import { body, display, mono } from "../fonts";

export const metadata = {
  title: "textil studio",
  description: "ASCII art generator, editor and exporter",
};

export default function StudioLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} ${body.variable} ${mono.variable}`}>{children}</div>;
}
