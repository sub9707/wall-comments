"use client";

import { useEffect, useRef, useState } from "react";
import { useWallStore } from "@/store/useWallStore";
import styles from "./BubbleContextMenu.module.css";

const MENU_WIDTH = 160;
const MENU_HEIGHT = 148;

/** Right-click a bubble: 수정 / 삭제 / 속성. */
export function BubbleContextMenu() {
  const contextMenu = useWallStore((s) => s.contextMenu);
  const closeContextMenu = useWallStore((s) => s.closeContextMenu);
  const requestEdit = useWallStore((s) => s.requestEdit);
  const requestDelete = useWallStore((s) => s.requestDelete);
  const requestProperties = useWallStore((s) => s.requestProperties);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!contextMenu) {
      setPosition(null);
      return;
    }
    const x = Math.min(contextMenu.x, window.innerWidth - MENU_WIDTH - 12);
    const y = Math.min(contextMenu.y, window.innerHeight - MENU_HEIGHT - 12);
    setPosition({ x, y });

    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeContextMenu();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContextMenu();
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextMenu, closeContextMenu]);

  if (!contextMenu || !position) return null;

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ left: position.x, top: position.y }}
      role="menu"
    >
      <button
        type="button"
        className={styles.item}
        role="menuitem"
        onClick={() => {
          requestEdit(contextMenu.id, contextMenu.text);
          closeContextMenu();
        }}
      >
        <span className={styles.icon}>✎</span> 수정
      </button>
      <button
        type="button"
        className={`${styles.item} ${styles.danger}`}
        role="menuitem"
        onClick={() => {
          requestDelete(contextMenu.id, contextMenu.text);
          closeContextMenu();
        }}
      >
        <span className={styles.icon}>🗑</span> 삭제
      </button>
      <button
        type="button"
        className={styles.item}
        role="menuitem"
        onClick={() => {
          requestProperties(contextMenu.id, contextMenu.text, contextMenu.createdAt, contextMenu.updatedAt);
          closeContextMenu();
        }}
      >
        <span className={styles.icon}>ⓘ</span> 속성
      </button>
    </div>
  );
}
