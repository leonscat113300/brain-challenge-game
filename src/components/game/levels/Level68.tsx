"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 68 — The food is cold! 3 steps: open the microwave door,      */
/* drag the plate inside, press START.                                 */
/* ------------------------------------------------------------------ */

function PlateFoodSvg({ cold, size = 1 }: { cold: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 130 80" className="h-auto w-full" style={{ transform: `scale(${size})` }} aria-hidden>
      {/* plate */}
      <ellipse cx="65" cy="58" rx="56" ry="16" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* drumstick */}
      <path d="M40 34 Q56 14 82 24 Q102 32 92 50 Q84 62 62 58 Q44 54 40 34 Z" fill="#FF9B77" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M88 46 L104 58" stroke="#FAFAFA" strokeWidth="7" strokeLinecap="round" />
      <path d="M88 46 L104 58" stroke="#3B2E5A" strokeWidth="8.5" strokeLinecap="round" opacity="0.25" />
      <circle cx="106" cy="60" r="5" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
      {/* peas */}
      <circle cx="40" cy="52" r="5" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="2.5" />
      <circle cx="52" cy="58" r="5" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="2.5" />
      {cold && (
        <g style={{ animation: "bob 1.4s ease-in-out infinite" }}>
          <path d="M96 16 L96 36 M90 20 L102 32 M102 20 L90 32" stroke="#1EC8CF" strokeWidth="3.2" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

export default function Level68({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [doorOpen, setDoorOpen] = useState(false);
  const [foodIn, setFoodIn] = useState(false);
  const [heating, setHeating] = useState(false);
  const [done, setDone] = useState(false);
  const cavityRef = useRef<HTMLDivElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const toggleDoor = useCallback(() => {
    if (solved || done || heating) return;
    if (doorOpen) return;
    setDoorOpen(true);
    sfx.whoosh();
    onProgress(0.33);
  }, [solved, done, heating, doorOpen, onProgress]);

  const plateDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => {
        if (foodIn || done || heating) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (!doorOpen) {
          api.reset();
          sfx.fail();
          onMistake({
            fa: "اول درِ مایکروویو را باز کن!",
            en: "First open the microwave door!",
          });
          return;
        }
        if (overElement(plateRef, cavityRef, 14)) {
          const b = cavityRef.current!.getBoundingClientRect();
          const a = plateRef.current!.getBoundingClientRect();
          api.setPos(d.x + (b.left + b.width / 2 - (a.left + a.width / 2)), d.y + (b.top + b.height / 2 - (a.top + a.height / 2)));
          setFoodIn(true);
          sfx.pop();
          onProgress(0.66);
          return;
        }
        api.reset();
      },
      [foodIn, done, heating, doorOpen, onMistake, onProgress]
    )
  );

  const pressStart = useCallback(() => {
    if (solved || done || heating) return;
    if (!doorOpen) {
      sfx.fail();
      onMistake({
        fa: "اول درِ مایکروویو را باز کن!",
        en: "First open the microwave door!",
      });
      return;
    }
    if (!foodIn) {
      sfx.fail();
      onMistake({
        fa: "اول غذا را داخل مایکروویو بگذار!",
        en: "First put the food inside the microwave!",
      });
      return;
    }
    setHeating(true);
    setDoorOpen(false);
    sfx.click();
    [400, 900, 1400].forEach((ms, i) => {
      timers.current.push(setTimeout(() => sfx.tick(), ms));
      void i;
    });
    timers.current.push(
      setTimeout(() => {
        sfx.chime();
        setDone(true);
        onProgress(1);
        timers.current.push(setTimeout(() => sfx.sparkle(), 250));
        timers.current.push(setTimeout(onSolved, 1400));
      }, 1900)
    );
  }, [solved, done, heating, doorOpen, foodIn, onMistake, onProgress, onSolved]);

  return (
    <Scene bg="linear-gradient(180deg,#FDF3E3 0%,#F7E6C8 55%,#EFD6AF 100%)">
      {/* wall tiles */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(59,46,90,0.12) 0 3px, transparent 3px 44px), repeating-linear-gradient(90deg, rgba(59,46,90,0.12) 0 3px, transparent 3px 44px)" }} aria-hidden />

      {/* microwave */}
      <div className="absolute bottom-[10%] end-[4%] w-[52%]">
        <div className="relative">
          {/* body */}
          <div className="relative rounded-2xl border-[5px] border-[#3B2E5A] bg-[#33205E] p-2 shadow-[0_5px_0_rgba(59,46,90,0.3)]">
            <div className="flex gap-2">
              {/* cavity + door area */}
              <div className="relative w-[68%]">
                {/* cavity (visible when door open) */}
                <div ref={cavityRef} className="relative h-20 overflow-hidden rounded-lg border-4 border-[#3B2E5A]" style={{ background: heating ? "#FFF3D6" : "#171034" }}>
                  {/* tray */}
                  <div className="absolute bottom-1 left-1/2 h-2 w-[80%] -translate-x-1/2 rounded-full bg-[#C9C4D8]" aria-hidden />
                  {foodIn && (
                    <div className="absolute left-1/2 top-1/2 w-[92%] -translate-x-1/2 -translate-y-1/2" style={{ animation: heating && !done ? "wobble 0.7s ease-in-out infinite" : done ? "pop-in 0.3s ease both" : undefined }}>
                      <PlateFoodSvg cold={false} />
                    </div>
                  )}
                  {done && (
                    <div className="pointer-events-none absolute -top-8 left-1/2 h-10 w-14 -translate-x-1/2" aria-hidden>
                      {[0, 1, 2].map((i) => (
                        <svg key={i} viewBox="0 0 20 44" className="absolute bottom-0" style={{ left: i * 14, animation: `float-up 1.6s ${i * 0.25}s ease-out infinite` }}>
                          <path d="M10 40 Q4 30 10 20 Q16 10 10 2" stroke="#8FA6BD" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
                        </svg>
                      ))}
                    </div>
                  )}
                </div>

                {/* door (flat panel, swings on left hinge) */}
                <div
                  className="absolute inset-0 rounded-lg border-4 border-[#3B2E5A] bg-[#1EC8CF]"
                  style={{
                    transform: doorOpen ? "perspective(500px) rotateY(-72deg)" : "perspective(500px) rotateY(0deg)",
                    transformOrigin: "left center",
                    transition: "transform 0.6s cubic-bezier(0.5,0,0.3,1)",
                    opacity: doorOpen ? 0.25 : 1,
                    zIndex: 5,
                    pointerEvents: "none",
                  }}
                  aria-hidden
                >
                  <div className="absolute inset-1.5 rounded-md border-[3px] border-[#22717a] bg-[#BFE7F5] opacity-60" aria-hidden />
                </div>
              </div>

              {/* control column */}
              <div className="flex w-[32%] flex-col items-center gap-1.5 py-1">
                <div className="h-4 w-full rounded-full border-[3px] border-[#3B2E5A] bg-[#171034] text-center text-[8px] font-bold leading-[14px] text-[#FFD154]" aria-hidden>
                  {done ? "00:00" : heating ? "00:15" : "--:--"}
                </div>
                <Pulse active={hintPulse > 0 && foodIn && !done && !heating} className="w-full">
                  <button
                    type="button"
                    onClick={pressStart}
                    aria-label={lang === "fa" ? "دکمهٔ شروع" : "start button"}
                    className="w-full cursor-pointer rounded-lg border-[3px] border-[#3B2E5A] bg-[#FF6B81] py-1 text-[10px] font-black text-[#FAFAFA] transition-transform active:scale-90"
                  >
                    START
                  </button>
                </Pulse>
                <Pulse active={hintPulse > 0 && !doorOpen && !done && !heating} className="w-full">
                  <button
                    type="button"
                    onClick={toggleDoor}
                    aria-label={lang === "fa" ? "درِ مایکروویو" : "microwave door"}
                    className="w-full cursor-pointer rounded-lg border-[3px] border-[#3B2E5A] bg-[#FFD154] py-1 text-[10px] font-black text-[#33205E] transition-transform active:scale-90"
                  >
                    {doorOpen ? "OPEN" : "DOOR"}
                  </button>
                </Pulse>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* table + plate (draggable) */}
      <div className="absolute bottom-[6%] start-[3%] w-[36%]">
        <div className="h-3 rounded-xl border-[4px] border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
        <div className="mx-auto h-[46px] w-[26%] rounded-b-lg border-x-4 border-b-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />
      </div>
      {!foodIn && (
        <div className="absolute bottom-[16%] start-[5%] w-[30%]">
          <div
            ref={plateRef}
            {...(done || heating ? {} : plateDrag.bind)}
            role="button"
            aria-label={lang === "fa" ? "بشقاب غذا" : "plate of food"}
            className={done || heating ? "" : "cursor-grab active:cursor-grabbing"}
            style={{
              transform: `translate(${plateDrag.x}px, ${plateDrag.y}px)`,
              transition: plateDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && doorOpen && !foodIn && !done}>
              <PlateFoodSvg cold={!heating && !done} />
            </Pulse>
          </div>
        </div>
      )}
    </Scene>
  );
}
