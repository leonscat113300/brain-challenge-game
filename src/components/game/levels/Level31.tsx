"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { DragState } from "./shared";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { LevelProps } from "@/lib/game/types";

/* ------------------------------------------------------------------ */
/* Level 31 — Which box is heavier? Feel the drag resistance, then     */
/* tap the box that is hard to move.                                   */
/* ------------------------------------------------------------------ */

function BoxSvg({
  tag,
  straining,
  className,
  style,
}: {
  tag: string;
  straining?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 180 150" className={className} style={style} aria-hidden>
      {/* effort lines while straining */}
      {straining && (
        <g stroke="#3B2E5A" strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M52 14 L60 26" />
          <path d="M90 8 L90 22" />
          <path d="M128 14 L120 26" />
        </g>
      )}
      <rect x="18" y="44" width="144" height="90" rx="10" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M18 44 L42 22 L138 22 L162 44" fill="#B87A3E" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <rect x="80" y="22" width="20" height="112" rx="4" fill="#FFD154" opacity="0.9" stroke="#3B2E5A" strokeWidth="3.5" />
      <rect x="70" y="76" width="40" height="26" rx="7" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
      <text x="90" y="95" textAnchor="middle" fontSize="17" fontWeight="700" fill="#3B2E5A">
        {tag}
      </text>
    </svg>
  );
}

function StoneBadgeSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 64" className={className} style={style} aria-hidden>
      <path d="M14 50 L22 24 L48 12 L72 30 L68 50 Z" fill="#A9A3B8" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M32 26 L50 20 M58 38 L70 34" stroke="#7E7890" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M24 58 L66 58" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function Level31({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [heavyTested, setHeavyTested] = useState(false);
  const [lightTested, setLightTested] = useState(false);
  const [dropped, setDropped] = useState(false);
  const [done, setDone] = useState(false);
  const progFiredRef = useRef(false);
  const bothTested = heavyTested && lightTested;

  /* heavy box: barely budges (clamped to +/-14px), trembles while pulled */
  const heavyDrag = useDragMove(
    useCallback(
      (d: DragState, api) => {
        if (solved || done) return;
        const dist = Math.hypot(d.x, d.y);
        if (dist < 8) {
          /* tap: this is the heavy one — thud, dust, badge, solved */
          setDropped(true);
          setDone(true);
          sfx.pop();
          sfx.cheer();
          onProgress(1);
          setTimeout(onSolved, 700);
          return;
        }
        setHeavyTested(true);
        api.reset();
      },
      [solved, done, onProgress, onSolved]
    )
  );

  /* light box: slides freely up to 120px with a springy overshoot */
  const lightDrag = useDragMove(
    useCallback(
      (d: DragState) => {
        if (solved || done) return;
        const dist = Math.hypot(d.x, d.y);
        if (dist < 8) {
          onMistake({
            fa: "این سبکه! اونی که سخت جابه‌جا میشه رو انتخاب کن",
            en: "This one is light! Pick the one that's hard to move",
          });
          return;
        }
        setLightTested(true);
      },
      [solved, done, onMistake]
    )
  );

  useEffect(() => {
    if (heavyTested && lightTested && !progFiredRef.current) {
      progFiredRef.current = true;
      onProgress(0.5);
    }
  }, [heavyTested, lightTested, onProgress]);

  const hx = Math.max(-14, Math.min(14, heavyDrag.x));
  const hy = Math.max(-6, Math.min(6, heavyDrag.y));
  const lx = Math.max(-120, Math.min(120, lightDrag.x));
  const ly = Math.max(-10, Math.min(10, lightDrag.y));

  return (
    <Scene bg="linear-gradient(180deg,#F6F1E7 0%,#EFE7D8 100%)">
      {/* floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[16%] border-t-4 border-[#3B2E5A] bg-[#E8D9C3]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(139,94,60,0.25) 0 4px, transparent 4px 56px)" }}
        aria-hidden
      />
      {/* wall decor dots */}
      <div className="absolute top-[8%] start-[44%] flex gap-2 z-[2]" aria-hidden>
        <div className="w-3 h-3 rounded-full bg-[#FFD154] border-2 border-[#3B2E5A]" />
        <div className="w-3 h-3 rounded-full bg-[#FF6B81] border-2 border-[#3B2E5A]" />
        <div className="w-3 h-3 rounded-full bg-[#1EC8CF] border-2 border-[#3B2E5A]" />
      </div>

      {/* HEAVY box (A): hard to move */}
      <div
        className="absolute bottom-[15%] start-[6%] w-[36%] z-[15]"
        style={{
          transform: `translate(${hx}px, ${hy}px)`,
          transition: heavyDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.3,0.64,1)",
        }}
      >
        <Pulse active={hintPulse > 0 && bothTested && !done}>
          <div
            {...(solved || done ? {} : heavyDrag.bind)}
            role="button"
            aria-label={lang === "fa" ? "جعبه A" : "box A"}
            className={`relative ${solved || done ? "" : "cursor-grab active:cursor-grabbing"}`}
          >
            <div style={{ animation: heavyDrag.dragging ? "shake-hard 0.45s linear infinite" : undefined }}>
              <BoxSvg tag="A" straining={heavyDrag.dragging} className="w-full h-auto drop-shadow-[0_4px_3px_rgba(59,46,90,0.25)]" />
            </div>
            {dropped && (
              <div className="absolute -top-[30%] start-[31%] w-[38%]">
                <div style={{ animation: "star-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) both" }}>
                  <StoneBadgeSvg className="w-full h-auto" />
                </div>
              </div>
            )}
            {dropped &&
              [0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute bottom-[2%] w-[16%] aspect-square rounded-full"
                  style={{ left: `${16 + i * 24}%`, background: "#CFC9DB" }}
                  initial={{ opacity: 0.9, y: 0, scale: 0.5 }}
                  animate={{ opacity: 0, y: -28, scale: 1.5 }}
                  transition={{ duration: 0.7, delay: i * 0.12 }}
                />
              ))}
          </div>
        </Pulse>
      </div>

      {/* LIGHT box (B): slides easily */}
      <div
        className="absolute bottom-[15%] end-[6%] w-[36%] z-[14]"
        style={{
          transform: `translate(${lx}px, ${ly}px)`,
          transition: lightDrag.dragging ? "none" : "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <div
          {...(solved || done ? {} : lightDrag.bind)}
          role="button"
          aria-label={lang === "fa" ? "جعبه B" : "box B"}
          className={`relative ${solved || done ? "" : "cursor-grab active:cursor-grabbing"}`}
        >
          <BoxSvg tag="B" className="w-full h-auto drop-shadow-[0_4px_3px_rgba(59,46,90,0.25)]" />
        </div>
      </div>
    </Scene>
  );
}
