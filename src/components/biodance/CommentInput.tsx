"use client";

import { useCallback, useRef, useState } from "react";
import { useWallStore } from "@/store/useWallStore";
import { useSpawnOriginObserver } from "@/hooks/useSpawnOriginObserver";
import { PINK_DROP_CONFIG } from "@/lib/config";
import type { PostCommentResponse } from "@/types/comment";
import styles from "./CommentInput.module.css";

const ERROR_MESSAGES: Record<string, string> = {
  empty: "한마디를 입력해주세요.",
  too_long: `${PINK_DROP_CONFIG.maxCommentLength}자 이내로 입력해주세요.`,
  banned_word: "다른 표현으로 남겨주세요.",
  url_not_allowed: "링크는 남길 수 없어요.",
  html_not_allowed: "사용할 수 없는 문자가 포함되어 있어요.",
  repeated_characters: "같은 문자를 너무 많이 반복했어요.",
  duplicate: "방금 같은 문장이 등록되었어요.",
  rate_limited: "잠시 후 다시 시도해주세요.",
  invalid_input: "다시 입력해주세요.",
  invalid_json: "다시 입력해주세요.",
  db_error: "저장에 실패했어요. 다시 시도해주세요.",
};

export function CommentInput() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const lastSubmitRef = useRef(0);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRowRef = useRef<HTMLDivElement>(null);
  useSpawnOriginObserver(inputRowRef, "bottom");

  const setInputFocused = useWallStore((s) => s.setInputFocused);
  const publishNewComment = useWallStore((s) => s.publishNewComment);
  const incrementTodayCount = useWallStore((s) => s.incrementTodayCount);

  const showError = useCallback((message: string) => {
    setError(message);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => setError(null), 2200);
  }, []);

  const submit = useCallback(async () => {
    const now = Date.now();
    if (now - lastSubmitRef.current < PINK_DROP_CONFIG.submitCooldown) {
      return;
    }
    const text = value.trim();
    if (!text || submitting) return;

    lastSubmitRef.current = now;
    setSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await res.json()) as PostCommentResponse;

      if (data.success) {
        setValue("");
        incrementTodayCount();
        publishNewComment(data.comment);
      } else {
        showError(ERROR_MESSAGES[data.error] ?? "다시 시도해주세요.");
      }
    } catch {
      showError("네트워크 오류가 발생했어요.");
    } finally {
      setSubmitting(false);
    }
  }, [value, submitting, incrementTodayCount, publishNewComment, showError]);

  return (
    <div className={styles.wrap}>
      <div ref={inputRowRef} className={styles.inputRow}>
        <input
          className={styles.input}
          type="text"
          value={value}
          maxLength={PINK_DROP_CONFIG.maxCommentLength}
          placeholder="여기에 한마디를 입력해주세요 :)"
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          autoFocus
        />
        <span className={styles.counter}>
          {value.length}/{PINK_DROP_CONFIG.maxCommentLength}
        </span>
      </div>

      <button
        type="button"
        className={styles.enterButton}
        onClick={submit}
        disabled={submitting || value.trim().length === 0}
      >
        ENTER <span className={styles.enterGlyph}>&#8629;</span>
      </button>

      <div className={styles.errorSlot} role="status">
        {error}
      </div>
    </div>
  );
}
