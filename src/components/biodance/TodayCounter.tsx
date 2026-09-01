"use client";

import { useWallStore } from "@/store/useWallStore";
import styles from "./TodayCounter.module.css";

export function TodayCounter() {
  const count = useWallStore((s) => s.todayCount);

  return (
    <div className={styles.card}>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        aria-hidden
      >
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20c0-3.6 3.1-6.4 7-6.4s7 2.8 7 6.4" />
      </svg>
      <div className={styles.textBlock}>
        <span className={styles.label}>TODAY&apos;S MESSAGES</span>
        <span className={styles.count}>{count.toLocaleString("en-US")}</span>
        <span className={styles.sublabel}>오늘 남긴 한마디</span>
      </div>
    </div>
  );
}
