"use client";

import { PinkDropScene } from "@/components/pink-drop/PinkDropScene";
import { WallUI } from "@/components/wall/WallUI";
import { useTodayStats } from "@/hooks/useTodayStats";
import { useKioskHardening } from "@/hooks/useKioskHardening";
import styles from "./page.module.css";

export default function WallPage() {
  useTodayStats();
  useKioskHardening();

  return (
    <main className={styles.stage}>
      <PinkDropScene />
      <WallUI />
    </main>
  );
}
