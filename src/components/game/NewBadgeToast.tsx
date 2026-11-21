"use client";

import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Trophy, Sparkles, Compass, Coins, Gift, Crown, Star, Footprints, Flag,
  Milestone, Medal, MoonStar, Gem, Award, ShieldCheck, BadgeCheck, Zap,
  Timer, Flame, RotateCcw, LightbulbOff, Brain, Target, HeartPulse, PiggyBank,
} from "lucide-react";
import { useGameStore, ACHIEVEMENTS } from "@/lib/game/store";
import { sfx } from "@/lib/game/audio";
import { tr } from "@/lib/game/i18n";

const ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
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

export default function NewBadgeToast() {
  const badge = useGameStore((s) => s.newBadge);
  const clear = useGameStore((s) => s.clearNewBadge);
  const lang = useGameStore((s) => s.lang);

  useEffect(() => {
    if (!badge) return;
    sfx.sparkle();
    const t = setTimeout(clear, 2600);
    return () => clearTimeout(t);
  }, [badge, clear]);

  const meta = ACHIEVEMENTS.find((a) => a.id === badge);
  const Icon = meta ? ICONS[meta.icon] ?? Trophy : Trophy;

  return (
    <AnimatePresence>
      {badge && meta && (
        <motion.div
          key={badge}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-[80]"
          initial={{ y: -60, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: "spring", damping: 18 }}
        >
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#FFD154] border-[3px] border-[#3B2E5A] shadow-[0_5px_0_rgba(59,46,90,0.35)]">
            <Icon size={22} className="text-[#3B2E5A]" aria-hidden />
            <div className="text-[#3B2E5A] leading-tight">
              <div className="text-xs font-bold opacity-70">{tr(lang, "badgeUnlocked")}</div>
              <div className="font-black text-sm">{meta.name[lang]}</div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
