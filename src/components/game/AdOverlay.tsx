"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clapperboard } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { sfx } from "@/lib/game/audio";
import { tr } from "@/lib/game/i18n";
import { num } from "@/lib/game/utils";

/** Fake "rewarded video" overlay: 3s countdown then grants +25 coins. */
export default function AdOverlay() {
  const open = useGameStore((s) => s.adOpen);
  return (
    <AnimatePresence>{open && <AdSession />}</AnimatePresence>
  );
}

function AdSession() {
  const setAdOpen = useGameStore((s) => s.setAdOpen);
  const addCoins = useGameStore((s) => s.addCoins);
  const lang = useGameStore((s) => s.lang);
  const [t, setT] = useState(3);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => {
      setT((v) => {
        if (v <= 1) {
          clearInterval(iv);
          setDone(true);
          return 0;
        }
        sfx.tick();
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-[70] bg-[#1B1230]/95 flex flex-col items-center justify-center gap-6 px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-label={tr(lang, "adPlaying")}
    >
      <div className="rounded-3xl border-[4px] border-[#FFD154] bg-[#33205E] px-6 py-8 w-full max-w-[300px]">
        <Clapperboard size={44} className="mx-auto text-[#FFD154]" aria-hidden />
        <div className="mt-3 text-white font-extrabold">{tr(lang, "adPlaying")}</div>
        <div className="mt-2 text-5xl font-black text-[#FFD154]" aria-live="polite">
          {done ? "+" + num(25, lang) : num(t, lang)}
        </div>
        <div className="mt-4 h-3 rounded-full bg-[#1B1230] overflow-hidden border-2 border-[#6C4AB6]">
          <div className="h-full bg-[#FFD154] transition-all duration-1000" style={{ width: `${((3 - t) / 3) * 100}%` }} />
        </div>
      </div>
      <button
        disabled={!done}
        onClick={() => {
          if (!done) return;
          addCoins(25);
          sfx.coin();
          setAdOpen(false);
        }}
        className="btn-chunky px-10 py-3.5 text-lg bg-[#4CAF50] text-white border-[3px] border-[#3B2E5A]"
      >
        {done ? `${tr(lang, "adReward")} (${tr(lang, "close")})` : "..."}
      </button>
    </motion.div>
  );
}
