import { discoverMovies } from "@/lib/tmdb";

export default async function Home() {
  const movies = await discoverMovies();

  return (
    <main>
      <h1>Discover</h1>
      <ul>
        {movies.map((movie) => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </main>
  );
}
