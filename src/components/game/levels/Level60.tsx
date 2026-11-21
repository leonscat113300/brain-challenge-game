"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 60 — Help the chick hatch: pull the TOP half of the egg up    */
/* and the BOTTOM half down (a two-finger split, made mouse-friendly). */
/* When both halves move apart, the chick pops out.                    */
/* ------------------------------------------------------------------ */

function TopHalfSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 96" className={className} aria-hidden>
      <path
        d="M12 92 L12 54 Q12 8 60 8 Q108 8 108 54 L108 92 L96 92 L92 80 L82 92 L72 82 L62 92 L52 82 L42 92 L32 80 L24 92 Z"
        fill="#FAFAFA"
        stroke="#3B2E5A"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <ellipse cx="40" cy="34" rx="7" ry="5" fill="#E0DAEE" />
      <ellipse cx="76" cy="24" rx="5" ry="4" fill="#E0DAEE" />
    </svg>
  );
}

function BottomHalfSvg({ peeking }: { peeking: boolean }) {
  return (
    <svg viewBox="0 0 120 96" className="h-auto w-full" aria-hidden>
      <path
        d="M12 6 L24 6 L32 16 L42 6 L52 16 L62 6 L72 16 L82 6 L92 16 L96 6 L108 6 L108 44 Q108 88 60 88 Q12 88 12 44 Z"
        fill="#FAFAFA"
        stroke="#3B2E5A"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <ellipse cx="36" cy="62" rx="7" ry="5" fill="#E0DAEE" />
      <ellipse cx="80" cy="52" rx="5" ry="4" fill="#E0DAEE" />
      {peeking && (
        <g>
          <circle cx="46" cy="30" r="7" fill="#3B2E5A" />
          <circle cx="74" cy="30" r="7" fill="#3B2E5A" />
          <circle cx="48" cy="28" r="2.2" fill="#fff" />
          <circle cx="76" cy="28" r="2.2" fill="#fff" />
        </g>
      )}
    </svg>
  );
}

function ChickSvg() {
  return (
    <svg viewBox="0 0 140 150" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.2)]" aria-hidden>
      {/* wings up */}
      <path d="M28 66 Q6 52 10 34 Q26 40 34 58 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M112 66 Q134 52 130 34 Q114 40 106 58 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* body */}
      <circle cx="70" cy="84" r="48" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
      {/* head tuft */}
      <path d="M62 36 Q66 24 72 34 Q78 22 82 34" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* eyes */}
      <circle cx="54" cy="74" r="7" fill="#3B2E5A" />
      <circle cx="86" cy="74" r="7" fill="#3B2E5A" />
      <circle cx="56.5" cy="71.5" r="2.4" fill="#fff" />
      <circle cx="88.5" cy="71.5" r="2.4" fill="#fff" />
      {/* beak */}
      <path d="M62 88 L78 88 L70 100 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      {/* cheeks */}
      <ellipse cx="44" cy="86" rx="5" ry="3.4" fill="#FF9FB2" />
      <ellipse cx="96" cy="86" rx="5" ry="3.4" fill="#FF9FB2" />
      {/* feet */}
      <path d="M56 132 L56 142 M64 132 L64 142 M76 132 L76 142 M84 132 L84 142" stroke="#FF6B81" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function HeartSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 21C7 16.5 2 12.8 2 8.5 2 5.5 4.5 3 7.5 3 9.2 3 11 4 12 5.5 13 4 14.8 3 16.5 3 19.5 3 22 5.5 22 8.5c0 4.3-5 8-10 12.5z"
        fill="#FF6B81"
        stroke="#3B2E5A"
        strokeWidth="1.5"
      />
    </svg>
  );
}

const NEEDED = 55;

export default function Level60({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [topOff, setTopOff] = useState(false);
  const [bottomOff, setBottomOff] = useState(false);
  const [opened, setOpened] = useState(false);
  const [done, setDone] = useState(false);
  const [wobble, setWobble] = useState(false);
  const topProgRef = useRef(false);
  const bottomProgRef = useRef(false);
  const wobbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      if (wobbleTimer.current) clearTimeout(wobbleTimer.current);
    };
  }, []);

  const wobbleEgg = useCallback(() => {
    setWobble(true);
    if (wobbleTimer.current) clearTimeout(wobbleTimer.current);
    wobbleTimer.current = setTimeout(() => setWobble(false), 500);
  }, []);

  const topDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => {
        if (solved || done || opened || topOff) return;
        if (d.y <= -NEEDED) {
          api.reset();
          setTopOff(true);
          sfx.click();
          if (!topProgRef.current) {
            topProgRef.current = true;
            onProgress(bottomProgRef.current ? 1 : 0.5);
          }
          return;
        }
        if (Math.hypot(d.x, d.y) < 8) {
          wobbleEgg();
          sfx.pop();
          onMistake({
            fa: "دو نیمهٔ تخم‌مرغ را از هم جدا کن!",
            en: "Pull the two egg halves apart!",
          });
          return;
        }
        api.reset();
      },
      [solved, done, opened, topOff, onProgress, onMistake, wobbleEgg]
    )
  );

  const bottomDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => {
        if (solved || done || opened || bottomOff) return;
        if (d.y >= NEEDED) {
          api.reset();
          setBottomOff(true);
          sfx.click();
          if (!bottomProgRef.current) {
            bottomProgRef.current = true;
            onProgress(topProgRef.current ? 1 : 0.5);
          }
          return;
        }
        if (Math.hypot(d.x, d.y) < 8) {
          wobbleEgg();
          sfx.pop();
          onMistake({
            fa: "دو نیمهٔ تخم‌مرغ را از هم جدا کن!",
            en: "Pull the two egg halves apart!",
          });
          return;
        }
        api.reset();
      },
      [solved, done, opened, bottomOff, onProgress, onMistake, wobbleEgg]
    )
  );

  const firstOff = useRef(false);
  useEffect(() => {
    if ((topOff || bottomOff) && !opened) {
      timers.current.push(
        setTimeout(() => {
          /* let the first half finish its slide, then check both */
          if (topOff && bottomOff && !opened && !done) {
            setOpened(true);
            setDone(true);
            sfx.boing();
            timers.current.push(setTimeout(() => sfx.cheer(), 350));
            onProgress(1);
            timers.current.push(setTimeout(onSolved, 1000));
          }
        }, 380)
      );
    }
  }, [topOff, bottomOff, opened, done, onProgress, onSolved]);

  return (
    <Scene bg="linear-gradient(180deg,#EAF7FB 0%,#DFF3F7 58%,#E7F3DF 59%,#DFF0D8 100%)">
      {/* nest */}
      <div className="absolute bottom-[8%] left-1/2 w-[58%] -translate-x-1/2" aria-hidden>
        <svg viewBox="0 0 240 70" className="h-auto w-full">
          <ellipse cx="120" cy="40" rx="104" ry="26" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="5" />
          <path d="M30 34 Q120 18 210 34" stroke="#8B5E34" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M24 48 Q120 32 216 48" stroke="#8B5E34" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M60 56 L110 48 M130 52 L180 56" stroke="#8B5E34" strokeWidth="5" strokeLinecap="round" />
        </svg>
      </div>

      {/* egg assembly */}
      <div
        className="absolute bottom-[16%] left-1/2 w-[30%] -translate-x-1/2"
        style={{ animation: wobble ? "shake-hard 0.5s ease-in-out" : undefined }}
      >
        {/* chick (hidden until opened) */}
        <div
          className="absolute left-1/2 top-[-38%] w-[112%] -translate-x-1/2"
          style={{
            zIndex: opened ? 26 : 8,
            opacity: opened ? 1 : 0,
            transform: opened ? "translate(-50%, -8%) scale(1)" : "translate(-50%, 12%) scale(0.6)",
            transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
          }}
        >
          <ChickSvg />
        </div>

        {/* top half */}
        <div
          className="relative w-full"
          style={{
            zIndex: topDrag.dragging ? 45 : 20,
            transform: topOff ? "translateY(-110px)" : `translate(${topDrag.x}px, ${topDrag.y}px)`,
            transition: topDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.3,0.64,1)",
          }}
        >
          <div
            {...(solved || done || opened || topOff ? {} : topDrag.bind)}
            role="button"
            aria-label={lang === "fa" ? "نیمهٔ بالای تخم‌مرغ" : "top egg half"}
            className={solved || done || opened || topOff ? "" : "cursor-grab active:cursor-grabbing"}
          >
            <TopHalfSvg className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" />
          </div>
        </div>

        {/* bottom half (slightly overlapped upward) */}
        <div
          className="relative -mt-[38%] w-full"
          style={{
            zIndex: bottomDrag.dragging ? 44 : 18,
            transform: bottomOff ? "translateY(110px)" : `translate(${bottomDrag.x}px, ${bottomDrag.y}px)`,
            transition: bottomDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.3,0.64,1)",
          }}
        >
          <div
            {...(solved || done || opened || bottomOff ? {} : bottomDrag.bind)}
            role="button"
            aria-label={lang === "fa" ? "نیمهٔ پایین تخم‌مرغ" : "bottom egg half"}
            className={solved || done || opened || bottomOff ? "" : "cursor-grab active:cursor-grabbing"}
          >
            <BottomHalfSvg peeking={!opened && !topOff} />
          </div>
        </div>

        {/* hint rings */}
        {hintPulse > 0 && !done && !opened && (
          <>
            <div className="pointer-events-none absolute -inset-2 animate-pulse-ring" style={{ border: "4px dashed #FFD154", borderRadius: 24 }} />
          </>
        )}
      </div>

      {/* hearts on hatch */}
      {opened &&
        [
          { l: "30%", t: "24%", d: 0 },
          { l: "64%", t: "18%", d: 0.3 },
          { l: "48%", t: "10%", d: 0.6 },
        ].map((h, i) => (
          <span
            key={`h-${i}`}
            className="absolute z-30"
            style={{ left: h.l, top: h.t, width: 22, height: 22, animation: `float-up 1.5s ${h.d}s ease-out infinite` }}
            aria-hidden
          >
            <HeartSvg className="h-full w-full" />
          </span>
        ))}
    </Scene>
  );
}
