import type { BiText, Lang } from "./types";

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert a number to Persian digits when lang is fa. */
export function num(n: number, lang: Lang): string {
  const s = String(n);
  if (lang === "fa") return s.replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
  return s;
}

export function bi(t: BiText, lang: Lang): string {
  return t[lang];
}

export function vibrate(pattern: number | number[], vibrationOn: boolean) {
  if (!vibrationOn) return;
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

export function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/** today's date as YYYY-MM-DD (local) */
export function todayKey(): string {
  const d = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** deterministic daily pseudo random in [0, n) */
export function dailySeed(n: number): number {
  const k = todayKey();
  let h = 0;
  for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
  return h % n;
}
