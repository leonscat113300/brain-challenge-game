"use client";

import React from "react";
import { motion } from "framer-motion";
import { Settings, Store, Grid3X3, Gift, Trophy, UserRound, Languages, Play } from "lucide-react";
import { useGameStore, TOTAL_LEVELS } from "@/lib/game/store";
import { tr } from "@/lib/game/i18n";
import { num } from "@/lib/game/utils";
import { sfx } from "@/lib/game/audio";
import { Brain } from "../Brain";
import { IconBtn, CoinChip } from "../ui";

export default function MainMenu() {
  const lang = useGameStore((s) => s.lang);
  const unlocked = useGameStore((s) => s.unlocked);
  const progress = useGameStore((s) => s.progress);
  const playerName = useGameStore((s) => s.playerName);
  const setScreen = useGameStore((s) => s.setScreen);
  const startLevel = useGameStore((s) => s.startLevel);
  const setModal = useGameStore((s) => s.setModal);
  const setLang = useGameStore((s) => s.setLang);
  const dailyDone = useGameStore((s) => s.daily.lastDailyDone);
  const dailyClaimedToday = useGameStore((s) => s.daily.lastClaim);

  /* continue: first uncompleted unlocked level */
  const continueId = (() => {
    for (let i = 1; i <= unlocked; i++) {
      if (!(i in progress)) return i;
    }
    return Math.min(TOTAL_LEVELS, unlocked);
  })();
  const solvedCount = Object.keys(progress).length;
  const todayDone = !!dailyDone;

  return (
    <div className="doodle-bg absolute inset-0 flex flex-col text-white overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between px-4 pt-4 shrink-0">
        <div className="flex items-center gap-2">
          <IconBtn label={tr(lang, "settings")} bg="#FAFAFA" size={44} onClick={() => setModal("settings")}>
            <Settings size={22} strokeWidth={2.5} />
          </IconBtn>
          <IconBtn label={tr(lang, "store")} bg="#FFD154" size={44} onClick={() => setModal("store")}>
            <Store size={22} strokeWidth={2.5} />
          </IconBtn>
        </div>
        <div className="flex items-center gap-2">
          <IconBtn
            label={tr(lang, "language")}
            bg="#1EC8CF"
            size={44}
            onClick={() => {
              sfx.whoosh();
              setLang(lang === "fa" ? "en" : "fa");
            }}
          >
            <Languages size={22} strokeWidth={2.5} />
          </IconBtn>
          <CoinChip />
        </div>
      </div>

      {/* title + mascot (height-aware sizing keeps everything on screen) */}
      <div className="flex flex-col items-center mt-3 shrink-0">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 14, delay: 0.1 }}
          style={{ width: "clamp(104px, 18vh, 160px)", height: "clamp(104px, 18vh, 160px)" }}
        >
          <Brain mood="wink" className="w-full h-full" style={{ animation: "bob 2.4s ease-in-out infinite" }} />
        </motion.div>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-black text-[#FFD154] text-center drop-shadow-[0_3px_0_rgba(51,32,94,0.8)] leading-snug px-6">
          {tr(lang, "appName")}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-white/85 font-bold text-center px-8">{tr(lang, "tagline")}</p>
      </div>

      {/* play button */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-4">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => {
            sfx.unlock();
            startLevel(continueId);
          }}
          className="btn-chunky grid place-items-center bg-[#FFD154] border-[5px] border-[#3B2E5A] shadow-[0_9px_0_rgba(59,46,90,0.4)]"
          style={{ width: "clamp(104px, 16vh, 128px)", height: "clamp(104px, 16vh, 128px)", borderRadius: "50%" }}
          aria-label={tr(lang, "play")}
        >
          <Play size={48} strokeWidth={3.5} className="text-[#33205E] translate-x-0.5" fill="#33205E" />
        </motion.button>

        {/* secondary row */}
        <div className="flex items-center gap-4">
          <IconBtn label={tr(lang, "levelSelect")} bg="#1EC8CF" size={56} onClick={() => setScreen("levels")}>
            <Grid3X3 size={26} strokeWidth={2.6} />
          </IconBtn>
          <div className="relative">
            <IconBtn label={tr(lang, "daily")} bg="#FF6B81" size={56} onClick={() => setModal("daily")}>
              <Gift size={26} strokeWidth={2.6} />
            </IconBtn>
            {!todayDone && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFD154] border-2 border-[#3B2E5A]" aria-hidden />
            )}
          </div>
          <IconBtn label={tr(lang, "achievements")} bg="#4CAF50" size={56} onClick={() => setModal("achievements")}>
            <Trophy size={26} strokeWidth={2.6} />
          </IconBtn>
        </div>
      </div>

      {/* bottom: profile + progress */}
      <div className="px-4 pb-4 mt-auto shrink-0">
        <button
          onClick={() => {
            sfx.click();
            setModal("profile");
          }}
          className="w-full flex items-center justify-between rounded-2xl bg-[#33205E]/70 border-2 border-white/25 px-4 py-3 text-white active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="grid place-items-center w-10 h-10 shrink-0 rounded-full bg-[#FFD154] text-[#33205E]">
              <UserRound size={22} strokeWidth={2.6} />
            </span>
            <div className="text-start leading-tight min-w-0">
              <div className="font-extrabold text-sm truncate max-w-[180px]">{playerName || tr(lang, "guestPlayer")}</div>
              <div className="text-[11px] font-bold text-white/70">
                {tr(lang, "solvedCount")}: {num(solvedCount, lang)}/{num(TOTAL_LEVELS, lang)}
              </div>
            </div>
          </div>
          <div className="text-[11px] font-bold text-white/60 shrink-0">
            {dailyClaimedToday ? tr(lang, "dailyClaimed") : tr(lang, "dailyClaim")}
          </div>
        </button>
      </div>
    </div>
  );
}
