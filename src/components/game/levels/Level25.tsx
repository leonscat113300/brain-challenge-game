"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Pulse, Scene, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 25 — Odd clock out: two clocks show real times; the third     */
/* has its hand lengths swapped (impossible). Tap the odd clock.       */
/* ------------------------------------------------------------------ */

const CORRECT_MSG = { fa: "این ساعت درسته!", en: "This clock is correct!" };

interface HandSpec {
  angle: number;
  long: boolean;
}

function ClockSvg({ hands, className, style }: { hands: HandSpec[]; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 140 140" className={className} style={style} aria-hidden>
      <circle cx="70" cy="70" r="62" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="70" cy="70" r="55" fill="none" stroke="#FFD154" strokeWidth="3" opacity="0.5" />
      {/* 12 tick marks */}
      {Array.from({ length: 12 }).map((_, i) => (
        <line key={i} x1="70" y1="15" x2="70" y2="24" stroke="#3B2E5A" strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" transform={`rotate(${i * 30} 70 70)`} />
      ))}
      {/* hands: the LONG one is always the minute hand (tip y=24), the SHORT one the hour hand (tip y=40) */}
      {hands.map((h, i) => (
        <motion.g key={i} animate={{ rotate: h.angle }} transition={{ type: "spring", stiffness: 85, damping: 8 }} style={{ transformOrigin: "70px 70px" }}>
          <line x1="70" y1="70" x2="70" y2={h.long ? 24 : 40} stroke="#3B2E5A" strokeWidth={h.long ? 6 : 9.5} strokeLinecap="round" />
          <circle cx="70" cy={h.long ? 24 : 40} r={h.long ? 3.5 : 4.5} fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.5" />
        </motion.g>
      ))}
      {/* cute face */}
      <circle cx="52" cy="88" r="6.5" fill="#3B2E5A" />
      <circle cx="88" cy="88" r="6.5" fill="#3B2E5A" />
      <circle cx="54.5" cy="85.5" r="2.2" fill="#fff" />
      <circle cx="90.5" cy="85.5" r="2.2" fill="#fff" />
      <path d="M60 102 Q70 110 80 102" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="42" cy="96" rx="5" ry="3.5" fill="#FF9FB2" />
      <ellipse cx="98" cy="96" rx="5" ry="3.5" fill="#FF9FB2" />
      <circle cx="70" cy="70" r="6" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
    </svg>
  );
}

function Star({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 2 L14.6 8.6 L21.5 9.2 L16.3 13.8 L17.9 20.6 L12 17 L6.1 20.6 L7.7 13.8 L2.5 9.2 L9.4 8.6 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function Level25({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [fixed, setFixed] = useState(false);
  const [done, setDone] = useState(false);
  const [wob1, setWob1] = useState(0);
  const [wob2, setWob2] = useState(0);

  const tapCorrect = (which: 1 | 2) => {
    if (solved || done || fixed) return;
    if (which === 1) setWob1((v) => v + 1);
    else setWob2((v) => v + 1);
    sfx.tick();
    onMistake(CORRECT_MSG);
  };

  const tapOdd = () => {
    if (solved || done || fixed) return;
    setDone(true);
    setFixed(true);
    sfx.unlock();
    window.setTimeout(() => sfx.cheer(), 250);
    window.setTimeout(() => sfx.sparkle(), 500);
    onProgress(1);
    window.setTimeout(onSolved, 700);
  };

  /* 9:00 correct — short hour hand at 9 (270deg), long minute hand at 12 */
  const c1: HandSpec[] = [
    { angle: 270, long: false },
    { angle: 0, long: true },
  ];
  /* 4:30 correct — short hand between 4 and 5 (135deg), long hand at 6 (180deg) */
  const c2: HandSpec[] = [
    { angle: 135, long: false },
    { angle: 180, long: true },
  ];
  /* impossible: long hand points at 2 and short hand at 12 -> fix to a real 2:00 */
  const c3: HandSpec[] = fixed
    ? [
        { angle: 0, long: true },
        { angle: 60, long: false },
      ]
    : [
        { angle: 60, long: true },
        { angle: 0, long: false },
      ];

  return (
    <Scene bg="linear-gradient(180deg,#F3EDFB 0%,#E7DCF6 100%)">
      {/* wallpaper stripes */}
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(108,74,182,0.08) 0 26px, transparent 26px 52px)" }} aria-hidden />
      {/* baseboard */}
      <div className="absolute inset-x-0 bottom-0 h-[10%] border-t-4 border-[#3B2E5A] bg-[#D9CBEF]" aria-hidden />

      <div className="absolute inset-x-[3%] bottom-[14%] top-[12%] flex items-center justify-center gap-[4%]">
        {/* clock 1 — 9:00, correct */}
        <div className="w-[27%]">
          <div className="mx-auto mb-1 h-2.5 w-2.5 rounded-full bg-[#3B2E5A]" aria-hidden />
          <div key={wob1 ? `w${wob1}` : "still"} style={wob1 ? { animation: "wobble 0.6s ease" } : undefined}>
            <button type="button" aria-label={lang === "fa" ? "ساعت اول" : "first clock"} onClick={() => tapCorrect(1)} className="w-full cursor-pointer">
              <ClockSvg hands={c1} className="h-auto w-full drop-shadow-[0_6px_0_rgba(59,46,90,0.18)]" />
            </button>
          </div>
        </div>

        {/* clock 2 — 4:30, correct */}
        <div className="w-[27%]">
          <div className="mx-auto mb-1 h-2.5 w-2.5 rounded-full bg-[#3B2E5A]" aria-hidden />
          <div key={wob2 ? `w${wob2}` : "still"} style={wob2 ? { animation: "wobble 0.6s ease" } : undefined}>
            <button type="button" aria-label={lang === "fa" ? "ساعت دوم" : "second clock"} onClick={() => tapCorrect(2)} className="w-full cursor-pointer">
              <ClockSvg hands={c2} className="h-auto w-full drop-shadow-[0_6px_0_rgba(59,46,90,0.18)]" />
            </button>
          </div>
        </div>

        {/* clock 3 — the impossible one */}
        <div className="relative w-[27%]">
          <div className="mx-auto mb-1 h-2.5 w-2.5 rounded-full bg-[#3B2E5A]" aria-hidden />
          <Pulse active={hintPulse > 0 && !done}>
            <button type="button" aria-label={lang === "fa" ? "ساعت سوم" : "third clock"} onClick={tapOdd} className="w-full cursor-pointer">
              <ClockSvg hands={c3} className="h-auto w-full drop-shadow-[0_6px_0_rgba(59,46,90,0.18)]" />
            </button>
          </Pulse>
          {fixed &&
            [
              { l: "-14%", t: "6%", d: "0s" },
              { l: "104%", t: "18%", d: "0.12s" },
              { l: "-10%", t: "66%", d: "0.24s" },
              { l: "100%", t: "80%", d: "0.36s" },
            ].map((s, i) => (
              <span key={i} className="pointer-events-none absolute z-10" style={{ left: s.l, top: s.t, animation: `star-pop 0.8s ease ${s.d} both` }}>
                <Star className="h-7 w-7" />
              </span>
            ))}
        </div>
      </div>
    </Scene>
  );
}
