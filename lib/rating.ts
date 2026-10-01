import type { Movie } from "./tmdb";

export const FEATURED_RATING = 8;
// A few early votes can put a new release at 9+, so require a minimum sample.
export const FEATURED_MIN_VOTES = 100;

export function isFeatured(movie: Pick<Movie, "vote_average" | "vote_count">): boolean {
  return movie.vote_average >= FEATURED_RATING && movie.vote_count >= FEATURED_MIN_VOTES;
}