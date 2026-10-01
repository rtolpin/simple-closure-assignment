import { describe, expect, it } from "vitest";
import { buildHref, parseGenre, parseQuery, parseSort, toDiscoverParams } from "@/lib/params";

describe("parseSort", () => {
  it("accepts known sort keys", () => {
    expect(parseSort("rating")).toBe("rating");
    expect(parseSort("title")).toBe("title");
  });

  it("falls back to popular for missing or unknown values", () => {
    expect(parseSort(undefined)).toBe("popular");
    expect(parseSort("vote_average.desc")).toBe("popular");
    expect(parseSort("toString")).toBe("popular");
  });

  it("uses the first value when a param is repeated", () => {
    expect(parseSort(["newest", "rating"])).toBe("newest");
  });
});

describe("parseGenre", () => {
  it("parses a positive integer id", () => {
    expect(parseGenre("28")).toBe(28);
  });

  it("rejects anything that isn't a plain positive id", () => {
    for (const bad of [undefined, "", "0", "-1", "28,12", "28abc", "1e3", "9999999"]) {
      expect(parseGenre(bad)).toBeNull();
    }
  });
});

describe("toDiscoverParams", () => {
  const today = new Date("2026-10-01T12:00:00Z");

  it("maps the default query to a popularity sort with no filters", () => {
    const params = toDiscoverParams({ sort: "popular", genre: null }, today);
    expect(params.sort_by).toBe("popularity.desc");
    expect(params).not.toHaveProperty("with_genres");
    expect(params).not.toHaveProperty("vote_count.gte");
  });

  it("adds a vote floor to the rating sort", () => {
    const params = toDiscoverParams({ sort: "rating", genre: null }, today);
    expect(params.sort_by).toBe("vote_average.desc");
    expect(params["vote_count.gte"]).toBe("200");
  });

  it("caps newest at today's date and passes the genre through", () => {
    const params = toDiscoverParams({ sort: "newest", genre: 16 }, today);
    expect(params["primary_release_date.lte"]).toBe("2026-10-01");
    expect(params.with_genres).toBe("16");
  });
});

describe("buildHref", () => {
  const defaults = parseQuery({});

  it("keeps the default view at the root", () => {
    expect(buildHref(defaults)).toBe("/");
  });

  it("only includes params that differ from the defaults", () => {
    expect(buildHref(defaults, { view: "list" })).toBe("/?view=list");
    expect(buildHref({ sort: "rating", genre: 35, view: "list" }, { view: "grid" })).toBe(
      "/?genre=35&sort=rating",
    );
  });
});