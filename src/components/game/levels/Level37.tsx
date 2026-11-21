"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx, type DragState } from "./shared";
import { num } from "@/lib/game/utils";

/* ------------------------------------------------------------------ */
/* Level 37 — Prop the cracked balcony support with the plank before   */
/* the 8s timer runs out and the flower pot falls.                     */
/* ------------------------------------------------------------------ */

type Mood = "worried" | "happy" | "dizzy";

function PotSvg({ mood, className, style }: { mood: Mood; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 110 140" className={className} style={style} aria-hidden>
      <path d="M55 84 Q52 58 55 40" stroke="#4CAF50" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M55 64 Q40 58 36 46 Q50 48 55 60 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M55 56 Q68 50 72 40 Q58 42 55 52 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <g stroke="#3B2E5A" strokeWidth="4">
        <circle cx="55" cy="14" r="10" fill="#FF6B81" />
        <circle cx="41" cy="22" r="10" fill="#FF6B81" />
        <circle cx="69" cy="22" r="10" fill="#FF6B81" />
        <circle cx="45" cy="35" r="10" fill="#FF6B81" />
        <circle cx="65" cy="35" r="10" fill="#FF6B81" />
      </g>
      <circle cx="55" cy="26" r="13" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      {mood === "happy" && (
        <>
          <path d="M48 24 Q51 20 54 24" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M56 24 Q59 20 62 24" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M50 30 Q55 35 60 30" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === "worried" && (
        <>
          <circle cx="49" cy="24" r="3.4" fill="#3B2E5A" />
          <circle cx="61" cy="24" r="3.4" fill="#3B2E5A" />
          <circle cx="50.2" cy="22.8" r="1.2" fill="#fff" />
          <circle cx="62.2" cy="22.8" r="1.2" fill="#fff" />
          <ellipse cx="55" cy="33" rx="3" ry="4" fill="#3B2E5A" />
        </>
      )}
      {mood === "dizzy" && (
        <>
          <path d="M46 21 L54 28 M54 21 L46 28" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
          <path d="M56 21 L64 28 M64 21 L56 28" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
          <path d="M48 32 Q52 29 56 32 Q60 35 63 32" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      <path d="M28 84 L82 84 L74 128 Q55 134 36 128 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <rect x="24" y="76" width="62" height="14" rx="7" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M40 96 Q55 100 70 96" stroke="#D9485E" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
function PlankSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 44 160" className={className} style={style} aria-hidden>
      <rect x="5" y="5" width="34" height="150" rx="12" fill="#D9A05B" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M14 30 Q22 44 14 62 M28 80 Q20 96 28 116" stroke="#B97E42" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="22" cy="20" r="3" fill="#8B5E3C" />
      <circle cx="22" cy="142" r="3" fill="#8B5E3C" />
    </svg>
  );
}
function BraceSvg({ patched, className, style }: { patched: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 70 110" className={className} style={style} aria-hidden>
      <path d="M8 8 L62 8 L62 30 L26 100 L8 100 Z" fill="#B97E42" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M8 26 L62 26 M20 52 L50 52" stroke="#8B5E3C" strokeWidth="4" strokeLinecap="round" />
      {!patched && (
        <path d="M40 8 L34 26 L44 40 L30 56 L40 72 L28 88" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {patched && (
        <g>
          <rect x="20" y="34" width="34" height="14" rx="7" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="3.5" transform="rotate(-28 37 41)" />
          <rect x="28" y="26" width="14" height="30" rx="7" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="3.5" transform="rotate(-28 35 41)" />
        </g>
      )}
    </svg>
  );
}

export default function Level37({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [saved, setSaved] = useState(false);
  const [fell, setFell] = useState(false);
  const [stickLocked, setStickLocked] = useState(false);
  const [remaining, setRemaining] = useState(8);
  const [attempt, setAttempt] = useState(0);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const [savedAngle, setSavedAngle] = useState(0);
  const tickRef = useRef(8);
  const stickRef = useRef<HTMLDivElement>(null);
  const crackRef = useRef<HTMLDivElement>(null);
  const stickResetRef = useRef<() => void>(() => {});
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);

  const fall = useCallback(() => {
    if (doneRef.current) return;
    setFell(true);
    onMistake({ fa: "دیر شد! دوباره تلاش کن", en: "Too late! Try again" });
    timers.current.push(
      window.setTimeout(() => {
        setFell(false);
        setAttempt((a) => a + 1);
        stickResetRef.current();
      }, 1200)
    );
  }, [onMistake]);
  const fallRef = useRef(fall);
  useEffect(() => { fallRef.current = fall; }, [fall]);

  /* 8 second countdown, only while the pot is still in danger */
  useEffect(() => {
    if (saved || done || fell) return;
    let rem = 8;
    tickRef.current = 8;
    const raf = requestAnimationFrame(() => setRemaining(8));
    const iv = window.setInterval(() => {
      rem = Math.round((rem - 0.1) * 10) / 10;
      const whole = Math.ceil(rem);
      if (whole < tickRef.current) {
        tickRef.current = whole;
        if (whole > 0) sfx.tick();
      }
      if (rem <= 0) {
        window.clearInterval(iv);
        setRemaining(0);
        fallRef.current();
        return;
      }
      setRemaining(rem);
    }, 100);
    return () => { cancelAnimationFrame(raf); window.clearInterval(iv); };
  }, [saved, done, fell, attempt]);

  /* remember the tilt angle at the moment of the save (for the spring wobble) */
  const angle = saved ? 0 : ((8 - remaining) / 8) * 25;

  /* drag the plank: drop it on the cracked support to save the pot */
  const stickDrag = useDragMove(
    useCallback(
      (d: DragState, api) => {
        if (solved || done || saved || fell || stickLocked) { api.reset(); return; }
        if (overElement(stickRef, crackRef, 35)) {
          api.reset();
          setStickLocked(true);
          setSavedAngle(-(((8 - remaining) / 8) * 25));
          setSaved(true);
          doneRef.current = true;
          setDone(true);
          sfx.unlock();
          sfx.sparkle();
          onProgress(1);
          timers.current.push(window.setTimeout(onSolved, 700));
        } else {
          api.reset();
        }
      },
      [solved, done, saved, fell, stickLocked, remaining, onProgress, onSolved]
    )
  );
  useEffect(() => { stickResetRef.current = stickDrag.reset; }, [stickDrag]);

  const grabDown = (e: React.PointerEvent) => {
    if (solved || done || saved || fell || stickLocked) return;
    stickDrag.bind.onPointerDown(e);
    onProgress(0.5);
  };

  const potMood: Mood = fell ? "dizzy" : saved ? "happy" : "worried";
  const urgent = remaining <= 3 && !saved && !done;

  return (
    <Scene bg="linear-gradient(180deg,#F6EDDD 0%,#F1E4CD 100%)">
      {/* wall stripes + floor */}
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(59,46,90,0.045) 0 18px, transparent 18px 40px)" }} aria-hidden />
      <div
        className="absolute inset-x-0 bottom-0 h-[12%] border-t-4 border-[#3B2E5A]"
        style={{ background: "#D9A05B", backgroundImage: "repeating-linear-gradient(90deg, rgba(139,94,60,0.4) 0 4px, transparent 4px 52px)" }}
        aria-hidden
      />

      {/* countdown chip */}
      <div
        className={`absolute left-3 top-3 z-30 flex min-h-[46px] items-center gap-2 rounded-2xl border-4 border-[#3B2E5A] px-3 shadow-md ${urgent ? "bg-[#FF6B81]" : "bg-[#FAFAFA]"}`}
        aria-live="polite"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden>
          <circle cx="12" cy="13" r="8" stroke="#3B2E5A" strokeWidth="3" />
          <path d="M12 13 V8 M9 2 H15" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span
          className={`inline-block text-xl font-black ${urgent ? "text-[#FAFAFA]" : "text-[#3B2E5A]"}`}
          style={urgent ? { animation: "breathe 0.5s ease-in-out infinite" } : undefined}
        >
          {num(Math.ceil(remaining), lang)}
          <span className="ms-1 text-xs font-bold">{lang === "fa" ? "ثانیه" : "sec"}</span>
        </span>
      </div>

      {/* balcony with cracked support + tilting pot */}
      <div className="absolute right-[4%] top-[36%] z-[6] h-[52%] w-[38%]">
        <div
          className="absolute inset-x-0 top-0 h-[18px] rounded-xl border-4 border-[#3B2E5A]"
          style={{ background: "#D9A05B", backgroundImage: "repeating-linear-gradient(90deg, rgba(139,94,60,0.4) 0 4px, transparent 4px 40px)" }}
          aria-hidden
        />
        <div ref={crackRef} className="absolute left-[1%] top-[12px] w-[16%] min-w-[58px]">
          <BraceSvg patched={saved} className="h-auto w-full" />
        </div>
        <motion.div
          className="absolute left-[8%] w-[26%] min-w-[92px]"
          style={{ bottom: "100%", marginBottom: -10, transformOrigin: "50% 95%" }}
          animate={saved ? { rotate: [savedAngle, 10, -6, 0] } : { rotate: -angle }}
          transition={saved ? { duration: 0.8, ease: "easeInOut" } : { duration: 0.15, ease: "linear" }}
        >
          <div style={fell ? { animation: "drop-fall 0.8s ease-in 0.1s both" } : undefined}>
            <div style={fell ? { transform: "rotate(38deg)", transition: "transform 0.7s ease-in 0.1s" } : undefined}>
              <PotSvg mood={potMood} className="h-auto w-full" />
            </div>
          </div>
        </motion.div>
        {saved &&
          [0, 1, 2].map((k) => (
            <motion.span
              key={k}
              className="absolute"
              style={{ left: `${10 + k * 24}%`, top: "-32%" }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.3, 1], y: -16 }}
              transition={{ duration: 0.9, delay: 0.2 + k * 0.15 }}
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path d="M12 2 L14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2" />
              </svg>
            </motion.span>
          ))}
      </div>

      {/* crash dust poof */}
      {fell && (
        <div className="absolute bottom-[7%] right-[16%] z-[9] flex gap-1" aria-hidden>
          {[0, 1, 2].map((k) => (
            <motion.div key={k} className="h-8 w-8 rounded-full bg-[#C9CCD6]" initial={{ scale: 0 }} animate={{ scale: [0, 1.3, 1], opacity: [0, 0.9, 0] }} transition={{ duration: 0.9, delay: 0.5 + k * 0.12 }} />
          ))}
        </div>
      )}

      {/* the draggable wooden plank */}
      <div
        ref={stickRef}
        className="absolute z-30 w-[11%] min-w-[64px]"
        style={{
          left: stickLocked ? "60%" : "7%",
          top: stickLocked ? "39%" : "50%",
          transform: stickLocked ? "rotate(30deg)" : `translate(${stickDrag.x}px, ${stickDrag.y}px) rotate(16deg)`,
          transition: stickLocked
            ? "left 0.45s cubic-bezier(0.34,1.3,0.64,1), top 0.45s cubic-bezier(0.34,1.3,0.64,1), transform 0.45s ease"
            : stickDrag.dragging ? "none" : "transform 0.3s ease",
        }}
      >
        <Pulse active={hintPulse > 0 && !stickLocked && !saved && !done && !fell}>
          <div {...stickDrag.bind} onPointerDown={grabDown} className="cursor-grab active:cursor-grabbing">
            <PlankSvg className="h-auto w-full drop-shadow-[0_3px_3px_rgba(59,46,90,0.3)]" />
          </div>
        </Pulse>
      </div>
    </Scene>
  );
}
