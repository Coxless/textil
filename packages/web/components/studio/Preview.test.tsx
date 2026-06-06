import { render, screen } from "@testing-library/react";
import type { AsciiGrid } from "@textil/core";
import { describe, expect, it } from "vitest";
import { Preview } from "./Preview";

const mockGrid: AsciiGrid = {
  width: 3,
  height: 2,
  cells: [
    ["A", "B", "C"],
    ["D", "E", "F"],
  ],
};

describe("Preview", () => {
  it("shows placeholder when grid is null", () => {
    render(<Preview grid={null} error={null} />);
    expect(screen.getByText(/type something to generate/i)).toBeInTheDocument();
  });

  it("renders grid rows as pre content", () => {
    render(<Preview grid={mockGrid} error={null} />);
    const preEl = document.querySelector("pre");
    expect(preEl?.textContent).toBe("ABC\nDEF");
  });

  it("shows error message", () => {
    render(<Preview grid={null} error="Something went wrong" />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("prefers error over grid", () => {
    render(<Preview grid={mockGrid} error="Oops" />);
    expect(screen.getByText("Oops")).toBeInTheDocument();
    expect(document.querySelector("pre")).toBeNull();
  });
});
