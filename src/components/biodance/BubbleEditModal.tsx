"use client";

import { useEffect, useRef, useState } from "react";
import { useWallStore } from "@/store/useWallStore";
import { bubbleManagerRef } from "@/lib/bubbleManagerRef";
import { PINK_DROP_CONFIG } from "@/lib/config";
import type { PatchCommentResponse } from "@/types/comment";
import styles from "./BubbleEditModal.module.css";

const ERROR_MESSAGES: Record<string, string> = {
  empty: "한마디를 입력해주세요.",
  too_long: `${PINK_DROP_CONFIG.maxCommentLength}자 이내로 입력해주세요.`,
  banned_word: "다른 표현으로 남겨주세요.",
  url_not_allowed: "링크는 남길 수 없어요.",
  html_not_allowed: "사용할 수 없는 문자가 포함되어 있어요.",
  repeated_characters: "같은 문자를 너무 많이 반복했어요.",
  rate_limited: "잠시 후 다시 시도해주세요.",
  not_found: "이미 삭제된 메시지예요.",
};

export function BubbleEditModal() {
  const pendingEdit = useWallStore((s) => s.pendingEdit);
  const clearPendingEdit = useWallStore((s) => s.clearPendingEdit);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (pendingEdit) {
      setValue(pendingEdit.text);
      setError(null);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [pendingEdit]);

  if (!pendingEdit) return null;

  async function handleSave() {
    if (!pendingEdit) return;
    const text = value.trim();
    if (!text) {
      setError(ERROR_MESSAGES.empty!);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/comments/${pendingEdit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as PatchCommentResponse;
      if (data.success) {
        bubbleManagerRef.current?.updateTextByCommentId(data.comment.id, data.comment.text, data.comment.updatedAt);
        clearPendingEdit();
      } else {
        setError(ERROR_MESSAGES[data.error] ?? "수정에 실패했어요.");
      }
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.backdrop} onClick={clearPendingEdit}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className={styles.title}>메시지 수정</h2>
        <textarea
          ref={inputRef}
          className={styles.textarea}
          value={value}
          maxLength={PINK_DROP_CONFIG.maxCommentLength}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSave();
            }
          }}
        />
        <div className={styles.counter}>
          {value.length}/{PINK_DROP_CONFIG.maxCommentLength}
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={clearPendingEdit} disabled={saving}>
            취소
          </button>
          <button type="button" className={styles.save} onClick={handleSave} disabled={saving || !value.trim()}>
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
