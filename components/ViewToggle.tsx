import Link from "next/link";
import { buildHref, VIEWS, type Query } from "@/lib/params";
import styles from "./ViewToggle.module.css";

const ICONS = {
  grid: (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M1 1h6v6H1zM9 1h6v6H9zM1 9h6v6H1zM9 9h6v6H9z" fill="currentColor" />
    </svg>
  ),
  list: (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M1 2h14v3H1zM1 6.5h14v3H1zM1 11h14v3H1z" fill="currentColor" />
    </svg>
  ),
};

export function ViewToggle({ query }: { query: Query }) {
  return (
    <nav className={styles.toggle} aria-label="Layout">
      {VIEWS.map((view) => (
        <Link
          key={view}
          href={buildHref(query, { view })}
          className={styles.option}
          aria-current={query.view === view ? "page" : undefined}
          aria-label={`${view} view`}
          scroll={false}
        >
          {ICONS[view]}
        </Link>
      ))}
    </nav>
  );
}