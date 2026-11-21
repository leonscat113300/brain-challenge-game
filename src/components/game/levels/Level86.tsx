"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 86 — The window keeps flapping in the wind: drag the curtain  */
/* clip onto the window handle to hold it shut.                        */
/* ------------------------------------------------------------------ */

function ClipSvg() {
  return (
    <svg viewBox="0 0 60 80" className="h-auto w-full" aria-hidden>
      {/* hook */}
      <path d="M30 10 Q46 10 46 26 Q46 40 32 40" fill="none" stroke="#33205E" strokeWidth="8" strokeLinecap="round" />
      <path d="M30 10 Q46 10 46 26 Q46 40 32 40" fill="none" stroke="#8FA6BD" strokeWidth="3.6" strokeLinecap="round" />
      {/* clip body */}
      <rect x="18" y="38" width="24" height="30" rx="7" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="30" cy="53" r="4.5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.6" />
    </svg>
  );
}

function HandleSvg() {
  return (
    <svg viewBox="0 0 40 70" className="h-auto w-full" aria-hidden>
      <rect x="12" y="8" width="16" height="54" rx="8" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="20" cy="24" r="7" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="3.4" />
    </svg>
  );
}

export default function Level86({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [fixed, setFixed] = useState(false);

  const clipRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const clipDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || fixed) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(clipRef, handleRef, 16)) {
          api.reset();
          setFixed(true);
          sfx.unlock();
          timers.current.push(setTimeout(() => sfx.sparkle(), 250));
          timers.current.push(setTimeout(() => sfx.cheer(), 600));
          onProgress(1);
          timers.current.push(setTimeout(onSolved, 1600));
          return;
        }
        api.reset();
      },
      [solved, fixed, onProgress, onSolved]
    )
  );

  return (
    <Scene bg="linear-gradient(180deg,#DCD6EA 0%,#D2C9E6 58%,#C6BADD 66%,#E3CFA4 68%,#D9BE8F 100%)">
      {/* wind streaks before fixed */}
      {!fixed && (
        <div className="pointer-events-none absolute inset-x-0 top-[10%] h-[40%]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <svg key={i} viewBox="0 0 120 20" className="absolute w-[26%]" style={{ left: `${6 + i * 22}%`, top: `${i * 26}%`, animation: `wobble 1.1s ${i * 0.2}s ease-in-out infinite` }}>
              <path d="M4 12 Q40 4 76 12 Q98 16 116 8" fill="none" stroke="#8FA6BD" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
            </svg>
          ))}
        </div>
      )}

      {/* window */}
      <div className="absolute bottom-[22%] left-1/2 w-[62%] -translate-x-1/2">
        {/* frame */}
        <div className="relative rounded-2xl border-[6px] border-[#A96F35] bg-[#BFE7F5] p-2 shadow-[0_5px_0_rgba(59,46,90,0.2)]">
          {/* sash flapping (or steady when fixed) */}
          <div
            className="relative h-40 rounded-xl border-4 border-[#33205E] bg-[#8FDCE0]"
            style={{
              transformOrigin: "right center",
              animation: fixed ? undefined : "wobble 1.6s ease-in-out infinite",
              transition: "animation 0.3s",
            }}
          >
            {/* glass shine */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
              <path d="M14 14 L46 14 L14 52 Z" fill="#FAFAFA" opacity="0.5" />
            </svg>
            {/* handle on the sash */}
            <div className="absolute bottom-[8%] left-[8%] w-[13%]">
              <HandleSvg />
            </div>
            {/* attached clip */}
            {fixed && (
              <div className="absolute bottom-[5%] left-[10.5%] w-[12%]" style={{ animation: "pop-in 0.45s ease both" }} aria-hidden>
                <ClipSvg />
              </div>
            )}
          </div>
          {/* handle drop zone (covers handle area, generous) */}
          <div ref={handleRef} className="pointer-events-none absolute bottom-[16%] left-[12%] h-[28%] w-[16%]" aria-hidden />
        </div>
      </div>

      {/* clip on the ledge (draggable) */}
      {!fixed && (
        <div className="absolute bottom-[12%] right-[10%] w-[13%]">
          <div
            ref={clipRef}
            {...clipDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "گیرهٔ پرده" : "curtain clip"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${clipDrag.x}px, ${clipDrag.y}px) rotate(10deg)`,
              transition: clipDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && !fixed}>
              <ClipSvg />
            </Pulse>
          </div>
        </div>
      )}

      {/* ledge */}
      <div className="absolute bottom-[8%] left-[8%] right-[8%] h-4 rounded-xl border-4 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />

      {/* breeze stops + lock badge when fixed */}
      {fixed && (
        <div className="absolute right-[6%] top-[10%] w-[16%]" style={{ animation: "star-pop 0.6s ease both" }} aria-hidden>
          <svg viewBox="0 0 80 90">
            <circle cx="40" cy="44" r="34" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4.5" />
            <rect x="27" y="38" width="26" height="20" rx="6" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.4" />
            <path d="M32 38 L32 30 Q32 24 40 24 Q48 24 48 30 L48 38" fill="none" stroke="#FAFAFA" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </Scene>
  );
}
