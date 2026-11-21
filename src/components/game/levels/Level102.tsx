"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 102 — The giraffe can't reach the top leaf: grab the branch   */
/* and pull it down until the leaf reaches the giraffe's mouth.        */
/* ------------------------------------------------------------------ */

const PULL_MAX = 150; // px of pull needed

function GiraffeSvg({ eating, mouthOpen }: { eating: boolean; mouthOpen: boolean }) {
  return (
    <svg viewBox="0 0 140 190" className="h-auto w-full" aria-hidden>
      {/* body */}
      <ellipse cx="52" cy="150" rx="36" ry="26" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* legs */}
      <rect x="28" y="164" width="12" height="24" rx="5" fill="#FFC93C" stroke="#3B2E5A" strokeWidth="3.6" />
      <rect x="62" y="164" width="12" height="24" rx="5" fill="#FFC93C" stroke="#3B2E5A" strokeWidth="3.6" />
      {/* neck stretched up-left */}
      <path d="M44 132 Q26 92 22 46" fill="none" stroke="#FFD154" strokeWidth="24" strokeLinecap="round" />
      <path d="M44 132 Q26 92 22 46" fill="none" stroke="#3B2E5A" strokeWidth="28" strokeLinecap="round" opacity="0" />
      {/* neck outline trick: draw two outlines */}
      <path d="M34.5 130 Q17 90 13.5 46" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
      <path d="M53.5 134 Q36 94 30.5 46" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" opacity="0.95" />
      {/* spots */}
      <circle cx="42" cy="112" r="6" fill="#E89B2E" />
      <circle cx="32" cy="86" r="6" fill="#E89B2E" />
      <circle cx="27" cy="62" r="5.4" fill="#E89B2E" />
      <circle cx="56" cy="140" r="7" fill="#E89B2E" />
      {/* head at top of neck */}
      <g transform="translate(14,30)">
        {/* ossicones */}
        <path d="M6 -8 L4 -20 M16 -8 L18 -20" stroke="#3B2E5A" strokeWidth="4.4" strokeLinecap="round" />
        <circle cx="4" cy="-22" r="4.4" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.6" />
        <circle cx="18" cy="-22" r="4.4" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.6" />
        {/* ears */}
        <ellipse cx="-8" cy="-2" rx="7" ry="4.4" fill="#FFC93C" stroke="#3B2E5A" strokeWidth="2.8" transform="rotate(-30 -8 -2)" />
        {/* head */}
        <ellipse cx="12" cy="8" rx="15" ry="12" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
        {/* eye */}
        <circle cx="8" cy="5" r="4.6" fill="#3B2E5A" />
        <circle cx="9.4" cy="3.6" r="1.5" fill="#FAFAFA" />
        {/* mouth */}
        {eating ? (
          <>
            <path d="M10 16 Q16 22 22 15" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
            <circle cx="24" cy="14" r="4" fill="#4CAF50" style={{ animation: "breathe 0.6s ease-in-out infinite" }} />
          </>
        ) : mouthOpen ? (
          <ellipse cx="17" cy="16" rx="6" ry="5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.6" />
        ) : (
          <path d="M12 15 Q17 18 22 14" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
        )}
      </g>
      {/* tail */}
      <path d="M88 148 Q104 144 102 128" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      <circle cx="102" cy="126" r="4.4" fill="#E89B2E" stroke="#3B2E5A" strokeWidth="2.4" />
    </svg>
  );
}

export default function Level102({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [pulled, setPulled] = useState(0); // 0..1
  const [eating, setEating] = useState(false);
  const pulledRef = useRef(0);
  const branchRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const branchDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || eating) return;
        if (!d.everMoved) {
          sfx.click();
          api.reset();
          setPulled(0);
          pulledRef.current = 0;
          return;
        }
        const down = Math.max(0, d.y);
        const frac = Math.min(1, down / PULL_MAX);
        setPulled(frac);
        pulledRef.current = frac;
        onProgress(frac * 0.9);
        if (frac >= 1) {
          api.reset();
          setEating(true);
          sfx.pop();
          timers.current.push(setTimeout(() => sfx.coin(), 350));
          timers.current.push(setTimeout(() => sfx.sparkle(), 700));
          timers.current.push(setTimeout(() => sfx.cheer(), 1200));
          timers.current.push(setTimeout(onSolved, 2100));
          return;
        }
        /* released too early: spring back */
        api.reset();
        setPulled(0);
        pulledRef.current = 0;
        if (frac > 0.15) {
          sfx.boing();
          onMistake({
            fa: "نزدیک بود! شاخه را تا پایینِ دهان زرافه بکش.",
            en: "So close! Pull the branch all the way to the giraffe's mouth.",
          });
        }
      },
      [solved, eating, onProgress, onMistake, onSolved]
    )
  );

  const tapGiraffe = useCallback(() => {
    if (solved || eating) return;
    onMistake({
      fa: "گردن زرافه به آن بالا نمی‌رسد! شاخه را پایین بکش.",
      en: "The giraffe's neck can't reach! Pull the branch down.",
    });
  }, [solved, eating, onMistake]);

  const dy = pulled * PULL_MAX;

  return (
    <Scene bg="linear-gradient(180deg,#D8F3FA 0%,#E6F7EC 44%,#A8DF9C 46%,#8FCF84 62%,#7ABE6F 100%)">
      {/* clouds */}
      <div className="pointer-events-none absolute left-[6%] top-[6%] w-[24%]" aria-hidden>
        <svg viewBox="0 0 90 40">
          <ellipse cx="45" cy="24" rx="34" ry="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>
      <div className="pointer-events-none absolute right-[10%] top-[12%] w-[18%]" aria-hidden>
        <svg viewBox="0 0 90 40">
          <ellipse cx="45" cy="24" rx="34" ry="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>

      {/* tree trunk */}
      <div className="absolute bottom-0 right-[16%] top-0 w-[30%]" aria-hidden>
        <svg viewBox="0 0 120 300" className="h-full w-full" preserveAspectRatio="none">
          {/* crown */}
          <ellipse cx="60" cy="52" rx="96" ry="44" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="5" />
          <ellipse cx="30" cy="72" rx="52" ry="30" fill="#5CB85C" stroke="#3B2E5A" strokeWidth="5" />
          <ellipse cx="92" cy="76" rx="50" ry="28" fill="#57B257" stroke="#3B2E5A" strokeWidth="5" />
          {/* trunk */}
          <path d="M42 130 Q48 200 40 300 M78 130 Q72 200 80 300 L104 300 Q92 200 100 130 Q80 118 42 130 Z" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
          <path d="M60 180 Q70 210 62 250" fill="none" stroke="#A96F35" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>

      {/* the pullable branch (drag down) */}
      <div
        ref={branchRef}
        {...branchDrag.bind}
        role="button"
        aria-label={lang === "fa" ? "شاخهٔ درخت" : "tree branch"}
        className="absolute right-[20%] top-[24%] z-10 w-[26%] cursor-grab active:cursor-grabbing"
        style={{
          transform: `translateY(${dy}px)`,
          transition: branchDrag.dragging ? "none" : "transform 0.5s cubic-bezier(0.34,1.6,0.64,1)",
        }}
      >
        <Pulse active={hintPulse > 0 && !eating}>
          <svg viewBox="0 0 150 80" className="h-auto w-full" aria-hidden>
            {/* branch */}
            <path d="M8 14 Q70 22 128 44" fill="none" stroke="#3B2E5A" strokeWidth="14" strokeLinecap="round" />
            <path d="M8 14 Q70 22 128 44" fill="none" stroke="#C98A4B" strokeWidth="7" strokeLinecap="round" />
            {/* juicy leaf at the tip */}
            <g transform="translate(128,44)">
              <path d="M0 0 Q-6 -22 10 -28 Q26 -22 16 -2 Q10 8 0 0 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
              <path d="M4 -4 Q12 -14 18 -24" fill="none" stroke="#3B2E5A" strokeWidth="2.6" strokeLinecap="round" />
            </g>
            {/* small twig leaves */}
            <path d="M52 22 Q48 8 58 6 Q64 12 56 24" fill="#57B257" stroke="#3B2E5A" strokeWidth="3" />
            <path d="M86 30 Q84 16 94 15 Q99 22 90 32" fill="#57B257" stroke="#3B2E5A" strokeWidth="3" />
          </svg>
        </Pulse>
        {/* pull arrow hint */}
        {!eating && pulled < 0.1 && (
          <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2" aria-hidden>
            <svg viewBox="0 0 30 40" className="w-6" style={{ animation: "drop-fall 1.1s ease-in infinite" }}>
              <path d="M15 4 V28 M6 20 L15 32 L24 20" fill="none" stroke="#3B2E5A" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* giraffe */}
      <div className="absolute bottom-[4%] right-[6%] w-[36%]">
        <button
          type="button"
          onClick={tapGiraffe}
          aria-label={lang === "fa" ? "زرافه" : "giraffe"}
          className="block w-full cursor-pointer"
          style={{ transform: "scaleX(-1)" }}
        >
          <div ref={mouthRef} style={{ animation: eating ? "breathe 0.9s ease-in-out infinite" : "breathe 2.6s ease-in-out infinite" }}>
            <GiraffeSvg eating={eating} mouthOpen={!eating && pulled > 0.62} />
          </div>
        </button>
      </div>

      {/* success hearts */}
      {eating &&
        [
          { l: "62%", t: "34%" },
          { l: "72%", t: "26%" },
        ].map((p, i) => (
          <div key={i} className="pointer-events-none absolute" style={{ left: p.l, top: p.t, animation: `float-up 1.4s ${i * 0.25}s ease-out infinite` }} aria-hidden>
            <svg viewBox="0 0 24 24" className="w-6">
              <path d="M12 21 Q3 14 3 8 Q3 3 8 3 Q11 3 12 6 Q13 3 16 3 Q21 3 21 8 Q21 14 12 21 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2" />
            </svg>
          </div>
        ))}
    </Scene>
  );
}
