import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ImageUploader } from "./ImageUploader";

function makeMockFileReader(buffer: ArrayBuffer = new ArrayBuffer(4)) {
  return class MockFileReader {
    result: ArrayBuffer | null = null;
    onload: ((e: ProgressEvent<FileReader>) => void) | null = null;

    readAsArrayBuffer(_file: Blob) {
      setTimeout(() => {
        this.result = buffer;
        this.onload?.({ target: this } as unknown as ProgressEvent<FileReader>);
      }, 0);
    }
  };
}

describe("ImageUploader", () => {
  beforeEach(() => {
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:fake-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the drop zone with upload prompt", () => {
    render(<ImageUploader onImageLoad={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByTestId("upload-dropzone")).toBeInTheDocument();
    expect(screen.getByText(/drop image or click to upload/i)).toBeInTheDocument();
  });

  it("calls onImageLoad with ArrayBuffer when a file is selected", async () => {
    const buffer = new ArrayBuffer(8);
    const onImageLoad = vi.fn();
    vi.stubGlobal("FileReader", makeMockFileReader(buffer));

    render(<ImageUploader onImageLoad={onImageLoad} onClear={vi.fn()} />);

    const input = screen.getByTestId("upload-input");
    await userEvent.upload(input, new File(["png"], "photo.png", { type: "image/png" }));

    await vi.waitFor(() => {
      expect(onImageLoad).toHaveBeenCalledWith(buffer);
    });
  });

  it("shows thumbnail and remove button after upload", async () => {
    vi.stubGlobal("FileReader", makeMockFileReader());

    render(<ImageUploader onImageLoad={vi.fn()} onClear={vi.fn()} />);

    const input = screen.getByTestId("upload-input");
    await userEvent.upload(input, new File(["png"], "photo.png", { type: "image/png" }));

    await vi.waitFor(() => {
      expect(screen.getByRole("img", { name: "Uploaded preview" })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
  });

  it("calls onClear and reverts to drop zone when Remove is clicked", async () => {
    const onClear = vi.fn();
    vi.stubGlobal("FileReader", makeMockFileReader());

    render(<ImageUploader onImageLoad={vi.fn()} onClear={onClear} />);

    const input = screen.getByTestId("upload-input");
    await userEvent.upload(input, new File(["png"], "photo.png", { type: "image/png" }));

    await vi.waitFor(() => {
      expect(screen.getByRole("button", { name: "Remove" })).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "Remove" }));

    expect(onClear).toHaveBeenCalled();
    expect(screen.getByTestId("upload-dropzone")).toBeInTheDocument();
  });
});
