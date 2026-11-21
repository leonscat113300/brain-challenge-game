"use client";

import React from "react";
import { motion } from "framer-motion";
import { Home, RotateCcw, HeartCrack } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { sfx } from "@/lib/game/audio";
import { tr } from "@/lib/game/i18n";
import { vibrate } from "@/lib/game/utils";
import { Brain } from "./Brain";

/**
 * Defeat screen: shown when all 3 lives are gone.
 * "تلاش دوباره" restarts the current level from scratch (fresh lives, no mistakes).
 * "بازگشت به منو" returns to the main menu; permanent player data is untouched.
 */
export default function DefeatOverlay({ onRetry, onMenu }: { onRetry: () => void; onMenu: () => void }) {
  const lang = useGameStore((s) => s.lang);

  React.useEffect(() => {
    sfx.fail();
    vibrate([80, 60, 80, 60, 160], useGameStore.getState().vibrationOn);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-[60] flex items-center justify-center bg-[#1B1230]/85 backdrop-blur-[2px] px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="alertdialog"
      aria-label={tr(lang, "defeat")}
    >
      <motion.div
        className="card-chunky relative w-full bg-white px-5 pb-6 pt-8 text-center"
        initial={{ y: 90, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 280, delay: 0.1 }}
      >
        {/* ribbon */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-2.5 rounded-2xl bg-[#FF6B81] border-[4px] border-[#3B2E5A] shadow-[0_5px_0_rgba(59,46,90,0.3)]">
          <span className="text-2xl font-black text-white">{tr(lang, "defeat")}</span>
        </div>

        <Brain mood="sad" className="mx-auto mt-4 h-24 w-24" style={{ animation: "wobble 2.4s ease-in-out infinite" }} />

        {/* lives status */}
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#FFE1E7] border-[3px] border-[#3B2E5A] px-4 py-1.5">
          <HeartCrack size={18} className="text-[#FF6B81]" aria-hidden />
          <span className="text-sm font-black text-[#3B2E5A]">{tr(lang, "defeatDesc")}</span>
        </div>

        {/* buttons */}
        <div className="mt-6 grid grid-cols-1 gap-3">
          <button
            onClick={onRetry}
            className="btn-chunky flex items-center justify-center gap-2 bg-[#4CAF50] text-white border-[3px] border-[#3B2E5A] py-3.5 text-lg"
          >
            <RotateCcw size={20} strokeWidth={3} />
            {tr(lang, "retry")}
          </button>
          <button
            onClick={onMenu}
            className="btn-chunky flex items-center justify-center gap-2 bg-[#FAFAFA] text-[#3B2E5A] border-[3px] border-[#3B2E5A] py-3 text-base"
          >
            <Home size={18} strokeWidth={3} />
            {tr(lang, "backToMenu")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
