"use client";

import { useEffect } from "react";

const IDLE_CURSOR_TIMEOUT = 4000;

/**
 * Best-effort kiosk hardening from within the page itself — hides the
 * cursor after idle, blocks the context menu and text selection. Full
 * browser-chrome lockdown (fullscreen, refresh, alt-tab) still needs an
 * OS-level kiosk launch (see README) since a web page can't control that.
 */
export function useKioskHardening(): void {
  useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;

    const resetIdleTimer = () => {
      document.body.classList.remove("kiosk-idle");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => document.body.classList.add("kiosk-idle"), IDLE_CURSOR_TIMEOUT);
    };

    const blockContextMenu = (e: MouseEvent) => e.preventDefault();

    resetIdleTimer();
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("contextmenu", blockContextMenu);

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("contextmenu", blockContextMenu);
    };
  }, []);
}
