import type { View } from "@/lib/params";
import type { Movie } from "@/lib/tmdb";
import { MovieCard } from "./MovieCard";
import styles from "./MovieGrid.module.css";

type Props = {
  movies: Movie[];
  view?: View;
};

export function MovieGrid({ movies, view = "grid" }: Props) {
  return (
    <ul className={view === "list" ? styles.list : styles.grid}>
      {movies.map((movie, i) => (
        <li key={movie.id}>
          <MovieCard movie={movie} view={view} eager={i < 6} />
        </li>
      ))}
    </ul>
  );
}