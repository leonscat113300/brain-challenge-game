"use client";

import React, { useCallback, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 2 — Where is the Sun?: drag the big cloud away.               */
/* ------------------------------------------------------------------ */

function SunSvg({ happy, className, style }: { happy: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden>
      {/* rays */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI * 2) / 12;
        const x1 = 100 + Math.cos(a) * 72;
        const y1 = 100 + Math.sin(a) * 72;
        const x2 = 100 + Math.cos(a) * 92;
        const y2 = 100 + Math.sin(a) * 92;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#FFD154" strokeWidth="9" strokeLinecap="round" style={{ transformOrigin: "100px 100px", animation: happy ? "spin 14s linear infinite" : undefined }} />;
      })}
      <circle cx="100" cy="100" r="62" fill="#FFD154" stroke="#E8A81C" strokeWidth="6" />
      {happy ? (
        <>
          <path d="M76 92 Q83 83 90 92" stroke="#B97E0A" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M110 92 Q117 83 124 92" stroke="#B97E0A" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M80 112 Q100 130 120 112" stroke="#B97E0A" strokeWidth="6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="83" cy="94" r="7" fill="#B97E0A" />
          <circle cx="117" cy="94" r="7" fill="#B97E0A" />
          <circle cx="85" cy="91" r="2.5" fill="#FFF3D6" />
          <circle cx="119" cy="91" r="2.5" fill="#FFF3D6" />
          <path d="M84 114 Q100 122 116 114" stroke="#B97E0A" strokeWidth="6" fill="none" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="72" cy="108" rx="8" ry="5" fill="#FF9F1C" opacity="0.55" />
      <ellipse cx="128" cy="108" rx="8" ry="5" fill="#FF9F1C" opacity="0.55" />
    </svg>
  );
}

function CloudSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 260 160" className={className} style={style} aria-hidden>
      <path
        d="M60 120 a35 35 0 0 1 5 -69 a45 45 0 0 1 82 -18 a38 38 0 0 1 55 33 a30 30 0 0 1 -8 54 Z"
        fill="#FFFFFF"
        stroke="#3B2E5A"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M85 55 a28 28 0 0 1 45 -12" stroke="#D8D4E4" strokeWidth="7" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Level2({ solved, onSolved, onProgress, hintPulse }: LevelProps) {
  const [revealed, setRevealed] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const cloudRef = useRef<HTMLDivElement>(null);

  const drag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || revealed) return;
        const w = sceneRef.current?.clientWidth ?? 320;
        if (Math.abs(d.x) > w * 0.22) {
          setRevealed(true);
          sfx.sparkle();
          onProgress(1);
          setTimeout(onSolved, 900);
        } else if (d.everMoved && Math.abs(d.x) > 30) {
          api.reset();
        }
      },
      [solved, revealed, onSolved, onProgress]
    )
  );

  return (
    <div ref={sceneRef} className="relative h-full w-full overflow-hidden select-none" style={{ background: "linear-gradient(180deg,#8EE3EA 0%,#BFF1F4 60%,#CDEFE9 100%)" }}>
      {/* hills + grass */}
      <svg viewBox="0 0 400 120" className="absolute bottom-0 left-0 w-full" preserveAspectRatio="none" aria-hidden>
        <path d="M0 60 Q100 10 200 55 T400 45 L400 120 L0 120 Z" fill="#7ED491" />
        <path d="M0 85 Q120 45 240 80 T400 70 L400 120 L0 120 Z" fill="#4CAF50" />
        <circle cx="60" cy="95" r="7" fill="#FFD154" />
        <circle cx="320" cy="100" r="7" fill="#FF6B81" />
        <circle cx="220" cy="102" r="7" fill="#1EC8CF" />
      </svg>

      {/* sun behind cloud */}
      <div className={`absolute top-[14%] start-[30%] w-[42%] transition-all duration-700 ${revealed ? "opacity-100 scale-110" : "opacity-95"}`} style={{ filter: revealed ? "drop-shadow(0 0 24px rgba(255,209,84,0.8))" : undefined, animation: revealed ? "breathe 2s ease-in-out infinite" : undefined }}>
        <SunSvg happy={revealed} className="w-full h-auto" />
      </div>

      {/* small clouds (decor) */}
      <div className="absolute top-[10%] end-[6%] w-[20%] opacity-80">
        <CloudSvg className="w-full h-auto" />
      </div>
      <div className="absolute top-[38%] end-[16%] w-[14%] opacity-60">
        <CloudSvg className="w-full h-auto" />
      </div>

      {/* big draggable cloud */}
      <div
        ref={cloudRef}
        className="absolute top-[24%] start-[24%] w-[58%] z-10"
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px)`,
          transition: drag.dragging ? "none" : "transform 0.45s cubic-bezier(0.34,1.3,0.64,1)",
          cursor: revealed ? "default" : "grab",
        }}
      >
        <Pulse active={hintPulse > 0 && !revealed && !drag.dragging}>
          <div {...(revealed ? {} : drag.bind)} className={revealed ? "" : "active:cursor-grabbing"}>
            <CloudSvg className="w-full h-auto drop-shadow-[0_6px_4px_rgba(59,46,90,0.2)]" />
          </div>
        </Pulse>
      </div>

      {/* sparkle on reveal */}
      {revealed && (
        <div className="absolute top-[20%] start-[38%] w-[26%]" style={{ animation: "pop-in 0.5s both" }}>
          <svg viewBox="0 0 60 60" aria-hidden>
            <path d="M30 4 L34 24 L54 30 L34 36 L30 56 L26 36 L6 30 L26 24 Z" fill="#FFF3D6" stroke="#FFD154" strokeWidth="2" />
          </svg>
        </div>
      )}
    </div>
  );
}
