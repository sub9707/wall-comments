import styles from "./BeautyNoteTitle.module.css";

export function BeautyNoteTitle() {
  return (
    <div className={styles.wrap}>
      <p className={styles.subtitle}>
        교촌치킨과 함께한 오늘을
        <br />
        한마디로 남겨주세요.
      </p>
    </div>
  );
}
