"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Transition } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 51 — Which path is shorter? The rich winding road is a trap;  */
/* the plain dashed straight path wins. A little kid walks the chosen  */
/* route: on the long one he gets tired and trudges back.              */
/* ------------------------------------------------------------------ */

const START: [number, number] = [100, 210];
const END: [number, number] = [433, 228];

const PATH_A = "M100 210 C 70 150 120 95 185 88 C 250 81 245 45 300 55 C 355 65 340 150 433 228";
const PATH_B = "M100 210 C 180 206 350 214 433 228";

type Stage = "idle" | "walkA" | "tired" | "backA" | "walkB" | "done";

const POS: Record<Stage, { x: number | number[]; y: number | number[] }> = {
  idle: { x: START[0], y: START[1] },
  walkA: { x: [100, 155, 220, 270, 295], y: [210, 135, 98, 82, 102] },
  tired: { x: 295, y: 102 },
  backA: { x: [295, 270, 220, 155, 100], y: [102, 82, 98, 135, 210] },
  walkB: { x: [100, 433], y: [210, 228] },
  done: { x: END[0], y: END[1] },
};

const T: Record<Stage, Transition> = {
  idle: { duration: 0.35 },
  walkA: { duration: 1.5, ease: "easeInOut" },
  tired: { duration: 0.35 },
  backA: { duration: 1.6, ease: "easeInOut" },
  walkB: { duration: 1.25, ease: "linear" },
  done: { duration: 0.35 },
};

function Tree({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-hidden>
      <rect x="-4" y="0" width="8" height="16" rx="3" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="0" cy="-12" r="15" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="-5" cy="-16" r="4" fill="#7BC96A" opacity="0.8" />
    </g>
  );
}

function House() {
  return (
    <g transform="translate(16 130)" aria-hidden>
      <rect x="56" y="14" width="11" height="22" rx="3" fill="#C88B4A" stroke="#3B2E5A" strokeWidth="3.5" />
      <rect x="0" y="44" width="72" height="54" rx="6" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M-8 46 L36 8 L80 46 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <rect x="28" y="64" width="18" height="34" rx="4" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="3.5" />
      <circle cx="43" cy="82" r="2" fill="#FFD154" />
      <circle cx="58" cy="62" r="9" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
      <path d="M58 55 V69 M51 62 H65" stroke="#3B2E5A" strokeWidth="2" />
    </g>
  );
}

function School({ done }: { done: boolean }) {
  return (
    <g transform="translate(385 115)" aria-hidden>
      <rect x="0" y="50" width="96" height="72" rx="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M-8 52 L48 14 L104 52 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <line x1="48" y1="14" x2="48" y2="-10" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: done ? 1 : 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 13 }}
        style={{ transformBox: "fill-box", transformOrigin: "0% 50%" }}
      >
        <path d="M48 -10 L74 -3 L48 4 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      </motion.g>
      <g style={{ animation: done ? "wobble 0.6s ease-in-out 3" : undefined, transformBox: "fill-box", transformOrigin: "50% 20%" }}>
        <circle cx="48" cy="32" r="7" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="3.5" />
        <circle cx="48" cy="41" r="2" fill="#3B2E5A" />
      </g>
      <circle cx="48" cy="70" r="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
      <path d="M48 70 L48 65 M48 70 L52 72" stroke="#3B2E5A" strokeWidth="2" strokeLinecap="round" />
      <rect x="10" y="66" width="18" height="16" rx="3" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
      <rect x="68" y="66" width="18" height="16" rx="3" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
      <rect x="36" y="86" width="24" height="36" rx="4" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="55" cy="105" r="2.2" fill="#FFD154" />
    </g>
  );
}

export default function Level51({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [done, setDone] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pick = useCallback(
    (p: "a" | "b") => {
      if (solved || done || stage !== "idle") return;
      if (p === "b") {
        setStage("walkB");
        sfx.whoosh();
        timers.current.push(
          setTimeout(() => {
            setStage("done");
            setDone(true);
            sfx.unlock();
            onProgress(1);
            timers.current.push(setTimeout(() => sfx.cheer(), 380));
            timers.current.push(setTimeout(onSolved, 1050));
          }, 1300)
        );
      } else {
        setStage("walkA");
        sfx.whoosh();
        timers.current.push(setTimeout(() => setStage("tired"), 1600));
        timers.current.push(setTimeout(() => setStage("backA"), 2350));
        timers.current.push(
          setTimeout(() => {
            setStage("idle");
            onMistake({ fa: "این دورانه! راه مستقیم رو بزن", en: "That's the long way! Take the straight path" });
          }, 4050)
        );
      }
    },
    [solved, done, stage, onProgress, onSolved, onMistake]
  );

  const moving = stage === "walkA" || stage === "backA" || stage === "walkB";
  const sweaty = stage === "tired" || stage === "backA";

  return (
    <Scene bg="linear-gradient(180deg,#EAF7E4 0%,#DFF0D8 100%)">
      <svg viewBox="0 0 500 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
        {/* clouds */}
        <g transform="translate(70 32)" opacity="0.9" aria-hidden>
          <ellipse cx="0" cy="0" rx="26" ry="11" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
          <ellipse cx="22" cy="-8" rx="15" ry="8" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
        </g>
        <g transform="translate(430 42)" opacity="0.9" aria-hidden>
          <ellipse cx="0" cy="0" rx="22" ry="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
        </g>

        {/* the pond beside the long road */}
        <ellipse cx="298" cy="170" rx="36" ry="14" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
        <path d="M280 168 q9 -5 18 0 q9 5 18 0" stroke="#FAFAFA" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />

        {/* path A: long winding decorated road */}
        <path d={PATH_A} stroke="#3B2E5A" strokeWidth="24" fill="none" strokeLinecap="round" />
        <path d={PATH_A} stroke="#F2D29B" strokeWidth="16" fill="none" strokeLinecap="round" />
        <path d={PATH_A} stroke="#3B2E5A" strokeWidth="2.5" fill="none" strokeDasharray="9 11" opacity="0.6" />

        {/* path B: short straight dashed path */}
        <path d={PATH_B} stroke="#FAFAFA" strokeWidth="12" fill="none" strokeLinecap="round" />
        <path d={PATH_B} stroke="#6C4AB6" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="15 12" />

        {/* stream + bridge along path B */}
        <ellipse cx="267" cy="212" rx="30" ry="8" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="3.5" />
        <rect x="248" y="196" width="40" height="14" rx="5" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="3.5" />
        <path d="M258 196 V210 M268 196 V210 M278 196 V210" stroke="#5C3A22" strokeWidth="2.5" />

        {/* trees along path A */}
        <Tree x={155} y={88} />
        <Tree x={252} y={48} />
        <Tree x={322} y={68} />

        <House />
        <School done={done} />

        {/* start / end pads */}
        <circle cx={START[0]} cy={START[1]} r="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" strokeDasharray="4 3" />
        <circle cx={END[0]} cy={END[1] + 4} r="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" strokeDasharray="4 3" />

        {/* invisible tap zones for both routes */}
        <path
          d={PATH_A}
          stroke="transparent"
          strokeWidth="34"
          fill="none"
          style={{ pointerEvents: "stroke", cursor: "pointer" }}
          onClick={() => pick("a")}
          aria-label={lang === "fa" ? "راه پیچ‌دار" : "winding path"}
        />
        <path
          d={PATH_B}
          stroke="transparent"
          strokeWidth="26"
          fill="none"
          style={{ pointerEvents: "stroke", cursor: "pointer" }}
          onClick={() => pick("b")}
          aria-label={lang === "fa" ? "راه مستقیم" : "straight path"}
        />

        {/* the little walker */}
        <motion.g initial={{ x: START[0], y: START[1] }} animate={POS[stage]} transition={T[stage]}>
          <g transform="scale(1.15)">
            <g style={{ animation: moving ? "bob 0.38s ease-in-out infinite" : undefined, transformBox: "fill-box", transformOrigin: "center" }}>
              <path d="M-4 14 L-5 24 M4 14 L5 24" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
              <path d="M-9 2 L-15 8 M9 2 L15 8" stroke="#3B2E5A" strokeWidth="3.5" strokeLinecap="round" />
              <rect x="-9" y="-4" width="18" height="20" rx="8" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4" />
              <circle cx="0" cy="-14" r="11" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4" />
              <path d="M-6 -24 Q0 -30 6 -24" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
              <circle cx="-3.5" cy="-14" r="1.8" fill="#3B2E5A" />
              <circle cx="3.5" cy="-14" r="1.8" fill="#3B2E5A" />
              <path d="M-2.5 -9.5 Q0 -7.5 2.5 -9.5" stroke="#3B2E5A" strokeWidth="2" fill="none" strokeLinecap="round" />
              {sweaty && (
                <circle cx="13" cy="-26" r="3.4" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="1.5" style={{ animation: "float-up 1s ease-in infinite" }} />
              )}
            </g>
          </g>
        </motion.g>
      </svg>

      {/* hint pulse over the straight path */}
      <div className="pointer-events-none absolute" style={{ left: "26%", top: "60%", width: "46%", height: "18%" }} aria-hidden>
        <Pulse active={hintPulse > 0 && !done}>
          <div className="h-full w-full" />
        </Pulse>
      </div>
    </Scene>
  );
}
