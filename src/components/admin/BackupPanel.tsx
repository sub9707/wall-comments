"use client";

import { useState } from "react";
import styles from "./BackupPanel.module.css";

export function BackupPanel() {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleBackup() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/backup", { method: "POST" });
      const data = (await res.json()) as { success: boolean; fileName?: string };
      setStatus(data.success ? `백업 완료: ${data.fileName}` : "백업 실패");
    } catch {
      setStatus("네트워크 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>Backup</h2>
      <p className={styles.desc}>현재 DB 전체를 backup/ 폴더에 복사합니다.</p>
      <button className={styles.button} onClick={handleBackup} disabled={loading}>
        {loading ? "백업 중..." : "지금 백업"}
      </button>
      {status && <p className={styles.status}>{status}</p>}
    </div>
  );
}
