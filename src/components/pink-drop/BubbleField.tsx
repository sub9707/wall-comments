"use client";

import { useEffect, useRef } from "react";
import { createBubbleDomPool } from "./BubbleDom";
import { createRippleLayer } from "./RippleLayer";
import { createBubbleManager } from "./BubbleManager";
import { useWallStore } from "@/store/useWallStore";
import { subscribeToAdminControl, getWallPaused } from "@/lib/adminControlBridge";
import { bubbleManagerRef } from "@/lib/bubbleManagerRef";
import { clearAllTrigger } from "@/lib/clearAllTrigger";
import { useDateRollover } from "@/hooks/useDateRollover";
import { PINK_DROP_CONFIG } from "@/lib/config";
import type { CommentsTodayResponse } from "@/types/comment";

/**
 * Owns the bubble DOM pool and drives it with a single
 * requestAnimationFrame loop — no Three.js/WebGL. `glass-bubble.png`
 * is shown via plain <img> elements (see BubbleDom.ts); this component
 * is only responsible for lifecycle (spawn/hydrate/pause/clear) and
 * the per-frame update tick.
 *
 * Pool/ripple/manager are created inside the effect (not useMemo) —
 * they touch `document` directly, which doesn't exist during Next.js's
 * server-side prerender pass.
 */
export function BubbleField() {
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);
  const setTodayCount = useWallStore((s) => s.setTodayCount);
  const setDateKey = useWallStore((s) => s.setDateKey);
  const setPaused = useWallStore((s) => s.setPaused);

  useDateRollover(() => {
    clearAllTrigger.current?.();
  });

  useEffect(() => {
    const pool = createBubbleDomPool(PINK_DROP_CONFIG.maxActiveBubbles);
    const ripple = createRippleLayer();
    const manager = createBubbleManager(pool, ripple);
    bubbleManagerRef.current = manager;
    clearAllTrigger.current = () => manager.clearAll(elapsedRef.current);

    // Event delegation on the pool container (one listener instead of
    // 45) reads the clicked bubble's data-comment-* attributes.
    // Left-click: just view the message full-size. Right-click: the
    // 수정/삭제/속성 menu (see BubbleContextMenu.tsx).
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-comment-id]");
      const id = target?.dataset.commentId;
      const text = target?.dataset.commentText;
      if (id && text) useWallStore.getState().requestView(id, text);
    };
    const handleContextMenu = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-comment-id]");
      const id = target?.dataset.commentId;
      const text = target?.dataset.commentText;
      const createdAt = target?.dataset.commentCreatedAt;
      const updatedAt = target?.dataset.commentUpdatedAt;
      if (!id || !text || !createdAt || !updatedAt) return;
      e.preventDefault();
      useWallStore.getState().openContextMenu({ id, text, createdAt, updatedAt, x: e.clientX, y: e.clientY });
    };
    pool.container.addEventListener("click", handleClick);
    pool.container.addEventListener("contextmenu", handleContextMenu);

    pausedRef.current = getWallPaused();
    setPaused(pausedRef.current);

    const unsubscribeControl = subscribeToAdminControl({
      onPausedChange: (paused) => {
        pausedRef.current = paused;
        setPaused(paused);
      },
      onClearSignal: () => clearAllTrigger.current?.(),
    });

    // Rehydrate today's recent comments so a refresh/PM2 restart doesn't lose the wall.
    (async () => {
      try {
        const res = await fetch("/api/comments/today", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as CommentsTodayResponse;
        setTodayCount(data.count);
        setDateKey(data.dateKey);
        manager.hydrate(data.comments, elapsedRef.current);
      } catch {
        // Offline/first-boot race — the wall just starts empty, which is fine.
      }
    })();

    // Spawn a bubble the instant a comment is successfully posted elsewhere in the app.
    const unsubscribeStore = useWallStore.subscribe((state, prevState) => {
      if (state.latestComment && state.latestComment !== prevState.latestComment) {
        manager.spawn(state.latestComment, () => elapsedRef.current);
      }
    });

    const startTime = performance.now();
    let lastTime = startTime;
    let frameId = requestAnimationFrame(function tick(now) {
      const elapsed = (now - startTime) / 1000;
      const dt = Math.min(0.1, (now - lastTime) / 1000); // clamp so a tab-switch stall can't fling bubbles
      lastTime = now;
      elapsedRef.current = elapsed;
      if (!pausedRef.current) manager.update(elapsed, dt);
      frameId = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(frameId);
      pool.container.removeEventListener("click", handleClick);
      pool.container.removeEventListener("contextmenu", handleContextMenu);
      bubbleManagerRef.current = null;
      clearAllTrigger.current = null;
      unsubscribeControl();
      unsubscribeStore();
      pool.dispose();
      ripple.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
