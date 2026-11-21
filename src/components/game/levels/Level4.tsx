"use client";

import React, { useCallback, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 4 — Lost Ball: drag the sofa away to find the ball.           */
/* ------------------------------------------------------------------ */

function SofaSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 340 210" className={className} style={style} aria-hidden>
      {/* back rest */}
      <rect x="26" y="22" width="288" height="86" rx="26" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="6" />
      <line x1="122" y1="34" x2="122" y2="100" stroke="#3B8C3F" strokeWidth="5" strokeLinecap="round" />
      <line x1="218" y1="34" x2="218" y2="100" stroke="#3B8C3F" strokeWidth="5" strokeLinecap="round" />
      <circle cx="74" cy="58" r="4" fill="#2E7A33" />
      <circle cx="170" cy="58" r="4" fill="#2E7A33" />
      <circle cx="266" cy="58" r="4" fill="#2E7A33" />
      {/* seat cushions */}
      <rect x="46" y="104" width="80" height="44" rx="14" fill="#5BBE60" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="130" y="104" width="80" height="44" rx="14" fill="#5BBE60" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="214" y="104" width="80" height="44" rx="14" fill="#5BBE60" stroke="#3B2E5A" strokeWidth="5" />
      {/* armrests */}
      <rect x="6" y="78" width="48" height="76" rx="20" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="6" />
      <rect x="286" y="78" width="48" height="76" rx="20" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="6" />
      {/* base */}
      <rect x="26" y="146" width="288" height="24" rx="10" fill="#3E9A42" stroke="#3B2E5A" strokeWidth="6" />
      {/* wooden legs */}
      <rect x="44" y="170" width="18" height="28" rx="5" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="161" y="170" width="18" height="28" rx="5" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="278" y="170" width="18" height="28" rx="5" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="5" />
    </svg>
  );
}

function BallSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 96" className={className} style={style} aria-hidden>
      {/* ground shadow */}
      <ellipse cx="45" cy="86" rx="30" ry="6" fill="#3B2E5A" opacity="0.18" />
      <circle cx="45" cy="46" r="36" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M18 36 Q45 20 72 36" stroke="#C94A5E" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="32" cy="34" rx="9" ry="12" fill="#FAFAFA" opacity="0.85" transform="rotate(-18 32 34)" />
    </svg>
  );
}

export default function Level4({ solved, onSolved, onProgress, hintPulse }: LevelProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [moved, setMoved] = useState(false);
  const [boingN, setBoingN] = useState(0);
  const [bubble, setBubble] = useState(false);

  const drag = useDragMove(
    useCallback(
      (d) => {
        if (solved || moved) return;
        const w = sceneRef.current?.clientWidth ?? 340;
        const tap = !d.everMoved || (Math.abs(d.x) < 8 && Math.abs(d.y) < 8);
        if (!tap && (Math.abs(d.x) > w * 0.18 || Math.abs(d.y) > 60)) {
          // dragged far enough: the sofa stays where it was dropped
          setMoved(true);
          sfx.whoosh();
          onProgress(1);
          window.setTimeout(onSolved, 800);
          return;
        }
        if (tap) {
          // tapped without dragging: boing!
          sfx.boing();
          setBoingN((n) => n + 1);
          setBubble(true);
          window.setTimeout(() => setBubble(false), 1000);
        }
        // eslint-disable-next-line react-hooks/immutability -- reset lives on the hook value declared below
        dragReset();
      },
      [solved, moved, onProgress, onSolved]
    )
  );
  const dragReset = drag.reset;

  return (
    <Scene bg="linear-gradient(180deg,#FDF3E3 0%,#FBEAD0 56%,#EAD9C0 58%,#DFC9A4 100%)">
      {/* measuring layer */}
      <div ref={sceneRef} className="pointer-events-none absolute inset-0" aria-hidden />

      {/* window */}
      <div className="absolute top-[6%] start-[6%] aspect-[4/3] w-[24%] overflow-hidden rounded-2xl border-4 border-[#3B2E5A] bg-[#BEE9F5]">
        <div className="absolute inset-x-0 top-1/2 h-1 bg-[#3B2E5A]" />
        <div className="absolute inset-y-0 left-1/2 w-1 bg-[#3B2E5A]" />
        <div className="absolute top-2 start-2 h-3 w-3 rounded-full bg-[#FFD154]" />
      </div>

      {/* wall picture */}
      <div className="absolute top-[8%] end-[6%] aspect-square w-[17%] overflow-hidden rounded-xl border-4 border-[#3B2E5A] bg-[#FAFAFA]">
        <svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden>
          <rect width="60" height="60" fill="#FFEFC9" />
          <circle cx="44" cy="16" r="8" fill="#FF9F1C" />
          <path d="M0 44 L16 26 L28 38 L40 24 L60 44 L60 60 L0 60 Z" fill="#4CAF50" />
        </svg>
      </div>

      {/* wooden floor planks */}
      <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="pointer-events-none absolute bottom-0 left-0 h-[40%] w-full" aria-hidden>
        <g stroke="#3B2E5A" opacity="0.12" strokeWidth="2">
          <line x1="0" y1="30" x2="400" y2="26" />
          <line x1="0" y1="62" x2="400" y2="66" />
          <line x1="90" y1="0" x2="90" y2="30" />
          <line x1="250" y1="26" x2="250" y2="62" />
          <line x1="150" y1="62" x2="150" y2="100" />
          <line x1="330" y1="62" x2="330" y2="100" />
        </g>
      </svg>

      {/* the shiny ball, hidden behind the sofa */}
      <div
        className={`absolute bottom-[10%] start-[4%] z-10 w-[15%] ${moved ? "cursor-pointer" : ""}`}
        onClick={() => {
          if (moved) sfx.sparkle();
        }}
      >
        <div style={{ animation: moved ? "pop-in 0.5s both, wobble 0.7s 0.5s ease-in-out" : undefined }}>
          <BallSvg className="h-auto w-full" />
        </div>
      </div>

      {/* draggable sofa covering the ball */}
      <div
        className="absolute bottom-[9%] start-[10%] z-20 w-[78%]"
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px) ${drag.dragging ? "scale(1.03) rotate(-1.5deg)" : ""}`,
          transition: drag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.3,0.64,1)",
          filter: drag.dragging ? "drop-shadow(0 16px 10px rgba(59,46,90,0.35))" : "drop-shadow(0 6px 3px rgba(59,46,90,0.2))",
        }}
      >
        <Pulse active={hintPulse > 0 && !moved}>
          <div {...(moved ? {} : drag.bind)} className={moved ? "" : "cursor-grab active:cursor-grabbing"}>
            <div key={boingN} style={{ animation: boingN > 0 ? "wobble 0.55s ease-in-out" : undefined }}>
              <SofaSvg className="h-auto w-full" />
            </div>
            {bubble && (
              <div
                className="absolute -top-9 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full border-[3px] border-[#3B2E5A] bg-[#FAFAFA] px-3 py-1 font-extrabold text-[#3B2E5A]"
                style={{ animation: "pop-in 0.25s both" }}
                role="status"
              >
                boing!
              </div>
            )}
          </div>
        </Pulse>
      </div>
    </Scene>
  );
}
