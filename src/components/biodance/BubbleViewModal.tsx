"use client";

import { useWallStore } from "@/store/useWallStore";
import styles from "./BubbleViewModal.module.css";

/** Left-click a bubble: just show its message, full-size and easy to read from a distance. */
export function BubbleViewModal() {
  const pendingView = useWallStore((s) => s.pendingView);
  const clearPendingView = useWallStore((s) => s.clearPendingView);

  if (!pendingView) return null;

  return (
    <div className={styles.backdrop} onClick={clearPendingView}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <span className={styles.quote} aria-hidden>
          &ldquo;
        </span>
        <p className={styles.text}>{pendingView.text}</p>
        <button type="button" className={styles.close} onClick={clearPendingView} aria-label="닫기">
          ✕
        </button>
      </div>
    </div>
  );
}
