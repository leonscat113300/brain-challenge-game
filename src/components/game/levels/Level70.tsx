"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 70 — Where is the toothbrush? Lift the cup on the sink —      */
/* the brush hides underneath it. Then tap the brush to take it.       */
/* ------------------------------------------------------------------ */

function ToothbrushSvg() {
  return (
    <svg viewBox="0 0 90 130" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" aria-hidden>
      {/* handle */}
      <rect x="36" y="46" width="18" height="72" rx="9" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* neck */}
      <rect x="39" y="18" width="12" height="32" rx="6" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
      {/* head with bristles */}
      <rect x="34" y="4" width="22" height="18" rx="6" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
      <g stroke="#3B2E5A" strokeWidth="2.6" strokeLinecap="round">
        <line x1="39" y1="7" x2="39" y2="14" />
        <line x1="45" y1="7" x2="45" y2="14" />
        <line x1="51" y1="7" x2="51" y2="14" />
      </g>
      {/* sparkle */}
      <g style={{ animation: "star-pop 0.6s 0.1s both" }}>
        <path d="M72 30 L74.5 37 L81 39.5 L74.5 42 L72 49 L69.5 42 L63 39.5 L69.5 37 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

function MirrorSvg() {
  return (
    <svg viewBox="0 0 180 110" className="h-auto w-full" aria-hidden>
      <rect x="4" y="4" width="172" height="102" rx="16" fill="#BFE7F5" stroke="#8B6F4E" strokeWidth="6" />
      <path d="M24 84 Q60 24 100 66 Q120 86 152 40" stroke="#FAFAFA" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.7" />
      <circle cx="140" cy="30" r="8" fill="#FAFAFA" opacity="0.5" />
    </svg>
  );
}

export default function Level70({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [lifted, setLifted] = useState(false);
  const [taken, setTaken] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapBrush = useCallback(() => {
    if (solved || done || !lifted) return;
    setTaken(true);
    setDone(true);
    sfx.sparkle();
    onProgress(1);
    timers.current.push(setTimeout(() => sfx.cheer(), 300));
    timers.current.push(setTimeout(onSolved, 1200));
  }, [solved, done, lifted, onProgress, onSolved]);

  const cupDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (lifted || done) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (Math.abs(d.x) > 55 || d.y < -40) {
          sfx.pop();
          api.reset();
          setLifted(true);
          onProgress(0.6);
        } else {
          api.reset();
        }
      },
      [lifted, done, onProgress]
    )
  );

  const tapMirror = useCallback(() => {
    if (done) return;
    sfx.laugh();
    onMistake({
      fa: "مسواک پنهان است؛ لیوان روی روشویی را بلند کن!",
      en: "The brush is hidden; lift the cup on the sink!",
    });
  }, [done, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#DFF3F7 0%,#CFE9F0 58%,#BFE0EA 100%)">
      {/* wall tiles */}
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(59,46,90,0.12) 0 3px, transparent 3px 42px), repeating-linear-gradient(90deg, rgba(59,46,90,0.12) 0 3px, transparent 3px 42px)" }} aria-hidden />

      {/* mirror */}
      <button type="button" onClick={tapMirror} aria-label={lang === "fa" ? "آینه" : "mirror"} className="absolute left-[18%] top-[4%] w-[52%] cursor-pointer border-0 bg-transparent p-0">
        <MirrorSvg />
      </button>

      {/* sink */}
      <div className="absolute bottom-[4%] left-1/2 w-[76%] -translate-x-1/2">
        <svg viewBox="0 0 300 130" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.15)]" aria-hidden>
          {/* faucet */}
          <rect x="130" y="-26" width="18" height="34" rx="8" fill="#7FA8B8" stroke="#3B2E5A" strokeWidth="4" />
          <path d="M139 4 Q139 22 158 22 L166 22" fill="none" stroke="#7FA8B8" strokeWidth="14" strokeLinecap="round" />
          <path d="M139 4 Q139 22 158 22 L166 22" fill="none" stroke="#3B2E5A" strokeWidth="17" strokeLinecap="round" opacity="0.2" />
          {/* basin */}
          <path d="M40 52 Q40 40 56 40 L244 40 Q260 40 260 52 L250 96 Q248 108 232 108 L68 108 Q52 108 50 96 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
          <ellipse cx="150" cy="50" rx="92" ry="9" fill="#DFF3F7" stroke="#3B2E5A" strokeWidth="3.5" />
          <circle cx="150" cy="84" r="7" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="3" />
          {/* pedestal */}
          <rect x="120" y="108" width="60" height="20" rx="8" fill="#E7DDF4" stroke="#3B2E5A" strokeWidth="4.5" />
        </svg>
      </div>

      {/* toothbrush — hidden under cup until lifted */}
      <div
        className="absolute bottom-[30%] left-[46%] w-[13%]"
        style={{
          opacity: lifted ? 1 : 0,
          transform: lifted ? "translateY(0)" : "translateY(10px)",
          transition: "opacity 0.3s ease 0.2s, transform 0.35s ease 0.2s",
          zIndex: 14,
          animation: taken ? "bob 0.5s ease-in-out" : undefined,
        }}
      >
        <Pulse active={hintPulse > 0 && lifted && !taken && !done}>
          <button type="button" onClick={tapBrush} aria-label={lang === "fa" ? "مسواک" : "toothbrush"} className="block w-full cursor-pointer border-0 bg-transparent p-0">
            <ToothbrushSvg />
          </button>
        </Pulse>
      </div>

      {/* cup (draggable) — covers the brush before lifting */}
      <div
        className="absolute bottom-[26%] left-[40%] w-[24%]"
        style={{
          transform: lifted ? "translate(-120%, -30%) rotate(-14deg)" : undefined,
          transition: lifted ? "transform 0.55s cubic-bezier(0.34,1.4,0.64,1)" : undefined,
          zIndex: lifted ? 12 : 20,
          opacity: lifted ? 0.95 : 1,
        }}
        aria-hidden={lifted}
      >
        {!lifted && (
          <div {...cupDrag.bind} role="button" aria-label={lang === "fa" ? "لیوان" : "cup"} className="cursor-grab active:cursor-grabbing">
            <Pulse active={hintPulse > 0 && !lifted && !done}>
              <svg viewBox="0 0 110 110" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]">
                {/* upside-down cup */}
                <path d="M24 34 L86 34 L80 96 Q79 102 72 102 L38 102 Q31 102 30 96 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
                <ellipse cx="55" cy="34" rx="31" ry="9" fill="#7FD8E8" stroke="#3B2E5A" strokeWidth="4" />
                <path d="M40 52 Q55 60 70 52" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
                <circle cx="46" cy="74" r="3.4" fill="#3B2E5A" />
                <circle cx="64" cy="74" r="3.4" fill="#3B2E5A" />
                <circle cx="47.4" cy="72.6" r="1.3" fill="#fff" />
                <circle cx="65.4" cy="72.6" r="1.3" fill="#fff" />
                <path d="M49 86 Q55 90 61 86" stroke="#3B2E5A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                {/* brush tip peeking out */}
                <rect x="82" y="88" width="16" height="7" rx="3.5" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.5" transform="rotate(18 82 88)" />
              </svg>
            </Pulse>
          </div>
        )}
      </div>

      {/* soap + towel decor */}
      <div className="absolute bottom-[13%] end-[10%] h-[6%] w-[13%] rounded-full border-4 border-[#3B2E5A] bg-[#FFD154]" aria-hidden />
      <div className="absolute end-[2%] top-[10%] w-[14%]" aria-hidden>
        <svg viewBox="0 0 70 90">
          <rect x="6" y="6" width="58" height="78" rx="10" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4.5" />
          <path d="M14 30 L56 30 M14 48 L56 48 M14 66 L56 66" stroke="#3B2E5A" strokeWidth="3" opacity="0.3" />
        </svg>
      </div>
    </Scene>
  );
}
