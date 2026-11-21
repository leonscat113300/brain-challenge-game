"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";
import { num } from "@/lib/game/utils";

/* ------------------------------------------------------------------ */
/* Level 15 — Three candles: press and HOLD a flame for 900ms (like    */
/* blowing) to snuff it out. Release early and it puffs back up.       */
/* ------------------------------------------------------------------ */

const HOLD_MS = 900;
const RING_R = 24;
const RING_C = 2 * Math.PI * RING_R;
const CANDLE_COLORS = ["#FF6B81", "#1EC8CF", "#FFD154"];

function FlameSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 44 60" className={className} style={style} aria-hidden>
      <path d="M22 3 Q36 24 31 42 Q27 55 22 55 Q17 55 13 42 Q8 24 22 3 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M22 20 Q28 32 25 42 Q23 48 21 47 Q18 44 17 38 Q16 30 22 20 Z" fill="#FF6B81" opacity="0.85" />
    </svg>
  );
}

function SmokeSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 90" className={className} style={style} aria-hidden>
      <path d="M30 84 Q16 64 28 48 Q40 32 28 16 Q22 6 30 2" stroke="#B9B4C9" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M40 70 Q50 58 44 44" stroke="#CFCBE0" strokeWidth="5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function CandleSvg({ color, ember }: { color: string; ember: boolean }) {
  return (
    <svg viewBox="0 0 84 130" className="h-full w-full" aria-hidden>
      <rect x="18" y="26" width="48" height="100" rx="12" fill={color} stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M18 34 Q26 42 34 34 Q42 26 50 34 Q58 42 66 34" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
      <path d="M22 62 L62 54" stroke="#FAFAFA" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <path d="M22 86 L62 78" stroke="#FAFAFA" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      <path d="M42 16 L42 28" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
      {ember && <motion.circle cx="42" cy="16" r="5" fill="#FF6B81" animate={{ opacity: [1, 0.3, 0] }} transition={{ duration: 1.4, ease: "easeOut" }} />}
    </svg>
  );
}

export default function Level15({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [outIdx, setOutIdx] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [holding, setHolding] = useState<number | null>(null);
  const [frac, setFrac] = useState(0);
  const rafRef = useRef<number | null>(null);
  const holdIdxRef = useRef<number | null>(null);
  const startRef = useRef({ t: 0, x: 0, y: 0 });
  const fracRef = useRef(0);
  const progRef = useRef(0);

  const stopLoop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const extinguish = (i: number) => {
    holdIdxRef.current = null;
    stopLoop();
    setHolding(null);
    setOutIdx(i);
    setDone(true);
    sfx.whoosh();
    window.setTimeout(() => sfx.cheer(), 420);
    onProgress(1);
    window.setTimeout(onSolved, 950);
  };

  const beginHold = (i: number, e: React.PointerEvent) => {
    if (solved || done || outIdx !== null || holdIdxRef.current !== null) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    startRef.current = { t: performance.now(), x: e.clientX, y: e.clientY };
    holdIdxRef.current = i;
    fracRef.current = 0;
    progRef.current = 0;
    setFrac(0);
    setHolding(i);
    const tick = () => {
      const idx = holdIdxRef.current;
      if (idx === null) return;
      const f = Math.min(1, (performance.now() - startRef.current.t) / HOLD_MS);
      fracRef.current = f;
      setFrac(f);
      if (f - progRef.current >= 0.2) {
        progRef.current = f;
        onProgress(f);
      }
      if (f >= 1) {
        extinguish(idx);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const moveHold = (e: React.PointerEvent) => {
    if (holdIdxRef.current === null) return;
    const d = Math.hypot(e.clientX - startRef.current.x, e.clientY - startRef.current.y);
    if (d > 12) {
      /* finger wandered: cancel the hold quietly */
      holdIdxRef.current = null;
      stopLoop();
      setHolding(null);
    }
  };

  const endHold = () => {
    const i = holdIdxRef.current;
    if (i === null) return;
    holdIdxRef.current = null;
    stopLoop();
    setHolding(null);
    if (fracRef.current >= 1) return;
    if (fracRef.current > 0.15) {
      onMistake({ fa: "کمی طولانی‌تر نگه دار! مثل فوت کردن", en: "Hold a bit longer — like blowing!" });
    } else {
      sfx.pop();
    }
  };

  return (
    <Scene bg="linear-gradient(180deg,#4A3570 0%,#8A5FA0 52%,#E8A060 100%)">
      {/* soft stars */}
      {[[10, 12], [30, 8], [70, 10], [88, 16], [55, 6]].map(([x, y], i) => (
        <div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-[#FFD154]"
          style={{ left: `${x}%`, top: `${y}%`, opacity: 0.7, animation: `breathe 1.4s ease-in-out ${i * 0.3}s infinite` }}
          aria-hidden
        />
      ))}

      {/* cozy table */}
      <div className="absolute inset-x-0 bottom-0 h-[24%]">
        <div
          className="h-[30%] rounded-t-2xl border-t-4 border-[#3B2E5A] bg-[#8B5E3C]"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.15) 0 3px, transparent 3px 48px)" }}
        />
        <div className="h-[70%] border-t-4 border-[#3B2E5A] bg-[#6E4526]" />
      </div>

      {/* candles in a row */}
      <div className="absolute inset-x-[10%] bottom-[22%] flex items-end justify-between">
        {CANDLE_COLORS.map((color, i) => {
          const out = outIdx === i;
          return (
            <div key={i} className="relative w-[24%]">
              <Pulse active={hintPulse > 0 && !done && i === 1}>
                {/* flame zone: press and hold here */}
                <div
                  className="relative h-16 w-full touch-none cursor-pointer"
                  onPointerDown={(e) => beginHold(i, e)}
                  onPointerMove={moveHold}
                  onPointerUp={endHold}
                  onPointerCancel={endHold}
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {!out && (
                    <div
                      className="absolute h-24 w-24 rounded-full"
                      style={{ left: "calc(50% - 48px)", top: "calc(50% - 48px)", background: "radial-gradient(circle, rgba(255,209,84,0.5) 0%, transparent 70%)", animation: "breathe 1.3s ease-in-out infinite" }}
                      aria-hidden
                    />
                  )}
                  {holding === i && !out && (
                    <svg viewBox="0 0 60 60" className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20" style={{ transform: "translate(-50%,-50%)" }} aria-hidden>
                      <circle cx="30" cy="30" r={RING_R} fill="none" stroke="#FAFAFA" strokeWidth="5" opacity="0.55" />
                      <circle
                        cx="30" cy="30" r={RING_R} fill="none" stroke="#FFD154" strokeWidth="5" strokeLinecap="round"
                        strokeDasharray={RING_C} strokeDashoffset={RING_C * (1 - frac)} transform="rotate(-90 30 30)"
                      />
                    </svg>
                  )}
                  {/* swaying flame, shrinking away when snuffed */}
                  <motion.div
                    className="absolute bottom-0 h-full w-9"
                    style={{ left: "calc(50% - 18px)", transformOrigin: "50% 90%" }}
                    animate={out ? { scale: 0, opacity: 0 } : { rotate: [-4, 4, -4], y: [0, -3, 0] }}
                    transition={out ? { duration: 0.3, ease: "easeIn" } : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="h-full w-full" style={{ animation: out ? undefined : "breathe 0.9s ease-in-out infinite" }}>
                      <FlameSvg className="h-full w-full" />
                    </div>
                  </motion.div>
                  {/* smoke wisp after snuffing */}
                  {out && (
                    <motion.div
                      className="pointer-events-none absolute bottom-2 h-14 w-10"
                      style={{ left: "calc(50% - 20px)" }}
                      initial={{ opacity: 0.9, y: 6 }}
                      animate={{ opacity: 0, y: -46 }}
                      transition={{ duration: 1.7, ease: "easeOut" }}
                    >
                      <SmokeSvg className="h-full w-full" />
                    </motion.div>
                  )}
                  {holding === i && !out && (
                    <div className="pointer-events-none absolute inset-x-0 -top-5 text-center text-xs font-extrabold text-[#FAFAFA]">
                      {lang === "fa" ? `${num(Math.round(frac * 100), "fa")}٪` : `${Math.round(frac * 100)}%`}
                    </div>
                  )}
                </div>
                {/* candle body */}
                <div className="h-36 w-full">
                  <CandleSvg color={color} ember={out} />
                </div>
              </Pulse>
            </div>
          );
        })}
      </div>
    </Scene>
  );
}
