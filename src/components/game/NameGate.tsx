"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserRound } from "lucide-react";
import { useGameStore } from "@/lib/game/store";
import { tr } from "@/lib/game/i18n";
import { sfx } from "@/lib/game/audio";
import { Brain } from "./Brain";

/**
 * First-launch gate: asks for the player's name before anything else.
 * Shown only while `playerName` is empty (persisted), so it never asks again.
 * Saving only touches the name — progress, coins and achievements stay intact.
 */
export default function NameGate() {
  const lang = useGameStore((s) => s.lang);
  const setPlayerName = useGameStore((s) => s.setPlayerName);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError(true);
      sfx.fail();
      return;
    }
    sfx.unlock();
    setPlayerName(trimmed);
  };

  return (
    <motion.div
      className="absolute inset-0 z-[90] flex items-center justify-center bg-[#33205E]/85 backdrop-blur-sm px-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      role="dialog"
      aria-modal="true"
      aria-label={tr(lang, "playerNameAsk")}
    >
      <motion.div
        className="card-chunky w-full bg-white px-5 pb-6 pt-7 text-center"
        initial={{ y: 80, scale: 0.92, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 280, delay: 0.1 }}
      >
        <Brain mood="wink" className="mx-auto h-20 w-20" style={{ animation: "bob 2.4s ease-in-out infinite" }} />
        <h2 className="mt-2 text-2xl font-black text-[#3B2E5A]">{tr(lang, "playerNameAsk")}</h2>
        <p className="mt-1 text-xs font-bold text-[#8B84A3]">{tr(lang, "playerNameHint")}</p>

        <div className="mt-4 flex items-center gap-2 rounded-2xl border-[3px] border-[#3B2E5A] bg-[#F3F0FA] px-3 py-2.5 focus-within:border-[#6C4AB6]" dir={lang === "fa" ? "rtl" : "ltr"}>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#FFD154] text-[#3B2E5A]" aria-hidden>
            <UserRound size={18} strokeWidth={2.6} />
          </span>
          <input
            autoFocus
            value={value}
            maxLength={24}
            onChange={(e) => {
              setValue(e.target.value);
              if (e.target.value.trim()) setError(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={tr(lang, "playerNamePlaceholder")}
            aria-label={tr(lang, "playerNameAsk")}
            className="w-full min-w-0 bg-transparent text-base font-extrabold text-[#3B2E5A] outline-none placeholder:text-[#B9B3CB]"
          />
        </div>

        {error && (
          <p className="mt-2 text-xs font-black text-[#FF6B81]" role="alert">
            {tr(lang, "playerNameError")}
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={submit}
          className="btn-chunky mt-4 w-full bg-[#FFD154] py-3 text-lg text-[#33205E] border-[3px] border-[#3B2E5A]"
        >
          {tr(lang, "playerNameSave")}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
