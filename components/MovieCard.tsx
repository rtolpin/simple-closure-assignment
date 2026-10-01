import Image from "next/image";
import type { View } from "@/lib/params";
import type { Movie } from "@/lib/tmdb";
import { posterUrl } from "@/lib/images";
import styles from "./MovieCard.module.css";

type Props = {
  movie: Movie;
  view?: View;
  eager?: boolean;
};

export function MovieCard({ movie, view = "grid", eager = false }: Props) {
  const year = movie.release_date?.slice(0, 4);
  const isList = view === "list";

  return (
    <a
      className={`${styles.card} ${isList ? styles.row : ""}`}
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
            sizes={isList ? "120px" : "(max-width: 480px) 50vw, (max-width: 1024px) 25vw, 240px"}
            loading={eager ? "eager" : "lazy"}
          />
        ) : (
          <div className={styles.placeholder} aria-label={`No poster for ${movie.title}`}>
            {movie.title}
          </div>
        )}
        {!isList && (
          <div className={styles.overlay} aria-hidden="true">
            <p className={styles.overview}>{movie.overview || "No synopsis available."}</p>
            <span className={styles.votes}>{movie.vote_count.toLocaleString()} votes</span>
          </div>
        )}
      </div>
      <div className={styles.info}>
        <h2 className={styles.name}>{movie.title}</h2>
        <div className={styles.meta}>
          <span>{year || "TBA"}</span>
          <span className={styles.rating}>★ {movie.vote_average.toFixed(1)}</span>
        </div>
        {isList && (
          <p className={styles.listOverview}>{movie.overview || "No synopsis available."}</p>
        )}
      </div>
    </a>
  );
}