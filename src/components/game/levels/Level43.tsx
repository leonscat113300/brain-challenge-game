"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 43 — Help the turtle arrive faster: drag the fallen log and   */
/* the stone off the track, then the turtle dashes to the finish flag. */
/* ------------------------------------------------------------------ */

function TurtleSvg({ racing, className, style }: { racing: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 230 150" className={className} style={style} aria-hidden>
      {racing && (
        <g stroke="#FAFAFA" strokeWidth="8" strokeLinecap="round" opacity="0.95">
          <path d="M4 52 L46 52 M14 82 L62 82 M6 112 L40 112" />
        </g>
      )}
      {/* tail */}
      <path d="M46 96 Q30 100 24 112" stroke="#3B2E5A" strokeWidth="8" fill="none" strokeLinecap="round" />
      {/* back leg */}
      <ellipse cx="66" cy="128" rx="18" ry="10" fill="#AEDCA0" stroke="#3B2E5A" strokeWidth="4" />
      {/* shell */}
      <path d="M40 110 Q40 40 112 38 Q182 40 184 108 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M52 106 Q54 56 112 52" stroke="#2E7D32" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M112 52 L112 108 M74 60 L84 106 M148 60 L140 106" stroke="#2E7D32" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M40 110 Q112 122 184 108" fill="#AEDCA0" stroke="#3B2E5A" strokeWidth="5" />
      {/* front leg */}
      <ellipse cx="168" cy="128" rx="16" ry="10" fill="#AEDCA0" stroke="#3B2E5A" strokeWidth="4" />
      {/* neck + head */}
      <path d="M176 88 Q200 84 202 66" stroke="#3B2E5A" strokeWidth="26" fill="none" strokeLinecap="round" />
      <path d="M176 88 Q200 84 202 66" stroke="#AEDCA0" strokeWidth="17" fill="none" strokeLinecap="round" />
      <circle cx="202" cy="58" r="26" fill="#AEDCA0" stroke="#3B2E5A" strokeWidth="5" />
      {/* headband */}
      <path d="M180 40 Q202 32 224 42" stroke="#6C4AB6" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M224 42 L236 30 M224 42 L238 46" stroke="#6C4AB6" strokeWidth="7" strokeLinecap="round" />
      {/* face: sunglasses when racing, cute eyes before */}
      {racing ? (
        <g style={{ animation: "pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both", transformBox: "fill-box", transformOrigin: "center" }}>
          <rect x="182" y="50" width="15" height="13" rx="5" fill="#33205E" stroke="#3B2E5A" strokeWidth="3" />
          <rect x="205" y="50" width="15" height="13" rx="5" fill="#33205E" stroke="#3B2E5A" strokeWidth="3" />
          <path d="M197 55 L205 55 M182 54 L176 50" stroke="#3B2E5A" strokeWidth="3" />
        </g>
      ) : (
        <g>
          <circle cx="196" cy="60" r="5.5" fill="#3B2E5A" />
          <circle cx="212" cy="60" r="5.5" fill="#3B2E5A" />
          <circle cx="198" cy="58" r="2" fill="#FAFAFA" />
          <circle cx="214" cy="58" r="2" fill="#FAFAFA" />
        </g>
      )}
      <path d="M186 72 a6 3.5 0 1 0 12 0 a6 3.5 0 1 0 -12 0 M210 72 a6 3.5 0 1 0 12 0 a6 3.5 0 1 0 -12 0" fill="#FF9FB2" />
      <path d="M198 76 Q204 81 210 76" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function LogSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 220 80" className={className} style={style} aria-hidden>
      <rect x="8" y="18" width="204" height="46" rx="23" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="198" cy="41" rx="16" ry="23" fill="#C9986A" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="198" cy="41" rx="8" ry="12" fill="none" stroke="#8B5E3C" strokeWidth="3.5" />
      <circle cx="198" cy="41" r="2.5" fill="#8B5E3C" />
      <path d="M28 32 Q70 26 112 32 M40 50 Q86 44 130 50" stroke="#6E4526" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M150 26 q8 6 0 12 M164 46 q8 6 0 12" stroke="#6E4526" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function StoneSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 160 120" className={className} style={style} aria-hidden>
      <path d="M18 96 Q6 62 34 40 Q62 14 104 24 Q148 34 146 74 Q144 100 112 104 Z" fill="#B9B4C7" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M48 44 Q66 30 92 34" stroke="#8F8AA3" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M36 76 Q56 66 80 72" stroke="#8F8AA3" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function FlagSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 190" className={className} style={style} aria-hidden>
      <ellipse cx="45" cy="178" rx="26" ry="8" fill="#6E4526" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="40" y="14" width="9" height="164" rx="4" fill="#C9986A" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="44.5" cy="12" r="7" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
      <path d="M50 22 L86 30 L50 46 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M56 26 L62 27.5 L56 32 Z M68 29 L74 30.5 L68 35 Z M62 35 L68 36.5 L62 41 Z" fill="#3B2E5A" />
    </svg>
  );
}

const CONFETTI_COLORS = ["#FFD154", "#FF6B81", "#1EC8CF", "#4CAF50", "#6C4AB6", "#FAFAFA"];

export default function Level43({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [logCleared, setLogCleared] = useState(false);
  const [stoneCleared, setStoneCleared] = useState(false);
  const [racing, setRacing] = useState(false);
  const [finished, setFinished] = useState(false);
  const [done, setDone] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);

  /* both obstacles gone -> turtle dashes to the flag (ref guard so the
     celebration timers can never be cancelled by a re-run) */
  const dashStarted = useRef(false);
  const startDash = useCallback(() => {
    if (dashStarted.current) return;
    dashStarted.current = true;
    setRacing(true);
    sfx.whoosh();
    window.setTimeout(() => {
      setFinished(true);
      setDone(true);
      sfx.fanfare();
      window.setTimeout(() => sfx.cheer(), 350);
      onProgress(1);
    }, 1500);
    window.setTimeout(onSolved, 2200);
  }, [onProgress, onSolved]);

  const logDrag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || racing || logCleared) return;
        if (Math.hypot(d.x, d.y) >= 55) {
          setLogCleared(true);
          sfx.whoosh();
          onProgress(0.45);
          if (stoneCleared) startDash();
        } else if (d.everMoved) {
          api.reset();
        }
      },
      [solved, done, racing, logCleared, stoneCleared, onProgress, startDash]
    )
  );

  const stoneDrag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || racing || stoneCleared) return;
        if (Math.hypot(d.x, d.y) >= 55) {
          setStoneCleared(true);
          sfx.whoosh();
          onProgress(0.9);
          if (logCleared) startDash();
        } else if (d.everMoved) {
          api.reset();
        }
      },
      [solved, done, racing, stoneCleared, logCleared, onProgress, startDash]
    )
  );

  const tapTurtle = () => {
    if (solved || done || racing) return;
    sfx.pop();
    setShakeKey((k) => k + 1);
    onMistake({ fa: "اول راه رو باز کن!", en: "Clear the path first!" });
  };

  return (
    <Scene bg="linear-gradient(180deg,#BEE9F5 0%,#D8F3EF 48%,#E9F7F2 62%)">
      <div className="absolute top-[6%] start-[10%] w-[16%] h-[7%] rounded-full bg-white/80" aria-hidden />
      <div className="absolute top-[10%] end-[14%] w-[12%] h-[6%] rounded-full bg-white/70" aria-hidden />

      {/* grass band + race track */}
      <div className="absolute inset-x-0 bottom-[44%] h-[10%] bg-[#4CAF50] border-y-4 border-[#3B2E5A]" aria-hidden>
        <div className="absolute bottom-1 start-[6%] w-[7%] h-[30%] rounded-full bg-[#FF6B81]" />
        <div className="absolute bottom-1 start-[46%] w-[7%] h-[30%] rounded-full bg-[#FFD154]" />
        <div className="absolute bottom-1 end-[20%] w-[7%] h-[30%] rounded-full bg-white" />
      </div>
      <div
        className="absolute inset-x-0 bottom-0 h-[44%] border-t-4 border-[#3B2E5A]"
        style={{ background: "#E7C48A", backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.07) 0 3px, transparent 3px 56px)" }}
        aria-hidden
      >
        <div
          className="absolute inset-x-0 top-[46%] h-[6px]"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, #FAFAFA 0 26px, transparent 26px 52px)" }}
          aria-hidden
        />
      </div>

      {/* finish flag */}
      <div className="absolute bottom-[40%] end-[3%] w-[13%] z-[5]">
        <FlagSvg className="w-full h-auto" />
      </div>

      {/* turtle */}
      <motion.div
        className="absolute bottom-[8%] start-[5%] w-[27%] z-20"
        animate={{ x: racing ? (lang === "fa" ? "-240%" : "240%") : "0%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        <button type="button" aria-label={lang === "fa" ? "لاک‌پشت مسابقه" : "race turtle"} onClick={tapTurtle} className="block w-full min-w-[56px] min-h-[44px]">
          <div key={shakeKey} style={{ animation: shakeKey > 0 && !racing ? "shake-hard 0.5s ease" : undefined }}>
            <div style={{ transform: lang === "fa" ? "scaleX(-1)" : undefined }}>
              <div style={{ animation: racing ? "bob 0.35s ease-in-out infinite" : undefined }}>
                <TurtleSvg racing={racing} className="w-full h-auto drop-shadow-[0_4px_3px_rgba(59,46,90,0.22)]" />
              </div>
            </div>
          </div>
        </button>
      </motion.div>

      {/* fallen log blocking the track */}
      <div
        className="absolute bottom-[22%] start-[36%] w-[26%] z-10"
        style={{
          transform: `translate(${logDrag.x}px, ${logDrag.y}px) rotate(${logCleared ? -14 : 0}deg)`,
          transition: logDrag.dragging ? "none" : "transform 0.35s ease",
        }}
      >
        <Pulse active={hintPulse > 0 && !logCleared && !done}>
          <div
            {...(logCleared ? {} : logDrag.bind)}
            className={`${logCleared ? "cursor-default" : "cursor-grab active:cursor-grabbing"} min-w-[44px] min-h-[44px]`}
          >
            <LogSvg className="w-full h-auto drop-shadow-[0_4px_2px_rgba(59,46,90,0.2)]" />
          </div>
        </Pulse>
      </div>

      {/* stone blocking the track */}
      <div
        className="absolute bottom-[10%] start-[62%] w-[17%] z-10"
        style={{
          transform: `translate(${stoneDrag.x}px, ${stoneDrag.y}px)`,
          transition: stoneDrag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.3,0.64,1)",
        }}
      >
        <Pulse active={hintPulse > 0 && logCleared && !stoneCleared && !done}>
          <div
            {...(stoneCleared ? {} : stoneDrag.bind)}
            className={`${stoneCleared ? "cursor-default" : "cursor-grab active:cursor-grabbing"} min-w-[44px] min-h-[44px]`}
          >
            <StoneSvg className="w-full h-auto drop-shadow-[0_4px_2px_rgba(59,46,90,0.2)]" />
          </div>
        </Pulse>
      </div>
      {/* confetti burst when the turtle crosses the flag */}
      {finished && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-30" aria-hidden>
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 w-[2.5%] aspect-[1/2] rounded-sm"
              style={{
                left: `${(i * 7 + 4) % 96}%`,
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                animation: `confetti-fall ${1.3 + (i % 4) * 0.25}s linear ${(i % 5) * 0.09}s both`,
              }}
            />
          ))}
        </div>
      )}
    </Scene>
  );
}
