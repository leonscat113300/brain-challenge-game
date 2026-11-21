"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 42 — Ring the school bell: pull the rope down hard.           */
/* ------------------------------------------------------------------ */

const NEED = 90;
const MAX_PULL = 150;
const ROPE_BASE = 150;
const HARDER_MSG = { fa: "محکم‌تر و بلندتر بکش!", en: "Pull harder and longer!" };
const CONFETTI: Array<{ l: number; d: number; c: string }> = [
  { l: 7, d: 0, c: "#FFD154" }, { l: 19, d: 0.14, c: "#FF6B81" }, { l: 31, d: 0.04, c: "#1EC8CF" },
  { l: 43, d: 0.18, c: "#4CAF50" }, { l: 55, d: 0.09, c: "#6C4AB6" }, { l: 67, d: 0.15, c: "#FFD154" },
  { l: 79, d: 0.02, c: "#FF6B81" }, { l: 91, d: 0.21, c: "#1EC8CF" }, { l: 13, d: 0.29, c: "#6C4AB6" },
  { l: 85, d: 0.27, c: "#4CAF50" },
];

function BellSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 122" className={className} style={style} aria-hidden>
      <circle cx="60" cy="16" r="6" fill="none" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M60 20 C35 20 25 48 22 86 L98 86 C95 48 85 20 60 20 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <rect x="16" y="86" width="88" height="13" rx="6.5" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="60" cy="108" r="8" fill="#3B2E5A" />
      <path d="M38 32 Q46 22 57 20" stroke="#FAFAFA" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

function WindowDiv({ className }: { className?: string }) {
  return (
    <div className={`absolute top-[24%] z-[2] aspect-[3/4] w-[17%] overflow-hidden rounded-t-full border-4 border-[#3B2E5A] bg-[#BEE9F5] ${className ?? ""}`} aria-hidden>
      <div className="absolute inset-x-0 top-1/2 h-1 bg-[#3B2E5A]" />
      <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-[#3B2E5A]" />
    </div>
  );
}

export default function Level42({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [ringing, setRinging] = useState(false);
  const [waves, setWaves] = useState(0);
  const [done, setDone] = useState(false);
  const maxRef = useRef(0);
  const timers = useRef<number[]>([]);

  const t = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const drag = useDragMove(
    useCallback(
      (d, api) => {
        const p = Math.max(maxRef.current, Math.max(0, Math.min(d.y, MAX_PULL)));
        maxRef.current = 0;
        api.reset();
        if (solved || done || ringing) return;
        if (p >= NEED) {
          setRinging(true);
          setWaves((w) => w + 1);
          setDone(true);
          sfx.unlock();
          t(() => sfx.pop(), 180);
          t(() => sfx.pop(), 360);
          sfx.cheer();
          onProgress(1);
          t(onSolved, 700);
          t(() => setRinging(false), 1800);
        } else if (d.everMoved && p > 14) {
          onMistake(HARDER_MSG);
        }
      },
      [solved, done, ringing, onProgress, onSolved, onMistake, t]
    )
  );

  /* live feedback while pulling: tilt the bell, report progress */
  useEffect(() => {
    if (solved || done || ringing || !drag.dragging) return;
    const p = Math.max(0, Math.min(drag.y, MAX_PULL));
    if (p > maxRef.current) maxRef.current = p;
    onProgress(Math.round(Math.min(p / NEED, 1) * 0.8 * 10) / 10);
  }, [drag.y, drag.dragging, solved, done, ringing, onProgress]);

  const pull = Math.max(0, Math.min(drag.y, MAX_PULL));

  return (
    <Scene bg="linear-gradient(180deg,#F8EFDC 0%,#F1E2C4 100%)">
      {/* brick wall texture */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(59,46,90,0.045) 0 2px, transparent 2px 34px), repeating-linear-gradient(90deg, rgba(59,46,90,0.045) 0 2px, transparent 2px 52px)" }}
        aria-hidden
      />
      {/* floor */}
      <div className="absolute inset-x-0 bottom-0 h-[10%] border-t-4 border-[#3B2E5A]" style={{ background: "repeating-linear-gradient(90deg, #C9A86B 0 26px, #BD9A5F 26px 52px)" }} aria-hidden />

      <WindowDiv className="start-[5%]" />
      <WindowDiv className="end-[5%]" />

      {/* entrance door */}
      <div className="absolute bottom-0 left-1/2 z-[3] h-[36%] w-[30%] -translate-x-1/2 rounded-t-2xl border-4 border-[#3B2E5A] bg-[#8B5E3C]" aria-hidden>
        <div className="absolute inset-x-[14%] top-[10%] h-[34%] rounded-t-lg border-[3px] border-[#5C3A22]" />
        <div className="absolute inset-x-[14%] bottom-[8%] h-[34%] rounded-lg border-[3px] border-[#5C3A22]" />
        <div className="absolute end-[8%] top-[48%] h-4 w-4 rounded-full border-[3px] border-[#3B2E5A] bg-[#E8A81C]" />
      </div>
      {/* little bell sign above the door */}
      <div className="absolute bottom-[37%] left-1/2 z-[4] grid h-[9%] w-[26%] -translate-x-1/2 place-items-center rounded-xl border-4 border-[#3B2E5A] bg-[#FAFAFA]" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-[72%]">
          <path d="M12 3 C7.5 3 6 8 5.5 13 L18.5 13 C18 8 16.5 3 12 3 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2" />
          <circle cx="12" cy="16.5" r="2" fill="#3B2E5A" />
        </svg>
      </div>

      {/* golden school bell */}
      <div className="absolute left-1/2 top-[1.5%] z-20 w-[27%] -translate-x-1/2">
        <div className="mx-auto h-2.5 w-[74%] rounded-full border-[3px] border-[#3B2E5A] bg-[#6C4AB6]" aria-hidden />
        <motion.div
          style={{ transformOrigin: "top center" }}
          animate={ringing ? { rotate: [0, -20, 15, -10, 6, -3, 0] } : { rotate: pull * 0.07 }}
          transition={ringing ? { duration: 1.7, ease: "easeOut" } : { type: "spring", stiffness: 320, damping: 22 }}
        >
          <BellSvg className="mx-auto h-auto w-[74%] drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" />
        </motion.div>
      </div>

      {/* expanding sound waves */}
      {waves > 0 && (
        <div key={waves} className="pointer-events-none absolute left-1/2 top-[15%] z-30 h-0 w-0" aria-hidden>
          {[0, 1].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-4 border-[#1EC8CF]"
              style={{ left: i === 0 ? -150 : 40, top: -26, width: 120, height: 120 }}
              initial={{ scale: 0.35, opacity: 0.85 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.9, delay: i * 0.22, repeat: 1, repeatDelay: 0.4 }}
            />
          ))}
        </div>
      )}

      {/* draggable rope: stretches downward only */}
      <div
        className="absolute left-1/2 top-[16.5%] z-10 w-14 -translate-x-1/2"
        style={{ height: `${ROPE_BASE + pull}px`, transition: drag.dragging ? "none" : "height 0.35s cubic-bezier(0.34,1.4,0.64,1)" }}
      >
        <Pulse active={hintPulse > 0 && !done} className="h-full">
          <div
            {...(solved || done ? {} : drag.bind)}
            className="relative h-full w-full cursor-grab active:cursor-grabbing"
            role="button"
            aria-label={lang === "fa" ? "طناب زنگ" : "bell rope"}
            style={{ touchAction: "none" }}
          >
            <div
              className="absolute left-1/2 top-0 h-full w-[10px] -translate-x-1/2 rounded-md"
              style={{ background: "repeating-linear-gradient(45deg, #C98A4B 0 6px, #A9713C 6px 12px)", borderLeft: "3px solid #3B2E5A", borderRight: "3px solid #3B2E5A" }}
              aria-hidden
            />
            <div className="absolute bottom-0 left-1/2 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full border-4 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden>
              <div className="h-4 w-4 rounded-full border-[3px] border-[#3B2E5A] bg-[#FAFAFA]" />
            </div>
          </div>
        </Pulse>
      </div>

      {/* celebration confetti */}
      {done && (
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden" aria-hidden>
          {CONFETTI.map((p, i) => (
            <div key={i} className="absolute top-0 rounded-[3px]" style={{ left: `${p.l}%`, width: 10, height: 14, background: p.c, animation: `confetti-fall 1.5s linear ${p.d}s both` }} />
          ))}
        </div>
      )}
    </Scene>
  );
}
