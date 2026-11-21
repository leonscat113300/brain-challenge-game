"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 33 — Tilt the lane: roll the ball into the wicker basket.     */
/* Device tilt (deviceorientation) + big hold buttons as fallback.     */
/* ------------------------------------------------------------------ */

const BALL_W = 54;

function BallSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      <circle cx="32" cy="32" r="28" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M14 20 q8 -9 20 -8" stroke="#FAFAFA" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85" />
      <circle cx="24" cy="34" r="4.6" fill="#3B2E5A" />
      <circle cx="41" cy="34" r="4.6" fill="#3B2E5A" />
      <circle cx="25.6" cy="32.4" r="1.6" fill="#fff" />
      <circle cx="42.6" cy="32.4" r="1.6" fill="#fff" />
      <path d="M28 43 q5 4 10 0" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="16" cy="41" rx="3.6" ry="2.4" fill="#FF9FB2" />
      <ellipse cx="49" cy="41" rx="3.6" ry="2.4" fill="#FF9FB2" />
    </svg>
  );
}

function BasketSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 110 96" className={className} style={style} aria-hidden>
      <ellipse cx="55" cy="18" rx="46" ry="12" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="55" cy="18" rx="33" ry="6.5" fill="#5C3A22" />
      <path d="M12 20 L24 88 Q55 96 86 88 L98 20 Q55 32 12 20 Z" fill="#D9A05B" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M16 36 Q55 47 94 36" stroke="#8B5E3C" strokeWidth="4" fill="none" />
      <path d="M20 54 Q55 64 90 54" stroke="#8B5E3C" strokeWidth="4" fill="none" />
      <path d="M25 71 Q55 80 85 71" stroke="#8B5E3C" strokeWidth="4" fill="none" />
      <path d="M34 24 L38 86 M55 28 L55 91 M76 24 L72 86" stroke="#B97E42" strokeWidth="3" opacity="0.7" />
    </svg>
  );
}

function TiltButton({ side, frozen, onHold }: { side: "left" | "right"; frozen: boolean; onHold: (dir: number) => void }) {
  const [held, setHeld] = useState(false);
  const chev = side === "left" ? "M15 5 L8 12 L15 19" : "M9 5 L16 12 L9 19";
  return (
    <button
      type="button"
      aria-label={side === "left" ? "tilt left" : "tilt right"}
      className={`absolute bottom-3 z-30 flex min-h-[56px] w-[88px] touch-none flex-col items-center justify-center gap-0.5 rounded-2xl border-4 border-[#3B2E5A] shadow-md transition-transform ${
        side === "left" ? "left-3 bg-[#FFD154]" : "right-3 bg-[#1EC8CF]"
      } ${held ? "scale-95" : ""} ${frozen ? "pointer-events-none" : ""}`}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setHeld(true);
        sfx.click();
        onHold(side === "left" ? -0.65 : 0.65);
      }}
      onPointerUp={() => { setHeld(false); onHold(0); }}
      onPointerCancel={() => { setHeld(false); onHold(0); }}
      onLostPointerCapture={() => { setHeld(false); onHold(0); }}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
        <path d={chev} stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[10px] font-bold text-[#3B2E5A]">کج کن / Tilt</span>
    </button>
  );
}

export default function Level33({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [scored, setScored] = useState(false);
  const [done, setDone] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  const spinRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const x = useRef(0);
  const vel = useRef(0);
  const sensorTilt = useRef(0);
  const btnTilt = useRef(0);
  const doneRef = useRef(false);
  const bx = useMotionValue(0);

  const score = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setScored(true);
    setDone(true);
    sfx.pop();
    sfx.cheer();
    onProgress(1);
    window.setTimeout(onSolved, 700);
  }, [onProgress, onSolved]);

  /* physics loop: acceleration = tilt * 700, friction 0.99/frame, wall bounces */
  useEffect(() => {
    if (done || solved) return;
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const track = trackRef.current;
      const basket = basketRef.current;
      if (track && basket) {
        const tilt = Math.max(-1, Math.min(1, sensorTilt.current + btnTilt.current));
        vel.current = (vel.current + tilt * 700 * dt) * 0.99;
        x.current += vel.current * dt;
        if (x.current < 0) { x.current = 0; vel.current = -vel.current * 0.4; }
        const tr = track.getBoundingClientRect();
        const br = basket.getBoundingClientRect();
        const mouth = br.left + br.width / 2 - tr.left;
        const maxX = Math.max(0, mouth - BALL_W / 2 + 18);
        if (x.current > maxX) { x.current = maxX; vel.current = -vel.current * 0.4; }
        bx.set(x.current);
        if (spinRef.current) spinRef.current.style.transform = `rotate(${x.current * 1.1}deg)`;
        if (arrowRef.current) arrowRef.current.style.transform = `rotate(${tilt * 24}deg)`;
        if (Math.abs(x.current + BALL_W / 2 - mouth) <= 18 && Math.abs(vel.current) < 900) {
          score();
          return;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [done, solved, score, bx]);

  /* device tilt sensor (gyroscope), gamma/35 clamped to [-1, 1] */
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      const g = e.gamma ?? 0;
      sensorTilt.current = Math.max(-1, Math.min(1, g / 35));
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  const onHold = useCallback((dir: number) => {
    if (doneRef.current || solved) { btnTilt.current = 0; return; }
    btnTilt.current = dir;
  }, [solved]);

  return (
    <Scene bg="linear-gradient(180deg,#FDF3E3 0%,#FAE9CF 58%,#F1DCB8 100%)">
      {/* decor: sun + cloud */}
      <div className="absolute left-[6%] top-[5%] h-14 w-14 rounded-full border-4 border-[#3B2E5A] bg-[#FFD154]" aria-hidden />
      <div className="absolute right-[9%] top-[7%] w-[20%] opacity-80" aria-hidden>
        <svg viewBox="0 0 120 50">
          <path d="M30 44 Q12 44 12 32 Q12 20 28 20 Q32 6 50 8 Q68 4 76 18 Q94 16 96 30 Q98 44 80 44 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
        </svg>
      </div>

      {/* tilt indicator arrow above the lane */}
      <div className="absolute left-1/2 top-[9%] z-20 -translate-x-1/2 text-center">
        <div ref={arrowRef} style={{ transition: "transform 0.08s linear" }}>
          <svg viewBox="0 0 32 40" className="mx-auto h-9 w-8" fill="none" aria-hidden>
            <path d="M16 4 V26 M7 19 L16 30 L25 19" stroke="#6C4AB6" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-xs font-bold text-[#6C4AB6]">{lang === "fa" ? "بچرخان" : "tilt"}</span>
      </div>

      {/* wooden lane (rolling track) */}
      <div ref={trackRef} className="absolute bottom-[24%] left-[4%] right-[4%] z-10 h-[18%]">
        <div
          className="absolute inset-x-0 bottom-0 h-[13px] rounded-lg border-4 border-[#3B2E5A]"
          style={{ background: "#D9A05B", backgroundImage: "repeating-linear-gradient(90deg, rgba(139,94,60,0.45) 0 4px, transparent 4px 48px)" }}
          aria-hidden
        />
        {/* the ball */}
        <div className={`absolute bottom-[12px] left-0 ${scored ? "z-[5]" : "z-[15]"}`} style={{ width: BALL_W, height: BALL_W }}>
          <motion.div className="h-full w-full" style={{ x: bx }}>
            <motion.div
              className="h-full w-full"
              animate={scored ? { y: 38, scale: 0.78, opacity: 0.9 } : { y: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
            >
              <div ref={spinRef} className="h-full w-full">
                <BallSvg className="h-full w-full drop-shadow-[0_3px_2px_rgba(59,46,90,0.3)]" />
              </div>
            </motion.div>
          </motion.div>
        </div>
        {/* wicker basket with open mouth */}
        <div ref={basketRef} className="absolute bottom-[8px] right-0 z-10 w-[17%] min-w-[82px]">
          <Pulse active={hintPulse > 0 && !done}>
            <BasketSvg className="h-auto w-full" />
          </Pulse>
        </div>
      </div>

      <TiltButton side="left" frozen={solved || done} onHold={onHold} />
      <TiltButton side="right" frozen={solved || done} onHold={onHold} />
    </Scene>
  );
}
