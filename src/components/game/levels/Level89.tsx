"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 89 — Water leaks under the sink: turn the loose pipe nut      */
/* three times to tighten it and stop the drips.                       */
/* ------------------------------------------------------------------ */

const TURNS_NEEDED = 3;

function NutSvg({ turns }: { turns: number }) {
  return (
    <svg viewBox="0 0 80 80" className="h-auto w-full" aria-hidden>
      <g style={{ transform: `rotate(${turns * 90}deg)`, transformOrigin: "40px 40px", transition: "transform 0.45s cubic-bezier(0.5,0,0.3,1)" }}>
        {/* hex nut */}
        <path d="M40 10 L64 24 L64 56 L40 70 L16 56 L16 24 Z" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
        <circle cx="40" cy="40" r="16" fill="#EDE9F4" stroke="#3B2E5A" strokeWidth="4" />
        {/* grip ridges */}
        {[0, 60, 120].map((a) => (
          <line key={a} x1="28" y1="18" x2="28" y2="26" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" transform={`rotate(${a} 40 40)`} />
        ))}
      </g>
      {/* water drop when loose */}
      {turns < TURNS_NEEDED && (
        <circle cx="40" cy="72" r="5" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="2.4" style={{ animation: `drop-fall 0.8s ${turns * 0.1}s linear infinite` }} />
      )}
    </svg>
  );
}

function PipeSvg({ drips }: { drips: number }) {
  return (
    <svg viewBox="0 0 240 170" className="h-auto w-full" aria-hidden>
      {/* sink base */}
      <rect x="10" y="8" width="220" height="16" rx="8" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* drain + vertical pipe */}
      <path d="M120 24 L120 52" stroke="#3B2E5A" strokeWidth="11" strokeLinecap="round" />
      <path d="M120 24 L120 52" stroke="#8FA6BD" strokeWidth="6" strokeLinecap="round" />
      {/* U-bend */}
      <path d="M120 52 Q120 92 82 92 Q44 92 44 128 L44 150" fill="none" stroke="#3B2E5A" strokeWidth="11" strokeLinecap="round" />
      <path d="M120 52 Q120 92 82 92 Q44 92 44 128 L44 150" fill="none" stroke="#8FA6BD" strokeWidth="6" strokeLinecap="round" />
      {/* horizontal outflow */}
      <path d="M44 150 L150 150" stroke="#3B2E5A" strokeWidth="11" strokeLinecap="round" />
      <path d="M44 150 L150 150" stroke="#8FA6BD" strokeWidth="6" strokeLinecap="round" />
      {/* drips under the loose joint */}
      {drips > 0 &&
        [0, 1].slice(0, drips).map((i) => (
          <circle key={i} cx={i === 0 ? 120 : 82} cy="100" r="6" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="2.6" style={{ animation: `drop-fall 0.9s ${i * 0.25}s linear infinite` }} />
        ))}
      {/* puddle */}
      {drips > 0 && <ellipse cx="100" cy="162" rx={drips > 1 ? 54 : 30} ry="7" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="3" opacity="0.7" />}
    </svg>
  );
}

export default function Level89({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [turns, setTurns] = useState(0);
  const turnsRef = useRef(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const drips = turns >= TURNS_NEEDED ? 0 : TURNS_NEEDED - turns;

  const tapNut = useCallback(() => {
    if (solved || turnsRef.current >= TURNS_NEEDED) return;
    const n = turnsRef.current + 1;
    turnsRef.current = n;
    setTurns(n);
    sfx.tick();
    onProgress(n === 1 ? 0.34 : n === 2 ? 0.67 : 1);
    if (n >= TURNS_NEEDED) {
      timers.current.push(setTimeout(() => sfx.unlock(), 300));
      timers.current.push(setTimeout(() => sfx.sparkle(), 650));
      timers.current.push(setTimeout(() => sfx.cheer(), 1000));
      timers.current.push(setTimeout(onSolved, 1900));
    }
  }, [solved, onProgress, onSolved]);

  /* drips counter chip */
  return (
    <Scene bg="linear-gradient(180deg,#FFF3E4 0%,#F7E6C8 52%,#EFD6AF 60%,#C9A87B 62%,#B8945F 100%)">
      {/* cabinet interior backdrop */}
      <div className="absolute inset-x-[6%] top-[8%] bottom-[16%] rounded-2xl border-[5px] border-[#3B2E5A] bg-[#E3CFA4]" aria-hidden>
        <div className="absolute inset-2 rounded-xl opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.2) 0 3px, transparent 3px 36px)" }} aria-hidden />
      </div>

      {/* pipe */}
      <div className="absolute left-1/2 top-[16%] w-[64%] -translate-x-1/2">
        <PipeSvg drips={drips} />
      </div>

      {/* loose nut at the joint (tappable) */}
      <div className="absolute left-[63%] top-[42%] w-[16%]">
        <Pulse active={hintPulse > 0 && drips > 0}>
          <button
            type="button"
            onClick={tapNut}
            aria-label={lang === "fa" ? "مهرهٔ لوله" : "pipe nut"}
            className="block w-full cursor-pointer transition-transform active:scale-90"
          >
            <NutSvg turns={turns} />
          </button>
        </Pulse>
      </div>

      {/* turn counter */}
      <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 rounded-full border-2 border-[#3B2E5A] bg-[#FAFAFA] px-3 py-1 text-[12px] font-black text-[#33205E]" aria-hidden>
        {lang === "fa" ? `چرخش: ${turns}/${TURNS_NEEDED}` : `Turns: ${turns}/${TURNS_NEEDED}`}
      </div>

      {/* fixed badge */}
      {drips === 0 && (
        <div className="absolute right-[6%] top-[12%] w-[15%]" style={{ animation: "star-pop 0.6s ease both" }} aria-hidden>
          <svg viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4.5" />
            <path d="M26 40 L36 50 L54 30" fill="none" stroke="#FAFAFA" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </Scene>
  );
}
