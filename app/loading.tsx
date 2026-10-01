import gridStyles from "@/components/MovieGrid.module.css";
import pageStyles from "./page.module.css";
import styles from "./loading.module.css";

const SKELETON_COUNT = 12;

export default function Loading() {
  return (
    <main className={pageStyles.main} aria-busy="true" aria-label="Loading movies">
      <div className={styles.header} />
      <ul className={gridStyles.grid}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <li key={i} className={styles.card}>
            <div className={styles.poster} />
            <div className={styles.line} />
            <div className={`${styles.line} ${styles.short}`} />
          </li>
        ))}
      </ul>
    </main>
  );
}