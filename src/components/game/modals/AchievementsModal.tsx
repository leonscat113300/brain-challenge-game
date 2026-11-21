"use client";

import {
  Sparkles, Star, Compass, Coins, Gift, Crown, Lock, Check, Trophy,
  Footprints, Flag, Milestone, Medal, MoonStar, Gem, Award, ShieldCheck,
  BadgeCheck, Zap, Timer, Flame, RotateCcw, LightbulbOff, Brain, Target,
  HeartPulse, PiggyBank,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useGameStore, ACHIEVEMENTS } from "@/lib/game/store";
import type { AchCategory } from "@/lib/game/store";
import { tr } from "@/lib/game/i18n";
import { num } from "@/lib/game/utils";
import { GameModal } from "../ui";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  star: Star,
  compass: Compass,
  coins: Coins,
  gift: Gift,
  crown: Crown,
  footprints: Footprints,
  flag: Flag,
  milestone: Milestone,
  medal: Medal,
  moonstar: MoonStar,
  gem: Gem,
  award: Award,
  shield: ShieldCheck,
  badgecheck: BadgeCheck,
  zap: Zap,
  timer: Timer,
  flame: Flame,
  undo: RotateCcw,
  brainoff: LightbulbOff,
  brain: Brain,
  target: Target,
  heart: HeartPulse,
  bank: PiggyBank,
};

const CATEGORY_ORDER: AchCategory[] = ["progress", "accuracy", "speed", "persistence", "puzzle", "flawless"];

const CAT_TITLE: Record<AchCategory, "achCatProgress" | "achCatAccuracy" | "achCatSpeed" | "achCatPersistence" | "achCatPuzzle" | "achCatFlawless"> = {
  progress: "achCatProgress",
  accuracy: "achCatAccuracy",
  speed: "achCatSpeed",
  persistence: "achCatPersistence",
  puzzle: "achCatPuzzle",
  flawless: "achCatFlawless",
};

const CAT_COLOR: Record<AchCategory, string> = {
  progress: "#6C4AB6",
  accuracy: "#1EC8CF",
  speed: "#FFD154",
  persistence: "#FF9F1C",
  puzzle: "#4CAF50",
  flawless: "#FF6B81",
};

export default function AchievementsModal() {
  const lang = useGameStore((s) => s.lang);
  const open = useGameStore((s) => s.modal === "achievements");
  const setModal = useGameStore((s) => s.setModal);
  const achievements = useGameStore((s) => s.achievements);

  const earned = ACHIEVEMENTS.filter((a) => achievements[a.id] === true).length;

  return (
    <GameModal open={open} onClose={() => setModal(null)} title={tr(lang, "achievements")} accent="#4CAF50" lang={lang}>
      {/* earned counter */}
      <div className="mb-3 flex items-center justify-center gap-2 rounded-2xl border-[3px] border-[#3B2E5A] bg-white px-4 py-2.5">
        <Trophy size={20} className="text-[#E8A81C]" aria-hidden />
        <span className="text-sm font-black text-[#3B2E5A]">{tr(lang, "badgesEarned")}:</span>
        <span className="text-sm font-black text-[#4CAF50]" dir="ltr">
          {num(earned, lang)} / {num(ACHIEVEMENTS.length, lang)}
        </span>
      </div>

      <div className="space-y-4">
        {CATEGORY_ORDER.map((cat) => {
          const list = ACHIEVEMENTS.filter((a) => a.cat === cat);
          if (list.length === 0) return null;
          return (
            <section key={cat} aria-label={tr(lang, CAT_TITLE[cat])}>
              <div className="mb-2 flex items-center gap-1.5">
                <span className="inline-block h-3.5 w-3.5 rounded-full border-2 border-[#3B2E5A]" style={{ background: CAT_COLOR[cat] }} aria-hidden />
                <h3 className="text-sm font-black text-[#3B2E5A]">{tr(lang, CAT_TITLE[cat])}</h3>
              </div>
              <div className="space-y-2.5">
                {list.map((a) => {
                  const unlocked = achievements[a.id] === true;
                  const Icon = ICONS[a.icon] ?? Trophy;
                  return (
                    <div
                      key={a.id}
                      className={`flex items-center gap-3 rounded-2xl border-[3px] border-[#3B2E5A] p-3 ${
                        unlocked ? "bg-[#DFF3E1]" : "bg-[#F3F0FA] opacity-70"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div
                          className="grid h-11 w-11 place-items-center rounded-full border-[3px] border-[#3B2E5A]"
                          style={{ background: unlocked ? "#FFD154" : "#C7C3D4" }}
                          aria-hidden
                        >
                          <Icon size={22} strokeWidth={2.4} color="#3B2E5A" />
                        </div>
                        {unlocked && (
                          <span
                            className="absolute -bottom-1 -end-1 grid h-5 w-5 place-items-center rounded-full border-2 border-[#3B2E5A] bg-[#4CAF50] text-white"
                            aria-hidden
                          >
                            <Check size={12} strokeWidth={3.5} />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-black text-[#3B2E5A]">{a.name[lang]}</div>
                        <div className="text-xs font-bold leading-5 text-[#3B2E5A]/70">{a.desc[lang]}</div>
                      </div>
                      {!unlocked && <Lock size={16} className="me-1 shrink-0 text-[#8B84A3]" aria-hidden />}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </GameModal>
  );
}
