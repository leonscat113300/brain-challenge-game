"use client";

import React, { useCallback, useState } from "react";
import type { DragState } from "./shared";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { LevelProps } from "@/lib/game/types";

/* ------------------------------------------------------------------ */
/* Level 29 — The train must move: drag the rock off the rail, then    */
/* press the big GO button to send the train chugging out.             */
/* ------------------------------------------------------------------ */

function Wheel({ cx, cy, r, moving, delay = 0 }: { cx: number; cy: number; r: number; moving: boolean; delay?: number }) {
  return (
    <g
      style={{
        transformBox: "fill-box",
        transformOrigin: "center",
        animation: moving ? `spin 0.7s linear ${delay}s infinite` : undefined,
      }}
    >
      <circle cx={cx} cy={cy} r={r} fill="#33205E" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx={cx} cy={cy} r={r * 0.45} fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
      <line x1={cx - r * 0.8} y1={cy} x2={cx + r * 0.8} y2={cy} stroke="#FAFAFA" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

function TrainSvg({ moving, className, style }: { moving: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 380 180" className={className} style={style} aria-hidden>
      {/* smoke puffs from the chimney */}
      {moving && (
        <>
          <circle cx="140" cy="26" r="10" fill="#9AA0B5" opacity="0.9" style={{ animation: "float-up 1.1s ease-out infinite" }} />
          <circle cx="146" cy="22" r="13" fill="#9AA0B5" opacity="0.9" style={{ animation: "float-up 1.1s ease-out 0.35s infinite" }} />
          <circle cx="136" cy="18" r="8" fill="#B9BECF" opacity="0.9" style={{ animation: "float-up 1.1s ease-out 0.7s infinite" }} />
        </>
      )}
      {/* locomotive */}
      <rect x="36" y="64" width="132" height="72" rx="14" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="42" y="30" width="54" height="44" rx="10" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="128" y="28" width="24" height="32" rx="5" fill="#33205E" stroke="#3B2E5A" strokeWidth="4" />
      {/* cute face on the loco front */}
      <circle cx="146" cy="92" r="5.5" fill="#3B2E5A" />
      <circle cx="148" cy="90" r="1.8" fill="#FAFAFA" />
      <circle cx="162" cy="92" r="5.5" fill="#3B2E5A" />
      <circle cx="164" cy="90" r="1.8" fill="#FAFAFA" />
      <path d="M148 106 q8 7 16 0" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <ellipse cx="138" cy="104" rx="4.5" ry="3.5" fill="#FF9FB2" />
      <path d="M168 136 L190 154 L168 154 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      {/* couplers + wagons */}
      <rect x="176" y="112" width="26" height="8" rx="3" fill="#3B2E5A" />
      <rect x="200" y="74" width="84" height="62" rx="10" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="214" y="86" width="56" height="22" rx="7" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
      <rect x="282" y="112" width="12" height="8" rx="3" fill="#3B2E5A" />
      <rect x="292" y="74" width="80" height="62" rx="10" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="316" cy="100" r="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
      <circle cx="344" cy="100" r="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
      {/* wheels */}
      <Wheel cx={72} cy={148} r={16} moving={moving} />
      <Wheel cx={116} cy={148} r={16} moving={moving} delay={0.12} />
      <Wheel cx={222} cy={150} r={13} moving={moving} delay={0.05} />
      <Wheel cx={260} cy={150} r={13} moving={moving} delay={0.18} />
      <Wheel cx={314} cy={150} r={13} moving={moving} delay={0.09} />
      <Wheel cx={350} cy={150} r={13} moving={moving} delay={0.22} />
    </svg>
  );
}

function RockSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 100" className={className} style={style} aria-hidden>
      <path d="M14 82 L22 44 L48 20 L88 26 L106 62 L96 82 Z" fill="#A9A3B8" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M40 40 L60 34 M72 52 L88 48" stroke="#7E7890" strokeWidth="4" strokeLinecap="round" />
      {/* sleepy rock face */}
      <path d="M42 62 q6 6 12 0 M68 62 q6 6 12 0" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M56 74 q8 6 16 0" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="38" cy="70" rx="5" ry="3.5" fill="#FF9FB2" />
      <ellipse cx="84" cy="70" rx="5" ry="3.5" fill="#FF9FB2" />
    </svg>
  );
}

export default function Level29({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [rockMoved, setRockMoved] = useState(false);
  const [go, setGo] = useState(false);
  const [bump, setBump] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [nudge, setNudge] = useState(0);
  const [done, setDone] = useState(false);
  const dir = lang === "fa" ? -1 : 1;

  const rockDrag = useDragMove(
    useCallback(
      (d: DragState, api) => {
        if (solved || done || rockMoved) return;
        const dist = Math.hypot(d.x, d.y);
        if (dist < 8) {
          sfx.pop();
          api.reset();
          return;
        }
        if (dist >= 55) {
          setRockMoved(true);
          sfx.whoosh();
          onProgress(0.5);
        }
        api.reset();
      },
      [solved, done, rockMoved, onProgress]
    )
  );

  const pressGo = () => {
    if (solved || done || go) return;
    setPressed(true);
    setTimeout(() => setPressed(false), 180);
    if (!rockMoved) {
      sfx.boing();
      setBump(true);
      setNudge((k) => k + 1);
      setTimeout(() => setBump(false), 420);
      onMistake({ fa: "ریل باز نیست!", en: "The track isn't clear!" });
      return;
    }
    sfx.boing();
    setTimeout(() => sfx.pop(), 320);
    setGo(true);
    onProgress(0.85);
    setTimeout(() => {
      setDone(true);
      sfx.cheer();
      onProgress(1);
      setTimeout(onSolved, 700);
    }, 2500);
  };

  return (
    <Scene bg="linear-gradient(180deg,#E7F6FA 0%,#FDF6E0 100%)">
      {/* decor cloud */}
      <div className="absolute top-[6%] start-[8%] w-[16%] z-[2] opacity-80" aria-hidden>
        <svg viewBox="0 0 260 170" className="w-full h-auto">
          <path d="M62 128 a36 36 0 0 1 4 -71 a46 46 0 0 1 86 -18 a40 40 0 0 1 58 34 a32 32 0 0 1 -10 55 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="6" strokeLinejoin="round" />
        </svg>
      </div>

      {/* ground + rails */}
      <div className="absolute inset-x-0 bottom-0 h-[15%] border-t-4 border-[#3B2E5A] bg-[#C4E3B4]" aria-hidden />
      <div
        className="absolute inset-x-0 bottom-[15%] h-[6%] border-y-4 border-[#3B2E5A] bg-[#B9BECF]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.3) 0 10px, transparent 10px 36px)" }}
        aria-hidden
      />

      {/* toy train: chugs out once the rail is clear */}
      <div
        className="absolute bottom-[19.5%] start-[1%] w-[58%] z-[12]"
        style={{
          transform: go ? `translateX(${dir * 140}vw)` : bump ? `translateX(${dir * -22}px)` : "translateX(0px)",
          transition: go ? "transform 2.5s ease-in" : bump ? "transform 0.15s ease-out" : "transform 0.35s ease",
        }}
      >
        <div style={{ transform: lang === "fa" ? "scaleX(-1)" : undefined }}>
          <TrainSvg moving={go} className="w-full h-auto drop-shadow-[0_3px_2px_rgba(59,46,90,0.2)]" />
        </div>
      </div>

      {/* heavy rock blocking the rail */}
      <div
        className="absolute bottom-[21%] start-[43%] w-[16%] z-[14]"
        style={{
          transform: `translate(${rockDrag.x}px, ${rockDrag.y}px)`,
          transition: rockDrag.dragging ? "none" : "transform 0.3s ease",
        }}
      >
        <div key={nudge} style={{ animation: nudge > 0 ? "wobble 0.4s ease-in-out" : undefined }}>
          <div
            style={{
              transform: rockMoved ? "translate(25%,150%) rotate(26deg)" : undefined,
              transition: "transform 0.55s cubic-bezier(0.34,1.3,0.64,1)",
            }}
          >
            <Pulse active={hintPulse > 0 && !rockMoved && !done}>
              <div
                {...(rockMoved || solved || done ? {} : rockDrag.bind)}
                className={`cursor-grab active:cursor-grabbing ${rockMoved ? "pointer-events-none" : ""}`}
              >
                <RockSvg className="w-full h-auto drop-shadow-[0_3px_2px_rgba(59,46,90,0.25)]" />
              </div>
            </Pulse>
          </div>
        </div>
      </div>

      {/* GO button on its pedestal */}
      <div className="absolute bottom-[13%] end-[2%] w-[22%] z-[15] flex flex-col items-center">
        <button
          type="button"
          onClick={pressGo}
          aria-label={lang === "fa" ? "دکمه حرکت قطار" : "go button"}
          className="grid aspect-square w-[74%] place-items-center rounded-full border-[5px] border-[#3B2E5A] bg-[#4CAF50]"
          style={{
            transform: pressed ? "translateY(4px)" : "translateY(0)",
            boxShadow: pressed ? "0 2px 0 rgba(59,46,90,0.35)" : "0 6px 0 rgba(59,46,90,0.35)",
            minWidth: 44,
            minHeight: 44,
          }}
        >
          <span className="font-extrabold tracking-wide text-[#FAFAFA] text-lg sm:text-2xl">GO</span>
        </button>
        <div className="-mt-1 h-6 w-[36%] rounded-b-lg border-4 border-[#3B2E5A] bg-[#B9BECF]" aria-hidden />
      </div>
    </Scene>
  );
}
