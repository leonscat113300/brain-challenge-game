"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 72 — The fridge door is stuck open because a bottle stands    */
/* right in its path. Drag the bottle aside — the door will close.     */
/* ------------------------------------------------------------------ */

function BottleSvg() {
  return (
    <svg viewBox="0 0 60 130" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" aria-hidden>
      {/* cap */}
      <rect x="22" y="4" width="16" height="12" rx="4" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
      {/* neck */}
      <path d="M24 16 L24 34 L14 52 L14 112 Q14 120 22 120 L38 120 Q46 120 46 112 L46 52 L36 34 L36 16" fill="#BFE7F5" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* milk inside */}
      <path d="M16 70 L44 70 L44 112 Q44 118 38 118 L22 118 Q16 118 16 112 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
      {/* label */}
      <circle cx="30" cy="92" r="9" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="30" cy="92" r="3" fill="#FAFAFA" />
    </svg>
  );
}

function FridgeSvg() {
  return (
    <svg viewBox="0 0 200 240" className="h-auto w-full" aria-hidden>
      {/* body */}
      <rect x="10" y="8" width="180" height="224" rx="18" fill="#7FD8E8" stroke="#3B2E5A" strokeWidth="5" />
      {/* freezer divider */}
      <line x1="10" y1="76" x2="190" y2="76" stroke="#3B2E5A" strokeWidth="5" />
    </svg>
  );
}

export default function Level72({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [bottleMoved, setBottleMoved] = useState(false);
  const [closed, setClosed] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const bottleDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (bottleMoved || done) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (Math.abs(d.x) > 55 || d.y > 55) {
          sfx.whoosh();
          api.reset();
          setBottleMoved(true);
          onProgress(0.6);
          const t1 = setTimeout(() => {
            setClosed(true);
            sfx.unlock();
            onProgress(1);
            setDone(true);
            timers.current.push(setTimeout(() => sfx.sparkle(), 400));
            timers.current.push(setTimeout(onSolved, 1500));
          }, 500);
          timers.current.push(t1);
        } else {
          api.reset();
        }
      },
      [bottleMoved, done, onProgress, onSolved]
    )
  );

  const tapDoor = useCallback(() => {
    if (done) return;
    sfx.fail();
    onMistake({
      fa: "چیزی جلوی در را گرفته! اول بطری را کنار بکش.",
      en: "Something is blocking the door! Move the bottle first.",
    });
  }, [done, onMistake]);

  const doorOpen = !closed;

  return (
    <Scene bg="linear-gradient(180deg,#E7DDF4 0%,#D8CCEC 55%,#D3C7B0 56%,#C5B89C 100%)">
      {/* floor line */}
      <div className="absolute bottom-[4%] left-0 right-0 h-[3px] bg-[#3B2E5A] opacity-30" aria-hidden />

      {/* fridge with items inside */}
      <div className="absolute bottom-[10%] start-[6%] w-[44%]" style={{ perspective: 700 }}>
        {/* fridge body */}
        <div className="relative">
          <FridgeSvg />
          {/* inner items (visible while door open) */}
          <div className="absolute left-[16%] top-[10%] w-[70%] transition-opacity duration-500" style={{ opacity: doorOpen ? 1 : 0 }} aria-hidden>
            <svg viewBox="0 0 150 180">
              {/* milk carton */}
              <rect x="14" y="96" width="34" height="52" rx="6" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
              <path d="M14 96 L31 84 L48 96" fill="#E7DDF4" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
              {/* apple */}
              <circle cx="76" cy="136" r="14" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
              <path d="M76 122 Q78 116 84 114" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* cheese */}
              <path d="M96 116 L136 108 L140 138 L100 142 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
              <circle cx="112" cy="124" r="3" fill="#C98A4B" />
              {/* jar */}
              <rect x="104" y="52" width="26" height="34" rx="7" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
              <rect x="102" y="48" width="30" height="10" rx="4" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
              {/* egg tray */}
              <rect x="20" y="30" width="60" height="26" rx="6" fill="#D9A66C" stroke="#3B2E5A" strokeWidth="4" />
              <ellipse cx="34" cy="30" rx="7" ry="5" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
              <ellipse cx="50" cy="30" rx="7" ry="5" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
              <ellipse cx="66" cy="30" rx="7" ry="5" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
            </svg>
          </div>

          {/* door (ajar, hinged left) */}
          <button
            type="button"
            onClick={tapDoor}
            aria-label={lang === "fa" ? "در یخچال" : "fridge door"}
            className="absolute inset-0 cursor-pointer border-0 bg-transparent p-0"
            style={{
              transform: closed ? "rotateY(0deg)" : "rotateY(26deg)",
              transformOrigin: "left center",
              transition: "transform 0.7s cubic-bezier(0.5,0,0.3,1)",
              transformStyle: "preserve-3d",
              zIndex: 10,
            }}
          >
            <svg viewBox="0 0 200 240" className="h-full w-full" aria-hidden>
              <rect x="4" y="4" width="192" height="232" rx="18" fill="#4FC3D4" stroke="#3B2E5A" strokeWidth="5" opacity={closed ? 1 : 0.96} />
              <rect x="14" y="14" width="172" height="212" rx="14" fill="none" stroke="#2E93A5" strokeWidth="4" opacity="0.5" />
              {/* handle */}
              <rect x="168" y="96" width="14" height="60" rx="7" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
              {/* magnet note */}
              {closed && (
                <g transform="translate(60 100)" style={{ animation: "pop-in 0.4s 0.5s both" }}>
                  <rect x="0" y="0" width="44" height="44" rx="6" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" transform="rotate(-6 22 22)" />
                  <circle cx="22" cy="22" r="6" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.5" />
                </g>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* bottle — blocks the door path (draggable) */}
      <div
        className={`absolute bottom-[6%] w-[13%] ${bottleMoved ? "end-[8%]" : "start-[30%]"}`}
        style={{ zIndex: 20, transition: bottleMoved ? "inset-inline-end 0.45s ease, inset-inline-start 0.45s ease" : undefined }}
      >
        <div
          {...(bottleMoved || done ? {} : bottleDrag.bind)}
          role="button"
          aria-label={lang === "fa" ? "بطری شیر" : "milk bottle"}
          className={bottleMoved || done ? "" : "cursor-grab active:cursor-grabbing"}
          style={{
            transform: `translate(${bottleDrag.x}px, ${bottleDrag.y}px) rotate(${bottleMoved ? -10 : 0}deg)`,
            transition: bottleDrag.dragging ? "none" : "transform 0.5s cubic-bezier(0.34,1.4,0.64,1)",
          }}
        >
          <Pulse active={hintPulse > 0 && !done}>
            <BottleSvg />
          </Pulse>
        </div>
      </div>

      {/* "cold" indicator while open */}
      {!closed && (
        <div className="absolute end-[8%] top-[8%] w-[16%]" style={{ animation: "bob 1.6s ease-in-out infinite" }} aria-hidden>
          <svg viewBox="0 0 40 40">
            <path d="M20 2 L20 38 M4 11 L36 29 M36 11 L4 29" stroke="#1EC8CF" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* success sparkles */}
      {done &&
        [0, 1, 2].map((i) => (
          <span key={i} className="absolute z-30" style={{ left: `${16 + i * 8}%`, top: `${18 + (i % 2) * 10}%`, width: 22, height: 22, animation: `star-pop 0.5s ${i * 0.15}s both` }} aria-hidden>
            <svg viewBox="0 0 20 20" className="h-full w-full">
              <path d="M10 0 L12.4 7.6 L20 10 L12.4 12.4 L10 20 L7.6 12.4 L0 10 L7.6 7.6 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.5" />
            </svg>
          </span>
        ))}
    </Scene>
  );
}
