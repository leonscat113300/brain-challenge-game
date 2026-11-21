"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 71 — The room is pitch dark! First drag the curtain aside     */
/* (so you can see), THEN turn the lamp on.                            */
/* ------------------------------------------------------------------ */

export default function Level71({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [lightOn, setLightOn] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapSwitch = useCallback(() => {
    if (solved || done || lightOn) return;
    if (!curtainOpen) {
      sfx.fail();
      onMistake({
        fa: "هیچی پیدا نمی‌شود در این تاریکی! اول پرده را کنار بزن.",
        en: "You can't find anything in the dark! Move the curtain first.",
      });
      return;
    }
    setLightOn(true);
    setDone(true);
    sfx.click();
    timers.current.push(setTimeout(() => sfx.chime(), 250));
    onProgress(1);
    timers.current.push(setTimeout(() => sfx.cheer(), 500));
    timers.current.push(setTimeout(onSolved, 1500));
  }, [solved, done, lightOn, curtainOpen, onMistake, onProgress, onSolved]);

  const curtainDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (curtainOpen || done) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (d.x > 55) {
          sfx.whoosh();
          api.reset();
          setCurtainOpen(true);
          onProgress(0.5);
        } else {
          api.reset();
        }
      },
      [curtainOpen, done, onProgress]
    )
  );

  /* darkness level: full → half (moon glow) → bright (lamp) */
  const dark = lightOn ? 0 : curtainOpen ? 0.45 : 0.86;

  return (
    <Scene bg="linear-gradient(180deg,#DCD6EA 0%,#C9C1E0 58%,#B7ABDA 100%)">
      {/* window with sun */}
      <div className="absolute end-[6%] top-[6%] h-[44%] w-[34%] overflow-hidden rounded-2xl border-[6px] border-[#8B6F4E] bg-[#BFE7F5] shadow-[0_4px_0_rgba(59,46,90,0.2)]">
        <svg viewBox="0 0 200 170" className="h-full w-full" aria-hidden>
          <circle cx="76" cy="56" r="30" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="76" y1="14" x2="76" y2="22" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" transform={`rotate(${a} 76 56)`} />
          ))}
          <circle cx="64" cy="50" r="3" fill="#3B2E5A" />
          <circle cx="88" cy="50" r="3" fill="#3B2E5A" />
          <path d="M68 61 Q76 68 84 61" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M120 100 Q136 88 152 100 M158 116 Q174 104 190 116" stroke="#7FB8D9" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
          <rect x="96" y="0" width="8" height="170" fill="#8B6F4E" stroke="#3B2E5A" strokeWidth="3" />
          <rect x="0" y="82" width="200" height="8" fill="#8B6F4E" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>

      {/* sunlight beam once curtain opens */}
      <div
        className="absolute"
        style={{
          right: "14%",
          top: "18%",
          width: "72%",
          height: "62%",
          clipPath: "polygon(66% 0, 100% 0, 100% 34%, 26% 100%, 0 100%, 0 88%)",
          background: "linear-gradient(245deg, rgba(255,209,84,0.85) 0%, rgba(255,209,84,0.4) 45%, rgba(255,209,84,0) 78%)",
          opacity: curtainOpen ? 0.9 : 0,
          transition: "opacity 0.7s ease",
          pointerEvents: "none",
        }}
        aria-hidden
      />

      {/* curtain (draggable) */}
      <div className="absolute end-[6%] top-[6%] h-[48%] w-[34%]" style={{ pointerEvents: "none" }}>
        <Pulse active={hintPulse > 0 && !done && !curtainOpen} className="h-full w-full">
          <div
            {...(curtainOpen ? {} : curtainDrag.bind)}
            role="button"
            aria-label={lang === "fa" ? "پرده" : "curtain"}
            className="absolute top-0 left-0 h-full w-full cursor-grab active:cursor-grabbing"
            style={{
              pointerEvents: "auto",
              transform: `translateX(${curtainOpen ? "108%" : `${curtainDrag.x}px`})`,
              transition: curtainDrag.dragging ? "none" : "transform 0.55s cubic-bezier(0.5,0,0.3,1)",
              zIndex: 25,
            }}
          >
            <svg viewBox="0 0 60 150" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
              <path d="M2 4 L58 4 L58 128 Q44 142 30 128 Q16 142 2 128 Z" fill="#FF7B54" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
              <path d="M16 8 L16 120 M30 8 L30 124 M44 8 L44 120" stroke="#3B2E5A" strokeWidth="2.4" opacity="0.35" />
              <rect x="0" y="0" width="60" height="10" rx="5" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="3.5" />
            </svg>
          </div>
        </Pulse>
      </div>

      {/* lamp */}
      <div className="absolute bottom-[16%] start-[8%] w-[26%]">
        <svg viewBox="0 0 120 160" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.2)]" aria-hidden>
          {/* shade */}
          <path d="M30 58 L60 18 L90 58 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
          {/* bulb */}
          <circle cx="60" cy="66" r="14" fill={lightOn ? "#FFD154" : "#C9C4D8"} stroke="#3B2E5A" strokeWidth="4" />
          {/* pole */}
          <rect x="55" y="80" width="10" height="56" rx="4" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
          {/* base */}
          <path d="M30 138 L90 138 L82 150 L38 150 Z" fill="#A96F35" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
          {lightOn &&
            [0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <line key={a} x1="60" y1="88" x2="60" y2="96" stroke="#FFD154" strokeWidth="4" strokeLinecap="round" transform={`rotate(${a} 60 66)`} />
            ))}
        </svg>
      </div>

      {/* wall switch */}
      <div className="absolute bottom-[30%] left-[29%]">
        <Pulse active={hintPulse > 0 && curtainOpen && !done}>
          <button
            type="button"
            onClick={tapSwitch}
            aria-label={lang === "fa" ? "کلید چراغ" : "light switch"}
            className="flex h-16 w-11 cursor-pointer flex-col items-center justify-center rounded-xl border-4 border-[#3B2E5A] bg-[#FAFAFA] shadow-[0_3px_0_rgba(59,46,90,0.3)] transition-all"
            style={{ opacity: curtainOpen ? 1 : 0.5 }}
          >
            <span className="h-5 w-2.5 rounded-full border-2 border-[#3B2E5A]" style={{ background: lightOn ? "#4CAF50" : "#C9C4D8", transform: lightOn ? "translateY(4px)" : "translateY(-4px)", transition: "transform 0.25s ease" }} aria-hidden />
          </button>
        </Pulse>
        <div className="mt-1 text-center text-[10px] font-bold text-[#33205E]" aria-hidden>
          {lang === "fa" ? "کلید" : "switch"}
        </div>
      </div>

      {/* furniture silhouettes */}
      <div className="absolute bottom-[4%] end-[4%] w-[26%] opacity-40" aria-hidden>
        <svg viewBox="0 0 140 80">
          <rect x="6" y="10" width="128" height="60" rx="10" fill="#8B7FB8" stroke="#3B2E5A" strokeWidth="4" />
          <rect x="18" y="22" width="44" height="36" rx="6" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="3.5" />
          <rect x="72" y="22" width="44" height="36" rx="6" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="3.5" />
        </svg>
      </div>

      {/* darkness overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background: "radial-gradient(circle at 50% 45%, rgba(26,16,48,0.92) 30%, rgba(16,10,32,0.98) 100%)",
          opacity: dark,
          transition: "opacity 0.8s ease",
        }}
        aria-hidden
      />
    </Scene>
  );
}
