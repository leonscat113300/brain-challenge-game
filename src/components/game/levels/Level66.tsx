"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 66 — The tap won't stop running! Turn the red MAIN VALVE      */
/* under the sink: 3 turns and the water stops.                        */
/* ------------------------------------------------------------------ */

export default function Level66({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [turns, setTurns] = useState(0);
  const [done, setDone] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapValve = useCallback(() => {
    if (solved || done || turns >= 3) return;
    const next = turns + 1;
    setTurns(next);
    sfx.pop();
    onProgress(Math.min(0.9, next / 3));
    if (next >= 3) {
      setDone(true);
      timers.current.push(setTimeout(() => sfx.chime(), 350));
      onProgress(1);
      timers.current.push(setTimeout(onSolved, 1400));
    }
  }, [solved, done, turns, onProgress, onSolved]);

  const tapFaucet = useCallback(() => {
    if (done) return;
    sfx.fail();
    onMistake({
      fa: "شیر بالایی خراب نیست؛ شیر اصلی زیر سینک را بچرخان!",
      en: "The tap isn't broken; turn the main valve under the sink!",
    });
  }, [done, onMistake]);

  const flowLeft = 3 - turns;

  return (
    <Scene bg="linear-gradient(180deg,#DFF3F7 0%,#CFE9F0 55%,#E8F4DA 56%,#D9EBC7 100%)">
      {/* wall tiles */}
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(59,46,90,0.13) 0 3px, transparent 3px 40px), repeating-linear-gradient(90deg, rgba(59,46,90,0.13) 0 3px, transparent 3px 40px)" }} aria-hidden />

      {/* sink + faucet */}
      <div className="absolute left-1/2 top-[6%] w-[64%] -translate-x-1/2">
        <button type="button" onClick={tapFaucet} aria-label={lang === "fa" ? "شیر روشویی" : "faucet"} className="block w-full cursor-pointer border-0 bg-transparent p-0">
          <svg viewBox="0 0 260 170" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.15)]" aria-hidden>
            {/* faucet */}
            <rect x="70" y="6" width="20" height="30" rx="8" fill="#7FA8B8" stroke="#3B2E5A" strokeWidth="4" />
            <path d="M80 30 Q80 52 104 52 L112 52" fill="none" stroke="#7FA8B8" strokeWidth="16" strokeLinecap="round" />
            <path d="M80 30 Q80 52 104 52 L112 52" fill="none" stroke="#3B2E5A" strokeWidth="20" strokeLinecap="round" opacity="0.25" />
            <rect x="104" y="44" width="26" height="18" rx="5" fill="#7FA8B8" stroke="#3B2E5A" strokeWidth="4" />
            {/* basin */}
            <path d="M28 74 Q28 62 42 62 L218 62 Q232 62 232 74 L222 112 Q220 122 206 122 L54 122 Q40 122 38 112 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
            <ellipse cx="130" cy="72" rx="86" ry="9" fill="#DFF3F7" stroke="#3B2E5A" strokeWidth="3.5" />
            {/* drain */}
            <circle cx="130" cy="100" r="7" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="3" />
            {/* cabinet */}
            <rect x="46" y="126" width="168" height="40" rx="10" fill="#B7ABDA" stroke="#3B2E5A" strokeWidth="4.5" />
            <rect x="118" y="140" width="24" height="12" rx="6" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
          </svg>
        </button>

        {/* water stream — fades with each turn */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${44 + i * 5}%`,
              top: "34%",
              width: 7,
              height: i === 0 ? 44 : 34,
              background: "linear-gradient(180deg,#7FD8E8,#1EC8CF)",
              border: "2px solid #3B2E5A",
              opacity: i < flowLeft ? 1 : 0,
              transition: "opacity 0.4s ease",
            }}
            aria-hidden
          />
        ))}
      </div>

      {/* puddle */}
      <div
        className="absolute bottom-[4%] left-1/2 h-[9%] w-[40%] -translate-x-1/2 rounded-[50%] border-4 border-[#3B2E5A] bg-[#1EC8CF]"
        style={{
          opacity: flowLeft > 0 ? 0.75 : 0,
          transform: `translateX(-50%) scaleX(${0.55 + flowLeft * 0.15})`,
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
        aria-hidden
      />

      {/* open cabinet with main valve */}
      <div className="absolute bottom-[6%] start-[3%] w-[30%]">
        <svg viewBox="0 0 130 130" className="h-auto w-full" aria-hidden>
          {/* cabinet */}
          <rect x="6" y="10" width="118" height="112" rx="12" fill="#E7DDF4" stroke="#3B2E5A" strokeWidth="4.5" />
          <path d="M6 52 L124 52" stroke="#3B2E5A" strokeWidth="3" opacity="0.3" />
          {/* pipes */}
          <path d="M65 10 L65 46 M65 84 L65 122" stroke="#7FA8B8" strokeWidth="10" strokeLinecap="round" />
          <path d="M65 10 L65 46 M65 84 L65 122" stroke="#3B2E5A" strokeWidth="13" strokeLinecap="round" opacity="0.2" />
        </svg>

        {/* main valve wheel — tap 3 times */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Pulse active={hintPulse > 0 && !done}>
            <button
              type="button"
              onClick={tapValve}
              aria-label={lang === "fa" ? "شیر اصلی آب" : "main valve"}
              className="h-16 w-16 cursor-pointer rounded-full border-0 bg-transparent p-0 transition-transform active:scale-90"
              style={{ transform: `rotate(${turns * 120}deg)`, transition: "transform 0.35s cubic-bezier(0.34,1.3,0.64,1)" }}
            >
              <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-[0_3px_2px_rgba(59,46,90,0.3)]" aria-hidden>
                <circle cx="32" cy="32" r="26" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" />
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <line key={a} x1="32" y1="10" x2="32" y2="24" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" transform={`rotate(${a} 32 32)`} />
                ))}
                <circle cx="32" cy="32" r="7" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
              </svg>
            </button>
          </Pulse>
        </div>

        {/* valve label */}
        <div className="mt-0.5 text-center text-[10px] font-bold text-[#33205E]" aria-hidden>
          {lang === "fa" ? "شیر اصلی" : "main valve"}
        </div>
      </div>

      {/* success sparkle when stopped */}
      {done &&
        [0, 1, 2].map((i) => (
          <span key={i} className="absolute z-30" style={{ left: `${46 + i * 6}%`, top: `${30 + i * 6}%`, width: 20, height: 20, animation: `star-pop 0.5s ${i * 0.15}s both` }} aria-hidden>
            <svg viewBox="0 0 20 20" className="h-full w-full">
              <path d="M10 0 L12.4 7.6 L20 10 L12.4 12.4 L10 20 L7.6 12.4 L0 10 L7.6 7.6 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.5" />
            </svg>
          </span>
        ))}
    </Scene>
  );
}
