"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import { num } from "@/lib/game/utils";

/* ------------------------------------------------------------------ */
/* Level 28 — Hidden hedgehog: sweep the magnifying glass over the     */
/* bush to reveal the camouflaged hedgehog, then tap it to pop out.    */
/* ------------------------------------------------------------------ */

function HedgehogSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 150" className={className} style={style} aria-hidden>
      {/* back spike coat — two staggered rows of spikes */}
      <path
        d="M28 108 L16 84 L34 90 L30 62 L50 74 L56 46 L74 64 L86 38 L98 60 L112 38 L122 62 L140 46 L144 70 L162 60 L158 86 L180 82 L170 108 Z"
        fill="#7A8B5A"
        stroke="#4A5D33"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* lighter inner coat */}
      <path
        d="M48 96 L44 78 L58 86 L62 66 L76 78 L86 58 L98 76 L112 58 L120 78 L134 66 L136 88 L152 82 L144 100 Z"
        fill="#8FA06A"
        opacity="0.85"
      />
      {/* spike tip strokes */}
      <path d="M62 66 L66 74 M86 58 L90 68 M112 58 L116 68 M136 66 L140 76" stroke="#5C6E3C" strokeWidth="3.4" strokeLinecap="round" />
      {/* pointed face with snout */}
      <path d="M52 88 Q26 92 16 108 Q28 124 56 122 Z" fill="#E9C99B" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      {/* little round ear */}
      <circle cx="54" cy="92" r="7" fill="#D9A968" stroke="#3B2E5A" strokeWidth="3" />
      {/* shiny black nose at the tip */}
      <circle cx="17" cy="107" r="9" fill="#3B2E5A" />
      <circle cx="14" cy="104" r="2.6" fill="#FAFAFA" opacity="0.8" />
      {/* eye */}
      <circle cx="42" cy="102" r="6" fill="#3B2E5A" />
      <circle cx="44" cy="100" r="2" fill="#FAFAFA" />
      {/* mouth + blush */}
      <path d="M34 114 Q40 118 46 114" stroke="#3B2E5A" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <ellipse cx="52" cy="116" rx="5.4" ry="3.6" fill="#FF9FB2" opacity="0.85" />
      {/* belly line */}
      <path d="M56 122 Q96 134 138 122" stroke="#C9A468" strokeWidth="3.4" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* feet */}
      <ellipse cx="52" cy="134" rx="11" ry="6.5" fill="#E9C99B" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="88" cy="136" rx="11" ry="6.5" fill="#E9C99B" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="124" cy="134" rx="11" ry="6.5" fill="#D9B98B" stroke="#3B2E5A" strokeWidth="4" />
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

  const drag = useDragMove();

  /* HARDER: the lens must be held over the hedgehog for a short moment
     (not just swept past) and the reveal radius is small */
  const REVEAL_RADIUS = 58;
  const DWELL_MS = 450;
  const enterRef = useRef(0);

  /* watch the lens centre: hold it near the hidden hedgehog to reveal it */
  const checkReveal = useCallback(
    (e: React.PointerEvent) => {
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
          setFound(true);
          sfx.sparkle();
          onProgress(0.6);
        }
      } else {
        enterRef.current = 0;
      }
      void e;
    },
    [found, done, solved, onProgress]
  );

  const lensBind = {
    onPointerDown: drag.bind.onPointerDown,
    onPointerMove: (e: React.PointerEvent) => {
      drag.bind.onPointerMove(e);
      checkReveal(e);
    },
    onPointerUp: () => {
      drag.bind.onPointerUp();
      enterRef.current = 0;
    },
    onPointerCancel: () => {
      drag.bind.onPointerCancel();
      enterRef.current = 0;
    },
    style: drag.bind.style,
  };

  const tapHog = () => {
    if (solved || done) return;
    if (!found) {
      sfx.pop();
      return;
    }
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
        <motion.div
          animate={out ? { y: -46 } : { y: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 12 }}
        >
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

      {/* draggable magnifying glass */}
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
            <div className="absolute start-[54%] top-[54%] h-[13%] w-[48%] rotate-45 rounded-full border-4 border-[#3B2E5A] bg-[#8B5E3C]" aria-hidden />
            <div className="absolute start-[50%] top-[50%] h-[18%] w-[18%] rotate-45 rounded-md border-4 border-[#3B2E5A] bg-[#E8A81C]" aria-hidden />
            {/* glass lens */}
            <div
              ref={lensRef}
              className="relative w-[62%] aspect-square rounded-full border-[7px] border-[#3B2E5A] overflow-hidden"
              style={{ background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), rgba(191,219,255,0.16) 45%, rgba(120,170,220,0.24) 100%)" }}
            >
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
                <path d="M24 36 Q34 20 54 20" stroke="#FAFAFA" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
                <path d="M30 54 Q36 44 46 40" stroke="#FAFAFA" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
              </svg>
              <div className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.35)" }} aria-hidden />
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
