import { describe, expect, it } from "vitest";
import { parseImageDataUrl } from "./upload";

describe("parseImageDataUrl", () => {
  it("accepts PNG data and returns a storage-ready buffer", () => {
    const image = parseImageDataUrl(`data:image/png;base64,${Buffer.from("png-bytes").toString("base64")}`);
    expect(image.contentType).toBe("image/png");
    expect(image.extension).toBe("png");
    expect(image.buffer.length).toBeGreaterThan(0);
  });

  it("rejects non-image data", () => {
    expect(() => parseImageDataUrl("data:text/plain;base64,aGVsbG8=")).toThrow("Only JPEG");
  });

  it("rejects images over 5MB", () => {
    const large = Buffer.alloc(5 * 1024 * 1024 + 1).toString("base64");
    expect(() => parseImageDataUrl(`data:image/jpeg;base64,${large}`)).toThrow("5MB");
  });
});
