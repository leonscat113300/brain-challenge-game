"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import { animalSfx } from "@/lib/game/audio";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 79 — The floor is flooded! Throw the towel over the water AND */
/* close the broken tap. Two steps, any order.                         */
/* ------------------------------------------------------------------ */

function DuckSvg({ happy }: { happy: boolean }) {
  return (
    <svg viewBox="0 0 80 70" className="h-auto w-full" aria-hidden>
      <path d="M14 44 Q10 24 30 22 Q30 10 42 10 Q52 10 52 20 L60 26 L52 30 Q54 44 40 48 Q26 52 14 44 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="40" cy="20" r="3" fill="#3B2E5A" />
      <circle cx="41.2" cy="18.8" r="1" fill="#FAFAFA" />
      {happy ? (
        <>
          <circle cx="36" cy="26" r="2.6" fill="#3B2E5A" />
          <path d="M40 30 Q45 34 50 30" fill="none" stroke="#3B2E5A" strokeWidth="2.6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="37" cy="27" r="2.6" fill="#3B2E5A" />
          <circle cx="46" cy="27" r="2.6" fill="#3B2E5A" />
        </>
      )}
      <path d="M14 44 L14 58 Q14 62 20 62 L26 62" fill="none" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="29" cy="62" r="4" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" />
    </svg>
  );
}

function TowelSvg({ wet, flat }: { wet: boolean; flat: boolean }) {
  return (
    <svg viewBox={flat ? "0 0 140 60" : "0 0 90 120"} className="h-auto w-full" aria-hidden>
      {flat ? (
        <>
          <path d="M10 44 Q70 30 130 44 L124 54 Q70 44 16 54 Z" fill={wet ? "#1EC8CF" : "#FF6B81"} stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M30 48 L110 48" stroke={wet ? "#0E96A5" : "#E14B60"} strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <rect x="14" y="10" width="62" height="98" rx="10" fill={wet ? "#1EC8CF" : "#FF6B81"} stroke="#3B2E5A" strokeWidth="4.5" />
          <path d="M14 34 L76 34 M14 62 L76 62" stroke={wet ? "#0E96A5" : "#E14B60"} strokeWidth="5" />
          <path d="M46 108 L46 118 M62 106 L62 116" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export default function Level79({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [towelOn, setTowelOn] = useState(false);
  const [tapClosed, setTapClosed] = useState(false);
  const [done, setDone] = useState(false);
  const [valveSpin, setValveSpin] = useState(0);

  const towelRef = useRef<HTMLDivElement>(null);
  const puddleRef = useRef<HTMLDivElement>(null);
  const solvedRef = useRef(false);
  const towelOnRef = useRef(false);
  const tapClosedRef = useRef(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /** celebrate once both steps are done */
  const maybeFinish = useCallback(() => {
    if (solvedRef.current) return;
    if (towelOnRef.current && tapClosedRef.current) {
      solvedRef.current = true;
      setDone(true);
      onProgress(1);
      sfx.sparkle();
      timers.current.push(setTimeout(() => animalSfx.duck(), 250));
      timers.current.push(setTimeout(() => sfx.cheer(), 700));
      timers.current.push(setTimeout(onSolved, 1800));
    }
  }, [onProgress, onSolved]);

  const towelDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || towelOn || done) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(towelRef, puddleRef, 14)) {
          api.reset();
          towelOnRef.current = true;
          setTowelOn(true);
          sfx.whoosh();
          if (tapClosedRef.current) {
            onProgress(1);
          } else {
            onProgress(0.5);
          }
          timers.current.push(setTimeout(maybeFinish, 60));
          return;
        }
        api.reset();
      },
      [solved, towelOn, done, onProgress, maybeFinish]
    )
  );

  const closeTap = useCallback(() => {
    if (solved || tapClosed || done) return;
    tapClosedRef.current = true;
    setTapClosed(true);
    setValveSpin((v) => v + 360);
    sfx.unlock();
    if (towelOnRef.current) {
      onProgress(1);
    } else {
      onProgress(0.5);
    }
    timers.current.push(setTimeout(maybeFinish, 60));
  }, [solved, tapClosed, done, onProgress, maybeFinish]);

  return (
    <Scene bg="linear-gradient(180deg,#E3F2F5 0%,#D8ECF0 55%,#CBDFE4 66%,#BFD6DA 68%,#B7CBCE 100%)">
      {/* wall tiles */}
      <div className="absolute inset-x-0 top-0 h-[64%] opacity-45" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(59,46,90,0.14) 0 3px, transparent 3px 42px), repeating-linear-gradient(90deg, rgba(59,46,90,0.14) 0 3px, transparent 3px 42px)" }} aria-hidden />

      {/* broken tap + spray */}
      <div className="absolute left-[4%] top-[6%] w-[30%]">
        <svg viewBox="0 0 160 150" className="h-auto w-full" aria-hidden>
          <path d="M28 20 L28 60 Q28 34 64 34 L120 34" fill="none" stroke="#3B2E5A" strokeWidth="11" strokeLinecap="round" />
          <path d="M28 20 L28 60 Q28 34 64 34 L120 34" fill="none" stroke="#8FA6BD" strokeWidth="6" strokeLinecap="round" />
          {/* valve cross */}
          <g style={{ transform: `rotate(${valveSpin}deg)`, transformOrigin: "28px 22px", transition: "transform 0.8s cubic-bezier(0.5,0,0.3,1)" }}>
            <rect x="10" y="14" width="36" height="10" rx="5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" />
            <rect x="23" y="1" width="10" height="36" rx="5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" />
            <circle cx="28" cy="19" r="7" fill="#33205E" stroke="#3B2E5A" strokeWidth="3" />
          </g>
          {!tapClosed && (
            <g>
              <path d="M120 34 Q118 60 122 88 Q126 108 120 126" fill="none" stroke="#1EC8CF" strokeWidth="9" strokeLinecap="round" opacity="0.9" style={{ animation: "bob 0.5s ease-in-out infinite" }} />
              <path d="M112 70 L128 70 M114 100 L130 100" stroke="#8FDCE0" strokeWidth="5" strokeLinecap="round" />
            </g>
          )}
        </svg>
        <button
          type="button"
          onClick={closeTap}
          aria-label={lang === "fa" ? "بستن شیر آب" : "close the tap"}
          className="absolute left-0 top-0 h-[42%] w-[42%] cursor-pointer rounded-full transition-transform active:scale-90"
        >
          <span className="sr-only">{lang === "fa" ? "بستن شیر آب" : "close the tap"}</span>
        </button>
      </div>

      {/* towel rail (empty after taking) */}
      {!towelOn && (
        <div className="absolute right-[4%] top-[16%] w-[22%]" aria-hidden>
          <div className="h-2.5 w-full rounded-full border-[3px] border-[#3B2E5A] bg-[#8FA6BD]" />
          <div className="mx-auto h-10 w-[30%] border-x-2 border-[#3B2E5A]" />
        </div>
      )}

      {/* puddle */}
      <div className="absolute bottom-[10%] left-[22%] w-[52%]">
        <div ref={puddleRef} className="relative h-[90px]">
          <svg viewBox="0 0 300 90" className="h-auto w-full" aria-hidden style={{ opacity: towelOn ? 0.35 : 1, transition: "opacity 0.8s" }}>
            {towelOn ? (
              <ellipse cx="150" cy="56" rx="70" ry="18" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
            ) : (
              <>
                <ellipse cx="150" cy="52" rx="140" ry="32" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" />
                <path d="M40 48 Q70 40 100 48 T160 48 T220 48 T280 48" fill="none" stroke="#8FDCE0" strokeWidth="4" strokeLinecap="round" />
                <path d="M60 60 Q90 52 120 60 T180 60 T240 60" fill="none" stroke="#8FDCE0" strokeWidth="3.4" strokeLinecap="round" />
              </>
            )}
          </svg>
          {/* rubber duck floats while there is water */}
          {!towelOn && !done && (
            <div className="absolute bottom-2 left-[38%] w-[22%]" style={{ animation: "bob 1.8s ease-in-out infinite" }}>
              <button
                type="button"
                onClick={() => animalSfx.duck()}
                aria-label={lang === "fa" ? "اردک لاستیکی" : "rubber duck"}
                className="block w-full cursor-pointer transition-transform active:scale-90"
              >
                <DuckSvg happy={false} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* towel lying on the water */}
      {towelOn && (
        <div className="absolute bottom-[13%] left-[30%] w-[36%]" style={{ animation: "pop-in 0.45s ease both" }}>
          <TowelSvg wet flat />
        </div>
      )}

      {/* towel hanging on rail (draggable) */}
      {!towelOn && (
        <div className="absolute right-[7%] top-[24%] w-[15%]">
          <div
            ref={towelRef}
            {...towelDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "حوله" : "towel"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${towelDrag.x}px, ${towelDrag.y}px) rotate(3deg)`,
              transition: towelDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && !towelOn && !done}>
              <TowelSvg wet={false} flat={false} />
            </Pulse>
          </div>
        </div>
      )}

      {/* happy duck at the end */}
      {done && (
        <div className="absolute bottom-[16%] right-[10%] w-[16%]" style={{ animation: "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <DuckSvg happy />
        </div>
      )}

      {/* step checklist chip */}
      <div className="absolute bottom-[2%] left-[3%] flex flex-col gap-1" aria-hidden>
        <div className={`flex items-center gap-1 rounded-full border-2 border-[#3B2E5A] px-2 py-0.5 text-[11px] font-black ${tapClosed ? "bg-[#4CAF50] text-[#FAFAFA]" : "bg-[#FAFAFA] text-[#3B2E5A]"}`}>
          <span>{tapClosed ? "✔" : "۱"}</span>
          <span>{lang === "fa" ? "بستن شیر" : "close tap"}</span>
        </div>
        <div className={`flex items-center gap-1 rounded-full border-2 border-[#3B2E5A] px-2 py-0.5 text-[11px] font-black ${towelOn ? "bg-[#4CAF50] text-[#FAFAFA]" : "bg-[#FAFAFA] text-[#3B2E5A]"}`}>
          <span>{towelOn ? "✔" : "۲"}</span>
          <span>{lang === "fa" ? "حوله روی آب" : "towel on water"}</span>
        </div>
      </div>
    </Scene>
  );
}
