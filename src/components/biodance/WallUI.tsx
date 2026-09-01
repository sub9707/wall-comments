"use client";

import { useRef } from "react";
import { useWallStore } from "@/store/useWallStore";
import { useSafeZoneObserver } from "@/hooks/useSafeZoneObserver";
import { BiodanceLogo } from "./BiodanceLogo";
import { BeautyNoteTitle } from "./BeautyNoteTitle";
import { CommentInput } from "./CommentInput";
import { TodayCounter } from "./TodayCounter";
import { KeyboardGuide } from "./KeyboardGuide";
import { ClearAllButton } from "./ClearAllButton";
import { BubbleViewModal } from "./BubbleViewModal";
import { BubbleContextMenu } from "./BubbleContextMenu";
import { BubbleDeleteModal } from "./BubbleDeleteModal";
import { BubbleEditModal } from "./BubbleEditModal";
import { BubblePropertiesModal } from "./BubblePropertiesModal";
import { ClearAllModal } from "./ClearAllModal";
import styles from "./WallUI.module.css";

export function WallUI() {
  const safeZoneRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const clearAllRef = useRef<HTMLDivElement>(null);
  // Registered as ONE zone: pushing a bubble out of two adjacent zones
  // separately can ping-pong it between them with no escape (see
  // BubblePhysics.ts) — the center block and footer guide are one
  // contiguous "keep clear" column, so they share a single union rect.
  useSafeZoneObserver("center", [safeZoneRef, guideRef]);
  useSafeZoneObserver("counter", [counterRef]);
  useSafeZoneObserver("clearAll", [clearAllRef]);
  const inputFocused = useWallStore((s) => s.inputFocused);

  return (
    <div className={styles.overlay}>
      <div ref={counterRef} className={styles.counterSlot}>
        <TodayCounter />
      </div>

      <div ref={clearAllRef} className={styles.clearAllSlot}>
        <ClearAllButton />
      </div>

      <div
        ref={safeZoneRef}
        className={`${styles.safeZone} ${inputFocused ? styles.focused : ""}`}
      >
        <BiodanceLogo />
        <BeautyNoteTitle />
        <CommentInput />
      </div>

      <div ref={guideRef} className={styles.guideSlot}>
        <KeyboardGuide />
      </div>

      <BubbleViewModal />
      <BubbleContextMenu />
      <BubbleDeleteModal />
      <BubbleEditModal />
      <BubblePropertiesModal />
      <ClearAllModal />
    </div>
  );
}
