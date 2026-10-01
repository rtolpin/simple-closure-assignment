import Image from "next/image";
import type { Movie } from "@/lib/tmdb";
import { posterUrl } from "@/lib/images";
import styles from "./MovieCard.module.css";

type Props = {
  movie: Movie;
  eager?: boolean;
};

export function MovieCard({ movie, eager = false }: Props) {
  const year = movie.release_date?.slice(0, 4);

  return (
    <a
      className={styles.card}
      href={`https://www.themoviedb.org/movie/${movie.id}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.poster}>
        {movie.poster_path ? (
          <Image
            className={styles.image}
            src={posterUrl(movie.poster_path)}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 480px) 50vw, (max-width: 1024px) 25vw, 240px"
            loading={eager ? "eager" : "lazy"}
          />
        ) : (
          <div className={styles.placeholder} aria-label={`No poster for ${movie.title}`}>
            {movie.title}
          </div>
        )}
        <div className={styles.overlay} aria-hidden="true">
          <p className={styles.overview}>{movie.overview || "No synopsis available."}</p>
          <span className={styles.votes}>{movie.vote_count.toLocaleString()} votes</span>
        </div>
      </div>
      <div className={styles.info}>
        <h2 className={styles.name}>{movie.title}</h2>
        <div className={styles.meta}>
          <span>{year || "TBA"}</span>
          <span className={styles.rating}>★ {movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
    </a>
  );
}