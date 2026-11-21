"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Pulse, Scene, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 26 — Let go!: tap the hand gripping the string so the helium  */
/* balloon floats up and sticks to the ceiling.                        */
/* ------------------------------------------------------------------ */

function BalloonSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 150" className={className} style={style} aria-hidden>
      <defs>
        <radialGradient id="bln26" cx="0.35" cy="0.28" r="0.95">
          <stop offset="0%" stopColor="#FF8A9C" />
          <stop offset="55%" stopColor="#FF6B81" />
          <stop offset="100%" stopColor="#E84D66" />
        </radialGradient>
      </defs>
      <ellipse cx="60" cy="52" rx="46" ry="52" fill="url(#bln26)" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M60 104 L52 117 L68 117 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="42" cy="30" rx="10" ry="15" fill="#FAFAFA" opacity="0.55" transform="rotate(-18 42 30)" />
      {/* cute face */}
      <circle cx="46" cy="56" r="6" fill="#3B2E5A" />
      <circle cx="74" cy="56" r="6" fill="#3B2E5A" />
      <circle cx="48.3" cy="53.7" r="2" fill="#fff" />
      <circle cx="76.3" cy="53.7" r="2" fill="#fff" />
      <ellipse cx="60" cy="72" rx="4" ry="5.5" fill="#3B2E5A" />
      <ellipse cx="35" cy="66" rx="5.5" ry="4" fill="#FF9FB2" />
      <ellipse cx="85" cy="66" rx="5.5" ry="4" fill="#FF9FB2" />
    </svg>
  );
}

function HandSvg({ open, className, style }: { open: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 140 122" className={className} style={style} aria-hidden>
      {/* sleeve */}
      <rect x="44" y="88" width="52" height="30" rx="12" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="5" />
      {/* palm */}
      <path d="M40 62 Q38 36 70 36 Q102 36 100 62 L100 90 Q100 102 86 102 L54 102 Q40 102 40 90 Z" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="5" />
      {/* two fingers spring apart when the string is released */}
      <motion.g animate={{ rotate: open ? -46 : 0 }} transition={{ type: "spring", stiffness: 210, damping: 13 }} style={{ transformOrigin: "60px 78px" }}>
        <rect x="50" y="40" width="17" height="38" rx="8.5" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" />
      </motion.g>
      <motion.g animate={{ rotate: open ? 46 : 0 }} transition={{ type: "spring", stiffness: 210, damping: 13 }} style={{ transformOrigin: "80px 78px" }}>
        <rect x="73" y="40" width="17" height="38" rx="8.5" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" />
      </motion.g>
      <path d="M52 92 Q70 98 88 92" stroke="#FF9FB2" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function Star({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 2 L14.6 8.6 L21.5 9.2 L16.3 13.8 L17.9 20.6 L12 17 L6.1 20.6 L7.7 13.8 L2.5 9.2 L9.4 8.6 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function Level26({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [released, setReleased] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [done, setDone] = useState(false);
  const finishRef = useRef(false);

  const release = () => {
    if (solved || done || released) return;
    setReleased(true);
    sfx.pop();
    sfx.whoosh();
  };

  const tapBalloon = () => {
    if (solved || done || released) return;
    sfx.boing();
    onMistake({ fa: "نخشو رها کن!", en: "Let go of the string!" });
  };

  const arrived = () => {
    if (done || finishRef.current) return;
    finishRef.current = true;
    setStuck(true);
    sfx.sparkle();
    setDone(true);
    sfx.cheer();
    onProgress(1);
    window.setTimeout(onSolved, 700);
  };

  return (
    <Scene bg="linear-gradient(180deg,#FDF1DC 0%,#FAE6C8 68%,#F5DDB4 100%)">
      {/* ceiling + floor */}
      <div className="absolute inset-x-0 top-0 h-[6%] border-b-4 border-[#3B2E5A] bg-[#EFE0C8]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-[10%] border-t-4 border-[#3B2E5A]" style={{ background: "repeating-linear-gradient(90deg,#E8D5BE 0 56px,#DDC7AC 56px 112px)" }} aria-hidden />
      {/* cozy wall poster + toy blocks */}
      <div className="absolute start-[7%] top-[18%] aspect-[3/4] w-[17%] rounded-lg border-4 border-[#8B5E3C] bg-[#FAFAFA] p-[6%]" aria-hidden>
        <svg viewBox="0 0 60 80" className="h-full w-full">
          <circle cx="42" cy="20" r="10" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
          <path d="M6 70 L20 46 L32 62 L42 52 L54 70 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="absolute bottom-[10%] start-[12%] flex gap-2" aria-hidden>
        <div className="h-6 w-6 rounded border-[3px] border-[#3B2E5A] bg-[#1EC8CF]" />
        <div className="h-6 w-6 rounded border-[3px] border-[#3B2E5A] bg-[#FFD154]" />
        <div className="h-6 w-6 rounded border-[3px] border-[#3B2E5A] bg-[#FF6B81]" />
      </div>

      {/* balloon + taut string reaching down into the hand */}
      <motion.div
        className="absolute right-[17%] z-20 flex w-[20%] flex-col items-center"
        animate={released ? { top: "3%", rotate: [0, 4, -4, 2, 0] } : { top: "20%", rotate: 0 }}
        transition={released ? { duration: 2.2, ease: "easeInOut" } : { duration: 0.3 }}
        onAnimationComplete={released ? arrived : undefined}
      >
        <div className="flex w-full flex-col items-center" style={released ? undefined : { animation: "bob 1.15s ease-in-out infinite alternate" }}>
          <div
            onClick={tapBalloon}
            className={`w-full ${released ? "" : "cursor-pointer"}`}
            style={
              stuck
                ? { transform: "scaleY(0.93)", transformOrigin: "top center", transition: "transform 0.25s ease" }
                : released
                  ? undefined
                  : { animation: "breathe 2.4s ease-in-out infinite" }
            }
          >
            <BalloonSvg className="h-auto w-full" />
          </div>
          <svg viewBox="0 0 120 130" className="h-auto w-full" aria-hidden>
            {released ? (
              <path d="M60 2 Q48 26 60 44 Q72 62 60 84 Q52 102 60 122" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
            ) : (
              <line x1="60" y1="0" x2="60" y2="128" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
            )}
          </svg>
        </div>
      </motion.div>

      {/* the child's hand gripping the string */}
      <div className="absolute bottom-[9%] right-[12%] z-30 w-[24%]">
        <Pulse active={hintPulse > 0 && !released && !done}>
          <button type="button" aria-label={lang === "fa" ? "دست" : "hand"} onClick={release} className="w-full cursor-pointer">
            <HandSvg open={released} className="h-auto w-full" />
          </button>
        </Pulse>
      </div>

      {/* sparkles when it sticks to the ceiling */}
      {stuck &&
        [
          { r: "10%", t: "7%", d: "0s" },
          { r: "30%", t: "3.5%", d: "0.12s" },
          { r: "2%", t: "14%", d: "0.24s" },
        ].map((s, i) => (
          <span key={i} className="pointer-events-none absolute z-40" style={{ right: s.r, top: s.t, animation: `star-pop 0.8s ease ${s.d} both` }}>
            <Star className="h-6 w-6" />
          </span>
        ))}
    </Scene>
  );
}
