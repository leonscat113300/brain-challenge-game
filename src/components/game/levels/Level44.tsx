"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 44 — Which container has more water? Compare the water LEVEL, */
/* not the container size: the tall narrow glass wins.                 */
/* ------------------------------------------------------------------ */

function DropletSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 52" className={className} style={style} aria-hidden>
      <path d="M20 4 Q34 24 34 34 A14 14 0 1 1 6 34 Q6 24 20 4 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="15" cy="32" r="4" fill="#FAFAFA" opacity="0.85" />
    </svg>
  );
}

type Pick = "glass" | "bowl" | "mug";

export default function Level44({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [correct, setCorrect] = useState(false);
  const [wrongPick, setWrongPick] = useState<Pick | null>(null);

  const pick = (id: Pick) => {
    if (solved || correct) return;
    if (id === "glass") {
      setCorrect(true);
      sfx.cheer();
      onProgress(1);
      window.setTimeout(onSolved, 1000);
    } else {
      setWrongPick(id);
      onMistake({ fa: "به ارتفاع سطح آب نگاه کن، نه اندازهٔ ظرف!", en: "Look at the water LEVEL, not the container size!" });
      window.setTimeout(() => setWrongPick(null), 650);
    }
  };

  const tapTable = () => {
    if (solved || correct) return;
    sfx.pop();
  };

  const waterAnim = correct ? "bob 0.5s ease-in-out 2" : "breathe 3s ease-in-out infinite";

  return (
    <Scene bg="linear-gradient(180deg,#F3EDFB 0%,#EDE4F7 60%,#E7DBF2 100%)">
      {/* wall decor: polka dots + little picture */}
      <div className="absolute top-[6%] start-[7%] w-[7%] aspect-square rounded-full bg-[#FFD154]/60" aria-hidden />
      <div className="absolute top-[12%] start-[18%] w-[4%] aspect-square rounded-full bg-[#1EC8CF]/50" aria-hidden />
      <div className="absolute top-[7%] end-[9%] w-[15%] aspect-[4/3] rounded-xl border-4 border-[#8B5E3C] bg-[#FAFAFA] overflow-hidden" aria-hidden>
        <svg viewBox="0 0 40 30" className="w-full h-full">
          <circle cx="30" cy="9" r="5" fill="#FFD154" />
          <path d="M2 26 L14 12 L22 21 L28 15 L38 26 Z" fill="#4CAF50" />
        </svg>
      </div>

      {/* table */}
      <button
        type="button"
        aria-label={lang === "fa" ? "میز" : "table"}
        onClick={tapTable}
        className="absolute inset-x-0 bottom-0 h-[26%] block w-full cursor-default"
      >
        <div className="mx-auto w-[86%] h-[34%] rounded-t-md bg-[#C9986A] border-4 border-[#3B2E5A]" />
        <div className="mx-auto flex w-[78%] justify-between">
          <div className="w-[4.5%] h-[8vh] max-h-[64px] bg-[#8B5E3C] border-x-4 border-b-4 border-[#3B2E5A]" />
          <div className="w-[4.5%] h-[8vh] max-h-[64px] bg-[#8B5E3C] border-x-4 border-b-4 border-[#3B2E5A]" />
        </div>
      </button>

      {/* the three containers on the table top */}
      <div className="absolute inset-x-[10%] bottom-[24.5%] h-[52%] flex items-end justify-between z-10">
        {/* A: tall narrow glass — highest water level (correct) */}
        <div className="relative w-[16%] h-[92%]">
          <Pulse active={hintPulse > 0 && !correct} color="#1EC8CF" className="h-full">
            <button
              type="button"
              aria-label={lang === "fa" ? "لیوان بلند" : "tall glass"}
              onClick={() => pick("glass")}
              className={`relative block w-full h-full rounded-b-xl rounded-t-md border-4 border-[#3B2E5A] bg-[#FAFAFA]/85 overflow-hidden ${
                wrongPick === "glass" ? "" : "cursor-pointer hover:brightness-105"
              }`}
              style={{ animation: wrongPick === "glass" ? "shake-hard 0.5s ease" : undefined, minHeight: 72 }}
            >
              <motion.div
                className="absolute inset-x-[5%] bottom-[4%] h-[85%] rounded-b-lg bg-[#7FD8E8] border-2 border-[#3B2E5A]/40"
                style={{ transformOrigin: "50% 100%" }}
                animate={correct ? { scaleY: [1, 1.16, 0.94, 1], y: [0, -6, 0] } : {}}
                transition={{ duration: 0.85 }}
              >
                <div className="w-full h-full" style={{ animation: waterAnim }}>
                  <div className="absolute inset-x-0 top-0 h-[9px] rounded-[50%] bg-[#BDF1F7]" aria-hidden />
                </div>
              </motion.div>
              {/* glass shine */}
              <div className="absolute top-[8%] start-[10%] w-[9%] h-[46%] rounded-full bg-white/60" aria-hidden />
              {correct && (
                <>
                  <DropletSvg className="absolute -top-8 -start-5 w-7 h-auto" style={{ animation: "float-up 0.9s ease-out 0.15s both" }} />
                  <DropletSvg className="absolute -top-6 -end-4 w-6 h-auto" style={{ animation: "float-up 0.9s ease-out 0.4s both" }} />
                </>
              )}
            </button>
          </Pulse>
          {correct && (
            <motion.div
              className="pointer-events-none absolute -top-[16%] left-1/2 -translate-x-1/2 w-[130%] aspect-square rounded-full border-4 border-[#1EC8CF] z-20"
              initial={{ scale: 0.4, opacity: 0.9 }}
              animate={{ scale: 1.7, opacity: 0 }}
              transition={{ duration: 0.9 }}
              aria-hidden
            />
          )}
          <div className="mx-auto mt-1 h-[7px] w-[64%] rounded-[50%] bg-[#3B2E5A]/15" aria-hidden />
        </div>

        {/* B: wide low bowl — least water */}
        <div className="relative w-[36%] h-[48%]">
          <button
            type="button"
            aria-label={lang === "fa" ? "کاسه پهن" : "wide bowl"}
            onClick={() => pick("bowl")}
            className="relative block w-full h-full cursor-pointer hover:brightness-105"
            style={{ animation: wrongPick === "bowl" ? "shake-hard 0.5s ease" : undefined, minHeight: 64 }}
          >
            <div className="absolute inset-0 rounded-b-[999px] border-4 border-[#3B2E5A] bg-[#FAFAFA]/90 overflow-hidden">
              <div
                className="absolute inset-x-[4%] bottom-[5%] h-[30%] rounded-b-[999px] rounded-t-md bg-[#7FD8E8] border-2 border-[#3B2E5A]/40"
                style={{ animation: waterAnim }}
              >
                <div className="absolute inset-x-0 top-0 h-[8px] rounded-[50%] bg-[#BDF1F7]" aria-hidden />
              </div>
            </div>
            <div className="absolute -top-2 inset-x-[10%] h-4 rounded-[50%] border-4 border-[#3B2E5A] bg-white" aria-hidden />
          </button>
          <div className="mx-auto mt-1 h-[7px] w-[60%] rounded-[50%] bg-[#3B2E5A]/15" aria-hidden />
        </div>

        {/* C: medium mug — middle level */}
        <div className="relative w-[21%] h-[64%]">
          <button
            type="button"
            aria-label={lang === "fa" ? "لیوان متوسط" : "medium mug"}
            onClick={() => pick("mug")}
            className="relative block w-full h-full cursor-pointer hover:brightness-105"
            style={{ animation: wrongPick === "mug" ? "shake-hard 0.5s ease" : undefined, minHeight: 64 }}
          >
            <div className="absolute inset-y-0 start-0 end-[16%] rounded-lg border-4 border-[#3B2E5A] bg-[#FAFAFA]/90 overflow-hidden">
              <div
                className="absolute inset-x-[5%] bottom-[4%] h-[55%] rounded-b-md bg-[#7FD8E8] border-2 border-[#3B2E5A]/40"
                style={{ animation: waterAnim }}
              >
                <div className="absolute inset-x-0 top-0 h-[8px] rounded-[50%] bg-[#BDF1F7]" aria-hidden />
              </div>
              <div className="absolute top-[10%] start-[12%] w-[9%] h-[38%] rounded-full bg-white/60" aria-hidden />
            </div>
            {/* handle */}
            <div className="absolute end-0 top-[26%] w-[26%] h-[34%] rounded-e-full border-4 border-[#3B2E5A] bg-transparent" aria-hidden />
          </button>
          <div className="mx-auto mt-1 h-[7px] w-[58%] rounded-[50%] bg-[#3B2E5A]/15" aria-hidden />
        </div>
      </div>
    </Scene>
  );
}
