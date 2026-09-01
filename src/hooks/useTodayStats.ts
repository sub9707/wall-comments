"use client";

import { useEffect, useRef } from "react";
import { useWallStore } from "@/store/useWallStore";
import { PINK_DROP_CONFIG } from "@/lib/config";
import type { StatsTodayResponse } from "@/types/comment";

/**
 * Periodically syncs the today counter from the server. Cheap
 * cross-check/drift correction — the optimistic increment on submit
 * already handles the common case instantly.
 */
export function useTodayStats(): void {
  const setTodayCount = useWallStore((s) => s.setTodayCount);
  const setDateKey = useWallStore((s) => s.setDateKey);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/stats/today", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as StatsTodayResponse;
        if (cancelled) return;
        setTodayCount(data.count);
        setDateKey(data.dateKey);
      } catch {
        // Network hiccup — just try again on the next tick.
      }
    }

    poll();
    intervalRef.current = setInterval(poll, PINK_DROP_CONFIG.statsPollMs);

    return () => {
      cancelled = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [setTodayCount, setDateKey]);
}
