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
      {/* spiky back */}
      <path
        d="M30 106 L20 82 L38 88 L34 60 L54 72 L58 44 L76 62 L88 36 L100 58 L114 36 L124 60 L142 44 L146 68 L164 58 L162 84 L182 80 L172 106 Z"
        fill="#7A8B5A"
        stroke="#4A5D33"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M62 74 L74 62 M94 60 L104 48 M124 64 L134 54" stroke="#5C6E3C" strokeWidth="4" strokeLinecap="round" />
      {/* face */}
      <ellipse cx="54" cy="104" rx="30" ry="24" fill="#E9C99B" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="44" cy="98" r="5.5" fill="#3B2E5A" />
      <circle cx="46" cy="96" r="1.8" fill="#FAFAFA" />
      <path d="M62 100 Q68 105 74 100" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="30" cy="94" r="11" fill="#3B2E5A" />
      <circle cx="26" cy="90" r="3" fill="#FAFAFA" opacity="0.8" />
      <ellipse cx="64" cy="112" rx="6" ry="4" fill="#FF9FB2" />
      {/* feet */}
      <ellipse cx="48" cy="132" rx="10" ry="6" fill="#E9C99B" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="80" cy="132" rx="10" ry="6" fill="#E9C99B" stroke="#3B2E5A" strokeWidth="4" />
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

  /* watch the lens centre: when it comes near the hidden hedgehog, reveal it */
  const checkReveal = useCallback(() => {
    if (found || done || solved) return;
    const lens = lensRef.current?.getBoundingClientRect();
    const hog = hogRef.current?.getBoundingClientRect();
    if (!lens || !hog) return;
    const dist = Math.hypot(
      lens.left + lens.width / 2 - (hog.left + hog.width / 2),
      lens.top + lens.height / 2 - (hog.top + hog.height / 2)
    );
    if (dist < 90) {
      setFound(true);
      sfx.sparkle();
      onProgress(0.6);
    }
  }, [found, done, solved, onProgress]);

  const lensBind = {
    onPointerDown: drag.bind.onPointerDown,
    onPointerMove: (e: React.PointerEvent) => {
      drag.bind.onPointerMove(e);
      checkReveal();
    },
    onPointerUp: drag.bind.onPointerUp,
    onPointerCancel: drag.bind.onPointerCancel,
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
    setLeafTaps(n >= 3 ? 0 : n);
    if (n >= 3) onMistake({ fa: "با ذره‌بین بگرد!", en: "Search with the magnifier!" });
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
            <div ref={lensRef} className="relative w-[62%] aspect-square rounded-full border-[6px] border-[#3B2E5A] bg-[#FAFAFA]/30 overflow-hidden">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" aria-hidden>
                <path d="M24 36 Q34 20 54 20" stroke="#FAFAFA" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.75" />
              </svg>
            </div>
            <div className="absolute start-[52%] top-[52%] w-[38%] h-[11%] rotate-45 rounded-full bg-[#FFD154] border-4 border-[#3B2E5A]" aria-hidden />
          </div>
        </Pulse>
      </div>

      {/* leaf tap counter */}
      {leafTaps > 0 && (
        <div className="absolute top-[3%] start-[3%] z-[35] rounded-full border-[3px] border-[#3B2E5A] bg-[#FAFAFA]/90 px-3 py-1 text-sm font-extrabold text-[#3B2E5A]">
          {num(leafTaps, lang)} / {num(3, lang)}
        </div>
      )}
    </Scene>
  );
}
