"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 102 — The giraffe can't reach the top leaf: grab the branch   */
/* and pull it down until the leaf reaches the giraffe's mouth.        */
/* The needed pull distance is measured from the real mouth position,  */
/* so the leaf always lands exactly in the mouth on every screen size. */
/* ------------------------------------------------------------------ */

function GiraffeSvg({
  eating,
  mouthOpen,
  mouthRef,
}: {
  eating: boolean;
  mouthOpen: boolean;
  mouthRef: React.Ref<SVGCircleElement>;
}) {
  return (
    <svg viewBox="0 0 160 200" className="h-auto w-full" aria-hidden>
      {/* tail */}
      <path d="M142 148 Q158 142 154 124" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      <circle cx="154" cy="121" r="4.5" fill="#E89B2E" stroke="#3B2E5A" strokeWidth="2.4" />
      {/* far legs */}
      <rect x="80" y="170" width="11" height="26" rx="5" fill="#E8B23C" stroke="#3B2E5A" strokeWidth="3.4" />
      <rect x="122" y="170" width="11" height="26" rx="5" fill="#E8B23C" stroke="#3B2E5A" strokeWidth="3.4" />
      {/* body */}
      <ellipse cx="106" cy="150" rx="42" ry="30" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* near legs */}
      <rect x="92" y="176" width="12" height="22" rx="5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.6" />
      <rect x="128" y="176" width="12" height="22" rx="5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.6" />
      {/* neck rising up-left toward the branch */}
      <path d="M86 132 Q62 110 56 58" fill="none" stroke="#3B2E5A" strokeWidth="30" strokeLinecap="round" />
      <path d="M86 132 Q62 110 56 58" fill="none" stroke="#FFD154" strokeWidth="24" strokeLinecap="round" />
      {/* mane along the back of the neck */}
      <path d="M70 122 Q58 102 50 70" fill="none" stroke="#C98A4B" strokeWidth="6" strokeLinecap="round" opacity="0.9" />
      {/* patches */}
      <circle cx="80" cy="118" r="7" fill="#E89B2E" />
      <circle cx="68" cy="96" r="6" fill="#E89B2E" />
      <circle cx="61" cy="78" r="5" fill="#E89B2E" />
      <circle cx="96" cy="140" r="8" fill="#E89B2E" />
      <circle cx="118" cy="148" r="7" fill="#E89B2E" />
      {/* head with muzzle pointing down-left */}
      <path d="M42 26 L40 14 M56 24 L58 12" stroke="#3B2E5A" strokeWidth="4.4" strokeLinecap="round" />
      <circle cx="40" cy="12" r="4.4" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.6" />
      <circle cx="58" cy="10" r="4.4" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.6" />
      <ellipse cx="66" cy="34" rx="8" ry="4.6" fill="#FFC93C" stroke="#3B2E5A" strokeWidth="2.8" transform="rotate(24 66 34)" />
      <ellipse cx="50" cy="40" rx="18" ry="14" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      <ellipse cx="38" cy="48" rx="10" ry="8" fill="#FFC93C" stroke="#3B2E5A" strokeWidth="3.6" />
      <circle cx="33" cy="46" r="1.8" fill="#3B2E5A" />
      <circle cx="52" cy="36" r="4.6" fill="#3B2E5A" />
      <circle cx="53.6" cy="34.4" r="1.5" fill="#FAFAFA" />
      {/* mouth */}
      {eating ? (
        <>
          <path d="M32 56 Q40 62 48 56" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
          <circle cx="28" cy="52" r="4" fill="#4CAF50" style={{ animation: "breathe 0.6s ease-in-out infinite" }} />
        </>
      ) : mouthOpen ? (
        <ellipse cx="36" cy="56" rx="6" ry="5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.6" />
      ) : (
        <path d="M32 55 Q38 58 44 55" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
      )}
      {/* invisible exact mouth target point (measured for leaf alignment) */}
      <circle ref={mouthRef} cx="38" cy="56" r="0.1" fill="none" />
    </svg>
  );
}

export default function Level102({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [pulled, setPulled] = useState(0); // 0..1
  const [eating, setEating] = useState(false);
  /* needed pull distance (px) — measured so the leaf lands in the mouth */
  const [pullNeed, setPullNeed] = useState(160);
  const pulledRef = useRef(0);
  const branchRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<SVGCircleElement>(null);
  const tipRef = useRef<SVGGElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* measure how far the leaf must travel to reach the mouth */
  useEffect(() => {
    const measure = () => {
      const m = mouthRef.current?.getBoundingClientRect();
      const t = tipRef.current?.getBoundingClientRect();
      if (!m || !t) return;
      const need = m.top + m.height / 2 - (t.top + t.height / 2);
      setPullNeed(Math.max(120, Math.min(240, need)));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

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
        const frac = Math.min(1, down / pullNeed);
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
      [solved, eating, pullNeed, onProgress, onMistake, onSolved]
    )
  );

  const tapGiraffe = useCallback(() => {
    if (solved || eating) return;
    onMistake({
      fa: "گردن زرافه به آن بالا نمی‌رسد! شاخه را پایین بکش.",
      en: "The giraffe's neck can't reach! Pull the branch down.",
    });
  }, [solved, eating, onMistake]);

  const dy = pulled * pullNeed;

  return (
    <Scene bg="linear-gradient(180deg,#D8F3FA 0%,#E6F7EC 44%,#A8DF9C 46%,#8FCF84 62%,#7ABE6F 100%)">
      {/* clouds */}
      <div className="pointer-events-none absolute left-[6%] top-[6%] w-[24%]" aria-hidden>
        <svg viewBox="0 0 90 40">
          <ellipse cx="45" cy="24" rx="34" ry="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>
      <div className="pointer-events-none absolute right-[10%] top-[10%] w-[18%]" aria-hidden>
        <svg viewBox="0 0 90 40">
          <ellipse cx="45" cy="24" rx="34" ry="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>

      {/* tree: curved trunk with bark texture + rounded layered crown */}
      <div className="absolute bottom-0 right-[10%] top-0 w-[36%]" aria-hidden>
        <svg viewBox="0 0 140 320" className="h-full w-full" preserveAspectRatio="none">
          {/* rounded crown blobs — kept inside the viewBox so the silhouette stays curved */}
          <ellipse cx="70" cy="30" rx="60" ry="25" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="5" />
          <ellipse cx="34" cy="48" rx="30" ry="17" fill="#5CB85C" stroke="#3B2E5A" strokeWidth="4" />
          <ellipse cx="104" cy="46" rx="32" ry="18" fill="#57B257" stroke="#3B2E5A" strokeWidth="4" />
          <ellipse cx="66" cy="58" rx="40" ry="18" fill="#6BC36B" stroke="#3B2E5A" strokeWidth="4" />
          {/* small lower leaves near the branch line */}
          <ellipse cx="22" cy="76" rx="20" ry="11" fill="#5CB85C" stroke="#3B2E5A" strokeWidth="4" />
          <ellipse cx="116" cy="74" rx="20" ry="11" fill="#5CB85C" stroke="#3B2E5A" strokeWidth="4" />
          {/* trunk with roots */}
          <path d="M56 78 Q62 200 50 320 L92 320 Q82 200 88 78 Q72 68 56 78 Z" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
          <path d="M64 180 Q72 210 66 250 M74 160 Q80 190 76 224" fill="none" stroke="#A96F35" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="72" cy="150" rx="8" ry="11" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="3.4" />
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
            {/* woody branch */}
            <path d="M8 14 Q70 22 128 44" fill="none" stroke="#3B2E5A" strokeWidth="14" strokeLinecap="round" />
            <path d="M8 14 Q70 22 128 44" fill="none" stroke="#C98A4B" strokeWidth="7" strokeLinecap="round" />
            <path d="M40 19 L74 25 M88 30 L112 37" stroke="#A96F35" strokeWidth="2.6" strokeLinecap="round" />
            {/* juicy leaf at the tip (measured for alignment) */}
            <g ref={tipRef} transform="translate(128,44)">
              <path d="M0 0 Q-6 -22 10 -28 Q26 -22 16 -2 Q10 8 0 0 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
              <path d="M4 -4 Q12 -14 18 -24" fill="none" stroke="#3B2E5A" strokeWidth="2.6" strokeLinecap="round" />
            </g>
            {/* small twig leaves */}
            <path d="M52 22 Q48 8 58 6 Q64 12 56 24" fill="#57B257" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
            <path d="M86 30 Q84 16 94 15 Q99 22 90 32" fill="#57B257" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
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

      {/* giraffe — faces the branch, mouth is the measured target */}
      <div className="absolute bottom-[10%] right-0 w-[35%]">
        <button
          type="button"
          onClick={tapGiraffe}
          aria-label={lang === "fa" ? "زرافه" : "giraffe"}
          className="block w-full cursor-pointer"
        >
          <div style={{ animation: eating ? "breathe 0.9s ease-in-out infinite" : "breathe 2.6s ease-in-out infinite" }}>
            <GiraffeSvg eating={eating} mouthOpen={!eating && pulled > 0.62} mouthRef={mouthRef} />
          </div>
        </button>
      </div>

      {/* success hearts near the mouth */}
      {eating &&
        [
          { l: "64%", t: "56%" },
          { l: "78%", t: "46%" },
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
