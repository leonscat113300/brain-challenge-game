"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import { animalSfx } from "@/lib/game/audio";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 98 — The cat wants out: drag the plant pot away from the      */
/* window, then tap the latch to open the window. The cat jumps out.   */
/* ------------------------------------------------------------------ */

function CatSvg({ jumping }: { jumping: boolean }) {
  return (
    <svg viewBox="0 0 130 120" className="h-auto w-full" aria-hidden>
      <path d="M96 92 Q118 88 116 66 Q114 52 102 54" fill="none" stroke="#3B2E5A" strokeWidth="8" strokeLinecap="round" />
      <path d="M96 92 Q118 88 116 66 Q114 52 102 54" fill="none" stroke="#8FA6BD" strokeWidth="4.4" strokeLinecap="round" />
      <ellipse cx="72" cy="90" rx="34" ry="24" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M58 74 Q60 84 58 92 M74 70 Q76 82 74 92 M90 76 Q92 86 90 92" stroke="#6E8CA6" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="44" cy="52" r="24" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M28 34 L24 14 L44 26 Z" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M60 34 L64 14 L44 26 Z" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M30 30 L28 20 L38 27 Z" fill="#FF6B81" />
      <path d="M58 30 L60 20 L50 27 Z" fill="#FF6B81" />
      {jumping ? (
        <>
          <path d="M31 50 Q36 45 41 50 M49 50 Q54 45 59 50" fill="none" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M39 59 Q44 65 49 59" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="36" cy="50" r="4.6" fill="#3B2E5A" />
          <circle cx="54" cy="50" r="4.6" fill="#3B2E5A" />
          <circle cx="37.4" cy="48.6" r="1.5" fill="#FAFAFA" />
          <circle cx="55.4" cy="48.6" r="1.5" fill="#FAFAFA" />
          <circle cx="45" cy="64" r="3.2" fill="#3B2E5A" />
        </>
      )}
      <path d="M22 56 L10 52 M22 62 L10 64 M68 56 L80 52 M68 62 L80 64" stroke="#3B2E5A" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function PotSvg() {
  return (
    <svg viewBox="0 0 110 150" className="h-auto w-full" aria-hidden>
      {/* flower */}
      <path d="M55 62 Q52 40 40 30" fill="none" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round" />
      <path d="M55 70 Q62 48 74 42" fill="none" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round" />
      <circle cx="38" cy="26" r="13" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="76" cy="38" r="11" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="38" cy="26" r="5" fill="#FFD154" />
      <circle cx="76" cy="38" r="4.4" fill="#FF6B81" />
      {/* pot */}
      <path d="M22 72 L88 72 L78 132 Q55 140 32 132 Z" fill="#FF8C42" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <rect x="16" y="64" width="78" height="16" rx="7" fill="#FFA35C" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  );
}

export default function Level98({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [potMoved, setPotMoved] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [catOut, setCatOut] = useState(false);
  const potRef = useRef<HTMLDivElement>(null);
  const sideRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const potDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || potMoved) return;
        if (!d.everMoved) {
          sfx.click();
          api.reset();
          return;
        }
        if (overElement(potRef, sideRef, 18)) {
          api.reset();
          setPotMoved(true);
          sfx.pop();
          onProgress(0.4);
          return;
        }
        api.reset();
        sfx.fail();
        onMistake({
          fa: "گلدان را کنارِ پنجره زمین بگذار تا جلوی راه نباشد!",
          en: "Set the pot down beside the window so it's out of the way!",
        });
      },
      [solved, potMoved, onMistake, onProgress]
    )
  );

  const tapWindow = useCallback(() => {
    if (solved || windowOpen) return;
    if (!potMoved) {
      sfx.boing();
      onMistake({
        fa: "گلدان جلوی پنجره است! اول آن را جابه‌جا کن.",
        en: "The pot is blocking the window! Move it first.",
      });
      return;
    }
    setWindowOpen(true);
    sfx.unlock();
    onProgress(0.8);
    timers.current.push(setTimeout(() => sfx.whoosh(), 350));
    timers.current.push(
      setTimeout(() => {
        setCatOut(true);
        animalSfx.cat();
        timers.current.push(setTimeout(() => sfx.cheer(), 900));
        timers.current.push(setTimeout(onSolved, 2000));
      }, 900)
    );
  }, [solved, windowOpen, potMoved, onMistake, onProgress, onSolved]);

  const tapCat = useCallback(() => {
    if (solved || catOut) {
      return;
    }
    animalSfx.cat();
    onMistake({
      fa: "میوو! گربه می‌خواهد بیرون برود؛ راهش را باز کن.",
      en: "Meow! The cat wants to go out; open its way.",
    });
  }, [solved, catOut, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#DCEFFF 0%,#CFE6F7 58%,#EFE3CB 60%,#E3D3AE 100%)">
      {/* sunny outside hint through window */}
      <div className="absolute left-1/2 top-[8%] w-[52%] -translate-x-1/2">
        <Pulse active={hintPulse > 0 && !windowOpen}>
          {/* window frame */}
          <div className="relative rounded-2xl border-[6px] border-[#3B2E5A] bg-[#FAFAFA] p-2 shadow-[0_10px_0_rgba(59,46,90,0.25)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border-[3px] border-[#3B2E5A]">
              {/* outside view */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#BDE8FF 0%,#DFF4FF 55%,#A8DF9C 56%,#7EC973 100%)" }}>
                {/* sun */}
                <div className="absolute right-[12%] top-[10%] w-[26%]" aria-hidden>
                  <svg viewBox="0 0 60 60" style={{ animation: "spin 9s linear infinite" }}>
                    <circle cx="30" cy="30" r="14" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.4" />
                    <path d="M30 4 V12 M30 48 V56 M4 30 H12 M48 30 H56 M11 11 L17 17 M43 43 L49 49 M49 11 L43 17 M17 43 L11 49" stroke="#FFD154" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>
                {/* clouds */}
                <div className="absolute left-[10%] top-[18%] w-[30%]" aria-hidden>
                  <svg viewBox="0 0 90 40">
                    <ellipse cx="45" cy="24" rx="34" ry="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
                  </svg>
                </div>
                {/* butterflies outside */}
                {!catOut &&
                  [0, 1].map((i) => (
                    <div key={i} className="absolute w-[9%]" style={{ left: `${34 + i * 26}%`, top: `${52 + i * 12}%`, animation: `bob ${1.6 + i * 0.4}s ease-in-out infinite` }} aria-hidden>
                      <svg viewBox="0 0 30 26">
                        <path d="M15 13 Q6 2 2 10 Q0 16 12 16 Q6 20 10 24 Q14 26 15 15 Q16 26 20 24 Q24 20 18 16 Q30 16 28 10 Q24 2 15 13 Z" fill={i ? "#FF6B81" : "#6C4AB6"} stroke="#3B2E5A" strokeWidth="2" />
                      </svg>
                    </div>
                  ))}
                {/* cat jumping outside */}
                {catOut && (
                  <div className="absolute bottom-[6%] left-[16%] w-[36%]" style={{ animation: "bob 0.9s ease-in-out infinite" }} aria-hidden>
                    <CatSvg jumping />
                  </div>
                )}
              </div>
              {/* window glass pane (closes the view until open) */}
              <div
                className="absolute inset-0 origin-left border-r-4 border-[#3B2E5A] bg-[#BFE9F2]/70 transition-transform duration-700"
                style={{ transform: windowOpen ? "perspective(500px) rotateY(-105deg)" : "perspective(500px) rotateY(0deg)" }}
                aria-hidden
              >
                <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-[#3B2E5A]" />
              </div>
              {/* latch */}
              <button
                type="button"
                onClick={tapWindow}
                aria-label={lang === "fa" ? "دستهٔ پنجره" : "window latch"}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 cursor-pointer"
              >
                <svg viewBox="0 0 34 34" className="w-8">
                  <circle cx="17" cy="17" r="13" fill={windowOpen ? "#4CAF50" : "#FFD154"} stroke="#3B2E5A" strokeWidth="3.4" />
                  <path d="M17 17 L27 9" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" style={{ transform: windowOpen ? "rotate(80deg)" : "rotate(0deg)", transformOrigin: "17px 17px", transition: "transform 0.5s ease" }} />
                </svg>
              </button>
            </div>
          </div>
        </Pulse>
        {/* sill */}
        <div className="mx-auto mt-1 h-4 w-[112%] -translate-x-[5%] rounded-xl border-4 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
      </div>

      {/* pot blocking the window */}
      {!potMoved && (
        <div className="absolute bottom-[16%] left-1/2 z-10 w-[22%] -translate-x-[10%]">
          <div
            ref={potRef}
            {...potDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "گلدان" : "plant pot"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${potDrag.x}px, ${potDrag.y}px)`,
              transition: potDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && !potMoved}>
              <PotSvg />
            </Pulse>
          </div>
        </div>
      )}
      {/* pot resting spot after moving */}
      {potMoved && (
        <div className="absolute bottom-[8%] left-[4%] w-[20%]" style={{ animation: "pop-in 0.4s ease-out both" }}>
          <PotSvg />
        </div>
      )}
      {/* drop target zone */}
      <div ref={sideRef} className="absolute bottom-[4%] left-[2%] h-[22%] w-[24%] rounded-2xl border-[3px] border-dashed border-[#c9b47e] bg-[#FFF6E0]/40" aria-hidden />

      {/* cat waiting */}
      {!catOut && (
        <div className="absolute bottom-[10%] right-[8%] w-[27%]">
          <button type="button" onClick={tapCat} aria-label={lang === "fa" ? "گربه" : "cat"} className="block w-full cursor-pointer">
            <div style={{ animation: "breathe 1.8s ease-in-out infinite" }}>
              <CatSvg jumping={false} />
            </div>
          </button>
        </div>
      )}

      {/* meow bubble */}
      {!windowOpen && !catOut && (
        <div className="pointer-events-none absolute bottom-[62%] right-[16%] w-[16%]" aria-hidden>
          <svg viewBox="0 0 90 60" style={{ animation: "float-up 2s ease-out infinite" }}>
            <rect x="4" y="6" width="82" height="38" rx="16" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
            <path d="M30 44 L26 56 L42 44" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
            <text x="45" y="32" textAnchor="middle" fontSize="20" fontWeight="800" fill="#3B2E5A">
              میو!
            </text>
          </svg>
        </div>
      )}
    </Scene>
  );
}
