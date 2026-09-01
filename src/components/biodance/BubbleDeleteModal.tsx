"use client";

import { useState } from "react";
import { useWallStore } from "@/store/useWallStore";
import { bubbleManagerRef } from "@/lib/bubbleManagerRef";
import styles from "./BubbleDeleteModal.module.css";

/**
 * Any visitor can click a bubble to delete it (confirmed open, no
 * admin gate, for this event) — but never without this confirmation
 * step, since it's a permanent delete of someone else's comment.
 */
export function BubbleDeleteModal() {
  const pendingDelete = useWallStore((s) => s.pendingDelete);
  const clearPendingDelete = useWallStore((s) => s.clearPendingDelete);
  const decrementTodayCount = useWallStore((s) => s.decrementTodayCount);
  const [deleting, setDeleting] = useState(false);

  if (!pendingDelete) return null;

  async function handleConfirm() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/comments/${pendingDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        bubbleManagerRef.current?.removeByCommentId(pendingDelete.id);
        decrementTodayCount();
      }
    } finally {
      setDeleting(false);
      clearPendingDelete();
    }
  }

  return (
    <div className={styles.backdrop} onClick={clearPendingDelete}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <p className={styles.question}>이 한마디를 지울까요?</p>
        <p className={styles.text}>&ldquo;{pendingDelete.text}&rdquo;</p>
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={clearPendingDelete} disabled={deleting}>
            취소
          </button>
          <button type="button" className={styles.confirm} onClick={handleConfirm} disabled={deleting}>
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>
  );
}
