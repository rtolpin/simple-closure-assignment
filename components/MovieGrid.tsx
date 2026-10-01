import type { View } from "@/lib/params";
import { isFeatured } from "@/lib/rating";
import type { Movie } from "@/lib/tmdb";
import { MovieCard } from "./MovieCard";
import styles from "./MovieGrid.module.css";

type Props = {
  movies: Movie[];
  view?: View;
  // When sorted by rating nearly every card qualifies, so the caller can
  // switch sizing off rather than render a wall of large tiles.
  sizeByRating?: boolean;
};

export function MovieGrid({ movies, view = "grid", sizeByRating = true }: Props) {
  return (
    <ul className={view === "list" ? styles.list : styles.grid}>
      {movies.map((movie, i) => {
        const featured = view === "grid" && sizeByRating && isFeatured(movie);
        return (
          <li key={movie.id} className={featured ? styles.featured : undefined}>
            <MovieCard movie={movie} view={view} featured={featured} eager={i < 6} />
          </li>
        );
      })}
    </ul>
  );
}