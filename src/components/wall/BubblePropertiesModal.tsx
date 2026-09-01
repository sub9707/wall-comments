"use client";

import { useWallStore } from "@/store/useWallStore";
import styles from "./BubblePropertiesModal.module.css";

/** "YYYY-MM-DDTHH:mm:ss+09:00" -> "YYYY-MM-DD HH:mm:ss" */
function formatKstTimestamp(iso: string): string {
  const [date, timeWithOffset] = iso.split("T");
  const time = timeWithOffset?.split("+")[0];
  return date && time ? `${date} ${time}` : iso;
}

export function BubblePropertiesModal() {
  const pendingProperties = useWallStore((s) => s.pendingProperties);
  const clearPendingProperties = useWallStore((s) => s.clearPendingProperties);

  if (!pendingProperties) return null;

  const wasEdited = pendingProperties.updatedAt !== pendingProperties.createdAt;

  return (
    <div className={styles.backdrop} onClick={clearPendingProperties}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className={styles.title}>메시지 속성</h2>

        <dl className={styles.list}>
          <dt>내용</dt>
          <dd className={styles.text}>{pendingProperties.text}</dd>

          <dt>작성일</dt>
          <dd>{formatKstTimestamp(pendingProperties.createdAt)}</dd>

          <dt>최근 수정일</dt>
          <dd>{wasEdited ? formatKstTimestamp(pendingProperties.updatedAt) : "수정 이력 없음"}</dd>
        </dl>

        <button type="button" className={styles.close} onClick={clearPendingProperties}>
          닫기
        </button>
      </div>
    </div>
  );
}
