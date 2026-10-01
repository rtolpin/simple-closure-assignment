import "server-only";

const API_BASE = "https://api.themoviedb.org/3";

export type Movie = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
};

export type Genre = { id: number; name: string };

type DiscoverResponse = {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

export class TmdbError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "TmdbError";
  }
}

function apiKey(): string {
  const key = process.env.TMDB_API_KEY;

  if (!key) throw new TmdbError("TMDB_API_KEY is not set");

  return key;
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {

  const url = new URL(`${API_BASE}${path}`);

  url.searchParams.set("api_key", apiKey());

  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  // Discover results change slowly; cache for an hour so repeat views are instant.
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    throw new TmdbError(`TMDB request failed: ${res.status} ${res.statusText}`, res.status);
  }

  return res.json() as Promise<T>;
}

export async function discoverMovies(params: Record<string, string> = {}): Promise<Movie[]> {

  const data = await tmdbFetch<DiscoverResponse>("/discover/movie", params);

  return data.results;
}

export async function getGenres(): Promise<Genre[]> {

  const data = await tmdbFetch<{ genres: Genre[] }>("/genre/movie/list");
  
  return data.genres;
}