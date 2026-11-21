"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { DragState } from "./shared";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { LevelProps } from "@/lib/game/types";

/* ------------------------------------------------------------------ */
/* Level 32 — Find the moon: drag the sun down below the horizon to    */
/* turn day into night, then tap the glowing crescent moon.            */
/* ------------------------------------------------------------------ */

const STARS = [
  { x: "10%", y: "12%", d: 0 },
  { x: "30%", y: "7%", d: 0.15 },
  { x: "48%", y: "17%", d: 0.3 },
  { x: "64%", y: "8%", d: 0.45 },
  { x: "82%", y: "30%", d: 0.6 },
];

function SunSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 160 160" className={className} style={style} aria-hidden>
      <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "spin 26s linear infinite" }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="80" y1="12" x2="80" y2="30" stroke="#FFD154" strokeWidth="8" strokeLinecap="round" transform={`rotate(${a} 80 80)`} />
        ))}
      </g>
      <circle cx="80" cy="80" r="46" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="66" cy="74" r="6" fill="#3B2E5A" />
      <circle cx="68" cy="72" r="2" fill="#FAFAFA" />
      <circle cx="94" cy="74" r="6" fill="#3B2E5A" />
      <circle cx="96" cy="72" r="2" fill="#FAFAFA" />
      <path d="M70 94 q10 9 20 0" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="58" cy="88" rx="6" ry="4" fill="#FF9FB2" />
      <ellipse cx="102" cy="88" rx="6" ry="4" fill="#FF9FB2" />
    </svg>
  );
}

function MoonSvg({ wink, className, style }: { wink: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden>
      <defs>
        <mask id="l32-moon-mask">
          <rect width="120" height="120" fill="#fff" />
          <circle cx="92" cy="38" r="34" fill="#000" />
        </mask>
      </defs>
      <circle cx="58" cy="60" r="42" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" mask="url(#l32-moon-mask)" />
      {wink ? (
        <path d="M30 52 q6 6 12 0" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="36" cy="52" r="5.5" fill="#3B2E5A" />
          <circle cx="38" cy="50" r="1.8" fill="#FAFAFA" />
        </>
      )}
      <circle cx="52" cy="52" r="5.5" fill="#3B2E5A" />
      <circle cx="54" cy="50" r="1.8" fill="#FAFAFA" />
      <path d="M36 70 q10 8 20 0" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <ellipse cx="30" cy="62" rx="5" ry="3.5" fill="#FF9FB2" />
    </svg>
  );
}

function StarTwinkle({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.5" />
    </svg>
  );
}

function CloudDeco({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 260 170" className={className} style={style} aria-hidden>
      <path d="M62 128 a36 36 0 0 1 4 -71 a46 46 0 0 1 86 -18 a40 40 0 0 1 58 34 a32 32 0 0 1 -10 55 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="6" strokeLinejoin="round" />
    </svg>
  );
}

export default function Level32({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [night, setNight] = useState(false);
  const [wink, setWink] = useState(false);
  const [done, setDone] = useState(false);
  const sunRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);

  const sunDrag = useDragMove(
    useCallback(
      (d: DragState, api) => {
        if (solved || done || night) return;
        if (Math.hypot(d.x, d.y) < 8) {
          sfx.pop();
          return;
        }
        const sun = sunRef.current?.getBoundingClientRect();
        const scene = sceneRef.current?.getBoundingClientRect();
        if (!sun || !scene) return;
        if (sun.top + sun.height / 2 >= scene.top + scene.height * 0.65) {
          setNight(true);
          sfx.sparkle();
          onProgress(0.6);
        } else {
          api.reset();
          onMistake({ fa: "خورشید رو تا افق پایین بکش", en: "Drag the sun down to the horizon" });
        }
      },
      [solved, done, night, onMistake, onProgress]
    )
  );

  const cloudA = useDragMove(
    useCallback(
      (d: DragState) => {
        if (solved || done) return;
        if (Math.hypot(d.x, d.y) < 8) sfx.pop();
      },
      [solved, done]
    )
  );
  const cloudB = useDragMove(
    useCallback(
      (d: DragState) => {
        if (solved || done) return;
        if (Math.hypot(d.x, d.y) < 8) sfx.pop();
      },
      [solved, done]
    )
  );

  const tapMoon = () => {
    if (solved || done || !night) return;
    setWink(true);
    setDone(true);
    sfx.cheer();
    onProgress(1);
    setTimeout(onSolved, 700);
  };

  return (
    <Scene bg="linear-gradient(180deg,#BEE9F5 0%,#FDF3D8 100%)">
      {/* measuring layer */}
      <div ref={sceneRef} aria-hidden className="pointer-events-none absolute inset-0" />

      {/* night sky overlay (CSS cross-fade) */}
      <div
        className="absolute inset-0 z-[42] pointer-events-none"
        style={{
          background: "linear-gradient(180deg,#241B4A 0%,#31265E 60%,#3A2E6E 100%)",
          opacity: night ? 1 : 0,
          transition: "opacity 1s ease",
        }}
        aria-hidden
      />

      {/* draggable decor clouds */}
      <div
        className="absolute top-[14%] start-[34%] w-[20%] z-[10]"
        style={{ transform: `translate(${cloudA.x}px, ${cloudA.y}px)`, transition: cloudA.dragging ? "none" : "transform 0.3s ease" }}
      >
        <div {...(solved || done ? {} : cloudA.bind)} className="cursor-grab active:cursor-grabbing">
          <CloudDeco className="w-full h-auto opacity-90" />
        </div>
      </div>
      <div
        className="absolute top-[38%] end-[24%] w-[16%] z-[10]"
        style={{ transform: `translate(${cloudB.x}px, ${cloudB.y}px)`, transition: cloudB.dragging ? "none" : "transform 0.3s ease" }}
      >
        <div {...(solved || done ? {} : cloudB.bind)} className="cursor-grab active:cursor-grabbing">
          <CloudDeco className="w-full h-auto opacity-90" />
        </div>
      </div>

      {/* draggable sun: pull it down past the horizon */}
      <div
        ref={sunRef}
        className="absolute top-[5%] start-[5%] w-[28%] z-[20]"
        style={{
          transform: `translate(${sunDrag.x}px, ${sunDrag.y}px)${night ? " translateY(120%) scale(0.85)" : ""}`,
          transition: sunDrag.dragging
            ? "none"
            : night
              ? "transform 1s ease-in, opacity 1s ease"
              : "transform 0.5s cubic-bezier(0.34,1.3,0.64,1)",
          opacity: night ? 0 : 1,
        }}
      >
        <Pulse active={hintPulse > 0 && !night && !done}>
          <div {...(night || solved || done ? {} : sunDrag.bind)} className="cursor-grab active:cursor-grabbing">
            <SunSvg className="w-full h-auto drop-shadow-[0_3px_4px_rgba(232,168,28,0.4)]" />
          </div>
        </Pulse>
      </div>

      {/* green hills at the horizon */}
      <div className="absolute inset-x-0 bottom-0 h-[26%] z-[40]" aria-hidden>
        <svg viewBox="0 0 600 160" preserveAspectRatio="none" className="w-full h-full">
          <ellipse cx="150" cy="185" rx="240" ry="115" fill="#3E9B44" stroke="#2E6B31" strokeWidth="5" />
          <ellipse cx="470" cy="195" rx="270" ry="125" fill="#4CAF50" stroke="#2E6B31" strokeWidth="5" />
        </svg>
      </div>

      {/* twinkling stars pop in at night */}
      {night &&
        STARS.map((s, i) => (
          <motion.div
            key={i}
            className="absolute z-[50] w-[4.5%]"
            style={{ left: s.x, top: s.y }}
            initial={{ scale: 0, rotate: -40 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.8 + s.d, type: "spring", stiffness: 260, damping: 14 }}
          >
            <div style={{ animation: "breathe 2.2s ease-in-out infinite" }}>
              <StarTwinkle className="w-full h-auto" />
            </div>
          </motion.div>
        ))}

      {/* glowing crescent moon */}
      <div
        className="absolute top-[6%] end-[7%] w-[22%] z-[50]"
        style={{
          opacity: night ? 1 : 0,
          transition: "opacity 1s ease 0.4s",
          pointerEvents: night && !done ? "auto" : "none",
          cursor: night && !done ? "pointer" : "default",
        }}
        onClick={tapMoon}
        role="button"
        aria-label={lang === "fa" ? "ماه" : "moon"}
      >
        <Pulse active={hintPulse > 0 && night && !done}>
          <div style={{ animation: night ? "glow 2.4s ease-in-out infinite" : undefined }}>
            <MoonSvg wink={wink} className="w-full h-auto" />
          </div>
        </Pulse>
        {wink && (
          <>
            <StarTwinkle className="absolute -top-3 -start-4 w-5 h-5" style={{ animation: "star-pop 0.5s ease-out both" }} />
            <StarTwinkle className="absolute top-8 -end-5 w-4 h-4" style={{ animation: "star-pop 0.5s 0.15s ease-out both" }} />
          </>
        )}
      </div>
    </Scene>
  );
}
