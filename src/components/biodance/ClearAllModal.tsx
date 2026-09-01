"use client";

import { useState } from "react";
import { useWallStore } from "@/store/useWallStore";
import { clearAllTrigger } from "@/lib/clearAllTrigger";
import styles from "./BubbleDeleteModal.module.css";

/**
 * Confirms the public "전체 제거" button — this permanently deletes
 * every comment posted today from the DB (not just the on-screen
 * bubbles), so it always requires this step, same as the per-bubble
 * delete but with a much bigger blast radius.
 */
export function ClearAllModal() {
  const clearAllRequested = useWallStore((s) => s.clearAllRequested);
  const cancelClearAll = useWallStore((s) => s.cancelClearAll);
  const setTodayCount = useWallStore((s) => s.setTodayCount);
  const [clearing, setClearing] = useState(false);

  if (!clearAllRequested) return null;

  async function handleConfirm() {
    setClearing(true);
    try {
      const res = await fetch("/api/comments/clear-today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      if (res.ok) {
        clearAllTrigger.current?.();
        setTodayCount(0);
      }
    } finally {
      setClearing(false);
      cancelClearAll();
    }
  }

  return (
    <div className={styles.backdrop} onClick={cancelClearAll}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <p className={styles.question}>오늘 남긴 모든 한마디를 지울까요?</p>
        <p className={styles.text}>이 작업은 되돌릴 수 없어요.</p>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={cancelClearAll} disabled={clearing}>
            취소
          </button>
          <button type="button" className={styles.confirm} onClick={handleConfirm} disabled={clearing}>
            {clearing ? "제거 중..." : "전체 제거"}
          </button>
        </div>
      </div>
    </div>
  );
}
