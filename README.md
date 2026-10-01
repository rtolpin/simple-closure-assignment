# Discover Movies

A small web app that fetches movies from [The Movie Database (TMDB)](https://www.themoviedb.org/) `/discover/movie` endpoint and shows them as a grid of poster cards. You can filter by genre, sort four ways, and switch between a grid and a list layout.

Built with **Next.js 16 (App Router)**, **React 19** and **TypeScript**. Styling is plain CSS Modules, and tests use **Vitest**.

---

## Quick start

Requires **Node.js 20.9 or later**.

```bash
npm i && npm start
```

Open [http://localhost:3000](http://localhost:3000).

No other setup is needed. `npm start` builds the app first (through a `prestart` script) and then serves the production build. The TMDB API key comes from `.env` in the repo (see [About the API key](#about-the-api-key)).

The same steps, one at a time:

```bash
npm install      # install dependencies
npm run build    # production build (npm start also runs this)
npm start        # build if needed, then serve on http://localhost:3000
npm run test     # run the unit tests
```

`npm run test` runs the Vitest unit tests in [`tests/`](tests/) once and exits. It doesn't need the API key or a build. For development with hot reload, use `npm run dev`.

| Script          | What it does                         |
| --------------- | ------------------------------------ |
| `npm install`   | Install dependencies                 |
| `npm run build` | Production build                     |
| `npm start`     | Build, then serve the production build |
| `npm run test`  | Run the unit tests (Vitest)          |
| `npm run dev`   | Development server with hot reload   |
| `npm run lint`  | ESLint (Next.js config)              |

### About the API key

The repo includes a `.env` file containing the TMDB API key from the assignment brief, so the app runs straight from a clone. Normally I wouldn't commit an API key. I did here because SimpleClosure provided this key for the exercise and the brief asks for the project to run with just `npm i && npm start`.

The key is only read on the server and never reaches the browser (see [Decisions I made](#decisions-i-made)). To use a different key, put `TMDB_API_KEY=...` in `.env.local`, which is git-ignored and overrides `.env`.


---

## Requirements checklist

### Core

| Requirement | How it's met | Where |
| --- | --- | --- |
| Fetch from `/discover/movie` (first page) | A server component calls TMDB on each request. The response is cached for an hour. | [`lib/tmdb.ts`](lib/tmdb.ts), [`app/page.tsx`](app/page.tsx) |
| Apply one filter to the API request | **Genre**, sent as `with_genres`. The list of genres comes from TMDB's `/genre/movie/list`. | [`lib/params.ts`](lib/params.ts) |
| Sort by a method and property of your choice | **Sorted by TMDB through `sort_by`**, defaulting to popularity. Also: highest rated, newest releases, title A–Z. | [`lib/params.ts`](lib/params.ts) |
| Movies in a grid | CSS Grid | [`components/MovieGrid.tsx`](components/MovieGrid.tsx) |
| Card: poster image | `next/image` with responsive `sizes`. Movies without a poster get a placeholder showing the title. | [`components/MovieCard.tsx`](components/MovieCard.tsx) |
| Card: title | ✓ | same |
| Card: an additional property | **Release year** and **average rating (★)**. On hover, also the synopsis and vote count. | same |
| Card: an interactive element | Hover **or keyboard focus** lifts the card, zooms the poster and fades in a synopsis overlay. Each card links to the movie's TMDB page. | [`components/MovieCard.module.css`](components/MovieCard.module.css) |

### Extras (all five done)

| Extra | Implementation |
| --- | --- |
| Responsive grid | `repeat(auto-fill, minmax(180px, 1fr))`, so the column count adjusts to the screen width. Phones (≤480px) get a fixed 2-column layout with tighter gaps. The header and controls wrap on narrow screens. |
| UI for filtering and sorting | Genre and sort dropdowns that apply as soon as you change them. |
| CSS transitions | Card lift, poster zoom, overlay fade, control hover states and a shimmering loading skeleton. All motion is turned off under `prefers-reduced-motion`. |
| Size by rating | Movies rated **≥ 8.0 with ≥ 100 votes** get a 2×2 tile and a "Top rated" badge. `grid-auto-flow: dense` fills the gaps around the larger tiles. This is turned off for the *Highest rated* sort, where nearly every movie would qualify. |
| Different layout option | A **grid / list** toggle. List view shows a small poster next to the title, metadata and a three-line synopsis. |

### Also included

- **Loading, empty and error states:** a skeleton grid while data loads ([`app/loading.tsx`](app/loading.tsx)), a "No movies found" message with a *Clear filters* link, and an error boundary with a *Try again* button ([`app/error.tsx`](app/error.tsx)).
- **Accessibility:** visible focus rings, `aria-current` on the active layout button, labelled controls, and alt text on posters.
- **Unit tests** for URL parsing, building the TMDB request, and the rating-size rule ([`tests/`](tests/)).

---

## How it works

```
URL (?genre=28&sort=rating&view=list)
        │
        ▼
parseQuery()         lib/params.ts    untrusted strings  →  typed Query
        │
        ├──► toDiscoverParams()       Query → TMDB params (sort_by, with_genres, vote floor…)
        │           │
        │           ▼
        │    discoverMovies()   lib/tmdb.ts   server-only fetch, cached 1h
        │
        ▼
<Controls/> <ViewToggle/> <MovieGrid/>   rendered on the server, sent as HTML
```

1. [`app/page.tsx`](app/page.tsx) is an async **server component**. It reads the search params, turns them into a typed `Query`, and fetches the movies and the genre list in parallel.
2. [`lib/params.ts`](lib/params.ts) is the only place that understands URL params. It is pure (no server or client imports), which makes it easy to unit test.
3. [`lib/tmdb.ts`](lib/tmdb.ts) is the only file that talks to TMDB. The `server-only` import makes the build fail if it is ever imported into client code, so the API key cannot leak to the browser.
4. The only client component is [`Controls`](components/Controls.tsx). When a dropdown changes, it submits a `next/form`, which updates the URL. The server then renders the new results.

---

## Decisions I made

### Architecture

**I fetch on the server, using Next.js server components.** [`app/page.tsx`](app/page.tsx) is an async server component that calls TMDB directly, so the page arrives as finished HTML. Posters, titles and ratings show on first paint, with no client-side fetching or loading spinners after the page loads.

**I kept the API key on the server.** Every TMDB call goes through [`lib/tmdb.ts`](lib/tmdb.ts), which imports `server-only`. If that file is ever imported into client code, the build fails, so the key can't end up in the browser bundle.

**I cache TMDB responses for an hour.** Discover results change slowly, so I set `revalidate: 3600` on the fetch. Repeat views of the same filter and sort combination load instantly and don't use up API requests.

**I made the URL the single source of truth.** Genre, sort and layout live in the query string (`/?genre=28&sort=rating&view=list`), not in React state. Any view can be bookmarked or shared, the back button works, and the server has everything it needs to render the page. Nothing in the app needed a client-side state library.

**I kept URL parsing in one pure module.** [`lib/params.ts`](lib/params.ts) handles every conversion: URL to typed `Query`, `Query` back to a link, and `Query` to TMDB request params. It has no server or client imports, so I could unit test it directly without rendering anything.

### Filtering and sorting

**I chose genre as the filter.** It's the most familiar way to browse movies, and TMDB provides the genre list (`/genre/movie/list`), so the dropdown always shows real genre names and IDs instead of a hard-coded list.

**I let TMDB do the sorting, not the browser.** The app shows page 1 (20 movies). Sorting those 20 in the browser would only reorder one page, not find the highest-rated movies overall. Passing `sort_by` and `with_genres` in the API request gives correct results across TMDB's whole catalogue.

**I offered four sorts:** most popular (the default), highest rated, newest releases and title A–Z. Each one maps to a TMDB `sort_by` value in a single table, `SORT_OPTIONS`.

**I added minimum vote counts so the sorts give useful results.** Without a minimum, *Highest rated* and *Title* are dominated by films with only a handful of votes. Those sorts require at least 200 votes (`vote_count.gte`), the same threshold TMDB uses for its own Top Rated list. *Newest releases* requires 20.

**I limited "Newest releases" to films that have already come out.** Sorting by release date alone puts films announced for years from now at the top. I added `primary_release_date.lte` set to today, so "newest" means released.

**I validate everything that comes from the URL.** Anyone can edit the URL, so a bad value falls back to the default instead of producing an error:
- Sort and layout must be one of the known options.
- Genre must be a plain positive integer (`^[1-9]\d{0,5}$`). That rejects input `Number()` would accept (`"1e3"`, `"0x1C"`, `" 28 "`). It also keeps TMDB's `,` (AND) and `|` (OR) syntax out of `with_genres`, so the URL can't be used to send TMDB a filter expression.
- Links leave out default values, so the default view is plain `/`.

### UI

**I made hover and keyboard focus behave the same.** Hovering over a card or tabbing to it lifts the card, zooms the poster and fades in an overlay with the synopsis and vote count. This works for keyboard users as well as mouse users.

**I showed release year and rating as the extra card details.** Together they answer "is this new?" and "is it any good?" at a glance. The synopsis is kept for the hover overlay so the grid stays uncluttered.

**I made each card a link to the movie's TMDB page.** Clicking a card opens the full details on TMDB in a new tab.

**I size tiles by rating, with a minimum vote count.** Movies rated 8.0 or higher with at least 100 votes get a 2×2 tile and a "Top rated" badge. The vote minimum exists because a brand-new release with a few early votes can average 9 or more. `grid-auto-flow: dense` fills the gaps the larger tiles would otherwise leave.

**I turn large tiles off under the "Highest rated" sort.** With the 200-vote minimum, nearly every movie in that sort qualifies, which would make a wall of large tiles that highlights nothing.

**I added a list layout alongside the grid.** List view shows a small poster next to the title, details and a three-line synopsis, for people who'd rather read than scan posters.

**I made the controls work without JavaScript.** They're a real `<form>` that submits with `GET`. With JavaScript, changing a dropdown applies it immediately. Without JavaScript, an *Apply* button appears. The layout toggle is plain links.

**I respect reduced-motion settings.** All transitions, including the loading shimmer, are turned off under `prefers-reduced-motion`.

**I handled the loading, empty and error states.** These are a skeleton grid while data loads, a "No movies found" message with a *Clear filters* link, and an error page with a *Try again* button if TMDB fails.

**I load the first six posters eagerly and lazy-load the rest.** The first row is visible right away, and posters further down only download when needed.

**I used plain CSS Modules instead of a CSS framework.** The UI is small, and scoped CSS plus a handful of shared variables (colors, corner radius, page margins in [`app/globals.css`](app/globals.css)) was enough without adding a dependency.

---

## Project structure

```
app/
  layout.tsx          Root layout, font, metadata
  page.tsx            Server component: parse URL → fetch → render
  loading.tsx         Skeleton grid shown while data loads
  error.tsx           Error boundary with retry
  globals.css         Design tokens and resets
components/
  Controls.tsx        Genre and sort form (the only client component)
  ViewToggle.tsx      Grid/list links
  MovieGrid.tsx       Grid or list container; decides which tiles are featured
  MovieCard.tsx       Poster card (grid, list and featured variants)
  EmptyState.tsx      "No movies found" state
lib/
  tmdb.ts             TMDB client (server-only), types, error class
  params.ts           URL ⇄ Query ⇄ TMDB params (pure, unit tested)
  rating.ts           Rule for featured (large) tiles
  images.ts           TMDB poster URL helper
tests/
  params.test.ts
  rating.test.ts
```

---

## Testing

```bash
npm run test
```

The tests cover the pure logic, where bugs are most likely and cheapest to catch:

- **`parseSort` / `parseGenre`:** valid values, unknown values, repeated params, and malformed IDs (`"0"`, `"-1"`, `"28,12"`, `"1e3"`, …).
- **`toDiscoverParams`:** the default query, the vote minimum on the rating sort, and the date limit plus genre on the newest sort.
- **`buildHref`:** default values are left out of URLs.
- **`isFeatured`:** the rating and vote-count thresholds.

The UI was checked manually across desktop and mobile widths and with keyboard navigation.

---

## How I prioritized the work

The commit history follows this order:

1. **Data first.** Fetch `/discover/movie` in a server component and confirm the data and image URLs.
2. **Core requirements.** A responsive poster grid with title, year and rating, then the hover and focus effect.
3. **Filter and sort through the URL.** I chose this early because the rest of the app is built on it.
4. **Edge cases.** Loading, empty and error states, before adding more features.
5. **Extras.** The grid/list toggle, then rating-based sizing.
6. **Tests and cleanup.** Unit tests for parsing and sizing, then tidying `lib/params.ts`.

---

## What I'd do next

- **Pagination or infinite scroll.** The brief only asks for page 1, but `toDiscoverParams` is the natural place to add a `page` param.
- **Second filter.** Release year (`primary_release_year`) would fit the same parse → validate → map pattern.
- **Component tests** for `MovieCard` variants, and an end-to-end smoke test (Playwright) for the filter → URL → results flow.
- **Image placeholders.** Blur placeholders for posters, to reduce layout shift on slow connections.

---

Data and images from [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.
