"use client";

import { useEffect, useRef } from "react";
import { getKstDateKey } from "@/lib/date/kst";
import { PINK_DROP_CONFIG } from "@/lib/config";

/**
 * Watches the KST date key while the app stays open across midnight and
 * fires onRollover exactly once when the day changes, so a kiosk left
 * running overnight starts a fresh wall for the new day without a reload.
 */
export function useDateRollover(onRollover: () => void): void {
  const currentDateKeyRef = useRef<string>(getKstDateKey());
  const callbackRef = useRef(onRollover);

  useEffect(() => {
    callbackRef.current = onRollover;
  }, [onRollover]);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = getKstDateKey();
      if (next !== currentDateKeyRef.current) {
        currentDateKeyRef.current = next;
        callbackRef.current();
      }
    }, PINK_DROP_CONFIG.dateRolloverPollMs);

    return () => clearInterval(interval);
  }, []);
}
