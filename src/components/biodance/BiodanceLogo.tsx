import styles from "./BiodanceLogo.module.css";

export function BiodanceLogo() {
  // eslint-disable-next-line @next/next/no-img-element -- fixed static asset, no need for next/image optimization on a kiosk build
  return <img src="/assets/KC-logo.png" alt="교촌치킨" className={styles.logo} />;
}
