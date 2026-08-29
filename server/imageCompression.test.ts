import { describe, expect, it } from "vitest";
import { calculateScaledDimensions } from "../client/src/lib/imageCompression";

describe("calculateScaledDimensions", () => {
  it("keeps small images unchanged", () => {
    expect(calculateScaledDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("scales landscape images proportionally", () => {
    expect(calculateScaledDimensions(4000, 2000, 1600)).toEqual({ width: 1600, height: 800 });
  });

  it("scales portrait images proportionally", () => {
    expect(calculateScaledDimensions(2000, 4000, 1600)).toEqual({ width: 800, height: 1600 });
  });
});
