import { describe, expect, it } from "vitest";
import { isFeatured } from "@/lib/rating";

describe("isFeatured", () => {
  it("features well-rated films with enough votes", () => {
    expect(isFeatured({ vote_average: 8.4, vote_count: 12000 })).toBe(true);
    expect(isFeatured({ vote_average: 8, vote_count: 100 })).toBe(true);
  });

  it("ignores lower ratings and thin vote counts", () => {
    expect(isFeatured({ vote_average: 7.9, vote_count: 12000 })).toBe(false);
    expect(isFeatured({ vote_average: 9.5, vote_count: 12 })).toBe(false);
  });
});