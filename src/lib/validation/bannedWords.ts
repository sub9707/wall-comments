/**
 * Minimal profanity / spam-keyword list for a public-kiosk beauty event.
 * Keep this list conservative — false positives frustrate real visitors
 * more than the occasional missed word hurts. Tune on-site if needed.
 */
export const BANNED_WORDS: readonly string[] = [
  "씨발",
  "시발",
  "개새끼",
  "병신",
  "지랄",
  "좆",
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "성매매",
  "도박",
  "casino",
  "대출",
  "viagra",
];

export function containsBannedWord(text: string): boolean {
  const normalized = text.toLowerCase().replace(/\s+/g, "");
  return BANNED_WORDS.some((word) => normalized.includes(word.toLowerCase()));
}
