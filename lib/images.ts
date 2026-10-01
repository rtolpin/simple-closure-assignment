const IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path: string, size: "w342" | "w500" = "w500"): string {
  return `${IMAGE_BASE}/${size}${path}`;
}