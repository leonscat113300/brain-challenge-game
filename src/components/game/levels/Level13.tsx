"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 13 — Which glass fills first? FIVE glasses now: A has a       */
/* closed valve, B is pinched, C is corked, D is capped — only E is    */
/* open. Two plain couplings (not blockages) add visual noise.         */
/* ------------------------------------------------------------------ */

const GLASS_LABELS = ["A", "B", "C", "D", "E"];
const GLASS_LEFTS = ["6.5%", "25%", "43.5%", "62%", "80.5%"];

function PitcherSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 150 150" className={className} style={style} aria-hidden>
      {/* handle */}
      <path d="M116 52 Q146 62 120 94" stroke="#3B2E5A" strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* body */}
      <path d="M40 34 L114 34 L106 108 Q104 120 92 120 L62 120 Q50 120 48 108 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      {/* juice inside */}
      <path d="M48 64 L106 64 L102 104 Q101 112 92 112 L62 112 Q53 112 52 104 Z" fill="#FFD154" />
      {/* spout */}
      <path d="M40 34 L22 26 L36 50 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      {/* shine */}
      <path d="M58 44 L54 96" stroke="#FAFAFA" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function ValveSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      {/* closed red handle, rotated across the wheel */}
      <rect x="7" y="27" width="50" height="10" rx="5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" transform="rotate(45 32 32)" />
      <circle cx="32" cy="32" r="19" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="32" cy="32" r="5" fill="#3B2E5A" />
    </svg>
  );
}

function PinchSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 64" className={className} style={style} aria-hidden>
      {/* two clamps squeezing the tube shut */}
      <rect x="13" y="4" width="9" height="56" rx="4.5" fill="#C89B6B" stroke="#3B2E5A" strokeWidth="3.5" transform="rotate(24 30 32)" />
      <rect x="38" y="4" width="9" height="56" rx="4.5" fill="#C89B6B" stroke="#3B2E5A" strokeWidth="3.5" transform="rotate(-24 30 32)" />
    </svg>
  );
}

function CorkSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 76 56" className={className} style={style} aria-hidden>
      {/* cork plug stuck in the pipe */}
      <rect x="4" y="12" width="62" height="32" rx="15" fill="#C99B6A" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M16 24 Q34 18 54 24" stroke="#8B5E3C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M18 34 Q36 28 56 34" stroke="#8B5E3C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** blockage D: a bolted dome cap welded over the pipe end */
function CapSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 58" className={className} style={style} aria-hidden>
      <rect x="8" y="36" width="48" height="14" rx="5" fill="#9BA3B8" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M16 36 Q32 8 48 36 Z" fill="#B8C0D4" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="32" cy="22" r="4.5" fill="#3B2E5A" />
    </svg>
  );
}

/** decoy: a plain pipe coupling — looks like the hardware on the other
    pipes but is NOT a blockage (no handle, no clamp, no cork, no cap) */
function CouplingSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      <circle cx="32" cy="32" r="18" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="32" cy="32" r="7" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="3.5" />
    </svg>
  );
}

export default function Level13({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [filled, setFilled] = useState(false);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState<{ id: number; seq: number } | null>(null);
  const wrongTapsRef = useRef(0);

  const pick = (idx: number) => {
    if (solved || done || filled) return;
    if (idx === 4) {
      /* correct: glass E — the only clear pipe */
      setDone(true);
      setFilled(true);
      sfx.pop();
      window.setTimeout(() => sfx.cheer(), 350);
      onProgress(1);
      window.setTimeout(onSolved, 1200);
    } else {
      wrongTapsRef.current += 1;
      setFlash({ id: idx, seq: wrongTapsRef.current });
      onMistake({ fa: "لولهٔ این لیوان مسدود است!", en: "This glass's pipe is blocked!" });
      onProgress(Math.min(0.75, 0.2 * wrongTapsRef.current));
      window.setTimeout(() => setFlash(null), 900);
    }
  };

  const flashing = (idx: number) => flash?.id === idx;
  const flashKey = (idx: number, base: string) => (flashing(idx) ? String(flash?.seq) : base);

  const glassJsx = (i: number) => (
    <>
      <button
        type="button"
        aria-label={lang === "fa" ? `لیوان ${GLASS_LABELS[i]}` : `glass ${GLASS_LABELS[i]}`}
        onClick={() => pick(i)}
        className="relative block w-full flex-1 overflow-hidden rounded-b-2xl rounded-t-md border-4 border-[#3B2E5A] bg-[#FAFAFA]/60"
      >
        {/* rising juice (correct glass only) */}
        <div className="absolute inset-x-0 bottom-0 bg-[#FFD154]" style={{ height: filled && i === 4 ? "80%" : "0%", transition: "height 1.1s ease-out" }} />
        <div className="absolute start-[12%] top-[10%] h-[45%] w-[13%] rounded-full bg-white/70" aria-hidden />
      </button>
      <div className="mt-1 text-center text-sm font-extrabold text-[#3B2E5A]">{GLASS_LABELS[i]}</div>
    </>
  );

  return (
    <Scene bg="linear-gradient(180deg,#EDE4F7 0%,#F9E9D2 62%,#F2D9B4 100%)">
      {/* kitchen wall stripes */}
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.05) 0 20px, transparent 20px 46px)" }} aria-hidden />

      {/* tilted juice pitcher — straightens once juice flows */}
      <div
        className="absolute left-[36%] top-[1%] z-10 w-[26%]"
        style={{ transform: filled ? "rotate(0deg)" : "rotate(-26deg)", transformOrigin: "60% 30%", transition: "transform 0.7s cubic-bezier(0.34,1.3,0.64,1)" }}
      >
        <PitcherSvg className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" />
      </div>

      {/* pipe manifold: ink outline + juice core (5 branches, E curves away) */}
      <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        {[
          "M196 78 L196 98",
          "M50 98 L346 98",
          "M50 98 L50 208",
          "M124 98 L124 208",
          "M198 98 L198 208",
          "M272 98 L272 208",
        ].map((d) => (
          <g key={d}>
            <path d={d} stroke="#3B2E5A" strokeWidth="10" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <path d={d} stroke="#FFD154" strokeWidth="4" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </g>
        ))}
        {/* glass E gets the long, curved, clear pipe */}
        <path d="M204 82 Q300 104 346 208" stroke="#3B2E5A" strokeWidth="10" fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <motion.path
          d="M204 82 Q300 104 346 208"
          stroke="#FFD154"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          strokeDasharray={filled ? "12 9" : undefined}
          animate={filled ? { strokeDashoffset: [0, -42] } : undefined}
          transition={filled ? { duration: 0.65, repeat: Infinity, ease: "linear" } : undefined}
        />
      </svg>

      {/* blockage A: closed valve */}
      <div className="absolute z-10 w-[6.5%]" style={{ left: "12.5%", top: "44%", transform: "translate(-50%,-50%)" }}>
        <div key={flashKey(0, "valve")} className="relative aspect-square" style={{ animation: flashing(0) ? "shake-hard 0.55s ease" : undefined }}>
          <ValveSvg className="h-full w-full" />
          {flashing(0) && <div className="absolute -inset-2 rounded-full border-4 border-[#FF3B30]" style={{ animation: "pulse-ring 0.55s ease" }} aria-hidden />}
        </div>
      </div>

      {/* blockage B: pinched pipe */}
      <div className="absolute z-10 w-[6%]" style={{ left: "31%", top: "47%", transform: "translate(-50%,-50%)" }}>
        <div key={flashKey(1, "pinch")} className="relative aspect-square" style={{ animation: flashing(1) ? "shake-hard 0.55s ease" : undefined }}>
          <PinchSvg className="h-full w-full" />
          {flashing(1) && <div className="absolute -inset-2 rounded-xl border-4 border-[#FF3B30]" style={{ animation: "pulse-ring 0.55s ease" }} aria-hidden />}
        </div>
      </div>

      {/* blockage C: cork plug */}
      <div className="absolute z-10 w-[8.5%]" style={{ left: "49.5%", top: "49%", transform: "translate(-50%,-50%)" }}>
        <div key={flashKey(2, "cork")} className="relative aspect-[76/56]" style={{ animation: flashing(2) ? "shake-hard 0.55s ease" : undefined }}>
          <CorkSvg className="h-full w-full" />
          {flashing(2) && <div className="absolute -inset-2 rounded-xl border-4 border-[#FF3B30]" style={{ animation: "pulse-ring 0.55s ease" }} aria-hidden />}
        </div>
      </div>

      {/* blockage D: bolted cap */}
      <div className="absolute z-10 w-[6.5%]" style={{ left: "68%", top: "46%", transform: "translate(-50%,-50%)" }}>
        <div key={flashKey(3, "cap")} className="relative aspect-[64/58]" style={{ animation: flashing(3) ? "shake-hard 0.55s ease" : undefined }}>
          <CapSvg className="h-full w-full" />
          {flashing(3) && <div className="absolute -inset-2 rounded-xl border-4 border-[#FF3B30]" style={{ animation: "pulse-ring 0.55s ease" }} aria-hidden />}
        </div>
      </div>

      {/* decoy coupling on C's pipe (higher up — open hardware, not a blockage) */}
      <div className="absolute z-10 w-[5.5%]" style={{ left: "49.5%", top: "28%", transform: "translate(-50%,-50%)" }} aria-hidden>
        <CouplingSvg className="h-full w-full opacity-90" />
      </div>

      {/* decoy coupling on E's pipe — open hardware, not a blockage */}
      <div className="absolute z-10 w-[5.5%]" style={{ left: "74%", top: "34%", transform: "translate(-50%,-50%)" }} aria-hidden>
        <CouplingSvg className="h-full w-full opacity-90" />
      </div>

      {/* juice droplets racing down E's pipe */}
      {filled &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute z-20 h-[4%] aspect-square rounded-full border-2 border-[#3B2E5A] bg-[#FFD154]"
            initial={{ left: "52%", top: "26%", opacity: 0 }}
            animate={{
              left: ["52%", "62%", "72%", "80%", "86%"],
              top: ["26%", "31%", "40%", "54%", "66%"],
              opacity: [0, 1, 1, 1, 0],
            }}
            transition={{ duration: 1, delay: 0.15 + i * 0.25, ease: "linear", repeat: 1 }}
          />
        ))}

      {/* the five glasses */}
      {GLASS_LABELS.map((_, i) => (
        <div key={i} className="absolute bottom-[3%] flex h-[27%] w-[12%] flex-col items-center" style={{ left: GLASS_LEFTS[i] }}>
          {i === 4 ? (
            <Pulse active={hintPulse > 0 && !done} className="flex h-full w-full flex-col">
              {glassJsx(i)}
            </Pulse>
          ) : (
            glassJsx(i)
          )}
        </div>
      ))}
    </Scene>
  );
}
