"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 46 — The sun hides behind the mountain: drag the mountain     */
/* ALL the way down to reveal the sun.                                 */
/* ------------------------------------------------------------------ */

function SunSvg({ revealed, className, style }: { revealed: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden>
      <g
        style={{
          animation: revealed ? "spin 14s linear infinite" : undefined,
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      >
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * Math.PI) / 6;
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * 62}
              y1={100 + Math.sin(a) * 62}
              x2={100 + Math.cos(a) * 92}
              y2={100 + Math.sin(a) * 92}
              stroke="#E8A81C"
              strokeWidth="9"
              strokeLinecap="round"
            />
          );
        })}
      </g>
      <circle cx="100" cy="100" r="58" fill="#FFD154" stroke="#E8A81C" strokeWidth="5" />
      {/* sleepy face until revealed, then beaming */}
      {revealed ? (
        <>
          <path d="M74 88 Q82 78 90 88" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M110 88 Q118 78 126 88" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="82" cy="90" r="7" fill="#3B2E5A" />
          <circle cx="118" cy="90" r="7" fill="#3B2E5A" />
          <circle cx="84.5" cy="87.5" r="2.4" fill="#FAFAFA" />
          <circle cx="120.5" cy="87.5" r="2.4" fill="#FAFAFA" />
        </>
      )}
      <ellipse cx="70" cy="108" rx="9" ry="5" fill="#FF9FB2" opacity="0.8" />
      <ellipse cx="130" cy="108" rx="9" ry="5" fill="#FF9FB2" opacity="0.8" />
      <path d="M82 116 Q100 132 118 116" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function MountainSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 420 300" className={className} style={style} aria-hidden>
      {/* far peak */}
      <path d="M60 300 L180 90 L300 300 Z" fill="#8E76C9" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M158 122 L180 90 L204 126 L192 118 L180 130 L170 118 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      {/* main peak (covers the sun) */}
      <path d="M130 300 L250 60 L380 300 Z" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M222 104 L250 60 L282 108 L266 96 L252 112 L238 96 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M210 200 Q240 170 268 198" stroke="#563B96" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="228" cy="238" r="7" fill="#8E76C9" />
      <circle cx="272" cy="250" r="9" fill="#8E76C9" />
    </svg>
  );
}

function BirdSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 48 24" className={className} style={style} aria-hidden>
      <path d="M2 16 Q13 2 24 14 Q35 2 46 16" stroke="#33205E" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Level46({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [boingKey, setBoingKey] = useState(0);
  const resetRef = useRef<() => void>(() => {});

  const mountainDrag = useDragMove(
    useCallback(
      (d: DragState) => {
        if (solved || done || revealed) return;
        if (d.everMoved) onProgress(0.5);
        if (d.y >= 60) {
          setRevealed(true);
          setDone(true);
          resetRef.current();
          sfx.sparkle();
          window.setTimeout(() => sfx.cheer(), 400);
          onProgress(1);
          window.setTimeout(onSolved, 1100);
        } else if (d.everMoved) {
          resetRef.current();
          onMistake({ fa: "کوه رو تا پایین بکش!", en: "Drag the mountain all the way down!" });
        }
      },
      [solved, done, revealed, onProgress, onSolved, onMistake]
    )
  );
  useEffect(() => {
    resetRef.current = mountainDrag.reset;
  }, [mountainDrag]);

  const tapSun = () => {
    if (solved || done) {
      sfx.pop();
      return;
    }
    sfx.boing();
    setBoingKey((k) => k + 1);
    onMistake({ fa: "خورشید رو نکش! کوه رو بکش", en: "Don't drag the sun! Drag the mountain" });
  };

  const clampY = Math.max(0, mountainDrag.y);
  const y = revealed ? "55%" : `${clampY}px`;

  return (
    <Scene bg="linear-gradient(180deg,#FFD154 0%,#FFB35C 34%,#FF6B81 64%,#9B6BC9 100%)">
      {/* sunset clouds */}
      <div className="absolute top-[10%] start-[8%] w-[20%] h-[7%] rounded-full bg-[#FAFAFA]/60" aria-hidden />
      <div className="absolute top-[16%] end-[10%] w-[16%] h-[6%] rounded-full bg-[#FAFAFA]/50" aria-hidden />

      {/* birds fly across once the sun is free */}
      {revealed && (
        <>
          <motion.div className="absolute top-[14%] start-0 w-[7%] z-[6]" initial={{ x: 0 }} animate={{ x: "1300%" }} transition={{ duration: 4.6, ease: "linear" }} aria-hidden>
            <BirdSvg className="w-full h-auto" />
          </motion.div>
          <motion.div className="absolute top-[22%] start-0 w-[5%] z-[6]" initial={{ x: 0 }} animate={{ x: "1500%" }} transition={{ duration: 5.4, ease: "linear", delay: 0.5 }} aria-hidden>
            <BirdSvg className="w-full h-auto" />
          </motion.div>
        </>
      )}

      {/* the cute sun (mostly hidden behind the ridge at first) */}
      <div className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[34%] z-[1]">
        <button
          type="button"
          aria-label={lang === "fa" ? "خورشید" : "sun"}
          onClick={tapSun}
          className="block w-full min-w-[52px] min-h-[44px] cursor-pointer"
        >
          <div key={boingKey} style={{ animation: boingKey > 0 && !done ? "wobble 0.55s ease" : undefined }}>
            <SunSvg revealed={revealed} className="w-full h-auto drop-shadow-[0_0_18px_rgba(255,209,84,0.75)]" />
          </div>
        </button>
      </div>

      {/* rolling dusk hills */}
      <svg viewBox="0 0 400 90" className="absolute bottom-0 left-0 w-full h-[26%]" preserveAspectRatio="none" aria-hidden>
        <path d="M0 60 Q90 20 200 52 T400 44 L400 90 L0 90 Z" fill="#563B96" />
        <path d="M0 80 Q120 48 260 74 T400 66 L400 90 L0 90 Z" fill="#3B2E5A" />
      </svg>

      {/* the big draggable mountain */}
      <div
        className="absolute top-[24%] left-1/2 -translate-x-1/2 w-[88%] z-[10]"
        style={{
          transform: `translate(-50%, ${y})`,
          transition: mountainDrag.dragging ? "none" : "transform 0.7s cubic-bezier(0.34,1.25,0.64,1)",
        }}
      >
        <Pulse active={hintPulse > 0 && !revealed && !done}>
          <div
            {...(revealed || done ? {} : mountainDrag.bind)}
            className={`w-full ${revealed ? "cursor-default" : "cursor-grab active:cursor-grabbing"} min-w-[120px] min-h-[80px]`}
          >
            <MountainSvg
              className="w-full h-auto drop-shadow-[0_8px_6px_rgba(51,32,94,0.35)]"
              style={{ animation: !revealed && !mountainDrag.dragging ? "breathe 4s ease-in-out infinite" : undefined }}
            />
          </div>
        </Pulse>
      </div>

      {/* sparkle burst on reveal */}
      {revealed && (
        <div className="pointer-events-none absolute inset-0 z-[12]" aria-hidden>
          {Array.from({ length: 6 }).map((_, i) => (
            <svg
              key={i}
              viewBox="0 0 40 40"
              className="absolute w-[4%]"
              style={{
                left: `${18 + i * 11}%`,
                top: `${8 + (i % 3) * 9}%`,
                animation: `star-pop 0.6s ${0.15 + i * 0.12}s both`,
              }}
            >
              <path d="M20 2 L24 14 L36 14 L26 22 L30 34 L20 27 L10 34 L14 22 L4 14 L16 14 Z" fill="#FFD154" stroke="#E8A81C" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          ))}
        </div>
      )}
    </Scene>
  );
}
