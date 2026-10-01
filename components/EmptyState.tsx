import Link from "next/link";
import styles from "./Status.module.css";

export function EmptyState() {
  return (
    <div className={styles.status} role="status">
      <h2 className={styles.heading}>No movies found</h2>
      <p className={styles.body}>Nothing matches this combination. Try a different genre or sort.</p>
      <Link href="/" className={styles.action}>
        Clear filters
      </Link>
    </div>
  );
}