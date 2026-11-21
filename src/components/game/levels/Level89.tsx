"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 89 — Water leaks under the sink: turn the loose pipe nut      */
/* FOUR times (slowly! spam-taps slip) to tighten it and stop the      */
/* drips. The big valve wheel and a spanner are decoys.                */
/* ------------------------------------------------------------------ */

const TURNS_NEEDED = 4;
/** taps faster than this make the nut slip back (no spam allowed) */
const SLIP_MS = 420;

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

/* decoy: the main shut-off wheel — big and shiny, but not the problem */
function ValveWheelSvg() {
  return (
    <svg viewBox="0 0 80 80" className="h-auto w-full" aria-hidden>
      <circle cx="40" cy="40" r="30" fill="#FF8A3C" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="40" cy="40" r="10" fill="#E3CFA4" stroke="#3B2E5A" strokeWidth="4" />
      {[0, 45, 90, 135].map((a) => (
        <line key={a} x1="40" y1="12" x2="40" y2="30" stroke="#3B2E5A" strokeWidth="4.5" strokeLinecap="round" transform={`rotate(${a} 40 40)`} />
      ))}
    </svg>
  );
}

/* decoy: a spanner lying in the cabinet — you must turn it by hand */
function SpannerSvg() {
  return (
    <svg viewBox="0 0 110 50" className="h-auto w-full" aria-hidden>
      <path d="M14 30 Q10 14 28 12 Q40 12 42 24 L96 34 Q102 36 100 42 Q98 48 90 46 L38 36 Q28 44 18 40 Q10 36 14 30 Z" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="26" cy="24" r="6" fill="#E3CFA4" stroke="#3B2E5A" strokeWidth="3" />
    </svg>
  );
}

export default function Level89({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [turns, setTurns] = useState(0);
  const turnsRef = useRef(0);
  const lastTapRef = useRef(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const drips = turns >= TURNS_NEEDED ? 0 : TURNS_NEEDED - turns;

  const tapNut = useCallback(() => {
    if (solved || turnsRef.current >= TURNS_NEEDED) return;
    const now = Date.now();
    if (turnsRef.current > 0 && now - lastTapRef.current < SLIP_MS) {
      /* spam-tapping makes the nut slip back to loose */
      lastTapRef.current = now;
      turnsRef.current = 0;
      setTurns(0);
      sfx.boing();
      onProgress(0);
      onMistake({
        fa: "مهره لیز خورد! آروم و حساب‌شده بچرخان.",
        en: "The nut slipped! Turn it slowly, one at a time.",
      });
      return;
    }
    lastTapRef.current = now;
    const n = turnsRef.current + 1;
    turnsRef.current = n;
    setTurns(n);
    sfx.tick();
    onProgress(n / TURNS_NEEDED);
    if (n >= TURNS_NEEDED) {
      timers.current.push(setTimeout(() => sfx.unlock(), 300));
      timers.current.push(setTimeout(() => sfx.sparkle(), 650));
      timers.current.push(setTimeout(() => sfx.cheer(), 1000));
      timers.current.push(setTimeout(onSolved, 1900));
    }
  }, [solved, onMistake, onProgress, onSolved]);

  const tapValve = useCallback(() => {
    if (solved) return;
    sfx.boing();
    onMistake({
      fa: "این شیر اصلی لوله است؛ مشکل از مهره است!",
      en: "That's the pipe's main valve; the problem is the nut!",
    });
  }, [solved, onMistake]);

  const tapSpanner = useCallback(() => {
    if (solved) return;
    sfx.pop();
    onMistake({
      fa: "آچار اینجا به کار نمی‌آد؛ خودت مهره رو بچرخون!",
      en: "No spanner needed here; turn the nut by hand!",
    });
  }, [solved, onMistake]);

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

      {/* decoy: main shut-off wheel on the wall of the cabinet */}
      <button
        type="button"
        onClick={tapValve}
        aria-label={lang === "fa" ? "شیر اصلی" : "main valve"}
        className="absolute left-[19%] top-[30%] w-[13%] cursor-pointer transition-transform active:scale-90"
        aria-hidden={drips === 0}
      >
        <ValveWheelSvg />
      </button>

      {/* decoy: spanner on the cabinet floor */}
      <button
        type="button"
        onClick={tapSpanner}
        aria-label={lang === "fa" ? "آچار" : "spanner"}
        className="absolute bottom-[6%] right-[12%] w-[22%] cursor-pointer transition-transform active:scale-90"
        aria-hidden={drips === 0}
      >
        <SpannerSvg />
      </button>

      {/* loose nut at the joint (tappable, smaller target) */}
      <div className="absolute left-[65%] top-[43%] w-[12%]">
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

      {/* turn counter removed — the player must keep track themselves */}

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
