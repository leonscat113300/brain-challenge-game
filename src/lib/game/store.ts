"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lang } from "./types";
import { todayKey, dailySeed } from "./utils";

export type Screen = "menu" | "levels" | "game";
export type ModalKind = null | "settings" | "store" | "daily" | "profile" | "achievements" | "about";

export interface Stats {
  solved: number;
  perfect: number;
  hintsUsed: number;
  skips: number;
  coinsEarned: number;
  mistakes: number;
  /* performance trackers used by the achievements system */
  flawlessStreak: number; // consecutive levels finished with 0 mistakes
  noHintStreak: number; // consecutive levels finished without hints
  fastSolves: number; // levels solved <= 45s with no hint & no mistake
  clutchWins: number; // levels won with exactly one life left
  comebacks: number; // levels won right after a defeat retry
}

export const DEFAULT_STATS: Stats = {
  solved: 0,
  perfect: 0,
  hintsUsed: 0,
  skips: 0,
  coinsEarned: 0,
  mistakes: 0,
  flawlessStreak: 0,
  noHintStreak: 0,
  fastSolves: 0,
  clutchWins: 0,
  comebacks: 0,
};

export type AchCategory = "progress" | "accuracy" | "speed" | "persistence" | "puzzle" | "flawless";

export interface AchievementMeta {
  id: string;
  icon: string;
  cat: AchCategory;
  name: { fa: string; en: string };
  desc: { fa: string; en: string };
}

/** Measurable, performance-based badges. `unlockCheck` is the single source of truth. */
export const ACHIEVEMENTS: AchievementMeta[] = [
  /* ---- progress ---- */
  { id: "first", icon: "sparkles", cat: "progress", name: { fa: "اولین قدم", en: "First Step" }, desc: { fa: "اولین مرحله را حل کن", en: "Solve your first level" } },
  { id: "five", icon: "compass", cat: "progress", name: { fa: "کاوشگر", en: "Explorer" }, desc: { fa: "۵ مرحله را حل کن", en: "Solve 5 levels" } },
  { id: "ten", icon: "footprints", cat: "progress", name: { fa: "ده‌پله", en: "Ten Steps" }, desc: { fa: "۱۰ مرحله را حل کن", en: "Solve 10 levels" } },
  { id: "quarter", icon: "flag", cat: "progress", name: { fa: "ربع راه", en: "Quarter Way" }, desc: { fa: "۲۵ مرحله را حل کن", en: "Solve 25 levels" } },
  { id: "half", icon: "milestone", cat: "progress", name: { fa: "نیمهٔ راه", en: "Halfway Hero" }, desc: { fa: "۵۰ مرحله را حل کن", en: "Solve 50 levels" } },
  { id: "century", icon: "medal", cat: "progress", name: { fa: "صد معما", en: "Century Club" }, desc: { fa: "۱۰۰ مرحله را حل کن", en: "Solve 100 levels" } },
  { id: "master", icon: "crown", cat: "progress", name: { fa: "استاد مغز", en: "Brain Master" }, desc: { fa: "همهٔ مراحل را حل کن", en: "Solve every level" } },
  { id: "rich", icon: "coins", cat: "progress", name: { fa: "پول‌ساز", en: "Coin Master" }, desc: { fa: "در مجموع ۳۰۰ سکه به دست بیاور", en: "Earn 300 coins in total" } },
  { id: "tycoon", icon: "bank", cat: "progress", name: { fa: "خزانه‌دار", en: "Coin Tycoon" }, desc: { fa: "در مجموع ۱۰۰۰ سکه به دست بیاور", en: "Earn 1000 coins in total" } },
  /* ---- accuracy ---- */
  { id: "star3", icon: "star", cat: "accuracy", name: { fa: "ستاره‌دار", en: "Star Struck" }, desc: { fa: "در یک مرحله ۳ ستاره بگیر", en: "Get 3 stars on any level" } },
  { id: "stars15", icon: "star", cat: "accuracy", name: { fa: "ستاره‌چین", en: "Star Picker" }, desc: { fa: "در مجموع ۱۵ ستاره جمع کن", en: "Collect 15 stars in total" } },
  { id: "stars45", icon: "moonstar", cat: "accuracy", name: { fa: "شکارچی ستاره", en: "Star Hunter" }, desc: { fa: "در مجموع ۴۵ ستاره جمع کن", en: "Collect 45 stars in total" } },
  { id: "clutch", icon: "heart", cat: "accuracy", name: { fa: "آخرین جان", en: "Last Life" }, desc: { fa: "مرحله‌ای را با آخرین جان ببر", en: "Win a level with your last life" } },
  /* ---- speed ---- */
  { id: "speedy1", icon: "zap", cat: "speed", name: { fa: "برق‌آسا", en: "Speedy" }, desc: { fa: "یک مرحله را در کمتر از ۴۵ ثانیه و بدون راهنما حل کن", en: "Solve a level under 45s with no hints" } },
  { id: "speedy5", icon: "timer", cat: "speed", name: { fa: "تندمغز", en: "Fast Mind" }, desc: { fa: "۵ مرحله را در کمتر از ۴۵ ثانیه و بدون راهنما حل کن", en: "Solve 5 levels under 45s with no hints" } },
  /* ---- persistence ---- */
  { id: "daily3", icon: "gift", cat: "persistence", name: { fa: "مهمان وفادار", en: "Loyal Guest" }, desc: { fa: "۳ روز متوالی مأموریت روزانه را انجام بده", en: "Claim the daily mission 3 days in a row" } },
  { id: "daily7", icon: "flame", cat: "persistence", name: { fa: "هفت‌روزه", en: "Week Warrior" }, desc: { fa: "۷ روز متوالی مأموریت روزانه را انجام بده", en: "Claim the daily mission 7 days in a row" } },
  { id: "comeback", icon: "undo", cat: "persistence", name: { fa: "سربه‌سر", en: "Comeback Kid" }, desc: { fa: "بعد از شکست، در تلاش دوباره پیروز شو", en: "Win right after a defeat retry" } },
  /* ---- puzzle solving ---- */
  { id: "nohint5", icon: "brainoff", cat: "puzzle", name: { fa: "ذهن روشن", en: "Clear Mind" }, desc: { fa: "۵ مرحله پشت سر هم بدون راهنما حل کن", en: "Solve 5 levels in a row with no hints" } },
  { id: "nohint10", icon: "brain", cat: "puzzle", name: { fa: "ذهن خلاق", en: "Creative Mind" }, desc: { fa: "۱۰ مرحله پشت سر هم بدون راهنما حل کن", en: "Solve 10 levels in a row with no hints" } },
  { id: "skipfree", icon: "target", cat: "puzzle", name: { fa: "بی‌نیاز", en: "No Skipper" }, desc: { fa: "۱۵ مرحله را بدون رد کردن حل کن", en: "Solve 15 levels without skipping" } },
  /* ---- flawless ---- */
  { id: "perfect5", icon: "gem", cat: "flawless", name: { fa: "بی‌نقص‌کار", en: "Flawless Doer" }, desc: { fa: "۵ بار مرحله را بی‌نقص (۳ ستاره) حل کن", en: "Get 3 stars on 5 levels" } },
  { id: "perfect15", icon: "award", cat: "flawless", name: { fa: "ماشین بی‌نقص", en: "Perfection Machine" }, desc: { fa: "۱۵ بار مرحله را بی‌نقص حل کن", en: "Get 3 stars on 15 levels" } },
  { id: "clean3", icon: "shield", cat: "flawless", name: { fa: "دست تمیز", en: "Clean Hand" }, desc: { fa: "۳ مرحله پشت سر هم بدون خطا حل کن", en: "Solve 3 levels in a row with no mistakes" } },
  { id: "clean7", icon: "badgecheck", cat: "flawless", name: { fa: "خطای‌ناپذیر", en: "Unerring" }, desc: { fa: "۷ مرحله پشت سر هم بدون خطا حل کن", en: "Solve 7 levels in a row with no mistakes" } },
];

export interface CompleteMeta {
  mistakes?: number;
  hintsUsed?: number;
  durationMs?: number;
  livesLeft?: number;
  afterDefeat?: boolean;
}

interface GameState {
  /* ---- persisted ---- */
  lang: Lang;
  soundOn: boolean;
  musicOn: boolean;
  vibrationOn: boolean;
  playerName: string;
  coins: number;
  progress: Record<number, number>; // levelId -> best stars (1..3)
  unlocked: number; // highest unlocked level id
  stats: Stats;
  daily: { lastClaim: string | null; streak: number; lastDailyDone: string | null };
  achievements: Record<string, boolean>;

  /* ---- ephemeral ---- */
  screen: Screen;
  currentLevel: number;
  sessionNonce: number; // bumps on every startLevel -> forces a fresh gameplay session
  showVictory: boolean;
  modal: ModalKind;
  lastStars: number;
  lastReward: number;
  newBadge: string | null;
  adOpen: boolean;

  /* ---- actions ---- */
  setLang: (l: Lang) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleVibration: () => void;
  setPlayerName: (name: string) => void;
  addCoins: (n: number) => void;
  spendCoins: (n: number) => boolean;
  completeLevel: (id: number, stars: number, meta?: CompleteMeta) => void;
  skipLevel: (id: number) => boolean;
  usedHint: () => void;
  madeMistake: () => void;
  claimDaily: () => boolean;
  finishDaily: () => void;
  resetAll: () => void;

  setScreen: (s: Screen) => void;
  startLevel: (id: number) => void;
  setVictory: (v: boolean) => void;
  setModal: (m: ModalKind) => void;
  clearNewBadge: () => void;
  setAdOpen: (v: boolean) => void;
}

export const TOTAL_LEVELS = 102;
export const BRANDED_TOTAL = 600;
export const SKIP_COST = 50;
export const HINT_COSTS = { 1: 25, 2: 50, 3: 100 } as const;

/** Evaluates every achievement condition against the current state. */
function unlockCheck(get: () => GameState, set: (p: Partial<GameState>) => void) {
  const s = get();
  const badges: string[] = [];
  const give = (id: string) => {
    if (!s.achievements[id]) {
      badges.push(id);
    }
  };

  const solvedIds = Object.keys(s.progress).map(Number);
  const solvedCount = solvedIds.length;
  const totalStars = Object.values(s.progress).reduce((a, b) => a + b, 0);
  const perfectCount = Object.values(s.progress).filter((v) => v === 3).length;

  /* progress */
  if (solvedCount >= 1) give("first");
  if (solvedCount >= 5) give("five");
  if (solvedCount >= 10) give("ten");
  if (solvedCount >= 25) give("quarter");
  if (solvedCount >= 50) give("half");
  if (solvedCount >= 100) give("century");
  if (solvedCount >= TOTAL_LEVELS) give("master");
  if (s.stats.coinsEarned >= 300) give("rich");
  if (s.stats.coinsEarned >= 1000) give("tycoon");
  /* accuracy */
  if (Object.values(s.progress).some((v) => v >= 3)) give("star3");
  if (totalStars >= 15) give("stars15");
  if (totalStars >= 45) give("stars45");
  if (s.stats.clutchWins >= 1) give("clutch");
  /* speed */
  if (s.stats.fastSolves >= 1) give("speedy1");
  if (s.stats.fastSolves >= 5) give("speedy5");
  /* persistence */
  if (s.daily.streak >= 3) give("daily3");
  if (s.daily.streak >= 7) give("daily7");
  if (s.stats.comebacks >= 1) give("comeback");
  /* puzzle solving */
  if (s.stats.noHintStreak >= 5) give("nohint5");
  if (s.stats.noHintStreak >= 10) give("nohint10");
  if (solvedCount >= 15 && s.stats.skips === 0) give("skipfree");
  /* flawless */
  if (perfectCount >= 5) give("perfect5");
  if (perfectCount >= 15) give("perfect15");
  if (s.stats.flawlessStreak >= 3) give("clean3");
  if (s.stats.flawlessStreak >= 7) give("clean7");

  if (badges.length > 0) {
    const ach = { ...s.achievements };
    badges.forEach((b) => (ach[b] = true));
    set({ achievements: ach, newBadge: badges[badges.length - 1] });
  }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      /* default language is baked at build time (NEXT_PUBLIC_DEFAULT_LANG=fa|en) */
      lang: (process.env.NEXT_PUBLIC_DEFAULT_LANG === "en" ? "en" : "fa") as Lang,
      soundOn: true,
      musicOn: true,
      vibrationOn: true,
      playerName: "",
      coins: 100,
      progress: {},
      /* all levels open: every level is unlocked from the start */
      unlocked: TOTAL_LEVELS,
      stats: { ...DEFAULT_STATS },
      daily: { lastClaim: null, streak: 0, lastDailyDone: null },
      achievements: {},

      screen: "menu",
      currentLevel: 1,
      sessionNonce: 0,
      showVictory: false,
      modal: null,
      lastStars: 0,
      lastReward: 0,
      newBadge: null,
      adOpen: false,

      setLang: (l) => set({ lang: l }),
      toggleSound: () => set((s) => ({ soundOn: !s.soundOn })),
      toggleMusic: () => set((s) => ({ musicOn: !s.musicOn })),
      toggleVibration: () => set((s) => ({ vibrationOn: !s.vibrationOn })),
      setPlayerName: (name) => set({ playerName: name.trim().slice(0, 24) }),

      addCoins: (n) => {
        set((s) => ({ coins: s.coins + n, stats: { ...s.stats, coinsEarned: s.stats.coinsEarned + Math.max(0, n) } }));
        unlockCheck(get, set);
      },
      spendCoins: (n) => {
        if (get().coins < n) return false;
        set((s) => ({ coins: s.coins - n }));
        return true;
      },

      completeLevel: (id, stars, meta) => {
        const s = get();
        const prev = s.progress[id] ?? 0;
        const best = Math.max(prev, stars);
        const firstTime = prev === 0;
        const reward = firstTime ? 30 + stars * 10 : stars * 5;
        const progress = { ...s.progress, [id]: best };
        const unlocked = Math.max(s.unlocked, Math.min(TOTAL_LEVELS, id + 1));
        const d = s.daily.lastDailyDone === todayKey();
        const dailyBonus = d && id === dailySeed(TOTAL_LEVELS) + 1 && firstTime ? 30 : 0;

        /* performance trackers */
        const mistakes = meta?.mistakes ?? 0;
        const hintsUsed = meta?.hintsUsed ?? 0;
        const flawlessStreak = mistakes === 0 ? s.stats.flawlessStreak + 1 : 0;
        const noHintStreak = hintsUsed === 0 ? s.stats.noHintStreak + 1 : 0;
        const fast = (meta?.durationMs ?? Number.POSITIVE_INFINITY) <= 45000 && hintsUsed === 0 && mistakes === 0;
        const clutch = (meta?.livesLeft ?? 3) === 1;
        const comeback = meta?.afterDefeat === true;

        set({
          progress,
          unlocked,
          coins: s.coins + reward + dailyBonus,
          lastStars: best,
          lastReward: reward + dailyBonus,
          stats: {
            ...s.stats,
            solved: Object.keys(progress).length,
            perfect: Object.values(progress).filter((v) => v === 3).length,
            coinsEarned: s.stats.coinsEarned + reward + dailyBonus,
            flawlessStreak,
            noHintStreak,
            fastSolves: s.stats.fastSolves + (fast ? 1 : 0),
            clutchWins: s.stats.clutchWins + (clutch ? 1 : 0),
            comebacks: s.stats.comebacks + (comeback ? 1 : 0),
          },
        });
        unlockCheck(get, set);
      },

      skipLevel: (id) => {
        const s = get();
        if (s.coins < SKIP_COST) return false;
        const prev = s.progress[id] ?? 0;
        const progress = { ...s.progress, [id]: Math.max(prev, 1) };
        set({
          coins: s.coins - SKIP_COST,
          progress,
          unlocked: Math.max(s.unlocked, Math.min(TOTAL_LEVELS, id + 1)),
          lastStars: Math.max(prev, 1),
          lastReward: 0,
          /* skipping breaks both streaks */
          stats: { ...s.stats, skips: s.stats.skips + 1, solved: Object.keys(progress).length, flawlessStreak: 0, noHintStreak: 0 },
        });
        unlockCheck(get, set);
        return true;
      },

      usedHint: () => set((s) => ({ stats: { ...s.stats, hintsUsed: s.stats.hintsUsed + 1 } })),
      madeMistake: () => set((s) => ({ stats: { ...s.stats, mistakes: s.stats.mistakes + 1 } })),

      claimDaily: () => {
        const s = get();
        const today = todayKey();
        if (s.daily.lastClaim === today) return false;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
        const streak = s.daily.lastClaim === yKey ? s.daily.streak + 1 : 1;
        set({
          coins: s.coins + 50,
          daily: { ...s.daily, lastClaim: today, streak },
          stats: { ...s.stats, coinsEarned: s.stats.coinsEarned + 50 },
        });
        unlockCheck(get, set);
        return true;
      },

      finishDaily: () => {
        const s = get();
        const today = todayKey();
        if (s.daily.lastDailyDone === today) return;
        set({ daily: { ...s.daily, lastDailyDone: today } });
      },

      resetAll: () =>
        set({
          coins: 100,
          progress: {},
          unlocked: TOTAL_LEVELS,
          playerName: "",
          stats: { ...DEFAULT_STATS },
          daily: { lastClaim: null, streak: 0, lastDailyDone: null },
          achievements: {},
          screen: "menu",
          showVictory: false,
          modal: null,
        }),

      setScreen: (sc) => set({ screen: sc }),
      /* every start gets a brand-new session: fresh hints, mistakes, lives & solved state */
      startLevel: (id) => set({ currentLevel: id, screen: "game", showVictory: false, sessionNonce: get().sessionNonce + 1 }),
      setVictory: (v) => set({ showVictory: v }),
      setModal: (m) => set({ modal: m }),
      clearNewBadge: () => set({ newBadge: null }),
      setAdOpen: (v) => set({ adOpen: v }),
    }),
    {
      name: "brain-challenge-save-r2",
      /* v6: all levels unlocked — old v5 saves are migrated so every level is open,
         while coins, progress, stars and stats are fully preserved */
      version: 6,
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        return {
          ...(p as GameState),
          unlocked: TOTAL_LEVELS,
          playerName: typeof p.playerName === "string" ? p.playerName : "",
          stats: { ...DEFAULT_STATS, ...(p.stats ?? {}) },
        };
      },
      partialize: (s) => ({
        lang: s.lang,
        soundOn: s.soundOn,
        musicOn: s.musicOn,
        vibrationOn: s.vibrationOn,
        playerName: s.playerName,
        coins: s.coins,
        progress: s.progress,
        unlocked: s.unlocked,
        stats: s.stats,
        daily: s.daily,
        achievements: s.achievements,
      }),
    }
  )
);
