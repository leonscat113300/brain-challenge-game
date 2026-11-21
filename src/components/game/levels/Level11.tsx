"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 11 — The Apple Tree: stop pulling the apple, shake the tree!  */
/* ------------------------------------------------------------------ */

function SunSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={32 + Math.cos(a) * 20}
            y1={32 + Math.sin(a) * 20}
            x2={32 + Math.cos(a) * 27}
            y2={32 + Math.sin(a) * 27}
            stroke="#E8A81C"
            strokeWidth="4"
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="32" cy="32" r="15" fill="#FFD154" stroke="#E8A81C" strokeWidth="3" />
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
        strokeWidth="7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TreeSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 220 240" className={className} style={style} aria-hidden>
      {/* trunk (behind the crown) */}
      <path
        d="M92 238 C93 198 88 168 82 96 C100 84 122 84 140 96 C134 168 130 198 130 238 Z"
        fill="#8B5E3C"
        stroke="#3B2E5A"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M104 150 Q112 140 120 150" stroke="#6E4630" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M102 190 Q112 180 122 190" stroke="#6E4630" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* crown: overlapping green circles */}
      <circle cx="80" cy="56" r="40" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="6" />
      <circle cx="140" cy="52" r="38" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="6" />
      <circle cx="110" cy="34" r="32" fill="#7ED491" stroke="#3B2E5A" strokeWidth="6" />
      <circle cx="112" cy="70" r="36" fill="#7ED491" stroke="#3B2E5A" strokeWidth="6" />
      <circle cx="92" cy="48" r="6" fill="#7ED491" />
      <circle cx="132" cy="40" r="5" fill="#4CAF50" />
      <circle cx="118" cy="62" r="6" fill="#4CAF50" />
    </svg>
  );
}

function AppleSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 78" className={className} style={style} aria-hidden>
      {/* stem */}
      <path d="M32 4 Q29 12 32 20" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {/* leaf */}
      <path d="M33 8 Q44 0 50 8 Q42 16 33 10 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      {/* shiny body */}
      <path
        d="M32 22 C46 20 58 30 58 46 C58 62 46 74 32 74 C18 74 6 62 6 46 C6 30 18 20 32 22 Z"
        fill="#FF6B81"
        stroke="#3B2E5A"
        strokeWidth="5"
      />
      <ellipse cx="22" cy="38" rx="6" ry="10" fill="#FFFFFF" opacity="0.55" transform="rotate(-18 22 38)" />
      <circle cx="44" cy="34" r="2.5" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
}

function LeafSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 20 22" className={className} style={style} aria-hidden>
      <path d="M10 2 C16 7 16 13 10 20 C4 13 4 7 10 2 Z" fill="#7ED491" stroke="#3B2E5A" strokeWidth="2" />
      <path d="M10 5 L10 17" stroke="#3B2E5A" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SparkSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#FFD154" stroke="#E8A81C" strokeWidth="1.5" />
    </svg>
  );
}

export default function Level11({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [shakeCount, setShakeCount] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [leaves, setLeaves] = useState<{ show: boolean; key: number }>({ show: false, key: 0 });
  const [falling, setFalling] = useState(false);
  const [appleDown, setAppleDown] = useState(false);
  const [fallPx, setFallPx] = useState(160);
  const [bubble, setBubble] = useState<string | null>(null);

  const sceneRef = useRef<HTMLDivElement>(null);
  const appleRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef(0);
  const lastShakeRef = useRef(0);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leavesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
      if (leavesTimer.current) clearTimeout(leavesTimer.current);
    },
    []
  );

  const showBubble = useCallback((text: string) => {
    setBubble(text);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 1500);
  }, []);

  /* --- the trap: dragging the apple itself never works --- */
  const drag = useDragMove(
    useCallback(
      (d) => {
        if (solved || falling || appleDown) return;
        // eslint-disable-next-line react-hooks/immutability -- reset lives on the hook value declared below
        dragReset();
        if (Math.hypot(d.x, d.y) > 25) {
          showBubble(lang === "fa" ? "سیب محکم چسبیده!" : "The apple is stuck tight!");
          onMistake({
            fa: "سیب جا نمی‌خورد؛ شاید خود درخت...",
            en: "The apple won't budge; maybe the tree itself...",
          });
        }
      },
      [solved, falling, appleDown, lang, onMistake, showBubble]
    )
  );
  const dragReset = drag.reset;

  /* --- the solution: shake the whole tree (tap or drag) --- */
  const doShake = useCallback(() => {
    if (solved || falling || appleDown) return;
    const now = Date.now();
    if (now - lastShakeRef.current < 350) return;
    lastShakeRef.current = now;
    sfx.shake();
    shakeRef.current += 1;
    const n = shakeRef.current;
    setShakeCount(n);
    setShakeKey((k) => k + 1);
    setLeaves({ show: true, key: n });
    if (leavesTimer.current) clearTimeout(leavesTimer.current);
    leavesTimer.current = setTimeout(() => setLeaves((l) => ({ ...l, show: false })), 1200);
    if (n >= 3) {
      /* apple detaches: measure the drop to the grass line, then fall */
      const a = appleRef.current?.getBoundingClientRect();
      const sc = sceneRef.current?.getBoundingClientRect();
      if (a && sc) setFallPx(Math.max(90, sc.bottom - sc.height * 0.12 - a.bottom));
      setFalling(true);
      onProgress(1);
      sfx.pop();
      setTimeout(() => sfx.cheer(), 500);
      setTimeout(() => setAppleDown(true), 850);
      setTimeout(onSolved, 800);
    } else {
      onProgress(n / 3);
    }
  }, [solved, falling, appleDown, onProgress, onSolved]);

  /* tree drag/tap = one shake */
  const treeDrag = useDragMove(
    useCallback(
      () => {
        doShake();
        // eslint-disable-next-line react-hooks/immutability -- reset lives on the hook value declared below
        treeDragReset();
      },
      [doShake]
    )
  );
  const treeDragReset = treeDrag.reset;

  const shakeAnim = shakeKey > 0 && !appleDown ? "wobble 0.6s ease-in-out" : undefined;
  const appleAnim = shakeKey > 0 && !falling ? "wobble 0.6s ease-in-out" : undefined;
  const appleTilt = Math.max(-4, Math.min(4, treeDrag.x * 0.02));

  return (
    <Scene bg="linear-gradient(180deg,#BFF1F4 0%,#BFF1F4 58%,#CDEFE9 100%)">
      {/* measurable scene layer */}
      <div ref={sceneRef} className="pointer-events-none absolute inset-0" />

      {/* sun */}
      <div className="absolute left-[6%] top-[6%] w-[13%]" style={{ animation: "breathe 3s ease-in-out infinite" }}>
        <SunSvg className="h-auto w-full" />
      </div>

      {/* clouds */}
      <div className="absolute end-[5%] top-[8%] w-[20%] opacity-90">
        <CloudSvg className="h-auto w-full" />
      </div>
      <div className="absolute end-[24%] top-[24%] w-[13%] opacity-60">
        <CloudSvg className="h-auto w-full" />
      </div>

      {/* grass */}
      <svg viewBox="0 0 400 92" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full" style={{ height: "22%" }} aria-hidden>
        <path d="M0 34 Q100 6 200 30 T400 22 L400 92 L0 92 Z" fill="#7ED491" />
        <path d="M0 58 Q120 30 240 52 T400 46 L400 92 L0 92 Z" fill="#4CAF50" />
        <circle cx="52" cy="76" r="6" fill="#FF6B81" />
        <circle cx="330" cy="80" r="6" fill="#FFD154" />
        <circle cx="215" cy="84" r="5" fill="#FAFAFA" />
        <circle cx="110" cy="86" r="5" fill="#FF9F1C" />
      </svg>

      {/* speech bubble (tree talking) */}
      {bubble && (
        <div className="absolute left-1/2 top-[11%] z-30 -translate-x-1/2" style={{ animation: "pop-in 0.25s both" }}>
          <div
            className="relative whitespace-nowrap rounded-2xl border-[3px] border-[#3B2E5A] bg-white px-3.5 py-2 text-sm font-extrabold text-[#3B2E5A] shadow-[0_3px_0_rgba(59,46,90,0.25)]"
            dir={lang === "fa" ? "rtl" : "ltr"}
            role="status"
          >
            {bubble}
            <span
              className="absolute -bottom-[8px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-[#3B2E5A] bg-white"
              aria-hidden
            />
          </div>
        </div>
      )}

      {/* the tree: one big tappable/draggable element */}
      <div
        className={`absolute bottom-[14%] left-[22%] w-[56%] ${appleDown ? "" : "cursor-grab active:cursor-grabbing"}`}
        {...treeDrag.bind}
        role="button"
        tabIndex={0}
        aria-label={lang === "fa" ? "درخت را تکان بده" : "Shake the tree"}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            doShake();
          }
        }}
      >
        <Pulse active={hintPulse > 0 && !falling} className="rounded-[3rem]">
          <div
            style={{
              transform: `rotate(${appleTilt}deg)`,
              transformOrigin: "50% 96%",
              transition: treeDrag.dragging ? "none" : "transform 0.25s ease",
            }}
          >
            <div key={shakeKey} style={{ animation: shakeAnim, transformOrigin: "50% 96%" }}>
              <TreeSvg className="h-auto w-full drop-shadow-[0_6px_4px_rgba(59,46,90,0.18)]" />
            </div>
          </div>
        </Pulse>

        {/* fluttering leaves on each shake */}
        {leaves.show && (
          <div key={`leaves-${leaves.key}`} className="pointer-events-none absolute inset-x-0 top-[2%] z-20">
            <LeafSvg className="absolute left-[28%] top-0 w-[9%]" style={{ animation: "drop-fall 1s ease-in 0s both" }} />
            <LeafSvg className="absolute left-[52%] top-[2%] w-[8%]" style={{ animation: "drop-fall 1.1s ease-in 0.12s both" }} />
            <LeafSvg className="absolute left-[70%] top-[1%] w-[7%]" style={{ animation: "drop-fall 0.95s ease-in 0.22s both" }} />
          </div>
        )}
      </div>

      {/* shake progress dots */}
      <div className="absolute bottom-[5%] left-1/2 flex -translate-x-1/2 gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2.5 w-2.5 rounded-full border-2 border-[#3B2E5A]"
            style={{ background: i < shakeCount ? "#FFD154" : "#FAFAFA" }}
          />
        ))}
      </div>

      {/* the apple (trap): draggable but stuck to the tree */}
      <div ref={appleRef} className="absolute z-20 w-[15%]" style={{ left: "43%", top: "50%" }}>
        <div style={{ transform: `translate(${drag.x}px, ${drag.y}px)`, transition: drag.dragging ? "none" : "transform 0.3s ease" }}>
          <div key={shakeKey} style={{ animation: appleAnim, transformOrigin: "50% 0%" }}>
            <motion.div
              animate={falling ? { y: fallPx, rotate: 16, scale: appleDown ? [1, 1.25, 1] : 1 } : { y: 0, rotate: 0, scale: 1 }}
              transition={
                falling
                  ? {
                      y: { type: "spring", stiffness: 320, damping: 12 },
                      rotate: { duration: 0.7 },
                      scale: { duration: 0.45, times: [0, 0.5, 1] },
                    }
                  : { duration: 0.25 }
              }
            >
              <div {...(falling || appleDown ? {} : drag.bind)} className={falling || appleDown ? "" : "cursor-grab active:cursor-grabbing"}>
                <AppleSvg className="h-auto w-full drop-shadow-[0_3px_2px_rgba(59,46,90,0.25)]" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* sparkles when the apple lands */}
      {appleDown && (
        <>
          <div className="absolute z-30" style={{ left: "38%", top: "80%", animation: "pop-in 0.4s 0.1s both" }}>
            <SparkSvg className="h-5 w-5" />
          </div>
          <div className="absolute z-30" style={{ left: "58%", top: "76%", animation: "pop-in 0.4s 0.25s both" }}>
            <SparkSvg className="h-4 w-4" />
          </div>
        </>
      )}
    </Scene>
  );
}
