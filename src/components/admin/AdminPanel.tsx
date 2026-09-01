"use client";

import { useCallback, useEffect, useState } from "react";
import { getWallPaused, setWallPaused, triggerClearScreen } from "@/lib/adminControlBridge";
import { PINK_DROP_CONFIG } from "@/lib/config";
import { ModerationPanel } from "./ModerationPanel";
import { BackupPanel } from "./BackupPanel";
import styles from "./AdminPanel.module.css";

export function AdminPanel({ onLogout }: { onLogout: () => void }) {
  const [count, setCount] = useState(0);
  const [dateKey, setDateKey] = useState("");
  const [paused, setPaused] = useState(() => getWallPaused());
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);

  const pollStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats/today", { cache: "no-store" });
      const data = (await res.json()) as { dateKey: string; count: number };
      setCount(data.count);
      setDateKey(data.dateKey);
    } catch {
      // ignore transient errors
    }
  }, []);

  useEffect(() => {
    // setState only happens after the fetch's await resolves, same as the
    // fetch-on-mount pattern elsewhere — safe despite the heuristic lint warning.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    pollStats();
    const interval = setInterval(pollStats, PINK_DROP_CONFIG.statsPollMs);
    return () => clearInterval(interval);
  }, [pollStats]);

  function togglePause() {
    const next = !paused;
    setPaused(next);
    setWallPaused(next);
  }

  function handleClearScreen() {
    if (!window.confirm("화면의 시각화만 초기화합니다. DB 데이터는 유지됩니다. 계속할까요?")) return;
    triggerClearScreen();
  }

  async function handleDeleteData() {
    if (!window.confirm(`정말로 오늘(${dateKey}) 댓글 ${count}건을 DB에서 완전히 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/clear-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const data = (await res.json()) as { success: boolean; deletedCount?: number };
      setDeleteStatus(data.success ? `${data.deletedCount}건 삭제 완료` : "삭제 실패");
      pollStats();
    } catch {
      setDeleteStatus("네트워크 오류");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    onLogout();
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>교촌치킨 Wall Admin</h1>
          <p className={styles.subtitle}>{dateKey}</p>
        </div>
        <button className={styles.logout} onClick={handleLogout}>
          로그아웃
        </button>
      </header>

      <section className={styles.statCard}>
        <span className={styles.statLabel}>TODAY&apos;S NOTES</span>
        <span className={styles.statCount}>{count.toLocaleString("en-US")}</span>
      </section>

      <section className={styles.controls}>
        <button className={styles.controlButton} onClick={togglePause}>
          {paused ? "RESUME" : "PAUSE"}
        </button>
        <button className={styles.controlButton} onClick={handleClearScreen}>
          CLEAR SCREEN
        </button>
        <button className={`${styles.controlButton} ${styles.danger}`} onClick={handleDeleteData}>
          DELETE TODAY&apos;S DATA
        </button>
      </section>
      {deleteStatus && <p className={styles.deleteStatus}>{deleteStatus}</p>}

      <div className={styles.grid}>
        <ModerationPanel />
        <BackupPanel />
      </div>
    </div>
  );
}
