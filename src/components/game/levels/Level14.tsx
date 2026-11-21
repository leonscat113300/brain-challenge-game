"use client";

import React, { useCallback, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 14 — Hungry Rabbit: shove the crate and the rock out of the   */
/* corridor, then drag the carrot to the rabbit.                       */
/* ------------------------------------------------------------------ */

const BLOCKED_MSG = { fa: "راه بسته است! مانع‌ها را کنار بزن", en: "The path is blocked! Move the obstacles first" };

function RabbitSvg({ fed, className, style }: { fed: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 190 210" className={className} style={style} aria-hidden>
      <ellipse cx="66" cy="38" rx="13" ry="34" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" transform="rotate(-8 66 38)" />
      <ellipse cx="114" cy="38" rx="13" ry="34" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" transform="rotate(8 114 38)" />
      <ellipse cx="66" cy="42" rx="6" ry="22" fill="#FF9FB2" transform="rotate(-8 66 42)" />
      <ellipse cx="114" cy="42" rx="6" ry="22" fill="#FF9FB2" transform="rotate(8 114 42)" />
      <ellipse cx="95" cy="152" rx="52" ry="44" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="95" cy="162" rx="32" ry="26" fill="#F3EEF9" />
      <circle cx="95" cy="86" r="42" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="66" cy="100" rx="8" ry="5" fill="#FF9FB2" opacity="0.8" />
      <ellipse cx="124" cy="100" rx="8" ry="5" fill="#FF9FB2" opacity="0.8" />
      <path d="M90 92 L100 92 L95 99 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
      {fed ? (
        <>
          <path d="M70 78 Q77 70 84 78" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M106 78 Q113 70 120 78" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M84 104 Q95 114 106 104" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M88 132 L102 132 L95 158 Z" fill="#FF8A3C" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
          <path d="M90 130 L95 122 L100 130" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
        </>
      ) : (
        <>
          <path d="M68 68 Q76 62 84 68" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M106 68 Q114 62 122 68" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="78" cy="80" r="6" fill="#3B2E5A" />
          <circle cx="112" cy="80" r="6" fill="#3B2E5A" />
          <circle cx="80" cy="78" r="2" fill="#FAFAFA" />
          <circle cx="114" cy="78" r="2" fill="#FAFAFA" />
          <path d="M84 104 Q89 100 94 104 Q99 108 104 104" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M104 108 Q107 116 103 120" stroke="#9EDBF5" strokeWidth="4" fill="none" strokeLinecap="round" />
          <g opacity="0.9">
            <circle cx="138" cy="44" r="4" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2" />
            <circle cx="152" cy="30" r="7" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2" />
            <path d="M148 24 L158 40 L142 40 Z" fill="#FF8A3C" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
          </g>
        </>
      )}
      <ellipse cx="70" cy="196" rx="15" ry="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="120" cy="196" rx="15" ry="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="152" cy="168" r="12" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  );
}

function CarrotSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 150" className={className} style={style} aria-hidden>
      <ellipse cx="34" cy="14" rx="8" ry="16" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" transform="rotate(-24 34 14)" />
      <ellipse cx="56" cy="14" rx="8" ry="16" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" transform="rotate(24 56 14)" />
      <ellipse cx="45" cy="10" rx="7" ry="15" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M45 30 L68 112 Q70 126 45 132 Q20 126 22 112 Z" fill="#FF8A3C" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M34 56 Q45 62 56 56" stroke="#E86A1C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M32 78 Q45 84 58 78" stroke="#E86A1C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M36 100 Q45 105 54 100" stroke="#E86A1C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M38 42 Q34 60 36 76" stroke="#FAFAFA" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export default function Level14({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [crateMoved, setCrateMoved] = useState(false);
  const [rockMoved, setRockMoved] = useState(false);
  const [fed, setFed] = useState(false);
  const [done, setDone] = useState(false);
  const carrotRef = useRef<HTMLDivElement>(null);
  const rabbitRef = useRef<HTMLButtonElement>(null);

  /* stage 1+2: shove the obstacles aside (stays put when dragged far) */
  const crateDrag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || crateMoved) return;
        if (Math.hypot(d.x, d.y) >= 60) {
          setCrateMoved(true);
          sfx.whoosh();
          onProgress(0.35);
        } else {
          api.reset();
        }
      },
      [solved, done, crateMoved, onProgress]
    )
  );

  const rockDrag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || rockMoved) return;
        if (Math.hypot(d.x, d.y) >= 60) {
          setRockMoved(true);
          sfx.whoosh();
          onProgress(0.7);
        } else {
          api.reset();
        }
      },
      [solved, done, rockMoved, onProgress]
    )
  );

  /* stage 3: drag the carrot to the rabbit (only when path is clear) */
  const carrotDrag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || fed) return;
        const dist = Math.hypot(d.x, d.y);
        const open = crateMoved && rockMoved;
        if (open && overElement(carrotRef, rabbitRef, 30)) {
          setFed(true);
          setDone(true);
          api.reset();
          sfx.pop();
          window.setTimeout(() => sfx.cheer(), 300);
          onProgress(1);
          window.setTimeout(onSolved, 900);
          return;
        }
        if (!open && dist > 40) {
          api.reset();
          onMistake(BLOCKED_MSG);
          return;
        }
        api.reset();
      },
      [solved, done, fed, crateMoved, rockMoved, onSolved, onProgress, onMistake]
    )
  );

  const tapRabbit = () => {
    if (solved || done || fed) return;
    sfx.boing();
  };

  return (
    <Scene bg="linear-gradient(180deg,#BEE9F5 0%,#D8F1EA 55%,#D6EFC9 100%)">
      <svg viewBox="0 0 120 60" className="absolute start-[6%] top-[5%] w-[16%] opacity-90" aria-hidden>
        <path d="M20 48 Q4 48 8 34 Q10 22 24 24 Q28 8 46 10 Q62 10 64 24 Q80 20 84 32 Q90 46 72 48 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      </svg>

      <div className="absolute start-[3%] top-[26%] w-[24%]" aria-hidden>
        <div className="relative h-16">
          <div className="absolute inset-x-0 top-[30%] h-2 rounded border-2 border-[#3B2E5A] bg-[#C89B6B]" />
          <div className="absolute inset-x-0 top-[62%] h-2 rounded border-2 border-[#3B2E5A] bg-[#C89B6B]" />
          <div className="absolute inset-x-[8%] top-0 flex h-full justify-between">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-full w-3 rounded-t-full border-2 border-[#3B2E5A] bg-[#E8C48F]" />
            ))}
          </div>
        </div>
      </div>

      <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-[24%] w-full" aria-hidden>
        <path d="M0 34 Q100 6 200 30 T400 22 L400 100 L0 100 Z" fill="#7ED491" />
        <path d="M0 62 Q120 34 240 58 T400 50 L400 100 L0 100 Z" fill="#4CAF50" />
      </svg>
      <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M330 30 Q300 110 200 150 Q100 190 70 286" stroke="#E9D8B8" strokeWidth="44" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity="0.9" />
      </svg>
      <div className="absolute bottom-[6%] start-[46%] h-2 w-2 rounded-full bg-[#FF6B81]" aria-hidden />
      <div className="absolute bottom-[10%] start-[70%] h-2 w-2 rounded-full bg-[#FFD154]" aria-hidden />
      <div className="absolute bottom-[4%] start-[86%] h-2 w-2 rounded-full bg-[#1EC8CF]" aria-hidden />

      <button
        ref={rabbitRef}
        type="button"
        onClick={tapRabbit}
        aria-label={lang === "fa" ? "خرگوش گرسنه" : "hungry rabbit"}
        className="absolute bottom-[4%] block start-[5%] z-[16] w-[36%] cursor-pointer"
        style={{ animation: fed ? "bob 0.55s ease-in-out 2" : "wobble 1.7s ease-in-out infinite" }}
      >
        <RabbitSvg fed={fed} className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.16)]" />
      </button>

      <div
        className="absolute z-[14]"
        style={{
          left: "36%", top: "42%", width: "19%",
          transform: `translate(${crateDrag.x}px, ${crateDrag.y}px)${crateDrag.dragging ? " scale(1.06) rotate(-2deg)" : ""}`,
          transition: crateDrag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.3,0.64,1)",
        }}
      >
        <Pulse active={hintPulse > 0 && !crateMoved && !done}>
          <div {...(crateMoved ? {} : crateDrag.bind)} className={crateMoved ? "" : "cursor-grab active:cursor-grabbing"}>
            <div className="relative aspect-square overflow-hidden rounded-lg border-4 border-[#3B2E5A] bg-[#C89B6B] shadow-[0_4px_0_rgba(59,46,90,0.2)]">
              <div className="absolute inset-x-0 top-[30%] h-1 bg-[#8B5E3C]" />
              <div className="absolute inset-x-0 top-[64%] h-1 bg-[#8B5E3C]" />
              <div className="absolute left-[-8%] top-[46%] h-1.5 w-[116%] rotate-[22deg] bg-[#8B5E3C]" />
              <div className="absolute left-[-8%] top-[46%] h-1.5 w-[116%] -rotate-[22deg] bg-[#8B5E3C]" />
            </div>
          </div>
        </Pulse>
      </div>

      <div
        className="absolute z-[14]"
        style={{
          left: "52%", top: "50%", width: "15%",
          transform: `translate(${rockDrag.x}px, ${rockDrag.y}px)${rockDrag.dragging ? " scale(1.06) rotate(2deg)" : ""}`,
          transition: rockDrag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.3,0.64,1)",
        }}
      >
        <Pulse active={hintPulse > 0 && !rockMoved && !done}>
          <div {...(rockMoved ? {} : rockDrag.bind)} className={rockMoved ? "" : "cursor-grab active:cursor-grabbing"}>
            <div className="relative aspect-[5/4] rounded-[50%] border-4 border-[#3B2E5A]" style={{ background: "radial-gradient(circle at 35% 30%, #B9BEC9 0%, #8D93A1 55%, #6E7480 100%)" }}>
              <div className="absolute left-[24%] top-[30%] h-[10%] w-[16%] rounded-full bg-[#6E7480]" />
              <div className="absolute left-[56%] top-[52%] h-[8%] w-[12%] rounded-full bg-[#6E7480]" />
              <div className="absolute left-[16%] top-[16%] h-[16%] w-[10%] rounded-full bg-white/50" />
            </div>
          </div>
        </Pulse>
      </div>

      <div className="absolute end-[8%] top-[4%] z-20 w-[18%]">
        <div className="absolute left-1/2 top-[86%] w-[72%] -translate-x-1/2" aria-hidden>
          <div className="h-2.5 rounded-md border-[3px] border-[#3B2E5A] bg-[#C89B6B]" />
          <div className="mx-auto h-9 w-2.5 border-x-[3px] border-[#3B2E5A] bg-[#8B5E3C]" />
        </div>
        <div
          ref={carrotRef}
          className={fed ? "invisible" : ""}
          style={{
            transform: `translate(${carrotDrag.x}px, ${carrotDrag.y}px)${carrotDrag.dragging ? " scale(1.12) rotate(7deg)" : ""}`,
            transition: carrotDrag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.3,0.64,1)",
          }}
        >
          <Pulse active={hintPulse > 0 && !done} className="w-full">
            <div {...carrotDrag.bind} className="cursor-grab active:cursor-grabbing">
              <CarrotSvg className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.22)]" />
            </div>
          </Pulse>
        </div>
      </div>
    </Scene>
  );
}
