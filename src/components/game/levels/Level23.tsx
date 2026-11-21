"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Pulse, Scene, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 23 — The Exit Door: three doors in a dark hallway; only the   */
/* middle one leaks warm light. Tap it to escape.                      */
/* ------------------------------------------------------------------ */

const DARK_MSG = { fa: "پشت این در تاریکه!", en: "It's dark behind this door!" };

function RaysSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden>
      {Array.from({ length: 10 }).map((_, i) => (
        <path key={i} d="M100 100 L93 8 L107 8 Z" fill="#FFD154" opacity={i % 2 ? 0.45 : 0.8} transform={`rotate(${i * 36} 100 100)`} />
      ))}
      <circle cx="100" cy="100" r="30" fill="#FFD154" opacity="0.9" />
    </svg>
  );
}

function BatsSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 56" className={className} style={style} aria-hidden>
      <g fill="#17102B" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round">
        <path d="M22 26 Q10 12 2 20 Q10 26 12 31 Q4 35 9 44 Q18 41 26 32 Z" />
        <path d="M96 40 Q108 28 117 36 Q109 42 107 46 Q115 51 109 55 Q100 51 93 44 Z" />
        <path d="M56 10 Q45 -2 38 7 Q46 13 48 17 Q40 21 45 30 Q53 27 60 19 Z" />
      </g>
      <circle cx="50" cy="13" r="2" fill="#FAFAFA" />
      <circle cx="56" cy="13" r="2" fill="#FAFAFA" />
    </svg>
  );
}

function WalkerSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 132" className={className} style={style} aria-hidden>
      <circle cx="45" cy="26" r="19" fill="#33205E" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M45 7 Q52 1 55 9" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="38" cy="26" r="5.5" fill="#FAFAFA" />
      <circle cx="52" cy="26" r="5.5" fill="#FAFAFA" />
      <circle cx="39.5" cy="26.5" r="2.2" fill="#33205E" />
      <circle cx="53.5" cy="26.5" r="2.2" fill="#33205E" />
      <ellipse cx="32" cy="33" rx="3.5" ry="2" fill="#FF9FB2" opacity="0.85" />
      <ellipse cx="58" cy="33" rx="3.5" ry="2" fill="#FF9FB2" opacity="0.85" />
      <path d="M40 37 Q45 41 50 37" stroke="#FAFAFA" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M30 60 Q30 44 45 44 Q60 44 60 60 L60 96 Q60 102 54 102 L36 102 Q30 102 30 96 Z" fill="#33205E" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M31 64 Q20 74 24 86" stroke="#33205E" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M59 64 Q70 72 66 84" stroke="#33205E" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M38 102 L34 124" stroke="#33205E" strokeWidth="9" strokeLinecap="round" />
      <path d="M52 102 L58 122" stroke="#33205E" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}

function Door({ warm, open, peek, onTap, label }: { warm: boolean; open: boolean; peek: boolean; onTap: () => void; label: string }) {
  return (
    <div role="button" aria-label={label} onClick={onTap} className="relative h-full w-full cursor-pointer">
      <div className="absolute inset-0 rounded-t-[26px] border-4 border-[#3B2E5A] bg-[#241A44]" />
      {/* doorway interior */}
      <div className="absolute overflow-hidden rounded-t-[18px]" style={{ left: "6%", right: "6%", top: "3.5%", bottom: "3.5%" }} aria-hidden>
        <div
          className="absolute inset-0"
          style={warm
            ? { background: "radial-gradient(ellipse at 50% 72%, #FFD154 0%, rgba(232,168,28,0.7) 48%, #1E1430 92%)" }
            : { background: "linear-gradient(180deg,#1E1430 0%,#120B22 100%)" }}
        />
      </div>
      {/* swinging panel */}
      <div
        className="absolute overflow-hidden rounded-t-[18px] border-4 border-[#3B2E5A]"
        style={{
          left: "6%",
          right: "6%",
          top: "3.5%",
          bottom: "3.5%",
          background: "linear-gradient(180deg,#6C4AB6 0%,#5A3B9E 100%)",
          transformOrigin: "left center",
          transform: open ? "perspective(700px) rotateY(-74deg)" : peek ? "perspective(700px) rotateY(-18deg)" : "rotateY(0deg)",
          transition: "transform 0.85s cubic-bezier(0.5,0,0.4,1)",
        }}
        aria-hidden
      >
        <div className="absolute left-[10%] right-[10%] top-[28%] h-[3px] rounded bg-[#4A3490]" />
        <div className="absolute left-[10%] right-[10%] top-[58%] h-[3px] rounded bg-[#4A3490]" />
        <div className="absolute right-[8%] top-[46%] aspect-square w-[13%] rounded-full border-[3px] border-[#3B2E5A] bg-[#FFD154]" />
      </div>
      {/* light leak / shadow beneath */}
      {warm && !open && (
        <div
          className="pointer-events-none absolute inset-x-[16%] bottom-[-2%] h-[10px] rounded-full"
          style={{
            background: "linear-gradient(90deg, rgba(255,209,84,0), #FFD154 25%, #FFD154 75%, rgba(255,209,84,0))",
            boxShadow: "0 0 18px 6px rgba(255,209,84,0.55)",
            animation: "glow 2.2s ease-in-out infinite",
          }}
          aria-hidden
        />
      )}
      {!warm && <div className="pointer-events-none absolute inset-x-[18%] bottom-[-2.5%] h-[8px] rounded-full bg-[#17102B] opacity-80" aria-hidden />}
      {warm && !open &&
        [0, 1, 2].map((i) => (
          <span
            key={i}
            className="pointer-events-none absolute rounded-full bg-[#FFD154]"
            style={{ width: 6, height: 6, left: `${36 + i * 14}%`, bottom: "-1%", opacity: 0.9, animation: `float-up 2.6s linear ${i * 0.8}s infinite` }}
            aria-hidden
          />
        ))}
    </div>
  );
}

export default function Level23({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [done, setDone] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [peek, setPeek] = useState<number | null>(null);

  const tapExit = () => {
    if (solved || done || exitOpen) return;
    setDone(true);
    setExitOpen(true);
    sfx.chime();
    onProgress(1);
    window.setTimeout(() => sfx.cheer(), 380);
    window.setTimeout(onSolved, 700);
  };

  const tapDark = (n: number) => {
    if (solved || done || exitOpen) return;
    setPeek(n);
    sfx.whoosh();
    onMistake(DARK_MSG);
    window.setTimeout(() => setPeek(null), 1500);
  };

  return (
    <Scene bg="linear-gradient(180deg,#33205E 0%,#4A3490 55%,#6C4AB6 100%)">
      {/* hanging lamps */}
      {[16, 84].map((x) => (
        <div key={x} className="absolute top-0 w-10" style={{ insetInlineStart: `${x}%` }} aria-hidden>
          <div className="mx-auto h-10 w-[3px] bg-[#17102B]" />
          <div className="h-7 w-10 rounded-b-full border-4 border-[#3B2E5A] bg-[#FFD154]" />
          <div className="-ml-3 mt-1 h-4 w-16 rounded-full bg-[#FFD154] opacity-40 blur-[6px]" />
        </div>
      ))}
      {/* tiled floor */}
      <div className="absolute inset-x-0 bottom-0 h-[7%] border-t-4 border-[#17102B]" style={{ background: "repeating-linear-gradient(90deg,#241A44 0 64px,#2B2050 64px 128px)" }} aria-hidden />

      {/* the three doors */}
      <div className="absolute inset-x-[4%] bottom-[7%] top-[13%] flex items-stretch gap-[4%]">
        {/* door 1 */}
        <div className="relative flex-1">
          {peek === 1 && (
            <motion.div className="pointer-events-none absolute -top-[14%] left-[8%] z-20 w-[74%]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: -28 }} transition={{ duration: 0.8 }}>
              <BatsSvg className="w-full" />
            </motion.div>
          )}
          <Door warm={false} open={false} peek={peek === 1} onTap={() => tapDark(1)} label={lang === "fa" ? "در اول" : "first door"} />
        </div>

        {/* door 2 — the exit */}
        <Pulse active={hintPulse > 0 && !done} className="relative flex-1">
          {exitOpen && (
            <div className="pointer-events-none absolute -bottom-[3%] left-[-30%] z-[3] h-[14%] w-[160%]" style={{ background: "radial-gradient(ellipse at center, rgba(255,209,84,0.55), transparent 70%)" }} aria-hidden />
          )}
          {exitOpen && (
            <div className="pointer-events-none absolute -inset-[18%] z-0" style={{ animation: "spin 16s linear infinite" }} aria-hidden>
              <RaysSvg className="h-full w-full opacity-90" />
            </div>
          )}
          <div className="relative z-[5] h-full">
            <Door warm open={exitOpen} peek={false} onTap={tapExit} label={lang === "fa" ? "در روشن" : "the glowing door"} />
          </div>
          {exitOpen && (
            <motion.div
              className="pointer-events-none absolute left-[16%] top-[8%] z-[6] w-[54%]"
              initial={{ x: 0, opacity: 0 }}
              animate={{ x: 60, opacity: [0, 1, 1] }}
              transition={{ duration: 1.5, delay: 0.35, ease: "linear" }}
            >
              <div style={{ animation: "bob 0.45s ease-in-out infinite alternate" }}>
                <WalkerSvg className="w-full" />
              </div>
            </motion.div>
          )}
        </Pulse>

        {/* door 3 */}
        <div className="relative flex-1">
          {peek === 3 && (
            <motion.div className="pointer-events-none absolute -top-[14%] left-[8%] z-20 w-[74%]" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: -28 }} transition={{ duration: 0.8 }}>
              <BatsSvg className="w-full" />
            </motion.div>
          )}
          <Door warm={false} open={false} peek={peek === 3} onTap={() => tapDark(3)} label={lang === "fa" ? "در سوم" : "third door"} />
        </div>
      </div>
    </Scene>
  );
}
