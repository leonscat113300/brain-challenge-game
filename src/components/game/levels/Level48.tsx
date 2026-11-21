"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 48 — Which umbrella is intact? Watch how the rain behaves.    */
/* Pink leaks through a hole, yellow drips sideways, green bounces     */
/* the drops off its canopy — tap the green one.                       */
/* ------------------------------------------------------------------ */

type UmbId = "pink" | "yellow" | "green";

interface UmbCfg {
  id: UmbId;
  left: string;
  colLeft: string;
  color: string;
  dark: string;
  rainH: string;
  drift: number;
  fa: string;
  en: string;
}

const UMBS: UmbCfg[] = [
  { id: "pink", left: "5%", colLeft: "15.5%", color: "#FF6B81", dark: "#E14B63", rainH: "56%", drift: 0, fa: "صورتی", en: "pink" },
  { id: "yellow", left: "36%", colLeft: "46.5%", color: "#FFD154", dark: "#E8A81C", rainH: "56%", drift: 22, fa: "زرد", en: "yellow" },
  { id: "green", left: "67%", colLeft: "77.5%", color: "#4CAF50", dark: "#3B8C3F", rainH: "21%", drift: 0, fa: "سبز", en: "green" },
];

const DELAYS = [0, 0.32, 0.64, 0.96];

function CloudSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 150 84" className={className} style={style} aria-hidden>
      <path
        d="M22 66 Q8 66 8 52 Q8 40 22 39 Q24 24 42 24 Q50 12 68 14 Q86 8 96 20 Q114 18 118 34 Q134 36 134 50 Q134 64 118 66 Z"
        fill="#FAFAFA"
        stroke="#3B2E5A"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle cx="52" cy="42" r="4.5" fill="#3B2E5A" />
      <circle cx="84" cy="42" r="4.5" fill="#3B2E5A" />
      <circle cx="53.5" cy="40.5" r="1.6" fill="#fff" />
      <circle cx="85.5" cy="40.5" r="1.6" fill="#fff" />
      <path d="M60 52 Q68 58 76 52" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="44" cy="51" rx="5" ry="3" fill="#FF9FB2" opacity="0.8" />
      <ellipse cx="92" cy="51" rx="5" ry="3" fill="#FF9FB2" opacity="0.8" />
    </svg>
  );
}

function UmbrellaSvg({
  color,
  dark,
  hole,
  slit,
  className,
  style,
}: {
  color: string;
  dark: string;
  hole?: boolean;
  slit?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 120 134" className={className} style={style} aria-hidden>
      <ellipse cx="58" cy="126" rx="27" ry="7" fill="#C9C2DC" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M58 66 L58 124" stroke="#3B2E5A" strokeWidth="6" strokeLinecap="round" />
      <path d="M58 124 Q58 130 50 130" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path
        d="M8 64 A52 52 0 0 1 112 64 L112 64 Q95 77 78 64 Q60 77 43 64 Q26 77 8 64 Z"
        fill={color}
        stroke="#3B2E5A"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M60 16 Q30 34 24 62" stroke={dark} strokeWidth="3" fill="none" opacity="0.7" />
      <path d="M60 16 Q90 34 96 62" stroke={dark} strokeWidth="3" fill="none" opacity="0.7" />
      <path d="M60 16 L60 64" stroke={dark} strokeWidth="3" fill="none" opacity="0.4" />
      <circle cx="60" cy="12" r="5" fill={dark} stroke="#3B2E5A" strokeWidth="3" />
      {hole && <circle cx="88" cy="34" r="9" fill="#BEE9F5" stroke="#3B2E5A" strokeWidth="3.5" />}
      {slit && (
        <path d="M92 22 L98 32 L90 40 L96 50" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function DropSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 14 18" className={className} style={style} aria-hidden>
      <path d="M7 1 C7 1 2 8 2 11.5 A5 5 0 0 0 12 11.5 C12 8 7 1 7 1 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="1.4" />
    </svg>
  );
}

export default function Level48({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [done, setDone] = useState(false);
  const [wob, setWob] = useState<{ id: UmbId; k: number } | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pick = useCallback(
    (id: UmbId) => {
      if (solved || done) return;
      if (id === "green") {
        setDone(true);
        sfx.cheer();
        onProgress(1);
        timers.current.push(setTimeout(onSolved, 700));
      } else {
        setWob((w) => ({ id, k: (w?.k ?? 0) + 1 }));
        onMistake({ fa: "این چتر سوراخ داره!", en: "This umbrella has a hole!" });
      }
    },
    [solved, done, onMistake, onProgress, onSolved]
  );

  return (
    <Scene bg="linear-gradient(180deg,#BEE9F5 0%,#D7F1F7 62%,#EFE9F8 63%,#EFE9F8 100%)">
      {/* ground strip */}
      <div className="absolute inset-x-0 bottom-0 h-[13%] border-t-4 border-[#3B2E5A] bg-[#DFF0D8]" aria-hidden />

      {/* cute rain cloud */}
      <div
        className="absolute left-1/2 top-[2%] z-[14] w-[36%] -translate-x-1/2"
        style={{ animation: "bob 3.4s ease-in-out infinite" }}
        aria-hidden
      >
        <CloudSvg className="w-full h-auto" />
      </div>

      {/* rain columns: pink passes through, yellow drifts sideways, green stops at canopy */}
      {UMBS.map((u) => (
        <div
          key={`rain-${u.id}`}
          className="pointer-events-none absolute"
          style={{
            left: u.colLeft,
            top: "30%",
            width: "5%",
            height: u.rainH,
            zIndex: 12,
            opacity: u.id === "green" && done ? 0 : 1,
            transition: "opacity 0.45s ease",
          }}
          aria-hidden
        >
          {DELAYS.map((d, i) => (
            <motion.span
              key={i}
              className="absolute block w-full"
              style={{ left: 0, top: "0%" }}
              initial={{ top: "0%" }}
              animate={{ top: "100%" }}
              transition={{ duration: 1.25, repeat: Infinity, ease: "linear", delay: d }}
            >
              <motion.span
                className="block w-full"
                animate={{ x: u.drift > 0 ? [0, u.drift] : 0 }}
                transition={{ duration: 1.25, repeat: Infinity, ease: "linear", delay: d }}
              >
                <DropSvg className="w-full h-auto" />
              </motion.span>
            </motion.span>
          ))}
        </div>
      ))}

      {/* drops bouncing off the green canopy */}
      {!done &&
        [
          { l: "76%", d: 0.15 },
          { l: "81%", d: 0.5 },
        ].map((b, i) => (
          <motion.span
            key={`bd-${i}`}
            className="absolute z-[13] rounded-full"
            style={{ left: b.l, top: "48%", width: 8, height: 8, background: "#1EC8CF" }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: b.d }}
            aria-hidden
          />
        ))}

      {/* wet puddles under the broken umbrellas */}
      {UMBS.filter((u) => u.id !== "green").map((u) => (
        <div
          key={`sp-${u.id}`}
          className="absolute rounded-full"
          style={{ left: `calc(${u.colLeft} - 6%)`, bottom: "10%", width: "17%", height: "3.2%", background: "rgba(30,200,207,0.42)", zIndex: 2 }}
          aria-hidden
        />
      ))}

      {/* the three umbrellas on stands */}
      {UMBS.map((u) => {
        const btn = (
          <button
            type="button"
            onClick={() => pick(u.id)}
            aria-label={lang === "fa" ? `چتر ${u.fa}` : `${u.en} umbrella`}
            className="block w-full cursor-pointer border-0 bg-transparent p-0"
          >
            <UmbrellaSvg color={u.color} dark={u.dark} hole={u.id === "pink"} slit={u.id === "yellow"} className="w-full h-auto" />
          </button>
        );
        const wobbing = wob !== null && wob.id === u.id;
        return (
          <div
            key={wobbing ? `${u.id}-${wob.k}` : u.id}
            className="absolute"
            style={{ left: u.left, bottom: "9%", width: "26%", zIndex: 10, animation: wobbing ? "wobble 0.6s ease-in-out" : undefined }}
          >
            {u.id === "green" ? <Pulse active={hintPulse > 0 && !done}>{btn}</Pulse> : btn}
          </div>
        );
      })}

      {/* shield-check badge + sparkles above the intact umbrella */}
      {done && (
        <motion.div
          className="absolute z-20"
          style={{ left: "71%", top: "24%", width: "17%" }}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          <svg viewBox="0 0 44 50" className="w-full h-auto" style={{ animation: "glow 1.6s ease-in-out infinite" }} aria-hidden>
            <path
              d="M22 2 L40 9 V22 C40 35 32 44 22 48 C12 44 4 35 4 22 V9 Z"
              fill="#4CAF50"
              stroke="#3B2E5A"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M13 24 L20 31 L32 16" stroke="#FAFAFA" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {[
            { l: "88%", t: "4%" },
            { l: "2%", t: "22%" },
            { l: "92%", t: "62%" },
            { l: "6%", t: "78%" },
          ].map((p, i) => (
            <span
              key={`sk-${i}`}
              className="absolute rounded-full"
              style={{ left: p.l, top: p.t, width: 7, height: 7, background: "#FFD154", animation: `star-pop 0.5s ${i * 0.1}s both` }}
              aria-hidden
            />
          ))}
        </motion.div>
      )}
    </Scene>
  );
}
