"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";
import { num } from "@/lib/game/utils";

/* ------------------------------------------------------------------ */
/* Level 19 — Odd one out: one pinned card hangs upside-down.          */
/* SEVEN cards in two rows, all wearing the same face, and every       */
/* number is an upside-down confusable (12↔21, 16↔91, 18↔81...).       */
/* The only tell is the flipped orientation: pin/face below the number. */
/* ------------------------------------------------------------------ */

interface CardDef {
  n: number;
  rot: number;
  left: string;
  top: string;
  flip: boolean;
}

const CARDS: CardDef[] = [
  { n: 12, rot: -6, left: "2%", top: "12%", flip: false },
  { n: 21, rot: 5, left: "18.5%", top: "16%", flip: false },
  { n: 33, rot: -4, left: "35%", top: "11%", flip: false },
  { n: 88, rot: 8, left: "51.5%", top: "17%", flip: true },
  { n: 69, rot: -7, left: "2%", top: "46%", flip: false },
  { n: 96, rot: 6, left: "18.5%", top: "44%", flip: false },
  { n: 16, rot: -5, left: "35%", top: "48%", flip: false },
];

function FaceSvg({ wink, className }: { wink: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 64 26" className={className} aria-hidden>
      {wink ? (
        <>
          <circle cx="18" cy="10" r="5" fill="#3B2E5A" />
          <circle cx="20" cy="8" r="1.7" fill="#fff" />
          <path d="M40 10 Q46 5 52 10" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="18" cy="10" r="5" fill="#3B2E5A" />
          <circle cx="46" cy="10" r="5" fill="#3B2E5A" />
          <circle cx="20" cy="8" r="1.7" fill="#fff" />
          <circle cx="48" cy="8" r="1.7" fill="#fff" />
        </>
      )}
      <circle cx="7" cy="18" r="4" fill="#FF9FB2" opacity="0.9" />
      <circle cx="57" cy="18" r="4" fill="#FF9FB2" opacity="0.9" />
      <path d="M26 18 Q32 23 38 18" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Level19({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [upright, setUpright] = useState(false);
  const [shakeIdx, setShakeIdx] = useState(-1);
  const [noteShake, setNoteShake] = useState(false);
  const [done, setDone] = useState(false);

  const tapCard = (c: CardDef, i: number) => {
    if (solved || done || upright) return;
    if (c.flip) {
      setUpright(true);
      setDone(true);
      sfx.sparkle();
      onProgress(1);
      window.setTimeout(() => sfx.cheer(), 320);
      window.setTimeout(onSolved, 850);
    } else {
      setShakeIdx(i);
      window.setTimeout(() => setShakeIdx(-1), 560);
      onMistake({ fa: "این عدد سر جاشه!", en: "This number is fine!" });
    }
  };

  const tapNote = () => {
    if (solved || done || upright) return;
    setNoteShake(true);
    sfx.boing();
    window.setTimeout(() => setNoteShake(false), 560);
    onMistake({ fa: "روی کارت‌ها تمرکز کن!", en: "Focus on the cards!" });
  };

  return (
    <Scene bg="linear-gradient(180deg,#F3EDFB 0%,#E7DBF5 74%,#D9A05B 75%,#C98D4B 100%)">
      {/* cork bulletin board */}
      <div
        className="absolute rounded-3xl border-[6px] border-[#8B5E3C]"
        style={{
          left: "3%",
          right: "3%",
          top: "8%",
          bottom: "22%",
          background: "#C98A5B",
          backgroundImage: "radial-gradient(rgba(59,46,90,0.16) 1.6px, transparent 1.7px)",
          backgroundSize: "15px 15px",
        }}
      >
        {/* extra push pins */}
        <div className="absolute left-[3%] top-[4%] w-4 h-4 rounded-full bg-[#1EC8CF] border-2 border-[#3B2E5A]" aria-hidden />
        <div className="absolute right-[3%] top-[6%] w-4 h-4 rounded-full bg-[#4CAF50] border-2 border-[#3B2E5A]" aria-hidden />
        <div className="absolute left-[5%] bottom-[6%] w-4 h-4 rounded-full bg-[#FFD154] border-2 border-[#3B2E5A]" aria-hidden />

        {/* decoy: helper note pinned on the board */}
        <button
          type="button"
          onClick={tapNote}
          className="absolute right-[4%] bottom-[7%] w-[13%] rotate-3"
          style={{ animation: noteShake ? "shake-hard 0.5s ease-in-out" : undefined }}
          aria-label={lang === "fa" ? "یادداشت روی تخته" : "note on the board"}
        >
          <div className="rounded-lg border-[3px] border-[#3B2E5A] bg-[#FFF9E8] p-[8%] shadow-[0_3px_0_rgba(59,46,90,0.2)]">
            <span className="block text-center font-black text-[#FF6B81] text-base sm:text-lg md:text-xl">؟</span>
            <div className="mt-[10%] space-y-[14%]">
              <div className="h-[2px] rounded bg-[#3B2E5A]/25" />
              <div className="h-[2px] rounded bg-[#3B2E5A]/25" />
              <div className="h-[2px] rounded bg-[#3B2E5A]/25" />
            </div>
          </div>
        </button>
        {/* pencil resting on the board frame */}
        <svg viewBox="0 0 90 16" className="absolute left-[4%] bottom-[8%] w-[14%]" aria-hidden>
          <rect x="10" y="3" width="60" height="10" rx="3" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
          <path d="M10 3 L2 8 L10 13 Z" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
          <rect x="70" y="3" width="12" height="10" rx="2" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" />
        </svg>

        {CARDS.map((c, i) => (
          <div key={c.n} className="absolute w-[15%]" style={{ left: c.left, top: c.top }}>
            <Pulse active={hintPulse > 0 && c.flip && !upright && !done}>
              <motion.div
                initial={false}
                animate={{ rotate: upright && c.flip ? c.rot : c.flip ? c.rot + 180 : c.rot }}
                transition={{ type: "spring", stiffness: 120, damping: 12 }}
              >
                <button
                  type="button"
                  onClick={() => tapCard(c, i)}
                  aria-label={lang === "fa" ? `کارت عدد ${num(c.n, lang)}` : `number ${c.n} card`}
                  className={`relative block w-full aspect-[3/4] rounded-xl border-4 border-[#3B2E5A] bg-[#FAFAFA] shadow-[0_4px_0_rgba(59,46,90,0.25)] ${upright ? "" : "cursor-pointer"}`}
                  style={{ animation: shakeIdx === i ? "shake-hard 0.5s ease-in-out" : undefined }}
                >
                  {/* pin (flips together with the card) */}
                  <span className="absolute -top-[9%] left-1/2 -translate-x-1/2 w-[22%] aspect-square rounded-full bg-[#FF6B81] border-[3px] border-[#3B2E5A]" aria-hidden>
                    <span className="absolute left-[22%] top-[16%] w-[28%] h-[28%] rounded-full bg-white/80" />
                  </span>
                  <span className="flex h-full w-full flex-col items-center justify-center gap-[6%] p-[5%]">
                    <FaceSvg wink={c.flip && upright} className="w-[70%]" />
                    <span className="font-black leading-none text-[#6C4AB6] text-lg sm:text-xl md:text-3xl">{num(c.n, lang)}</span>
                  </span>
                  {c.flip && upright && (
                    <span className="absolute -top-4 -end-4" style={{ animation: "star-pop 0.7s ease-out both" }} aria-hidden>
                      <svg viewBox="0 0 24 24" className="w-8 h-8">
                        <path d="M12 2l2.7 6.2 6.8.6-5.1 4.4 1.5 6.6L12 16.2 6.1 19.8l1.5-6.6L2.5 8.8l6.8-.6z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.5" />
                      </svg>
                    </span>
                  )}
                </button>
              </motion.div>
            </Pulse>
          </div>
        ))}
      </div>
    </Scene>
  );
}
