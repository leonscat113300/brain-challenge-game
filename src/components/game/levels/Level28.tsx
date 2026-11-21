"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import { num } from "@/lib/game/utils";

/* ------------------------------------------------------------------ */
/* Level 28 — Hidden hedgehog: sweep the magnifying glass over the     */
/* bush and HOLD it over the camouflaged hedgehog to reveal it, then   */
/* tap it before it ducks back under the leaves.                       */
/* ------------------------------------------------------------------ */

function HedgehogSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 210 160" className={className} style={style} aria-hidden>
      {/* soft round body under the coat */}
      <ellipse cx="105" cy="106" rx="72" ry="40" fill="#D9A968" />
      {/* spike coat: staggered zigzag with varied spike lengths */}
      <path
        d="M56 116 L40 98 L58 94 L48 68 L68 78 L70 46 L88 64 L100 32 L112 60 L130 38 L134 66 L154 50 L152 78 L174 68 L166 92 L186 92 L172 108 L184 116 Z"
        fill="#7A8B5A"
        stroke="#4A5D33"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* lighter inner coat */}
      <path
        d="M74 108 L66 92 L80 96 L78 74 L92 86 L98 62 L108 84 L122 66 L126 90 L142 78 L138 98 L154 94 L142 110 Z"
        fill="#8FA06A"
        opacity="0.9"
      />
      {/* individual spike strokes */}
      <path
        d="M70 52 L72 70 M100 40 L102 62 M130 46 L132 70 M152 58 L152 80 M168 76 L162 94 M58 74 L64 88 M46 100 L56 106"
        stroke="#5C6E3C"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      {/* coat rim shadow on the body */}
      <path d="M62 110 Q104 96 168 108" stroke="#B98F55" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />

      {/* pointed face with snout */}
      <path d="M66 92 Q36 94 24 112 Q36 130 68 128 Z" fill="#E9C99B" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      {/* little round ear */}
      <circle cx="68" cy="94" r="8" fill="#D9A968" stroke="#3B2E5A" strokeWidth="3.4" />
      <circle cx="68" cy="94" r="3.5" fill="#B98F55" />
      {/* shiny black nose at the tip */}
      <circle cx="26" cy="112" r="10" fill="#3B2E5A" />
      <circle cx="22.5" cy="108.5" r="3" fill="#FAFAFA" opacity="0.85" />
      {/* big cute eye with highlight */}
      <circle cx="54" cy="106" r="7.5" fill="#3B2E5A" />
      <circle cx="56.5" cy="103.5" r="2.6" fill="#FAFAFA" />
      <circle cx="52" cy="109" r="1.4" fill="#FAFAFA" opacity="0.8" />
      {/* brow */}
      <path d="M44 94 Q54 90 64 95" stroke="#8B5E3C" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* mouth + blush */}
      <path d="M42 120 Q49 125 56 120" stroke="#3B2E5A" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <ellipse cx="62" cy="121" rx="6" ry="4" fill="#FF9FB2" opacity="0.85" />
      {/* belly line */}
      <path d="M70 132 Q110 144 148 130" stroke="#C9A468" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* tiny rounded feet with toes */}
      <ellipse cx="62" cy="142" rx="12" ry="7" fill="#E9C99B" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="96" cy="145" rx="12" ry="7" fill="#E9C99B" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="130" cy="142" rx="12" ry="7" fill="#D9B98B" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M56 141 l2 3 M62 142 l2 3 M90 144 l2 3 M96 145 l2 3 M124 141 l2 3 M130 142 l2 3" stroke="#3B2E5A" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function BushSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 640 400" className={className} style={style} aria-hidden>
      <ellipse cx="150" cy="300" rx="185" ry="125" fill="#3E8E41" stroke="#2E6B31" strokeWidth="6" />
      <ellipse cx="470" cy="290" rx="200" ry="140" fill="#4CAF50" stroke="#2E6B31" strokeWidth="6" />
      <ellipse cx="310" cy="190" rx="190" ry="125" fill="#5CB860" stroke="#2E6B31" strokeWidth="6" />
      {/* leaf veins */}
      <path d="M240 150 q20 14 12 34 M300 120 q18 16 10 36 M380 160 q16 14 8 32" stroke="#2E6B31" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M120 260 q18 12 10 30 M200 230 q16 12 8 28 M480 230 q16 12 8 28 M545 268 q14 12 8 26" stroke="#2E6B31" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* berries + flower */}
      <circle cx="92" cy="222" r="9" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" />
      <circle cx="574" cy="212" r="9" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" />
      <circle cx="330" cy="92" r="10" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
      <circle cx="330" cy="92" r="4" fill="#FAFAFA" />
    </svg>
  );
}

function StarBurst({ delay, className }: { delay: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ animation: `star-pop 0.5s ${delay} ease-out both` }} aria-hidden>
      <path d="M12 2 L14.5 9.5 L22 12 L14.5 14.5 L12 22 L9.5 14.5 L2 12 L9.5 9.5 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.5" />
    </svg>
  );
}

export default function Level28({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [found, setFound] = useState(false);
  const [out, setOut] = useState(false);
  const [done, setDone] = useState(false);
  const [leafTaps, setLeafTaps] = useState(0);
  const [rustle, setRustle] = useState(0);
  const lensRef = useRef<HTMLDivElement>(null);
  const hogRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);

  const drag = useDragMove();

  /* HARDER: the lens must be held over the hedgehog for a short moment
     (not just swept past) and the reveal radius is small */
  const REVEAL_RADIUS = 56;
  const DWELL_MS = 450;
  /** once revealed, the hedgehog ducks back under the leaves if not tapped fast */
  const HIDE_MS = 3000;
  const enterRef = useRef(0);

  const clearHide = () => {
    if (hideTimer.current !== null) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };
  useEffect(() => clearHide, []);

  const reveal = useCallback(() => {
    setFound(true);
    sfx.sparkle();
    onProgress(0.6);
    clearHide();
    hideTimer.current = window.setTimeout(() => {
      /* it ducks back — no life lost, but the player must re-reveal & tap fast */
      setFound(false);
      enterRef.current = 0;
      sfx.whoosh();
    }, HIDE_MS);
  }, [onProgress]);

  /* watch the lens centre: holding it near the hidden hedgehog reveals it.
     A timer-based watcher makes the dwell work even while holding still. */
  const checkReveal = useCallback(() => {
    if (found || done || solved) return;
    const lens = lensRef.current?.getBoundingClientRect();
    const hog = hogRef.current?.getBoundingClientRect();
    if (!lens || !hog) return;
    const dist = Math.hypot(
      lens.left + lens.width / 2 - (hog.left + hog.width / 2),
      lens.top + lens.height / 2 - (hog.top + hog.height / 2)
    );
    const now = performance.now();
    if (dist < REVEAL_RADIUS) {
      if (!enterRef.current) enterRef.current = now;
      else if (now - enterRef.current >= DWELL_MS) {
        enterRef.current = 0;
        reveal();
      }
    } else {
      enterRef.current = 0;
    }
  }, [found, done, solved, reveal]);

  const checkRevealRef = useRef(checkReveal);
  useEffect(() => {
    checkRevealRef.current = checkReveal;
  });

  const dwellInterval = useRef<number | null>(null);
  const startDwell = useCallback(() => {
    if (dwellInterval.current !== null) return;
    checkRevealRef.current();
    dwellInterval.current = window.setInterval(() => checkRevealRef.current(), 110);
  }, []);
  const stopDwell = useCallback(() => {
    if (dwellInterval.current !== null) {
      window.clearInterval(dwellInterval.current);
      dwellInterval.current = null;
    }
    enterRef.current = 0;
  }, []);
  useEffect(() => stopDwell, []);

  const lensBind = {
    onPointerDown: (e: React.PointerEvent) => {
      drag.bind.onPointerDown(e);
      startDwell();
    },
    onPointerMove: (e: React.PointerEvent) => {
      drag.bind.onPointerMove(e);
      checkReveal();
    },
    onPointerUp: () => {
      drag.bind.onPointerUp();
      stopDwell();
    },
    onPointerCancel: () => {
      drag.bind.onPointerCancel();
      stopDwell();
    },
    style: drag.bind.style,
  };

  const tapHog = () => {
    if (solved || done) return;
    if (!found) {
      sfx.pop();
      return;
    }
    clearHide();
    setOut(true);
    setDone(true);
    sfx.cheer();
    onProgress(1);
    setTimeout(onSolved, 700);
  };

  const tapLeaf = () => {
    if (solved || done || found) return;
    sfx.pop();
    setRustle((r) => r + 1);
    const n = leafTaps + 1;
    setLeafTaps(n >= 2 ? 0 : n);
    if (n >= 2) onMistake({ fa: "با ذره‌بین بگرد!", en: "Search with the magnifier!" });
  };

  return (
    <Scene bg="linear-gradient(180deg,#EAF6FF 0%,#E9F7EA 100%)">
      {/* decor cloud */}
      <div className="absolute top-[5%] end-[6%] w-[18%] z-[2] opacity-90" aria-hidden>
        <svg viewBox="0 0 260 170" className="w-full h-auto">
          <path d="M62 128 a36 36 0 0 1 4 -71 a46 46 0 0 1 86 -18 a40 40 0 0 1 58 34 a32 32 0 0 1 -10 55 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="6" strokeLinejoin="round" />
        </svg>
      </div>

      {/* lush bush (rustles when tapped) */}
      <div
        className="absolute inset-x-[2%] bottom-0 h-[84%] z-[5] cursor-pointer"
        onClick={tapLeaf}
        role="button"
        aria-label={lang === "fa" ? "بوته" : "bush"}
      >
        <div key={rustle} className="h-full w-full" style={{ animation: rustle > 0 ? "wobble 0.45s ease-in-out" : undefined }}>
          <BushSvg className="h-full w-full" />
        </div>
      </div>

      {/* camouflaged hedgehog: nearly invisible until the lens finds it */}
      <div
        ref={hogRef}
        className="absolute start-[46%] bottom-[16%] w-[38%] z-[15]"
        style={{
          opacity: found ? 1 : 0.12,
          transition: "opacity 0.6s ease",
          cursor: found ? "pointer" : "default",
        }}
        onClick={tapHog}
      >
        <motion.div animate={out ? { y: -46 } : { y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 12 }}>
          <Pulse active={hintPulse > 0 && found && !done}>
            <HedgehogSvg
              className="w-full h-auto"
              style={{
                animation: found ? "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both" : undefined,
                filter: found ? "drop-shadow(0 4px 6px rgba(59,46,90,0.3))" : undefined,
              }}
            />
          </Pulse>
        </motion.div>
        {out && (
          <>
            <StarBurst delay="0s" className="absolute -top-4 start-2 w-7 h-7" />
            <StarBurst delay="0.12s" className="absolute top-8 -start-6 w-5 h-5" />
            <StarBurst delay="0.24s" className="absolute -top-8 end-2 w-6 h-6" />
          </>
        )}
      </div>

      {/* draggable magnifying glass — redrawn: gold rim, glassy lens, wooden handle */}
      <div
        className="absolute bottom-[10%] start-[4%] w-[38%] z-[30]"
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px)${drag.dragging ? " scale(1.05)" : ""}`,
          transition: drag.dragging ? "none" : "transform 0.3s ease",
          pointerEvents: found ? "none" : "auto",
        }}
      >
        <Pulse active={hintPulse > 0 && !found && !done}>
          <div {...(found ? {} : lensBind)} className="relative cursor-grab active:cursor-grabbing">
            {/* wooden handle behind the lens */}
            <div
              className="absolute start-[52%] top-[52%] h-[12%] w-[52%] rotate-45 rounded-full border-4 border-[#3B2E5A]"
              style={{ background: "linear-gradient(180deg,#A9773F 0%,#8B5E3C 55%,#6E4526 100%)" }}
              aria-hidden
            />
            <div className="absolute start-[56%] top-[58%] h-[2%] w-[40%] rotate-45 rounded-full bg-[#6E4526]/70" aria-hidden />
            {/* brass ferrule between lens and handle */}
            <div className="absolute start-[50%] top-[50%] h-[17%] w-[17%] rotate-45 rounded-md border-[3.5px] border-[#3B2E5A] bg-[#E8A81C]" aria-hidden />
            <div className="absolute start-[53%] top-[47%] h-[4%] w-[7%] rotate-45 rounded-full bg-[#FAFAFA]/70" aria-hidden />
            {/* gold outer ring */}
            <div
              className="absolute start-[-2%] top-[-2%] w-[66%] aspect-square rounded-full border-[5px] border-[#3B2E5A] bg-[#E8A81C]"
              aria-hidden
            />
            {/* glass lens */}
            <div
              ref={lensRef}
              className="relative w-[62%] aspect-square rounded-full border-[7px] border-[#3B2E5A] overflow-hidden"
              style={{ background: "radial-gradient(circle at 35% 28%, rgba(255,255,255,0.75), rgba(255,255,255,0.25) 38%, rgba(150,205,240,0.28) 78%, rgba(90,160,215,0.34) 100%)" }}
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
                <path d="M22 40 Q30 20 52 18" stroke="#FAFAFA" strokeWidth="6.5" fill="none" strokeLinecap="round" opacity="0.9" />
                <path d="M28 58 Q34 46 46 40" stroke="#FAFAFA" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.55" />
                <circle cx="70" cy="66" r="2.5" fill="#FAFAFA" opacity="0.7" />
                <circle cx="76" cy="58" r="1.6" fill="#FAFAFA" opacity="0.6" />
              </svg>
              <div className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 0 4px rgba(255,255,255,0.4), inset 0 -6px 12px rgba(90,160,215,0.25)" }} aria-hidden />
            </div>
          </div>
        </Pulse>
      </div>

      {/* leaf tap counter */}
      {leafTaps > 0 && (
        <div className="absolute top-[3%] start-[3%] z-[35] rounded-full border-[3px] border-[#3B2E5A] bg-[#FAFAFA]/90 px-3 py-1 text-sm font-extrabold text-[#3B2E5A]">
          {num(leafTaps, lang)} / {num(2, lang)}
        </div>
      )}
    </Scene>
  );
}
