"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 90 — A thief hides behind one of the curtains. The odd shadow */
/* (a fedora!) gives it away — touch it to pull the curtain aside.     */
/* ------------------------------------------------------------------ */

function CurtainSvg({ shifted }: { shifted: boolean }) {
  return (
    <svg viewBox="0 0 90 150" className="h-auto w-full" aria-hidden>
      <g style={{ transform: shifted ? "translateX(70px)" : "translateX(0px)", transition: "transform 0.9s cubic-bezier(0.5,0,0.3,1)" }}>
        <path d="M10 6 L80 6 L80 144 Q66 134 58 144 Q46 132 36 144 Q22 132 10 144 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M24 10 L24 132 M40 10 L40 134 M58 10 L58 132" stroke="#E14B60" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* rail */}
      <rect x="4" y="0" width="82" height="8" rx="4" fill="#33205E" stroke="#3B2E5A" strokeWidth="2.6" />
    </svg>
  );
}

function ThiefSvg() {
  return (
    <svg viewBox="0 0 110 130" className="h-auto w-full" aria-hidden>
      {/* sack */}
      <ellipse cx="84" cy="88" rx="20" ry="26" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M74 66 Q84 58 94 66" fill="none" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
      {/* body */}
      <rect x="28" y="62" width="40" height="48" rx="14" fill="#33205E" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* arms */}
      <path d="M30 76 L18 92 M66 76 L74 62" stroke="#3B2E5A" strokeWidth="8" strokeLinecap="round" />
      {/* tail */}
      <path d="M28 96 Q12 100 10 112" fill="none" stroke="#3B2E5A" strokeWidth="7" strokeLinecap="round" />
      <path d="M28 96 Q12 100 10 112" fill="none" stroke="#8FA6BD" strokeWidth="3.6" strokeLinecap="round" />
      {/* head */}
      <circle cx="48" cy="40" r="20" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* burglar mask */}
      <rect x="32" y="34" width="32" height="12" rx="6" fill="#33205E" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="41" cy="40" r="3.4" fill="#FAFAFA" />
      <circle cx="55" cy="40" r="3.4" fill="#FAFAFA" />
      {/* fedora */}
      <path d="M30 22 Q48 2 66 22 L66 26 Q48 32 30 26 Z" fill="#33205E" stroke="#3B2E5A" strokeWidth="3.6" />
      <rect x="36" y="16" width="24" height="5" rx="2.5" fill="#FF6B81" />
      {/* mouth */}
      <path d="M44 52 Q48 55 52 52" fill="none" stroke="#3B2E5A" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

/* decoy: a coat stand with a hat — a hat shape, but no shadow behind glass */
function CoatStandSvg() {
  return (
    <svg viewBox="0 0 90 150" className="h-auto w-full" aria-hidden>
      {/* fedora resting on top */}
      <path d="M30 22 Q45 4 60 22 L60 26 Q45 32 30 26 Z" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="3.6" />
      <rect x="35" y="16" width="20" height="5" rx="2.5" fill="#FF6B81" />
      <ellipse cx="45" cy="26" rx="24" ry="6" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="3.4" />
      {/* pole */}
      <path d="M45 32 L45 128" stroke="#3B2E5A" strokeWidth="10" strokeLinecap="round" />
      <path d="M45 32 L45 128" stroke="#C98A4B" strokeWidth="5" strokeLinecap="round" />
      {/* hooks */}
      <path d="M45 48 L30 60 M45 48 L60 60" stroke="#3B2E5A" strokeWidth="8" strokeLinecap="round" />
      <path d="M45 48 L30 60 M45 48 L60 60" stroke="#C98A4B" strokeWidth="4" strokeLinecap="round" />
      {/* tripod base */}
      <path d="M45 126 L26 144 M45 126 L64 144 M45 126 L45 146" stroke="#3B2E5A" strokeWidth="9" strokeLinecap="round" />
      <path d="M45 126 L26 144 M45 126 L64 144 M45 126 L45 146" stroke="#C98A4B" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Level90({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [revealed, setRevealed] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapOddShadow = useCallback(() => {
    if (solved || revealed) return;
    setRevealed(true);
    sfx.whoosh();
    timers.current.push(setTimeout(() => sfx.laugh(), 500));
    timers.current.push(setTimeout(() => sfx.cheer(), 1000));
    timers.current.push(setTimeout(() => sfx.sparkle(), 1300));
    onProgress(1);
    timers.current.push(setTimeout(onSolved, 2000));
  }, [solved, revealed, onProgress, onSolved]);

  const tapPlantShadow = useCallback(() => {
    if (solved || revealed) return;
    sfx.fail();
    onMistake({
      fa: "این سایه فقط گلدانِ خانگی است؛ سایهٔ عجیب را پیدا کن!",
      en: "That shadow is just a houseplant; find the odd one!",
    });
  }, [solved, revealed, onMistake]);

  const tapGlass = useCallback(() => {
    if (solved || revealed) return;
    sfx.fail();
    onMistake({
      fa: "دقیق روی سایهٔ عجیب بزن!",
      en: "Tap right on the odd shadow!",
    });
  }, [solved, revealed, onMistake]);

  const tapCoatStand = useCallback(() => {
    if (solved || revealed) return;
    sfx.boing();
    onMistake({
      fa: "این فقط رخت‌آویز با کلاه است؛ پشت پرده‌ها بگرد!",
      en: "That's just a coat stand with a hat; check behind the curtains!",
    });
  }, [solved, revealed, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#3D2C6E 0%,#4A377E 55%,#3A2A66 64%,#2A1D50 66%,#1C1436 100%)">
      {/* stars */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[
          { l: "8%", t: "8%" },
          { l: "46%", t: "5%" },
          { l: "86%", t: "10%" },
          { l: "30%", t: "20%" },
        ].map((p, i) => (
          <div key={i} className="absolute" style={{ left: p.l, top: p.t, animation: `breathe 2.4s ${i * 0.35}s ease-in-out infinite` }}>
            <svg viewBox="0 0 20 20" className="w-3 opacity-70">
              <path d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z" fill="#FFD154" />
            </svg>
          </div>
        ))}
      </div>

      {/* warm lamp light */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 42%, rgba(255,209,84,0.14) 0%, transparent 42%)" }}
        aria-hidden
      />

      {/* two windows with curtains */}
      {/* LEFT window (plant shadow trap) */}
      <div className="absolute bottom-[20%] left-[6%] w-[36%]">
        <div className="relative rounded-xl border-4 border-[#A96F35] bg-[#BFE7F5]/90">
          {/* plant silhouette behind glass */}
          <svg viewBox="0 0 140 110" className="block h-auto w-full opacity-45" aria-hidden>
            <path d="M70 104 Q68 70 70 44" stroke="#2A1D50" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M70 66 Q46 60 38 34 Q64 30 72 56 Z" fill="#2A1D50" />
            <path d="M70 58 Q94 52 102 26 Q76 22 68 48 Z" fill="#2A1D50" />
            <rect x="54" y="90" width="32" height="16" rx="4" fill="#2A1D50" />
          </svg>
          <button
            type="button"
            onClick={tapPlantShadow}
            aria-label={lang === "fa" ? "سایهٔ گلدان" : "plant shadow"}
            className="absolute inset-0 cursor-pointer"
          >
            <span className="sr-only">{lang === "fa" ? "سایهٔ گلدان" : "plant shadow"}</span>
          </button>
          {/* curtain on rail (moves on reveal) */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[46%]">
            <CurtainSvg shifted={revealed} />
          </div>
        </div>
      </div>

      {/* RIGHT window (thief!) */}
      <div className="absolute bottom-[20%] right-[6%] w-[36%]">
        <div className="relative rounded-xl border-4 border-[#A96F35] bg-[#BFE7F5]/90">
          {/* revealed thief */}
          {revealed ? (
            <div className="px-2 py-1" style={{ animation: "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
              <ThiefSvg />
            </div>
          ) : (
            <svg viewBox="0 0 140 110" className="block h-auto w-full opacity-45" aria-hidden>
              {/* odd shadow: fedora + nose silhouette */}
              <g style={{ animation: "breathe 2.2s ease-in-out infinite" }}>
                <path d="M46 38 Q70 14 94 38 L94 44 Q70 50 46 44 Z" fill="#2A1D50" />
                <rect x="56" y="24" width="28" height="7" rx="3.5" fill="#2A1D50" />
                <path d="M70 50 Q74 58 70 62 Q66 58 70 50" fill="#2A1D50" />
                <rect x="56" y="62" width="28" height="42" rx="10" fill="#2A1D50" />
                <path d="M56 96 Q48 104 46 108 M84 96 Q92 104 94 108" stroke="#2A1D50" strokeWidth="6" strokeLinecap="round" />
              </g>
            </svg>
          )}
          {/* off-target taps on the glass count as a miss */}
          {!revealed && (
            <button
              type="button"
              onClick={tapGlass}
              aria-label={lang === "fa" ? "شیشهٔ پنجره" : "window glass"}
              className="absolute inset-0 cursor-pointer"
            >
              <span className="sr-only">{lang === "fa" ? "شیشهٔ پنجره" : "window glass"}</span>
            </button>
          )}
          {/* shadow hotspot: only the fedora area counts now */}
          {!revealed && (
            <button
              type="button"
              onClick={tapOddShadow}
              aria-label={lang === "fa" ? "سایهٔ مشکوک" : "suspicious shadow"}
              className="absolute left-[26%] top-[8%] h-[52%] w-[48%] cursor-pointer"
            >
              <span className="sr-only">{lang === "fa" ? "سایهٔ مشکوک" : "suspicious shadow"}</span>
            </button>
          )}
          {/* curtain slides aside on reveal */}
          <div className={`pointer-events-none absolute inset-y-0 ${revealed ? "right-[-46%]" : "right-0"} w-[46%]`} style={{ transition: "right 0.9s cubic-bezier(0.5,0,0.3,1)" }}>
            <CurtainSvg shifted={false} />
          </div>
        </div>
        <Pulse active={hintPulse > 0 && !revealed} className="absolute inset-0">
          <span className="sr-only">hint</span>
        </Pulse>
      </div>

      {/* decoy: coat stand with a hat on the floor */}
      <button
        type="button"
        onClick={tapCoatStand}
        aria-label={lang === "fa" ? "رخت‌آویز" : "coat stand"}
        className="absolute bottom-[1%] left-[32%] z-10 w-[10%] cursor-pointer transition-transform active:scale-90"
        aria-hidden={revealed}
      >
        <CoatStandSvg />
      </button>

      {/* floor lamp */}
      <div className="absolute bottom-[16%] left-[44%] w-[13%]" aria-hidden>
        <svg viewBox="0 0 70 110">
          <path d="M14 26 L56 26 L46 4 L24 4 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
          <path d="M35 26 L35 92" stroke="#3B2E5A" strokeWidth="6" strokeLinecap="round" />
          <ellipse cx="35" cy="98" rx="16" ry="5" fill="#33205E" stroke="#3B2E5A" strokeWidth="3.4" />
          <circle cx="35" cy="30" r="8" fill="#FFF3D6" style={{ animation: "glow 2s ease-in-out infinite" }} />
        </svg>
      </div>

      {/* floor */}
      <div className="absolute bottom-0 left-0 right-0 h-[16%] rounded-t-[40px] border-t-4 border-[#3B2E5A] bg-[#33205E]" aria-hidden />

      {/* caught badge */}
      {revealed && (
        <div className="absolute left-[8%] top-[10%] w-[20%]" style={{ animation: "star-pop 0.7s 0.4s ease both" }} aria-hidden>
          <svg viewBox="0 0 100 60">
            <rect x="4" y="6" width="92" height="46" rx="12" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
            <text x="50" y="38" textAnchor="middle" fontSize="20" fontWeight="900" fill="#33205E">
              {lang === "fa" ? "گیرش انداخت!" : "GOTCHA!"}
            </text>
          </svg>
        </div>
      )}
    </Scene>
  );
}
