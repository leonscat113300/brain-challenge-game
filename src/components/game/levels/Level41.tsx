"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 41 — Find the different shape: one star hangs point-down.     */
/* ------------------------------------------------------------------ */

const ODD = 2;
const MISTAKE_MSG = { fa: "این یکی مثل بقیه‌ست!", en: "This one matches the others!" };

function StarSvg({ wink = false, className, style }: { wink?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <path d="M50 6 L61.5 37 L95 37 L68 57 L78 91 L50 70.5 L22 91 L32 57 L5 37 L38.5 37 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      {/* face */}
      {wink ? (
        <path d="M33 49 Q40 43 47 49" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="40" cy="49" r="5.5" fill="#3B2E5A" />
          <circle cx="42" cy="46.8" r="1.8" fill="#FAFAFA" />
        </>
      )}
      <circle cx="61" cy="49" r="5.5" fill="#3B2E5A" />
      <circle cx="63" cy="46.8" r="1.8" fill="#FAFAFA" />
      <path d="M42 60 Q50 67 58 60" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="30" cy="57" rx="6" ry="4" fill="#FF9FB2" />
      <ellipse cx="70" cy="57" rx="6" ry="4" fill="#FF9FB2" />
    </svg>
  );
}

function SparkleSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 1 L14.2 9.8 L23 12 L14.2 14.2 L12 23 L9.8 14.2 L1 12 L9.8 9.8 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function CloudSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 60" className={className} style={style} aria-hidden>
      <ellipse cx="38" cy="40" rx="26" ry="16" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="68" cy="32" rx="30" ry="19" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="94" cy="42" rx="20" ry="13" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  );
}

function SunSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 90" className={className} style={style} aria-hidden>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1="45" y1="6" x2="45" y2="18" stroke="#FFD154" strokeWidth="6" strokeLinecap="round" transform={`rotate(${a} 45 45)`} />
      ))}
      <circle cx="45" cy="45" r="20" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
    </svg>
  );
}

export default function Level41({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [flipped, setFlipped] = useState(false);
  const [wink, setWink] = useState(false);
  const [done, setDone] = useState(false);
  const [wrong, setWrong] = useState(-1);
  const [bump, setBump] = useState(0);
  const timers = useRef<number[]>([]);

  const t = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const tapStar = (i: number) => {
    if (solved || done || flipped) return;
    if (i === ODD) {
      setFlipped(true);
      setDone(true);
      sfx.sparkle();
      t(() => sfx.cheer(), 300);
      onProgress(1);
      t(() => setWink(true), 520);
      t(onSolved, 820);
    } else {
      setWrong(i);
      setBump((b) => b + 1);
      t(() => setWrong(-1), 520);
      onMistake(MISTAKE_MSG);
    }
  };

  return (
    <Scene bg="linear-gradient(180deg,#FFF7E6 0%,#FFEBCB 100%)">
      {/* soft background blobs */}
      <div className="absolute -left-[10%] top-[6%] h-40 w-40 rounded-full bg-[#FDE7EF] opacity-70 blur-xl" aria-hidden />
      <div className="absolute -right-[8%] bottom-[8%] h-44 w-44 rounded-full bg-[#E3F6F7] opacity-70 blur-xl" aria-hidden />

      {/* sunny sky decor */}
      <SunSvg className="absolute end-[6%] top-[4%] w-[14%]" style={{ animation: "breathe 3.4s ease-in-out infinite" }} />
      <CloudSvg className="absolute start-[6%] top-[7%] w-[22%]" style={{ animation: "bob 4.2s ease-in-out infinite" }} />
      <CloudSvg className="absolute start-[38%] top-[13%] w-[16%] opacity-90" style={{ animation: "bob 5.1s ease-in-out 0.6s infinite" }} />

      {/* star banner */}
      <div className="absolute left-1/2 top-[24%] w-[92%] -translate-x-1/2 rounded-[30px] border-4 border-[#3B2E5A] bg-[#FAFAFA] px-[4%] pb-[5%] pt-[7%] shadow-[0_6px_0_rgba(59,46,90,0.12)]">
        <div className="flex items-center justify-between">
          {[0, 1, 2, 3, 4].map((i) => {
            const odd = i === ODD;
            return (
              <button
                key={i}
                type="button"
                onClick={() => tapStar(i)}
                disabled={solved || done}
                aria-label={lang === "fa" ? "ستاره" : "star"}
                className="relative w-[17%] max-w-[96px] disabled:cursor-default"
                style={{ animation: `bob ${2.6 + i * 0.25}s ease-in-out infinite` }}
              >
                <div key={wrong === i ? bump : "calm"} style={{ animation: wrong === i ? "shake-hard 0.45s ease-in-out" : undefined }}>
                  <motion.div
                    initial={false}
                    animate={{ rotate: odd && !flipped ? 180 : 0 }}
                    transition={odd ? { type: "spring", stiffness: 210, damping: 10.5 } : { duration: 0.2 }}
                  >
                    <Pulse active={hintPulse > 0 && !done && odd}>
                      <StarSvg wink={odd && wink} className="h-auto w-full drop-shadow-[0_3px_2px_rgba(59,46,90,0.18)]" />
                    </Pulse>
                  </motion.div>
                </div>
                {odd && done && (
                  <>
                    <SparkleSvg className="absolute -top-4 end-[-10px] w-6" style={{ animation: "star-pop 0.5s ease-out 0.05s both" }} />
                    <SparkleSvg className="absolute -bottom-3 start-[-12px] w-5" style={{ animation: "star-pop 0.5s ease-out 0.22s both" }} />
                    <SparkleSvg className="absolute end-[-18px] top-[30%] w-4" style={{ animation: "star-pop 0.5s ease-out 0.4s both" }} />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* little rug under the banner */}
      <div className="absolute left-1/2 top-[70%] h-[9%] w-[70%] -translate-x-1/2 rounded-[50%] bg-[#F6D9A8] opacity-70" aria-hidden />
    </Scene>
  );
}
