import { PINK_DROP_CONFIG } from "@/lib/config";
import { containsBannedWord } from "./bannedWords";

export type ValidationResult =
  | { valid: true; text: string }
  | { valid: false; error: string };

const HTML_TAG_PATTERN = /<[^>]*>/;
const URL_PATTERN = /(https?:\/\/|www\.)\S+/i;
// same character (grouped) repeated 6+ times, e.g. "ㅋㅋㅋㅋㅋㅋㅋㅋ" or "!!!!!!!!"
const REPEATED_CHAR_PATTERN = /(.)\1{5,}/u;

export function validateCommentText(
  rawText: unknown,
  recentTexts: string[] = []
): ValidationResult {
  if (typeof rawText !== "string") {
    return { valid: false, error: "invalid_input" };
  }

  const text = rawText.trim().replace(/\s+/g, " ");

  if (text.length === 0) {
    return { valid: false, error: "empty" };
  }

  if (text.length > PINK_DROP_CONFIG.maxCommentLength) {
    return { valid: false, error: "too_long" };
  }

  if (HTML_TAG_PATTERN.test(rawText)) {
    return { valid: false, error: "html_not_allowed" };
  }

  if (URL_PATTERN.test(text)) {
    return { valid: false, error: "url_not_allowed" };
  }

  if (REPEATED_CHAR_PATTERN.test(text)) {
    return { valid: false, error: "repeated_characters" };
  }

  if (containsBannedWord(text)) {
    return { valid: false, error: "banned_word" };
  }

  const normalized = text.toLowerCase();
  if (recentTexts.some((recent) => recent.trim().toLowerCase() === normalized)) {
    return { valid: false, error: "duplicate" };
  }

  return { valid: true, text };
}
