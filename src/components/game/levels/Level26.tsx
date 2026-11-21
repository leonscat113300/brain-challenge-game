"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Pulse, Scene, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 26 — Let go!: THREE of the child's hands grip the string —    */
/* open them one by one so the helium balloon floats up and sticks      */
/* to the ceiling.                                                      */
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

function BirdSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 70" className={className} style={style} aria-hidden>
      {/* tail */}
      <path d="M14 40 L2 30 L10 48 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
      {/* body */}
      <circle cx="42" cy="38" r="22" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" />
      <ellipse cx="48" cy="47" rx="11" ry="9" fill="#FAFAFA" />
      {/* wing */}
      <path d="M34 34 Q22 28 26 44 Q34 50 44 44 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
      {/* eye + beak */}
      <circle cx="56" cy="30" r="4" fill="#3B2E5A" />
      <circle cx="57.4" cy="28.6" r="1.4" fill="#FAFAFA" />
      <path d="M62 34 L76 38 L62 44 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
      {/* feet */}
      <path d="M38 60 L38 66 M48 60 L48 66" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Level26({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [openTop, setOpenTop] = useState(false);
  const [openMid, setOpenMid] = useState(false);
  const [openBottom, setOpenBottom] = useState(false);
  const [stuck, setStuck] = useState(false);
  const [done, setDone] = useState(false);
  const finishRef = useRef(false);

  /* the balloon only flies once ALL THREE hands have let go of the string */
  const flying = openTop && openMid && openBottom;

  const openUpperHand = () => {
    if (solved || done || openTop) return;
    setOpenTop(true);
    sfx.pop();
    if (!openMid || !openBottom) onProgress(0.33);
  };

  const openMiddleHand = () => {
    if (solved || done || openMid) return;
    setOpenMid(true);
    sfx.pop();
    if (!openTop || !openBottom) onProgress(0.33);
  };

  const release = () => {
    if (solved || done || openBottom) return;
    setOpenBottom(true);
    sfx.pop();
    if (!openTop || !openMid) onProgress(0.34);
  };

  useEffect(() => {
    if (openTop && openMid && openBottom && !done && !solved) sfx.whoosh();
  }, [openTop, openMid, openBottom, done, solved]);

  const tapBalloon = () => {
    if (solved || done || flying) return;
    sfx.boing();
    onMistake({ fa: "نخشو رها کن!", en: "Let go of the string!" });
  };

  const tapBird = () => {
    if (solved || done) return;
    sfx.boing();
    onMistake({ fa: "پرنده فقط تماشا می‌کنه!", en: "The bird is just watching!" });
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

      {/* decoy: a little bird watching from the ceiling */}
      <button
        type="button"
        onClick={tapBird}
        aria-label={lang === "fa" ? "پرنده" : "bird"}
        className="absolute left-[20%] top-[1%] z-30 w-[10%] cursor-pointer"
      >
        <BirdSvg className="h-auto w-full" style={{ animation: "bob 1.6s ease-in-out infinite alternate" }} />
      </button>

      {/* balloon + taut string reaching down into the child's hands */}
      <motion.div
        className="absolute right-[17%] z-20 flex w-[20%] flex-col items-center"
        animate={flying ? { top: "3%", rotate: [0, 4, -4, 2, 0] } : { top: "20%", rotate: 0 }}
        transition={flying ? { duration: 2.2, ease: "easeInOut" } : { duration: 0.3 }}
        onAnimationComplete={flying ? arrived : undefined}
      >
        <div className="flex w-full flex-col items-center" style={flying ? undefined : { animation: "bob 1.15s ease-in-out infinite alternate" }}>
          <div
            onClick={tapBalloon}
            className={`w-full ${flying ? "" : "cursor-pointer"}`}
            style={
              stuck
                ? { transform: "scaleY(0.93)", transformOrigin: "top center", transition: "transform 0.25s ease" }
                : flying
                  ? undefined
                  : { animation: "breathe 2.4s ease-in-out infinite" }
            }
          >
            <BalloonSvg className="h-auto w-full" />
          </div>
          <svg viewBox="0 0 120 130" className="h-auto w-full" aria-hidden>
            {flying ? (
              <path d="M60 2 Q48 26 60 44 Q72 62 60 84 Q52 102 60 122" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
            ) : (
              <line x1="60" y1="0" x2="60" y2="128" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
            )}
          </svg>
        </div>
      </motion.div>

      {/* the child's upper hand also gripping the string — all three must open */}
      <div className="absolute bottom-[26%] right-[13%] z-30 w-[20%] rotate-[7deg]">
        <Pulse active={hintPulse > 0 && !openTop && !done}>
          <button type="button" aria-label={lang === "fa" ? "دست بالا" : "upper hand"} onClick={openUpperHand} className="w-full cursor-pointer">
            <HandSvg open={openTop} className="h-auto w-full" />
          </button>
        </Pulse>
      </div>

      {/* the child's middle hand gripping the string */}
      <div className="absolute bottom-[17%] right-[13.5%] z-30 w-[21%] rotate-[-6deg]">
        <Pulse active={hintPulse > 0 && !openMid && !done}>
          <button type="button" aria-label={lang === "fa" ? "دست میانی" : "middle hand"} onClick={openMiddleHand} className="w-full cursor-pointer">
            <HandSvg open={openMid} className="h-auto w-full" />
          </button>
        </Pulse>
      </div>

      {/* the child's hand gripping the string */}
      <div className="absolute bottom-[9%] right-[12%] z-30 w-[24%]">
        <Pulse active={hintPulse > 0 && !openBottom && !done}>
          <button type="button" aria-label={lang === "fa" ? "دست" : "hand"} onClick={release} className="w-full cursor-pointer">
            <HandSvg open={openBottom} className="h-auto w-full" />
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
