"use client";

import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>What If Money</h1>
        <p className={styles.subtitle}>
          See how your financial future changes with every decision
        </p>
      </header>
      <main className={styles.main}>
        <p className={styles.placeholder}>App components coming soon.</p>
      </main>
    </div>
  );
}
