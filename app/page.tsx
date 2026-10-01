import { MovieGrid } from "@/components/MovieGrid";
import { discoverMovies } from "@/lib/tmdb";
import styles from "./page.module.css";

export default async function Home() {
  const movies = await discoverMovies();

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>Discover Movies</h1>
        <p className={styles.subtitle}>Powered by The Movie Database</p>
      </header>
      <MovieGrid movies={movies} />
    </main>
  );
}