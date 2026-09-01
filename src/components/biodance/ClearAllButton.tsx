"use client";

import { useWallStore } from "@/store/useWallStore";
import styles from "./ClearAllButton.module.css";

export function ClearAllButton() {
  const requestClearAll = useWallStore((s) => s.requestClearAll);

  return (
    <button type="button" className={styles.button} onClick={requestClearAll}>
      전체 제거
    </button>
  );
}
