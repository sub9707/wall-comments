import styles from "./KeyboardGuide.module.css";

const STEPS = [
  { label: "키보드로\n메시지를 입력해주세요" },
  { label: "ENTER를 누르면\n질문 방울이 톡 하고 생성돼요" },
  { label: "다른 방울들과 어우러져\n화면에 자리 잡아요" },
];

export function KeyboardGuide() {
  return (
    <div className={styles.wrap}>
      {STEPS.map((step, i) => (
        <div className={styles.step} key={step.label}>
          <span className={styles.stepNumber}>{i + 1}</span>
          <span className={styles.stepLabel}>
            {step.label.split("\n").map((line) => (
              <span key={line} className={styles.line}>
                {line}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
