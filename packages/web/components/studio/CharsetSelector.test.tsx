import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CharsetSelector } from "./CharsetSelector";

describe("CharsetSelector", () => {
  it("renders all three charset options", () => {
    render(<CharsetSelector value="standard" onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Standard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Braille" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Block" })).toBeInTheDocument();
  });

  it("calls onChange with correct value when a charset is clicked", async () => {
    const onChange = vi.fn();
    render(<CharsetSelector value="standard" onChange={onChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Braille" }));
    expect(onChange).toHaveBeenCalledWith("braille");

    await userEvent.click(screen.getByRole("button", { name: "Block" }));
    expect(onChange).toHaveBeenCalledWith("block");
  });

  it("applies active styling to the selected charset", () => {
    render(<CharsetSelector value="braille" onChange={vi.fn()} />);
    const brailleBtn = screen.getByRole("button", { name: "Braille" });
    const standardBtn = screen.getByRole("button", { name: "Standard" });
    // selected button uses surf-3 background; unselected uses surf-2
    expect(brailleBtn.style.background).toContain("surf-3");
    expect(standardBtn.style.background).toContain("surf-2");
  });
});
