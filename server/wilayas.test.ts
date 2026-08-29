import { describe, expect, it } from "vitest";
import { ALGERIA_WILAYA_COUNT, ALGERIA_WILAYAS } from "../shared/wilayas";

describe("Algeria wilayas", () => {
  it("contains the current 69 wilayas", () => {
    expect(ALGERIA_WILAYA_COUNT).toBe(69);
    expect(new Set(ALGERIA_WILAYAS).size).toBe(69);
  });

  it("includes the eleven newly added wilayas", () => {
    expect(ALGERIA_WILAYAS).toEqual(expect.arrayContaining(["أفلو", "بريكة", "القنطرة", "بئر العاتر", "العريشة", "قصر الشلالة", "عين وسارة", "مسعد", "قصر البخاري", "بوسعادة", "الأبيض سيدي الشيخ"]));
  });
});
