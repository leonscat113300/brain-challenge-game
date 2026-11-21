"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 40 — Pipe maze: trace the winding pipes (mind the capped       */
/* stub) and tap the chute the ball will really exit from.              */
/* ------------------------------------------------------------------ */

type Chute = "A" | "B" | "C";

const TRUTH: Chute = "B";
const MISTAKE_MSG = { fa: "مسیر رو دنبال کن!", en: "Follow the pipes!" };
const PIPES = [
  "M160 96 L160 150",
  "M160 150 C118 160 88 180 92 220 C96 258 70 262 80 300",
  "M160 150 C160 190 138 208 150 240 C160 264 170 268 160 300",
  "M160 150 C204 160 236 182 230 220 C224 258 250 264 240 300",
];
const CHUTES: Array<{ id: Chute; left: string }> = [
  { id: "A", left: "13%" },
  { id: "B", left: "38%" },
  { id: "C", left: "63%" },
];
const CONFETTI: Array<{ l: number; d: number; c: string }> = [
  { l: 6, d: 0, c: "#FF6B81" }, { l: 18, d: 0.12, c: "#FFD154" }, { l: 30, d: 0.05, c: "#1EC8CF" },
  { l: 42, d: 0.2, c: "#4CAF50" }, { l: 54, d: 0.1, c: "#6C4AB6" }, { l: 66, d: 0.16, c: "#FF6B81" },
  { l: 78, d: 0.03, c: "#FFD154" }, { l: 90, d: 0.22, c: "#1EC8CF" }, { l: 12, d: 0.3, c: "#4CAF50" },
  { l: 84, d: 0.28, c: "#6C4AB6" },
];

type BallPath = { cx: number[]; cy: number[]; times: number[]; dur: number };

/* Ball routes: B winds through the only open pipe; A and C slam into
   their blockers (gate / cork) instead of revealing the real exit. */
const PATH_TRUTH: BallPath = {
  cx: [160, 160, 160, 160, 146, 150, 163, 160, 160, 160, 160],
  cy: [-14, 58, 128, 150, 208, 240, 268, 300, 348, 320, 344],
  times: [0, 0.14, 0.3, 0.4, 0.55, 0.66, 0.76, 0.86, 0.93, 0.97, 1],
  dur: 2.7,
};
const PATH_A: BallPath = {
  cx: [160, 160, 160, 124, 102, 92, 90],
  cy: [-14, 58, 128, 172, 196, 220, 238],
  times: [0, 0.2, 0.38, 0.56, 0.7, 0.84, 1],
  dur: 2,
};
const PATH_C: BallPath = {
  cx: [160, 160, 160, 196, 218, 230, 228],
  cy: [-14, 58, 128, 172, 194, 220, 240],
  times: [0, 0.2, 0.38, 0.56, 0.7, 0.84, 1],
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

  /* the ball follows the pipe matching the picked chute; only B is open */
  const path = picked === "A" ? PATH_A : picked === "C" ? PATH_C : PATH_TRUTH;

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
            {/* three exit chutes */}
            <path d="M56 300 L104 300 L124 368 L36 368 Z" fill="#E9E4F6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
            <path d="M136 300 L184 300 L204 368 L116 368 Z" fill="#E9E4F6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
            <path d="M216 300 L264 300 L284 368 L196 368 Z" fill="#E9E4F6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
            {/* closed gate blocks chute A */}
            <g onClick={tapBlocker} style={{ cursor: "pointer" }}>
              <rect x="50" y="222" width="60" height="34" rx="7" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" />
              <path d="M60 229 L100 249 M100 229 L60 249" stroke="#FAFAFA" strokeWidth="6" strokeLinecap="round" />
            </g>
            {/* cork plug blocks chute C */}
            <g onClick={tapBlocker} style={{ cursor: "pointer" }}>
              <rect x="212" y="224" width="56" height="30" rx="12" fill="#D99A5B" stroke="#3B2E5A" strokeWidth="4.5" />
              <path d="M224 233 H256 M224 244 H248" stroke="#A9713C" strokeWidth="3.5" strokeLinecap="round" />
            </g>
            {/* capped decoy stub branching off the trunk — a dead end */}
            <g onClick={tapStub} style={{ cursor: "pointer" }}>
              <rect x="148" y="94" width="72" height="36" fill="transparent" />
              <path d="M160 112 L196 112" fill="none" stroke="#3B2E5A" strokeWidth="26" strokeLinecap="round" />
              <path d="M160 112 L196 112" fill="none" stroke="#E9E4F6" strokeWidth="15" strokeLinecap="round" />
              <circle cx="202" cy="112" r="11" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4.5" />
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
          {/* ball travelling the real path */}
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
            className="absolute bottom-[1.5%] z-10 grid h-[13%] w-[24%] place-items-center rounded-2xl border-4 border-[#3B2E5A] text-2xl font-black text-[#3B2E5A] shadow-[0_4px_0_rgba(59,46,90,0.2)] disabled:cursor-default"
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
