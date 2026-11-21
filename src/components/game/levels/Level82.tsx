"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 82 — The child can't reach the toy on top of the cabinet.     */
/* Drag the chair under the cabinet, then tap the teddy to grab it.    */
/* ------------------------------------------------------------------ */

function TeddySvg({ size = 1 }: { size?: number }) {
  return (
    <svg viewBox="0 0 90 100" className="h-auto w-full" style={{ transform: `scale(${size})` }} aria-hidden>
      {/* ears */}
      <circle cx="24" cy="18" r="10" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="66" cy="18" r="10" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="24" cy="18" r="4.5" fill="#FFD9B3" />
      <circle cx="66" cy="18" r="4.5" fill="#FFD9B3" />
      {/* head */}
      <circle cx="45" cy="32" r="21" fill="#D9A468" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* muzzle */}
      <ellipse cx="45" cy="40" rx="11" ry="8" fill="#FFD9B3" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="45" cy="36" r="3.2" fill="#3B2E5A" />
      <path d="M45 39 L45 43 M45 43 Q40 46 38 43 M45 43 Q50 46 52 43" fill="none" stroke="#3B2E5A" strokeWidth="2.4" strokeLinecap="round" />
      {/* eyes */}
      <circle cx="37" cy="28" r="3.6" fill="#3B2E5A" />
      <circle cx="53" cy="28" r="3.6" fill="#3B2E5A" />
      <circle cx="38.2" cy="26.8" r="1.2" fill="#FAFAFA" />
      <circle cx="54.2" cy="26.8" r="1.2" fill="#FAFAFA" />
      {/* body */}
      <ellipse cx="45" cy="70" rx="20" ry="22" fill="#D9A468" stroke="#3B2E5A" strokeWidth="4.5" />
      <ellipse cx="45" cy="74" rx="11" ry="13" fill="#FFD9B3" />
      {/* arms */}
      <ellipse cx="22" cy="62" rx="8" ry="12" fill="#D9A468" stroke="#3B2E5A" strokeWidth="4" transform="rotate(18 22 62)" />
      <ellipse cx="68" cy="62" rx="8" ry="12" fill="#D9A468" stroke="#3B2E5A" strokeWidth="4" transform="rotate(-18 68 62)" />
      {/* bow */}
      <path d="M45 50 L38 45 L38 55 Z M45 50 L52 45 L52 55 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="45" cy="50" r="3" fill="#E14B60" stroke="#3B2E5A" strokeWidth="2" />
    </svg>
  );
}

function ChildSvg({ armsUp, happy }: { armsUp: boolean; happy: boolean }) {
  return (
    <svg viewBox="0 0 100 150" className="h-auto w-full" aria-hidden>
      {armsUp ? (
        <>
          <path d="M30 66 L14 38" stroke="#3B2E5A" strokeWidth="9" strokeLinecap="round" />
          <path d="M30 66 L14 38" stroke="#FFD9B3" strokeWidth="6" strokeLinecap="round" />
          <path d="M70 66 L86 38" stroke="#3B2E5A" strokeWidth="9" strokeLinecap="round" />
          <path d="M70 66 L86 38" stroke="#FFD9B3" strokeWidth="6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M30 70 L18 92" stroke="#3B2E5A" strokeWidth="9" strokeLinecap="round" />
          <path d="M30 70 L18 92" stroke="#FFD9B3" strokeWidth="6" strokeLinecap="round" />
          <path d="M70 70 L82 92" stroke="#3B2E5A" strokeWidth="9" strokeLinecap="round" />
          <path d="M70 70 L82 92" stroke="#FFD9B3" strokeWidth="6" strokeLinecap="round" />
        </>
      )}
      {/* body */}
      <rect x="28" y="60" width="44" height="52" rx="16" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* legs */}
      <path d="M38 112 L38 134 M62 112 L62 134" stroke="#3B2E5A" strokeWidth="8" strokeLinecap="round" />
      <path d="M38 112 L38 130 M62 112 L62 130" stroke="#33205E" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="38" cy="138" rx="9" ry="5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" />
      <ellipse cx="62" cy="138" rx="9" ry="5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" />
      {/* head */}
      <circle cx="50" cy="34" r="22" fill="#FFD9B3" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* hair swirl */}
      <path d="M30 24 Q38 10 50 12 Q64 10 70 24" fill="#3B2E5A" stroke="#3B2E5A" strokeWidth="3" />
      <path d="M50 12 Q52 4 60 6" fill="none" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
      {/* face */}
      <circle cx="42" cy="36" r="3.6" fill="#3B2E5A" />
      <circle cx="58" cy="36" r="3.6" fill="#3B2E5A" />
      <circle cx="43.2" cy="34.8" r="1.2" fill="#FAFAFA" />
      <circle cx="59.2" cy="34.8" r="1.2" fill="#FAFAFA" />
      {happy ? (
        <path d="M42 46 Q50 54 58 46" fill="none" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
      ) : (
        <path d="M44 49 Q50 45 56 49" fill="none" stroke="#3B2E5A" strokeWidth="3.2" strokeLinecap="round" />
      )}
      {/* cheeks */}
      <circle cx="34" cy="42" r="3.4" fill="#FFB3BE" opacity="0.85" />
      <circle cx="66" cy="42" r="3.4" fill="#FFB3BE" opacity="0.85" />
    </svg>
  );
}

function ChairSvg() {
  return (
    <svg viewBox="0 0 110 130" className="h-auto w-full" aria-hidden>
      {/* backrest */}
      <rect x="14" y="8" width="16" height="66" rx="7" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4.5" />
      <rect x="14" y="8" width="72" height="14" rx="7" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* seat */}
      <rect x="14" y="72" width="76" height="16" rx="8" fill="#D9A468" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* legs */}
      <path d="M24 88 L24 120 M80 88 L80 120" stroke="#3B2E5A" strokeWidth="7" strokeLinecap="round" />
      <path d="M24 96 L80 112" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function CabinetSvg() {
  return (
    <svg viewBox="0 0 160 230" className="h-auto w-full" aria-hidden>
      <rect x="6" y="10" width="148" height="210" rx="12" fill="#FFB84D" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="6" y="10" width="148" height="16" rx="8" fill="#E89B2E" stroke="#3B2E5A" strokeWidth="4" />
      {/* doors */}
      <rect x="18" y="42" width="58" height="88" rx="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="84" y="42" width="58" height="88" rx="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="68" cy="86" r="4" fill="#3B2E5A" />
      <circle cx="92" cy="86" r="4" fill="#3B2E5A" />
      {/* drawer */}
      <rect x="18" y="140" width="124" height="42" rx="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="62" y="156" width="36" height="8" rx="4" fill="#3B2E5A" />
    </svg>
  );
}

export default function Level82({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [chairPlaced, setChairPlaced] = useState(false);
  const [gotToy, setGotToy] = useState(false);
  const [wrongShake, setWrongShake] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const chairRef = useRef<HTMLDivElement>(null);
  const cabBaseRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const chairDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || chairPlaced || gotToy) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(chairRef, cabBaseRef, 16)) {
          api.reset();
          setChairPlaced(true);
          sfx.pop();
          timers.current.push(setTimeout(() => sfx.boing(), 150));
          onProgress(0.5);
          return;
        }
        api.reset();
      },
      [solved, chairPlaced, gotToy, onProgress]
    )
  );

  const grabToy = useCallback(() => {
    if (solved || gotToy) return;
    if (!chairPlaced) {
      sfx.fail();
      setWrongShake(true);
      timers.current.push(setTimeout(() => setWrongShake(false), 550));
      onMistake({
        fa: "دستش به اسباب‌بازی نمی‌رسد! اول صندلی را زیر کمد بکش.",
        en: "He can't reach the toy! First drag the chair under the cabinet.",
      });
      return;
    }
    setGotToy(true);
    sfx.cheer();
    timers.current.push(setTimeout(() => sfx.sparkle(), 250));
    onProgress(1);
    timers.current.push(setTimeout(onSolved, 1600));
  }, [solved, gotToy, chairPlaced, onMistake, onProgress, onSolved]);

  return (
    <Scene bg="linear-gradient(180deg,#E9F5F7 0%,#E1EFF2 55%,#D8E8EC 62%,#E3CFA4 64%,#D9BE8F 100%)">
      {/* wall picture + balloon */}
      <div className="absolute left-[4%] top-[6%] w-[15%]" aria-hidden>
        <svg viewBox="0 0 90 70">
          <rect x="6" y="6" width="78" height="58" rx="8" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" />
          <path d="M18 50 Q40 22 72 44" fill="none" stroke="#FAFAFA" strokeWidth="5" strokeLinecap="round" />
          <circle cx="30" cy="28" r="9" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>
      <div className="absolute right-[38%] top-[2%] w-[8%]" aria-hidden>
        <svg viewBox="0 0 50 90" style={{ animation: "bob 2.6s ease-in-out infinite" }}>
          <path d="M25 34 Q40 20 34 8 Q28 -2 16 4 Q6 10 12 22 Q16 28 25 34 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" />
          <path d="M25 34 Q23 50 28 66" fill="none" stroke="#3B2E5A" strokeWidth="2.4" />
        </svg>
      </div>

      {/* cabinet + teddy on top */}
      <div className="absolute bottom-[8%] right-[6%] w-[34%]">
        <div ref={cabBaseRef} className="absolute -bottom-2 -left-6 h-16 w-[130%]" aria-hidden />
        <div className="relative">
          {!gotToy ? (
            <div className="absolute -top-[26%] left-1/2 w-[54%] -translate-x-1/2" style={{ animation: chairPlaced && !gotToy ? "bob 1.2s ease-in-out infinite" : undefined }}>
              <Pulse active={hintPulse > 0 && chairPlaced && !gotToy}>
                <button
                  type="button"
                  onClick={grabToy}
                  aria-label={lang === "fa" ? "خرس اسباب‌بازی" : "teddy bear"}
                  className="block w-full cursor-pointer transition-transform active:scale-90"
                  style={{ animation: wrongShake ? "shake-hard 0.5s ease" : undefined }}
                >
                  <TeddySvg />
                </button>
              </Pulse>
            </div>
          ) : null}
          <CabinetSvg />
        </div>
      </div>

      {/* teddy in child's arms after grab */}
      {gotToy && (
        <div className="pointer-events-none absolute bottom-[22%] left-[64%] w-[14%]" style={{ animation: "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <TeddySvg />
          <div className="pointer-events-none absolute -inset-4 -z-10 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,107,129,0.35) 0%, transparent 70%)" }} aria-hidden />
        </div>
      )}

      {/* child: standing on chair once placed */}
      <div className={`pointer-events-none absolute ${chairPlaced ? "bottom-[30%] left-[60%] w-[19%]" : "bottom-[8%] left-[12%] w-[20%]"}`} style={{ transition: "bottom 0.9s cubic-bezier(0.5,0,0.3,1), left 0.9s cubic-bezier(0.5,0,0.3,1)", animation: chairPlaced ? "pop-in 0.5s ease both" : undefined }}>
        <div style={{ animation: chairPlaced && !gotToy ? "breathe 1.4s ease-in-out infinite" : undefined }}>
          <ChildSvg armsUp={chairPlaced} happy={gotToy || chairPlaced} />
        </div>
      </div>

      {/* chair (draggable) */}
      {!chairPlaced && (
        <div className="absolute bottom-[6%] left-[34%] w-[22%]">
          <div
            ref={chairRef}
            {...chairDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "صندلی" : "chair"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${chairDrag.x}px, ${chairDrag.y}px)`,
              transition: chairDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && !chairPlaced && !gotToy}>
              <ChairSvg />
            </Pulse>
          </div>
        </div>
      )}

      {/* chair parked at the cabinet */}
      {chairPlaced && (
        <div className="pointer-events-none absolute bottom-[8%] left-[60%] w-[19%]" aria-hidden>
          <ChairSvg />
        </div>
      )}

      {/* hearts on success */}
      {gotToy && (
        <>
          {[
            { l: "58%", t: "30%", d: "0s" },
            { l: "70%", t: "22%", d: "0.25s" },
          ].map((p, i) => (
            <div key={i} className="pointer-events-none absolute" style={{ left: p.l, top: p.t, animation: `float-up 1.5s ${p.d} ease-out infinite` }} aria-hidden>
              <svg viewBox="0 0 24 24" className="w-6">
                <path d="M12 21 Q3 14 3 8 Q3 3 8 3 Q11 3 12 6 Q13 3 16 3 Q21 3 21 8 Q21 14 12 21 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2" />
              </svg>
            </div>
          ))}
        </>
      )}
    </Scene>
  );
}
