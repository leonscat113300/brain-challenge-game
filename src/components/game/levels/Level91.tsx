"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 91 — Exit the bathroom without getting wet: spread the towel  */
/* over the wet floor by the door.                                     */
/* ------------------------------------------------------------------ */

function TowelSvg({ state }: { state: "hanging" | "spread" }) {
  return (
    <svg viewBox={state === "hanging" ? "0 0 90 120" : "0 0 160 50"} className="h-auto w-full" aria-hidden>
      {state === "hanging" ? (
        <>
          <rect x="14" y="10" width="62" height="96" rx="10" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" />
          <path d="M14 34 L76 34 M14 62 L76 62" stroke="#0E96A5" strokeWidth="5" />
          <path d="M46 106 L46 116 M62 104 L62 114" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M8 36 Q80 22 152 36 L146 46 Q80 34 14 46 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M24 40 L136 40" stroke="#0E96A5" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function ChildSvg({ happy }: { happy: boolean }) {
  return (
    <svg viewBox="0 0 100 150" className="h-auto w-full" aria-hidden>
      <path d="M30 70 L20 92 M70 70 L80 92" stroke="#3B2E5A" strokeWidth="9" strokeLinecap="round" />
      <path d="M30 70 L20 92 M70 70 L80 92" stroke="#FFD9B3" strokeWidth="6" strokeLinecap="round" />
      <rect x="28" y="60" width="44" height="52" rx="16" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M38 112 L38 134 M62 112 L62 134" stroke="#3B2E5A" strokeWidth="8" strokeLinecap="round" />
      <path d="M38 112 L38 130 M62 112 L62 130" stroke="#33205E" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="38" cy="138" rx="9" ry="5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
      <ellipse cx="62" cy="138" rx="9" ry="5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="50" cy="34" r="22" fill="#FFD9B3" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M30 24 Q38 10 50 12 Q64 10 70 24" fill="#3B2E5A" stroke="#3B2E5A" strokeWidth="3" />
      <path d="M50 12 Q52 4 60 6" fill="none" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="42" cy="36" r="3.6" fill="#3B2E5A" />
      <circle cx="58" cy="36" r="3.6" fill="#3B2E5A" />
      <circle cx="43.2" cy="34.8" r="1.2" fill="#FAFAFA" />
      <circle cx="59.2" cy="34.8" r="1.2" fill="#FAFAFA" />
      {happy ? (
        <path d="M42 46 Q50 54 58 46" fill="none" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
      ) : (
        <circle cx="50" cy="48" r="4" fill="#3B2E5A" />
      )}
      <circle cx="34" cy="42" r="3.4" fill="#FFB3BE" opacity="0.85" />
      <circle cx="66" cy="42" r="3.4" fill="#FFB3BE" opacity="0.85" />
    </svg>
  );
}

export default function Level91({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [spread, setSpread] = useState(false);
  const [exiting, setExiting] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const towelRef = useRef<HTMLDivElement>(null);
  const wetRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const towelDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || spread || exiting) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(towelRef, wetRef, 14)) {
          api.reset();
          setSpread(true);
          sfx.whoosh();
          onProgress(1);
          timers.current.push(setTimeout(() => sfx.sparkle(), 300));
          timers.current.push(
            setTimeout(() => {
              setExiting(true);
              sfx.boing();
            }, 700)
          );
          timers.current.push(
            setTimeout(() => {
              sfx.cheer();
              onSolved();
            }, 2100)
          );
          return;
        }
        api.reset();
      },
      [solved, spread, exiting, onProgress, onSolved]
    )
  );

  const tapDoor = useCallback(() => {
    if (solved || spread) return;
    sfx.fail();
    onMistake({
      fa: "زمین خیسه! اول حوله را جلوی در پهن کن.",
      en: "The floor is wet! First spread the towel by the door.",
    });
  }, [solved, spread, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#E3F2F5 0%,#D8ECF0 52%,#CBDFE4 60%,#CFE7EA 62%,#BFD6DA 100%)">
      {/* tiles */}
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(59,46,90,0.15) 0 3px, transparent 3px 42px), repeating-linear-gradient(90deg, rgba(59,46,90,0.15) 0 3px, transparent 3px 42px)" }} aria-hidden />

      {/* bathtub with bubbles */}
      <div className="absolute bottom-[24%] right-[6%] w-[38%]" aria-hidden>
        <svg viewBox="0 0 180 110">
          <path d="M14 22 L166 22 L156 92 Q90 102 24 92 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
          <path d="M22 34 Q90 26 158 34 L152 66 Q90 58 28 66 Z" fill="#8FDCE0" stroke="#3B2E5A" strokeWidth="3" />
          <circle cx="60" cy="44" r="7" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.4" />
          <circle cx="90" cy="50" r="5" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.2" />
          <circle cx="120" cy="42" r="6" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.4" />
          <circle cx="44" cy="10" r="10" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" style={{ animation: "float-up 2.4s ease-out infinite" }} />
          <circle cx="120" cy="6" r="8" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" style={{ animation: "float-up 2.8s 0.6s ease-out infinite" }} />
          {/* legs */}
          <ellipse cx="36" cy="98" rx="7" ry="4.5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
          <ellipse cx="144" cy="98" rx="7" ry="4.5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>

      {/* door (left) */}
      <div className="absolute bottom-[22%] left-[4%] w-[22%]">
        <button type="button" onClick={tapDoor} aria-label={lang === "fa" ? "در حمام" : "bathroom door"} className="block w-full cursor-pointer transition-transform active:scale-95">
          <svg viewBox="0 0 100 170" className="h-auto w-full" aria-hidden>
            <rect x="6" y="6" width="88" height="158" rx="10" fill="#A96F35" stroke="#3B2E5A" strokeWidth="5" />
            <rect x="16" y="16" width="68" height="138" rx="8" fill={exiting ? "#FFF3D6" : "#C98A4B"} stroke="#3B2E5A" strokeWidth="4" />
            <rect x="26" y="30" width="48" height="52" rx="7" fill="#BFE7F5" stroke="#3B2E5A" strokeWidth="3" />
            <circle cx="76" cy="92" r="5.5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
          </svg>
        </button>
      </div>

      {/* wet floor patch (target zone) */}
      <div className="absolute bottom-[10%] left-[24%] w-[42%]">
        <div ref={wetRef} className="relative h-[70px]">
          <svg viewBox="0 0 200 70" className="h-auto w-full" aria-hidden style={{ opacity: spread ? 0.25 : 1, transition: "opacity 0.8s" }}>
            <ellipse cx="100" cy="40" rx="94" ry="24" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
            <path d="M30 38 Q60 30 90 38 T150 38 T186 36" fill="none" stroke="#8FDCE0" strokeWidth="4" strokeLinecap="round" />
            <path d="M40 52 Q70 44 100 52 T170 50" fill="none" stroke="#8FDCE0" strokeWidth="3.4" strokeLinecap="round" />
          </svg>
          {spread && (
            <div className="absolute inset-0" style={{ animation: "pop-in 0.45s ease both" }}>
              <TowelSvg state="spread" />
            </div>
          )}
        </div>
      </div>

      {/* child steps out over the towel */}
      {exiting && (
        <div className="pointer-events-none absolute bottom-[12%] left-[24%] w-[15%]" style={{ animation: "walk-out-left 1.6s ease-in both" }}>
          <ChildSvg happy />
        </div>
      )}
      {!exiting && (
        <div className="absolute bottom-[26%] left-[24%] w-[13%]">
          <ChildSvg happy={false} />
        </div>
      )}

      {/* towel on rack (draggable) */}
      {!spread && (
        <div className="absolute right-[6%] top-[8%] w-[18%]">
          <div aria-hidden>
            <div className="h-2.5 w-full rounded-full border-[3px] border-[#3B2E5A] bg-[#8FA6BD]" />
            <div className="mx-auto h-8 w-[30%] border-x-2 border-[#3B2E5A]" />
          </div>
          <div
            ref={towelRef}
            {...towelDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "حولهٔ تمیز" : "clean towel"}
            className="-mt-2 cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${towelDrag.x}px, ${towelDrag.y}px) rotate(2deg)`,
              transition: towelDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && !spread}>
              <TowelSvg state="hanging" />
            </Pulse>
          </div>
        </div>
      )}

      {/* dry sparkle after spread */}
      {spread && !exiting && (
        <div className="pointer-events-none absolute bottom-[16%] left-[38%] w-[10%]" style={{ animation: "star-pop 0.6s ease both" }} aria-hidden>
          <svg viewBox="0 0 40 40" className="w-full">
            <path d="M20 2 L24 14 L36 14 L26 22 L30 34 L20 26 L10 34 L14 22 L4 14 L16 14 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" />
          </svg>
        </div>
      )}
    </Scene>
  );
}
