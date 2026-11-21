"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 16 — Which fish is alive? Only the cyan fish flutters its     */
/* gills, wags its tail and blows bubbles. Tap the living one.         */
/* ------------------------------------------------------------------ */

type FishVariant = "alive" | "gone" | "calm";

function FishSvg({ variant, className, style }: { variant: FishVariant; className?: string; style?: React.CSSProperties }) {
  const body = variant === "alive" ? "#1EC8CF" : variant === "gone" ? "#9A93B8" : "#FF6B81";
  const fin = variant === "alive" ? "#12A3A9" : variant === "gone" ? "#7D76A0" : "#E8546B";
  return (
    <svg viewBox="0 0 200 120" className={className} style={style} aria-hidden>
      {/* tail: only the living fish wags it */}
      {variant === "alive" ? (
        <motion.g
          animate={{ rotate: [0, 9, 0, -7, 0] }}
          transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformBox: "fill-box", transformOrigin: "100% 50%" }}
        >
          <path d="M52 60 L16 34 Q10 30 12 40 L18 60 L12 80 Q10 90 16 86 Z" fill={fin} stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
        </motion.g>
      ) : (
        <path d="M52 60 L16 34 Q10 30 12 40 L18 60 L12 80 Q10 90 16 86 Z" fill={fin} stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      )}
      {/* body */}
      <ellipse cx="112" cy="60" rx="62" ry="38" fill={body} stroke="#3B2E5A" strokeWidth="5" />
      <path d="M96 24 Q116 6 138 24" fill={fin} stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M76 76 Q112 92 150 72" stroke="#FAFAFA" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.45" />
      <path d="M92 44 Q102 52 92 60" stroke={fin} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M112 40 Q122 48 112 56" stroke={fin} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* gills: flutter only when alive */}
      {variant === "alive" ? (
        <>
          <motion.path d="M132 42 Q140 54 132 66" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 0.85, repeat: Infinity }} />
          <motion.path d="M142 40 Q150 54 142 68" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 0.85, repeat: Infinity }} />
        </>
      ) : (
        <>
          <path d="M132 42 Q140 54 132 66" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
          <path d="M142 40 Q150 54 142 68" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
        </>
      )}
      {variant === "gone" ? (
        <>
          {/* stiff pose: X eyes, flat mouth, tongue out */}
          <path d="M148 42 L164 56 M164 42 L148 56" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
          <path d="M162 64 Q170 68 176 62" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M170 68 Q176 84 166 86 Q159 86 161 75" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
        </>
      ) : (
        <>
          {/* round eye with highlight + smile + blush */}
          <circle cx="156" cy="48" r="7" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
          <circle cx="158" cy="48" r="3.2" fill="#3B2E5A" />
          <circle cx="159.5" cy="46" r="1.2" fill="#FAFAFA" />
          <path d="M164 66 Q170 71 176 64" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <ellipse cx="146" cy="64" rx="6" ry="3.5" fill="#FF9FB2" opacity="0.7" />
        </>
      )}
      {/* tiny bubble rising from the living fish */}
      {variant === "alive" && (
        <motion.g animate={{ y: [0, -64], opacity: [0, 1, 0] }} transition={{ duration: 2.4, repeat: Infinity, delay: 0.8, ease: "easeOut" }}>
          <circle cx="176" cy="44" r="5" fill="none" stroke="#FAFAFA" strokeWidth="3" />
        </motion.g>
      )}
    </svg>
  );
}

function HeartSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 21C7 16.5 2 12.8 2 8.5 2 5.5 4.5 3 7.5 3 9.2 3 11 4 12 5.5 13 4 14.8 3 16.5 3 19.5 3 22 5.5 22 8.5c0 4.3-5 8-10 12.5z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="1.5" />
    </svg>
  );
}

export default function Level16({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [correct, setCorrect] = useState(false);
  const [done, setDone] = useState(false);
  const [shakeId, setShakeId] = useState<number | null>(null);
  const [shakeSeq, setShakeSeq] = useState(0);

  const pick = (i: number) => {
    if (solved || done || correct) return;
    if (i === 0) {
      /* correct: the cyan fish with fluttering gills */
      setCorrect(true);
      setDone(true);
      sfx.pop();
      window.setTimeout(() => sfx.cheer(), 300);
      onProgress(1);
      window.setTimeout(onSolved, 1000);
    } else {
      setShakeId(i);
      setShakeSeq((s) => s + 1);
      onMistake({ fa: "این یکی دیگه تکان نمی‌خوره!", en: "This one isn't moving anymore!" });
      window.setTimeout(() => setShakeId(null), 700);
    }
  };

  const fishInner = (i: number, variant: FishVariant) => (
    <div key={shakeId === i ? shakeSeq : `fish-${i}`} style={{ animation: shakeId === i ? "shake-hard 0.5s ease" : undefined }}>
      <button type="button" aria-label={lang === "fa" ? "ماهی" : "fish"} onClick={() => pick(i)} className="block w-full cursor-pointer">
        {i === 0 ? (
          <motion.div
            animate={correct ? { x: [0, 30, 60, 30, 0], y: [0, -24, 0, 24, 0], rotate: [0, 6, 0, -6, 0] } : undefined}
            transition={{ duration: 1.6, ease: "easeInOut" }}
          >
            <FishSvg variant="alive" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.18)]" />
          </motion.div>
        ) : (
          <FishSvg variant={variant} className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.12)]" />
        )}
      </button>
      {i === 0 && correct && (
        <div className="pointer-events-none absolute inset-x-0 -top-3 h-0">
          {[0, 1, 2].map((h) => (
            <div key={h} className="absolute" style={{ left: `${16 + h * 26}%`, animation: `float-up 1.1s ease-out ${h * 0.18}s both` }}>
              <HeartSvg className="h-6 w-6" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Scene bg="linear-gradient(180deg,#BEE9F5 0%,#A8E0EF 55%,#8FD8E8 100%)">
      {/* rippling water surface */}
      <svg viewBox="0 0 400 30" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[7%] w-full" aria-hidden>
        <path d="M0 18 Q25 6 50 18 T100 18 T150 18 T200 18 T250 18 T300 18 T350 18 T400 18 L400 0 L0 0 Z" fill="#DFF6FB" opacity="0.85" />
      </svg>
      {/* light shafts */}
      {[[12, 22], [46, 16], [78, 24], [30, 40]].map(([x, y], i) => (
        <div key={i} className="absolute h-1 w-8 rounded-full bg-white/60" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden />
      ))}
      {/* sandy floor + pebbles */}
      <div className="absolute inset-x-0 bottom-0 h-[16%] border-t-4 border-[#3B2E5A] bg-[#F2D16B]" aria-hidden>
        <div className="absolute left-[12%] top-[22%] h-3 w-5 rounded-full bg-[#E3B65A]" />
        <div className="absolute left-[38%] top-[45%] h-2.5 w-4 rounded-full bg-[#E3B65A]" />
        <div className="absolute left-[70%] top-[30%] h-3 w-6 rounded-full bg-[#E3B65A]" />
      </div>
      {/* seaweed */}
      <svg viewBox="0 0 400 120" className="absolute bottom-[13%] left-0 h-[22%] w-full" aria-hidden>
        <path d="M40 120 Q30 84 46 56 Q58 34 46 8" stroke="#4CAF50" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M368 120 Q378 90 364 62 Q354 40 366 16" stroke="#4CAF50" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M64 120 Q58 100 66 84" stroke="#7ED491" strokeWidth="7" fill="none" strokeLinecap="round" />
      </svg>
      {/* ambient bubbles */}
      <motion.div className="absolute left-[14%] top-[62%] h-3 w-3 rounded-full border-2 border-white/80" animate={{ y: [0, -130], opacity: [0, 1, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeOut" }} aria-hidden />
      <motion.div className="absolute left-[80%] top-[55%] h-2 w-2 rounded-full border-2 border-white/80" animate={{ y: [0, -110], opacity: [0, 1, 0] }} transition={{ duration: 2.7, repeat: Infinity, delay: 1.2, ease: "easeOut" }} aria-hidden />

      {/* the three fish */}
      <div className="absolute inset-x-[6%] top-[30%] z-10 flex items-start justify-between">
        {[0, 1, 2].map((i) => {
          const variant: FishVariant = i === 0 ? "alive" : i === 1 ? "gone" : "calm";
          return (
            <div key={i} className={`relative w-[28%] ${i === 1 ? "translate-y-[10%] rotate-3" : ""}`}>
              {i === 0 ? (
                <Pulse active={hintPulse > 0 && !done}>{fishInner(i, variant)}</Pulse>
              ) : (
                fishInner(i, variant)
              )}
            </div>
          );
        })}
      </div>
    </Scene>
  );
}
