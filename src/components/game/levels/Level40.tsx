"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 40 — Pipe maze: FOUR chutes now. Trace the winding pipes      */
/* (mind the two capped stubs) and tap the chute the ball will really  */
/* exit from. A: gate, B: cork, C: valve — only D is open.             */
/* ------------------------------------------------------------------ */

type Chute = "A" | "B" | "C" | "D";

const TRUTH: Chute = "D";
const MISTAKE_MSG = { fa: "مسیر رو دنبال کن!", en: "Follow the pipes!" };
const PIPES = [
  "M160 96 L160 150",
  "M160 150 C120 160 64 180 44 220 C36 258 40 262 40 300",
  "M160 150 C150 190 128 210 122 240 C120 268 120 268 120 300",
  "M160 150 C172 190 194 210 200 240 C200 268 200 268 200 300",
  "M160 150 C204 160 258 180 278 220 C284 258 280 262 280 300",
];
const CHUTES: Array<{ id: Chute; left: string }> = [
  { id: "A", left: "1%" },
  { id: "B", left: "25.5%" },
  { id: "C", left: "50.5%" },
  { id: "D", left: "75.5%" },
];
const CONFETTI: Array<{ l: number; d: number; c: string }> = [
  { l: 6, d: 0, c: "#FF6B81" }, { l: 18, d: 0.12, c: "#FFD154" }, { l: 30, d: 0.05, c: "#1EC8CF" },
  { l: 42, d: 0.2, c: "#4CAF50" }, { l: 54, d: 0.1, c: "#6C4AB6" }, { l: 66, d: 0.16, c: "#FF6B81" },
  { l: 78, d: 0.03, c: "#FFD154" }, { l: 90, d: 0.22, c: "#1EC8CF" }, { l: 12, d: 0.3, c: "#4CAF50" },
  { l: 84, d: 0.28, c: "#6C4AB6" },
];

type BallPath = { cx: number[]; cy: number[]; times: number[]; dur: number };

/* Ball routes: D winds through the only open pipe; A, B and C slam
   into their blockers (gate / cork / valve) instead of revealing it. */
const PATH_TRUTH: BallPath = {
  cx: [160, 160, 160, 160, 204, 258, 278, 280, 280, 280],
  cy: [-14, 58, 128, 150, 168, 196, 220, 258, 300, 344],
  times: [0, 0.16, 0.32, 0.37, 0.49, 0.62, 0.72, 0.81, 0.9, 1],
  dur: 2.7,
};
const PATH_A: BallPath = {
  cx: [160, 160, 160, 160, 120, 64, 44, 40],
  cy: [-14, 58, 128, 150, 162, 182, 220, 238],
  times: [0, 0.23, 0.45, 0.52, 0.63, 0.81, 0.95, 1],
  dur: 2,
};
const PATH_B: BallPath = {
  cx: [160, 160, 160, 160, 150, 128, 122, 122],
  cy: [-14, 58, 128, 150, 190, 212, 240, 250],
  times: [0, 0.26, 0.5, 0.58, 0.73, 0.86, 0.96, 1],
  dur: 2,
};
const PATH_C: BallPath = {
  cx: [160, 160, 160, 160, 172, 194, 200, 200],
  cy: [-14, 58, 128, 150, 190, 212, 240, 250],
  times: [0, 0.26, 0.5, 0.58, 0.73, 0.86, 0.96, 1],
  dur: 2,
};

export default function Level40({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [picked, setPicked] = useState<Chute | null>(null);
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState(0);
  const [result, setResult] = useState<"right" | "wrong" | null>(null);
  const [done, setDone] = useState(false);
  const timers = useRef<number[]>([]);

  const t = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  /* the ball follows the pipe matching the picked chute; only D is open */
  const path = picked === "A" ? PATH_A : picked === "B" ? PATH_B : picked === "C" ? PATH_C : PATH_TRUTH;

  const tapChute = (c: Chute) => {
    if (solved || done || picked !== null) return;
    sfx.click();
    setPicked(c);
    setResult(null);
    setRunId((n) => n + 1);
    t(() => setRunning(true), 350);
  };

  const onRunComplete = useCallback(() => {
    if (solved || done) return;
    if (picked === TRUTH) {
      setResult("right");
      setDone(true);
      sfx.cheer();
      onProgress(1);
      t(onSolved, 700);
    } else {
      setResult("wrong");
      sfx.boing();
      onMistake(MISTAKE_MSG);
      t(() => {
        setPicked(null);
        setResult(null);
        setRunning(false);
      }, 1500);
    }
  }, [solved, done, picked, onProgress, onSolved, onMistake, t]);

  const tapBlocker = () => {
    if (solved || done) return;
    sfx.pop();
  };

  const tapStub = () => {
    if (solved || done) return;
    sfx.pop();
    onMistake({ fa: "این یکی بن‌بسته!", en: "This one is a dead end!" });
  };

  return (
    <Scene bg="linear-gradient(180deg,#EFE9F8 0%,#E4DCF3 100%)">
      <div className="absolute inset-x-0 top-[2%] bottom-[16%]">
        <Pulse active={hintPulse > 0 && !done} color="#1EC8CF" className="mx-auto h-full w-[88%]">
          <svg viewBox="0 0 320 420" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
            {/* tube outlines then inner channel */}
            {PIPES.map((d) => (
              <path key={`o-${d}`} d={d} fill="none" stroke="#3B2E5A" strokeWidth="26" strokeLinecap="round" />
            ))}
            {PIPES.map((d) => (
              <path key={`i-${d}`} d={d} fill="none" stroke="#E9E4F6" strokeWidth="15" strokeLinecap="round" />
            ))}
            {/* funnel */}
            <path d="M112 26 L208 26 L172 96 L148 96 Z" fill="#E9E4F6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
            {/* four exit chutes */}
            <path d="M16 300 L64 300 L72 368 L8 368 Z" fill="#E9E4F6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
            <path d="M96 300 L144 300 L152 368 L88 368 Z" fill="#E9E4F6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
            <path d="M176 300 L224 300 L232 368 L168 368 Z" fill="#E9E4F6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
            <path d="M256 300 L304 300 L312 368 L248 368 Z" fill="#E9E4F6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
            {/* closed gate blocks chute A */}
            <g onClick={tapBlocker} style={{ cursor: "pointer" }}>
              <rect x="12" y="218" width="56" height="32" rx="7" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" />
              <path d="M22 226 L58 242 M58 226 L22 242" stroke="#FAFAFA" strokeWidth="6" strokeLinecap="round" />
            </g>
            {/* cork plug blocks chute B */}
            <g onClick={tapBlocker} style={{ cursor: "pointer" }}>
              <rect x="96" y="228" width="52" height="28" rx="12" fill="#D99A5B" stroke="#3B2E5A" strokeWidth="4.5" />
              <path d="M106 236 H136 M106 246 H130" stroke="#A9713C" strokeWidth="3.5" strokeLinecap="round" />
            </g>
            {/* shut valve blocks chute C */}
            <g onClick={tapBlocker} style={{ cursor: "pointer" }}>
              <circle cx="200" cy="236" r="17" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4.5" />
              <rect x="184" y="230" width="32" height="11" rx="5.5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" transform="rotate(45 200 236)" />
              <circle cx="200" cy="236" r="4" fill="#3B2E5A" />
            </g>
            {/* capped decoy stub branching off the trunk — a dead end */}
            <g onClick={tapStub} style={{ cursor: "pointer" }}>
              <rect x="148" y="94" width="72" height="36" fill="transparent" />
              <path d="M160 112 L196 112" fill="none" stroke="#3B2E5A" strokeWidth="26" strokeLinecap="round" />
              <path d="M160 112 L196 112" fill="none" stroke="#E9E4F6" strokeWidth="15" strokeLinecap="round" />
              <circle cx="202" cy="112" r="11" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4.5" />
            </g>
            {/* second capped stub off chute A's pipe */}
            <g onClick={tapStub} style={{ cursor: "pointer" }}>
              <rect x="20" y="164" width="66" height="34" fill="transparent" />
              <path d="M64 180 L36 180" fill="none" stroke="#3B2E5A" strokeWidth="26" strokeLinecap="round" />
              <path d="M64 180 L36 180" fill="none" stroke="#E9E4F6" strokeWidth="15" strokeLinecap="round" />
              <circle cx="30" cy="180" r="11" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4.5" />
            </g>
          </svg>
          {/* idle ball waiting above the funnel */}
          {!running && (
            <motion.div
              className="absolute left-[50%] top-[3%] z-[8] aspect-square h-[4.5%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#3B2E5A] bg-[#FF6B81]"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            />
          )}
          {/* ball travelling the picked path */}
          {running && picked !== null && (
            <motion.div
              key={runId}
              className="absolute left-[50%] top-[-2%] z-[8] aspect-square h-[4.5%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-[#3B2E5A] bg-[#FF6B81]"
              initial={false}
              animate={{
                left: path.cx.map((x) => `${(x / 320) * 100}%`),
                top: path.cy.map((y) => `${(y / 420) * 100}%`),
              }}
              transition={{ duration: path.dur, times: path.times, ease: "linear" }}
              onAnimationComplete={onRunComplete}
              aria-hidden
            />
          )}
        </Pulse>
      </div>

      {/* chute answer buttons */}
      {CHUTES.map((c) => {
        const isPicked = picked === c.id;
        const bg = isPicked ? (result === "right" ? "#FFD154" : result === "wrong" ? "#FF6B81" : "#FFF3D6") : "#FAFAFA";
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => tapChute(c.id)}
            disabled={solved || done || picked !== null}
            aria-label={lang === "fa" ? `دهانه ${c.id}` : `chute ${c.id}`}
            className="absolute bottom-[1.5%] z-10 grid h-[13%] w-[22%] place-items-center rounded-2xl border-4 border-[#3B2E5A] text-2xl font-black text-[#3B2E5A] shadow-[0_4px_0_rgba(59,46,90,0.2)] disabled:cursor-default"
            style={{ left: c.left, background: bg, transition: "background 0.25s ease, transform 0.3s cubic-bezier(0.34,1.56,0.64,1)", transform: isPicked && result === "right" ? "scale(1.08)" : "scale(1)" }}
          >
            {c.id}
          </button>
        );
      })}

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
