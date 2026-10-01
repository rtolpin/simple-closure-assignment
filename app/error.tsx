"use client";

import { useEffect } from "react";
import styles from "@/components/Status.module.css";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className={styles.status} role="alert">
      <h2 className={styles.heading}>Could not load movies</h2>
      <p className={styles.body}>
        The Movie Database did not respond as expected. Check your connection and try again.
      </p>
      <button type="button" className={styles.action} onClick={() => retry()}>
        Try again
      </button>
    </main>
  );
}