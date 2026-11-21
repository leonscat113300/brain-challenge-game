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
      {/* ears — long, upright, soft pink inside */}
      <ellipse cx="70" cy="34" rx="14" ry="36" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" transform="rotate(-9 70 34)" />
      <ellipse cx="70" cy="38" rx="6" ry="23" fill="#FF9FB2" transform="rotate(-9 70 38)" />
      <ellipse cx="114" cy="30" rx="14" ry="38" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" transform="rotate(9 114 30)" />
      <ellipse cx="114" cy="34" rx="6" ry="25" fill="#FF9FB2" transform="rotate(9 114 34)" />
      {/* fluffy tail peeking behind */}
      <circle cx="158" cy="180" r="13" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
      {/* body */}
      <ellipse cx="95" cy="152" rx="55" ry="46" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" />
      {/* haunches */}
      <circle cx="52" cy="168" r="24" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="138" cy="168" r="24" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* belly */}
      <ellipse cx="95" cy="166" rx="32" ry="26" fill="#F3EEF9" />
      {/* head */}
      <circle cx="95" cy="86" r="42" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" />
      {/* whiskers */}
      <path d="M50 96 L30 92 M50 102 L31 104 M140 96 L160 92 M140 102 L159 104" stroke="#3B2E5A" strokeWidth="2.4" strokeLinecap="round" />
      {fed ? (
        <>
          {/* happy closed eyes */}
          <path d="M64 78 Q72 70 80 78" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M110 78 Q118 70 126 78" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {/* nose + big smile */}
          <path d="M90 92 L100 92 L95 99 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M78 106 Q95 120 112 106" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* carrot held between the paws */}
          <g transform="translate(88 112) rotate(-12)">
            <path d="M0 0 L14 42 Q16 50 7 52 Q-2 50 0 42 Z" fill="#FF8A3C" stroke="#3B2E5A" strokeWidth="3.4" strokeLinejoin="round" />
            <path d="M5 -2 L8 -12 M12 0 L18 -9" stroke="#4CAF50" strokeWidth="5" strokeLinecap="round" />
          </g>
          {/* paws holding it */}
          <ellipse cx="76" cy="132" rx="12" ry="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
          <ellipse cx="114" cy="132" rx="12" ry="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
          {/* blush */}
          <ellipse cx="58" cy="94" rx="8" ry="5" fill="#FF9FB2" opacity="0.8" />
          <ellipse cx="132" cy="94" rx="8" ry="5" fill="#FF9FB2" opacity="0.8" />
        </>
      ) : (
        <>
          {/* big shiny hungry eyes */}
          <circle cx="74" cy="78" r="8" fill="#3B2E5A" />
          <circle cx="116" cy="78" r="8" fill="#3B2E5A" />
          <circle cx="76.5" cy="75.5" r="2.6" fill="#FAFAFA" />
          <circle cx="118.5" cy="75.5" r="2.6" fill="#FAFAFA" />
          {/* nose */}
          <path d="M90 92 L100 92 L95 99 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
          {/* wiggly hungry mouth */}
          <path d="M84 106 Q89 102 95 106 Q101 110 106 106" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          {/* blush */}
          <ellipse cx="60" cy="94" rx="8" ry="5" fill="#FF9FB2" opacity="0.8" />
          <ellipse cx="130" cy="94" rx="8" ry="5" fill="#FF9FB2" opacity="0.8" />
          {/* dreaming of a carrot */}
          <g opacity="0.9">
            <circle cx="146" cy="40" r="4" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2" />
            <circle cx="158" cy="26" r="7" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2" />
            <path d="M154 20 L164 36 L148 36 Z" fill="#FF8A3C" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
          </g>
        </>
      )}
      {/* front feet */}
      <ellipse cx="72" cy="196" rx="14" ry="8" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="118" cy="196" rx="14" ry="8" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  );
}

function CarrotSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 150" className={className} style={style} aria-hidden>
      {/* fresh leafy top */}
      <path d="M45 28 Q38 4 24 6 Q30 22 42 30" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M45 28 Q52 2 66 6 Q60 22 48 30" fill="#5DBB63" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M45 26 L45 3" stroke="#4CAF50" strokeWidth="6" strokeLinecap="round" />
      {/* chunky tapered body */}
      <path d="M45 26 Q62 28 64 48 Q66 82 52 122 Q48 132 45 132 Q42 132 38 122 Q24 82 26 48 Q28 28 45 26 Z" fill="#FF8A3C" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      {/* ridges */}
      <path d="M32 56 Q45 61 58 56" stroke="#E86A1C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M30 80 Q45 86 60 80" stroke="#E86A1C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M34 102 Q45 107 56 102" stroke="#E86A1C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* shine */}
      <path d="M37 40 Q34 56 36 72" stroke="#FAFAFA" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.6" />
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
