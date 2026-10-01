"use client";

import Form from "next/form";
import type { Genre } from "@/lib/tmdb";
import { DEFAULT_VIEW, SORT_OPTIONS, type Query } from "@/lib/params";
import styles from "./Controls.module.css";

type Props = {
  query: Query;
  genres: Genre[];
};

export function Controls({ query, genres }: Props) {
  return (
    <Form
      action="/"
      className={styles.controls}
      onChange={(e) => e.currentTarget.requestSubmit()}
    >
      <label className={styles.field}>
        <span className={styles.label}>Genre</span>
        <select name="genre" defaultValue={query.genre ?? ""} className={styles.select}>
          <option value="">All genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Sort by</span>
        <select name="sort" defaultValue={query.sort} className={styles.select}>
          {Object.entries(SORT_OPTIONS).map(([key, { label }]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>

      {query.view !== DEFAULT_VIEW && <input type="hidden" name="view" value={query.view} />}

      <noscript>
        <button type="submit" className={styles.select}>
          Apply
        </button>
      </noscript>
    </Form>
  );
}