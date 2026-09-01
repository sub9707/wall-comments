"use client";

import { useCallback, useEffect, useState } from "react";
import type { Comment, CommentsTodayResponse } from "@/types/comment";
import styles from "./ModerationPanel.module.css";

export function ModerationPanel() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/comments/today", { cache: "no-store" });
      const data = (await res.json()) as CommentsTodayResponse;
      setComments(data.comments);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    load();
  }, [load]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>Moderation — 최근 댓글</h2>
        <button className={styles.refresh} onClick={handleRefresh} disabled={loading}>
          새로고침
        </button>
      </div>

      {loading ? (
        <p className={styles.empty}>불러오는 중...</p>
      ) : comments.length === 0 ? (
        <p className={styles.empty}>오늘 등록된 댓글이 없습니다.</p>
      ) : (
        <ul className={styles.list}>
          {comments.map((comment) => (
            <li key={comment.id} className={styles.row}>
              <div className={styles.rowText}>
                <span className={styles.text}>{comment.text}</span>
                <span className={styles.time}>{comment.createdAt.slice(11, 19)}</span>
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(comment.id)}
                disabled={deletingId === comment.id}
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
