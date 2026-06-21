import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AVAILABLE_FONTS } from "@textil/core";
import { describe, expect, it, vi } from "vitest";
import { FontPicker } from "./FontPicker";

describe("FontPicker", () => {
  it("renders all available fonts", () => {
    render(<FontPicker value="standard" onChange={() => {}} />);
    for (const font of AVAILABLE_FONTS) {
      expect(screen.getByText(font)).toBeInTheDocument();
    }
  });

  it("calls onChange with clicked font name", async () => {
    const onChange = vi.fn();
    render(<FontPicker value="standard" onChange={onChange} />);

    const buttons = screen.getAllByRole("button");
    const doomButton = buttons.find((b) => b.textContent?.includes("doom"));
    if (!doomButton) throw new Error("doom button not found");
    await userEvent.click(doomButton);
    expect(onChange).toHaveBeenCalledWith("doom");
  });

  it("highlights the selected font", () => {
    render(<FontPicker value="slant" onChange={() => {}} />);
    const selected = screen.getByText("slant").closest("button");
    const other = screen.getByText("doom").closest("button");
    // selected button has surf-3 background; others have surf-2
    expect(selected?.style.background).toContain("surf-3");
    expect(other?.style.background).toContain("surf-2");
  });
});
