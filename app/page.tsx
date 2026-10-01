import { Controls } from "@/components/Controls";
import { EmptyState } from "@/components/EmptyState";
import { MovieGrid } from "@/components/MovieGrid";
import { ViewToggle } from "@/components/ViewToggle";
import { parseQuery, toDiscoverParams } from "@/lib/params";
import { discoverMovies, getGenres } from "@/lib/tmdb";
import styles from "./page.module.css";

export default async function Home({ searchParams }: PageProps<"/">) {
  const query = parseQuery(await searchParams);
  const [movies, genres] = await Promise.all([
    discoverMovies(toDiscoverParams(query)),
    getGenres(),
  ]);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Discover Movies</h1>
          <p className={styles.subtitle}>Powered by The Movie Database</p>
        </div>
        <div className={styles.toolbar}>
          <Controls key={`${query.sort}-${query.genre}`} query={query} genres={genres} />
          <ViewToggle query={query} />
        </div>
      </header>
      {movies.length > 0 ? <MovieGrid movies={movies} view={query.view} /> : <EmptyState />}
    </main>
  );
}