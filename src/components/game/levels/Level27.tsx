"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Pulse, Scene, sfx, useDragMove } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 27 — Apple shake: pull the branch DOWN and let it spring back */
/* three times; the apple drops and lands in the wicker basket.        */
/* ------------------------------------------------------------------ */

function AppleSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 110 120" className={className} style={style} aria-hidden>
      <path d="M55 22 Q53 10 63 6" stroke="#8B5E3C" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M63 12 Q80 2 88 14 Q78 24 63 16 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M55 24 Q40 12 26 22 Q8 34 12 62 Q16 96 40 108 Q55 114 70 108 Q94 96 98 62 Q102 34 84 22 Q70 12 55 24 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M30 44 Q28 56 34 68" stroke="#FAFAFA" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* cute face */}
      <circle cx="42" cy="64" r="6" fill="#3B2E5A" />
      <circle cx="68" cy="64" r="6" fill="#3B2E5A" />
      <circle cx="44.3" cy="61.7" r="2.1" fill="#fff" />
      <circle cx="70.3" cy="61.7" r="2.1" fill="#fff" />
      <path d="M48 76 Q55 82 62 76" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="34" cy="72" rx="5.5" ry="4" fill="#FF9FB2" />
      <ellipse cx="76" cy="72" rx="5.5" ry="4" fill="#FF9FB2" />
    </svg>
  );
}

function BranchSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 340 100" className={className} style={style} aria-hidden>
      {/* leaf clusters */}
      <circle cx="55" cy="34" r="32" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="115" cy="24" r="36" fill="#5DBB63" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="180" cy="30" r="30" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="238" cy="36" r="24" fill="#5DBB63" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* branch wood + twig that holds the apple */}
      <path d="M0 74 Q80 62 170 58 Q260 56 298 62" stroke="#3B2E5A" strokeWidth="20" fill="none" strokeLinecap="round" />
      <path d="M0 74 Q80 62 170 58 Q260 56 298 62" stroke="#8B5E3C" strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d="M296 62 Q304 72 300 86" stroke="#3B2E5A" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M296 62 Q303 72 300 84" stroke="#8B5E3C" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function BasketBackSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 180 80" className={className} style={style} aria-hidden>
      <ellipse cx="90" cy="36" rx="80" ry="24" fill="#5C3A22" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="90" cy="33" rx="64" ry="15" fill="#2E1D3A" opacity="0.6" />
    </svg>
  );
}

function BasketFrontSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 180 92" className={className} style={style} aria-hidden>
      <path d="M10 36 Q10 88 90 88 Q170 88 170 36 Q150 52 90 52 Q30 52 10 36 Z" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M26 56 Q90 74 154 56" stroke="#8B5E3C" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M34 70 Q90 86 146 70" stroke="#8B5E3C" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function MissHandSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 110" className={className} style={style} aria-hidden>
      <path d="M30 64 L30 24 Q30 16 37 16 Q44 16 44 24 L44 54" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M44 54 L44 12 Q44 4 51 4 Q58 4 58 12 L58 54" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M58 54 L58 20 Q58 12 65 12 Q72 12 72 20 L72 58" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M26 60 Q22 72 30 82 L66 82 Q74 72 72 60 Z" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M30 82 Q26 96 38 100 L60 100 Q70 96 66 84" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
    </svg>
  );
}

function Star({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 2 L14.6 8.6 L21.5 9.2 L16.3 13.8 L17.9 20.6 L12 17 L6.1 20.6 L7.7 13.8 L2.5 9.2 L9.4 8.6 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function Level27({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [shakes, setShakes] = useState(0);
  const [falling, setFalling] = useState(false);
  const [landed, setLanded] = useState(false);
  const [done, setDone] = useState(false);
  const [miss, setMiss] = useState(0);
  const shakesRef = useRef(0);
  const finishRef = useRef(false);

  const branchDrag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || falling) return;
        api.reset();
        if (d.y >= 35) {
          const n = Math.min(3, shakesRef.current + 1);
          shakesRef.current = n;
          setShakes(n);
          sfx.whoosh();
          onProgress(n === 3 ? 0.99 : 0.33 * n);
          if (n === 3) {
            setFalling(true);
            window.setTimeout(() => sfx.pop(), 640);
          }
        }
      },
      [solved, done, falling, onProgress]
    )
  );

  const tapApple = () => {
    if (solved || done || falling) return;
    setMiss((v) => v + 1);
    sfx.pop();
    onMistake({ fa: "دستت بهش نمی‌رسه! شاخه رو تکون بده", en: "You can't reach it! Shake the branch" });
  };

  const appleLanded = () => {
    if (done || finishRef.current) return;
    finishRef.current = true;
    setLanded(true);
    sfx.sparkle();
    setDone(true);
    sfx.cheer();
    onProgress(1);
    window.setTimeout(onSolved, 700);
  };

  return (
    <Scene bg="linear-gradient(180deg,#DFF3FA 0%,#EEF8E8 62%,#E3F2DC 100%)">
      {/* sun + tree crown */}
      <div className="absolute end-[5%] top-[6%] h-12 w-12 rounded-full border-4 border-[#3B2E5A] bg-[#FFD154]" style={{ animation: "breathe 3.4s ease-in-out infinite" }} aria-hidden />
      <div className="absolute -left-[10%] -top-[16%] aspect-square w-[48%] rounded-full border-4 border-[#3B2E5A] bg-[#4CAF50]" aria-hidden />
      <div className="absolute -top-[22%] left-[22%] aspect-square w-[40%] rounded-full border-4 border-[#3B2E5A] bg-[#5DBB63]" aria-hidden />
      {/* grass */}
      <div className="absolute inset-x-0 bottom-0 h-[16%] border-t-4 border-[#3B2E5A]" style={{ background: "linear-gradient(180deg,#5DBB63,#4CAF50)" }} aria-hidden />

      {/* shake meter */}
      <div className="absolute end-[4%] top-[3%] z-40 flex gap-2" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-4 w-4 rounded-full border-[3px] border-[#3B2E5A]"
            style={{
              background: i < shakes ? "#FFD154" : "rgba(250,250,250,0.65)",
              animation: i === shakes - 1 ? "pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both" : undefined,
            }}
          />
        ))}
      </div>

      {/* basket (back rim, then apple, then front wall) */}
      <div className="absolute bottom-[9%] left-[50%] w-[28%]" aria-hidden>
        <div className="relative">
          <div className="z-[10]">
            <BasketBackSvg className="h-auto w-full" />
          </div>
          <div className="absolute left-0 top-[38%] z-[30] w-full">
            <BasketFrontSvg className="h-auto w-full" />
          </div>
        </div>
      </div>

      {/* draggable branch: pull DOWN, release, repeat */}
      <div
        className="absolute left-0 top-[6%] z-[16] w-[72%]"
        style={{
          transform: `translate(0px, ${branchDrag.y}px)`,
          transition: branchDrag.dragging ? "none" : "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <Pulse active={hintPulse > 0 && !done && !falling}>
          <motion.div key={`rustle-${shakes}`} animate={shakes > 0 ? { rotate: [0, -2.5, 2.5, 0] } : { rotate: 0 }} transition={{ duration: 0.5 }}>
            <div
              {...(falling || done ? {} : branchDrag.bind)}
              role="button"
              aria-label={lang === "fa" ? "شاخه درخت" : "tree branch"}
              className={falling || done ? "" : "cursor-grab active:cursor-grabbing"}
            >
              <BranchSvg className="h-auto w-full" />
            </div>
          </motion.div>
        </Pulse>
      </div>

      {/* the apple follows the branch, then drops into the basket */}
      <div
        className="pointer-events-none absolute inset-0 z-[18]"
        style={{
          transform: `translate(0px, ${falling ? 0 : branchDrag.y}px)`,
          transition: branchDrag.dragging && !falling ? "none" : "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <motion.div
          className="absolute left-[57%] w-[13%]"
          style={{ top: "28%" }}
          animate={
            falling
              ? landed
                ? { top: "71.5%", rotate: 0 }
                : { top: ["28%", "72%", "63%", "71.5%"], rotate: [0, 24, -12, 0] }
              : { top: "28%", rotate: 0 }
          }
          transition={falling ? { duration: 1.2, times: [0, 0.5, 0.76, 1], ease: ["easeIn", "easeOut", "easeInOut"] } : { duration: 0.3 }}
          onAnimationComplete={falling ? appleLanded : undefined}
        >
          <motion.div key={`wiggle-${shakes}`} animate={shakes > 0 ? { rotate: [0, 3 + shakes * 5, -(3 + shakes * 5), 0] } : { rotate: 0 }} transition={{ duration: 0.55 }}>
            <div onClick={tapApple} role="button" aria-label={lang === "fa" ? "سیب" : "apple"} className={`pointer-events-auto ${falling ? "" : "cursor-pointer"}`}>
              <AppleSvg className="h-auto w-full drop-shadow-[0_3px_2px_rgba(59,46,90,0.25)]" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* failed hand reach after tapping the apple */}
      {miss > 0 && (
        <motion.div
          key={`miss-${miss}`}
          className="pointer-events-none absolute left-[56%] top-0 z-40 w-[11%]"
          initial={{ top: "100%", opacity: 0 }}
          animate={{ top: ["100%", "46%", "100%", "100%"], opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.1, times: [0, 0.45, 0.9, 1] }}
        >
          <MissHandSvg className="h-auto w-full" />
        </motion.div>
      )}

      {/* sparkles when the apple lands */}
      {landed &&
        [
          { l: "54%", t: "58%", d: "0s" },
          { l: "72%", t: "55%", d: "0.14s" },
          { l: "63%", t: "50%", d: "0.28s" },
        ].map((s, i) => (
          <span key={i} className="pointer-events-none absolute z-40" style={{ left: s.l, top: s.t, animation: `star-pop 0.8s ease ${s.d} both` }}>
            <Star className="h-7 w-7" />
          </span>
        ))}
    </Scene>
  );
}
