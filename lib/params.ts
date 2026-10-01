// Pure helpers that turn URL search params into validated TMDB query params.
// Kept free of server/client imports so they can be unit tested directly.

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

type SortOption = { label: string; sortBy: string; minVotes?: number };

// minVotes: without a vote floor, rating and title sorts are dominated by films
// with a handful of votes. TMDB's own Top Rated list uses vote_count >= 200.
export const SORT_OPTIONS = {
  popular: { label: "Most popular", sortBy: "popularity.desc" },
  rating: { label: "Highest rated", sortBy: "vote_average.desc", minVotes: 200 },
  newest: { label: "Newest releases", sortBy: "primary_release_date.desc", minVotes: 20 },
  title: { label: "Title (A–Z)", sortBy: "title.asc", minVotes: 200 },
} as const satisfies Record<string, SortOption>;

export type SortKey = keyof typeof SORT_OPTIONS;
export const DEFAULT_SORT: SortKey = "popular";

export const VIEWS = ["grid", "list"] as const;
export type View = (typeof VIEWS)[number];
export const DEFAULT_VIEW: View = "grid";

// ---------------------------------------------------------------------------
// URL search params -> Query
// ---------------------------------------------------------------------------

type ParamValue = string | string[] | undefined;
export type SearchParams = { [key: string]: ParamValue };

export type Query = { sort: SortKey; genre: number | null; view: View };

export function parseQuery(params: SearchParams): Query {
  return {
    sort: parseSort(params.sort),
    genre: parseGenre(params.genre),
    view: parseView(params.view),
  };
}

export function parseSort(value: ParamValue): SortKey {
  const v = first(value);
  return v && Object.hasOwn(SORT_OPTIONS, v) ? (v as SortKey) : DEFAULT_SORT;
}

// Genre IDs are positive integers. A strict pattern rejects things Number()
// would accept ("", "1e3", "0x1C", " 28 ") and keeps TMDB's "," / "|"
// filter syntax out of with_genres.
export function parseGenre(value: ParamValue): number | null {
  const v = first(value);
  return v && /^[1-9]\d{0,5}$/.test(v) ? Number(v) : null;
}

export function parseView(value: ParamValue): View {
  const v = first(value);
  return VIEWS.find((view) => view === v) ?? DEFAULT_VIEW;
}

// Repeated params (?genre=1&genre=2) arrive as arrays; use the first.
function first(value: ParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// ---------------------------------------------------------------------------
// Query -> page link
// ---------------------------------------------------------------------------

// Link to the page with some params changed. Defaults are left out so the
// default view stays at "/".
export function buildHref(query: Query, changes: Partial<Query> = {}): string {
  const { sort, genre, view } = { ...query, ...changes };
  const params = new URLSearchParams();

  if (genre !== null) params.set("genre", String(genre));
  if (sort !== DEFAULT_SORT) params.set("sort", sort);
  if (view !== DEFAULT_VIEW) params.set("view", view);

  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

// ---------------------------------------------------------------------------
// Query -> TMDB /discover/movie params
// ---------------------------------------------------------------------------

// Returns strings because these become URL query params on the TMDB request.
// View is display-only, so it's not part of the API query.
export function toDiscoverParams(
  { sort, genre }: Pick<Query, "sort" | "genre">,
  today: Date = new Date(),
): Record<string, string> {
  const { sortBy, minVotes }: SortOption = SORT_OPTIONS[sort];
  const params: Record<string, string> = {
    sort_by: sortBy,
    include_adult: "false",
    language: "en-US",
  };

  if (minVotes) params["vote_count.gte"] = String(minVotes);

  // "Newest" should mean released, not announced for 2031.
  if (sort === "newest") params["primary_release_date.lte"] = today.toISOString().slice(0, 10);

  if (genre !== null) params.with_genres = String(genre);

  return params;
}
