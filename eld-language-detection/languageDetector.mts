// eld's package.json only allows 'import', which Playwright's loader cannot resolve for 'eld/large',
// so the large database is imported by path. The package has no types for this path, so reuse the ones from 'eld'.
import type { eld as EldType } from 'eld';
// @ts-ignore
import { eld as eldLarge } from '../node_modules/eld/src/entries/static.large.js';

const eld: typeof EldType = eldLarge;

const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });

// Languages eld does not support (checked against the eld README list).
// eld labels them as a close relative instead: af -> nl, id -> ms, bs -> hr.
export const UNSUPPORTED_BY_ELD = ['af', 'id', 'bs'];

export type CheckStatus = 'PASS' | 'FAIL' | 'FAIL_UNSUPPORTED';

export interface LanguageCheck {
  status: CheckStatus;
  expected: string;
  detected: string;
  expectedName: string;
  detectedName: string;
}

/** ISO code -> English language name ('de' -> 'German'). Empty/unknown code -> 'unknown'. */
export function getLanguageName(code: string): string {
  if (!code) return 'unknown';
  try {
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** Detects the language of the text. Returns the ISO code, or '' if eld cannot decide. */
export function detectLanguageCode(text: string): string {
  return eld.detect(text).language;
}

/** Detects the language of the text. Returns the English name ('German'), or 'unknown'. */
export function detectLanguageName(text: string): string {
  return getLanguageName(detectLanguageCode(text));
}

/** True if eld has no model for this language code, so a wrong result is expected. */
export function isUnsupportedByEld(code: string): boolean {
  return UNSUPPORTED_BY_ELD.includes(code);
}

/** Compares the detected language of the text with the expected ISO code. */
export function checkLanguage(text: string, expectedCode: string): LanguageCheck {
  const detected = detectLanguageCode(text);

  let status: CheckStatus = 'PASS';
  if (detected !== expectedCode) {
    status = isUnsupportedByEld(expectedCode) ? 'FAIL_UNSUPPORTED' : 'FAIL';
  }

  return {
    status,
    expected: expectedCode,
    detected,
    expectedName: getLanguageName(expectedCode),
    detectedName: getLanguageName(detected),
  };
}

/** Simple boolean version of checkLanguage, handy for expect(...).toBe(true). */
export function isLanguage(text: string, expectedCode: string): boolean {
  return detectLanguageCode(text) === expectedCode;
}

/** Runs checkLanguage for many texts and counts each status. */
export function summarize(checks: LanguageCheck[]): Record<CheckStatus | 'TOTAL', number> {
  const summary = { PASS: 0, FAIL: 0, FAIL_UNSUPPORTED: 0, TOTAL: checks.length };
  for (const check of checks) summary[check.status]++;
  return summary;
}

// ---- Name-based helpers: use these when you have language names, not ISO codes ----

/** Lower-case, trim and drop a region suffix: ' English (UK) ' -> 'english'. */
function normalizeName(name: string): string {
  return name.replace(/\(.*?\)/g, '').trim().toLowerCase();
}

// Reverse lookup built once: 'german' -> 'de' (covers every 2-letter code, including ones eld lacks).
const codeByName = new Map<string, string>();
for (const a of 'abcdefghijklmnopqrstuvwxyz') {
  for (const b of 'abcdefghijklmnopqrstuvwxyz') {
    const code = a + b;
    const name = languageNames.of(code);
    if (name && name !== code) codeByName.set(normalizeName(name), code);
  }
}

/** 'German' -> 'de'. Region suffixes are ignored ('English (UK)' -> 'en'). Throws if the name is unknown. */
export function getLanguageCode(name: string): string {
  const code = codeByName.get(normalizeName(name));
  if (!code) throw new Error(`Unknown language name: '${name}'`);
  return code;
}

/** Compares two language names, ignoring case and region: ('german', 'German') -> true. */
export function compareLanguageNames(expectedName: string, detectedName: string): boolean {
  return normalizeName(expectedName) === normalizeName(detectedName);
}

/** Detects the language of the text and compares it with the expected language NAME ('German'). */
export function isLanguageName(text: string, expectedName: string): boolean {
  return compareLanguageNames(expectedName, detectLanguageName(text));
}

/** Same as checkLanguage, but the expected language is given as a name ('Afrikaans'). */
export function checkLanguageByName(text: string, expectedName: string): LanguageCheck {
  return checkLanguage(text, getLanguageCode(expectedName));
}

// ---- All-in-one detection: null/empty check, trim, retry on cleaned text, never throws ----

/**
 * Detects the language of the text and returns its English name ('German').
 * - null / empty / whitespace-only text -> 'Unknown'
 * - if eld cannot decide, retries once with numbers and symbols removed
 * - still undecided -> 'Unknown'
 * - any unexpected error -> 'Unknown, error msg is <message>'
 */
export function detectLanguage(text: string | null | undefined): string {
  try {
    if (text == null || text.trim() === '') {
      console.debug('detectLanguage called with empty text.');
      return 'Unknown';
    }

    const cleanText = text.trim();

    // First attempt
    let code = detectLanguageCode(cleanText);

    // Retry with only letters, marks (needed for Hindi, Tamil, etc.) and spaces
    if (!code) {
      console.debug('First detection failed. Retrying with sanitized text...');
      const sanitized = cleanText.replace(/[^\p{L}\p{M}\s]/gu, '').trim();
      if (sanitized) code = detectLanguageCode(sanitized);
    }

    if (!code) {
      console.debug(`Language still not detected after retry: ${cleanText}`);
      return 'Unknown';
    }

    const name = getLanguageName(code);
    console.info(
      '\n========== LANGUAGE DETECTION ==========\n' +
        `Detected Language : ${name}\n` +
        `Input Text        : ${cleanText}\n` +
        '========================================'
    );
    return name;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`Language detection failed: ${message}`);
    return `Unknown, error msg is ${message}`;
  }
}
