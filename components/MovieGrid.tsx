import type { Movie } from "@/lib/tmdb";
import { MovieCard } from "./MovieCard";
import styles from "./MovieGrid.module.css";

export function MovieGrid({ movies }: { movies: Movie[] }) {
  return (
    <ul className={styles.grid}>
      {movies.map((movie, i) => (
        <li key={movie.id}>
          <MovieCard movie={movie} eager={i < 6} />
        </li>
      ))}
    </ul>
  );
}