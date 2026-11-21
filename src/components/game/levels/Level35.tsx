"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 35 — Draw a dashed path for the ant, avoiding the obstacles.  */
/* ------------------------------------------------------------------ */

interface Pt { x: number; y: number }

type Phase = "idle" | "draw" | "bad" | "fade" | "walking" | "arrived";

const ANT = { x: 0.13, y: 0.7 };
const COOKIE = { x: 0.83, y: 0.17 };
const OBSTACLES: Array<{ x: number; y: number; kind: "stone" | "apple" | "puddle" }> = [
  { x: 0.37, y: 0.5, kind: "stone" }, { x: 0.55, y: 0.33, kind: "apple" }, { x: 0.42, y: 0.79, kind: "puddle" },
];

function AntSvg({ happy, className, style }: { happy: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 84" className={className} style={style} aria-hidden>
      <path d="M34 52 L22 74 M34 52 L38 76 M58 52 L54 78 M58 52 L70 72" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" fill="none" />
      <ellipse cx="30" cy="40" rx="22" ry="17" fill="#C96A4A" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="55" cy="42" r="12" fill="#C96A4A" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="76" cy="34" r="15" fill="#C96A4A" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M80 21 Q86 10 94 8 M72 20 Q72 8 64 4" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {happy ? (
        <>
          <path d="M68 32 Q72 28 76 32 M80 32 Q84 28 88 32" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M74 40 Q78 44 82 40" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="72" cy="32" r="4" fill="#3B2E5A" />
          <circle cx="85" cy="32" r="4" fill="#3B2E5A" />
          <circle cx="73.4" cy="30.6" r="1.4" fill="#fff" />
          <circle cx="86.4" cy="30.6" r="1.4" fill="#fff" />
          <path d="M75 40 Q78 42 81 40" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="66" cy="39" rx="3" ry="2" fill="#FF9FB2" />
    </svg>
  );
}

function CookieSvg({ bitten, className, style }: { bitten: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 110 100" className={className} style={style} aria-hidden>
      <circle cx="55" cy="50" r="42" fill="#D9A05B" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="38" cy="36" r="6" fill="#8B5E3C" />
      <circle cx="62" cy="30" r="5" fill="#8B5E3C" />
      <circle cx="46" cy="62" r="5.5" fill="#8B5E3C" />
      <circle cx="70" cy="58" r="6" fill="#8B5E3C" />
      <circle cx="30" cy="52" r="4.5" fill="#8B5E3C" />
      {bitten && <circle cx="92" cy="24" r="17" fill="#FBF6EC" stroke="#3B2E5A" strokeWidth="5" />}
    </svg>
  );
}
function StoneSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 72" className={className} style={style} aria-hidden>
      <path d="M12 58 Q4 38 20 24 Q40 8 66 16 Q92 24 90 44 Q88 62 66 64 Q30 70 12 58 Z" fill="#C9CCD6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="40" cy="40" r="4" fill="#3B2E5A" />
      <circle cx="56" cy="40" r="4" fill="#3B2E5A" />
      <circle cx="41.4" cy="38.6" r="1.4" fill="#fff" />
      <circle cx="57.4" cy="38.6" r="1.4" fill="#fff" />
      <path d="M44 48 Q48 51 52 48" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="31" cy="47" rx="3.4" ry="2.2" fill="#FF9FB2" />
      <ellipse cx="65" cy="47" rx="3.4" ry="2.2" fill="#FF9FB2" />
    </svg>
  );
}
function AppleCoreSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 100" className={className} style={style} aria-hidden>
      <path d="M24 30 Q16 44 20 62 Q24 82 38 86 L52 86 Q66 82 70 62 Q74 44 66 30 Q45 22 24 30 Z" fill="#FFF3DC" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <ellipse cx="40" cy="54" rx="3.4" ry="5" fill="#3B2E5A" />
      <ellipse cx="50" cy="54" rx="3.4" ry="5" fill="#3B2E5A" transform="rotate(12 50 54)" />
      <path d="M24 30 Q45 40 66 30 Q60 18 45 18 Q30 18 24 30 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M38 86 Q45 92 52 86 L48 96 Q45 99 42 96 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M45 18 Q52 4 66 6 Q60 16 45 18 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}
function PuddleSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 60" className={className} style={style} aria-hidden>
      <path d="M14 40 Q10 24 34 20 Q44 8 66 12 Q94 8 104 24 Q116 34 98 42 Q92 52 66 50 Q30 54 14 40 Z" fill="#A9E8EC" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M30 30 Q40 24 52 26" stroke="#FAFAFA" strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Level35({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [points, setPoints] = useState<Pt[]>([]);
  const [done, setDone] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const antInnerRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<Pt[]>([]);
  const lastRef = useRef<Pt>({ x: 0, y: 0 });
  const antT = useRef("translate(-50%,-94%)");
  const doneRef = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase("arrived");
    setDone(true);
    sfx.cheer();
    onProgress(1);
    timers.current.push(window.setTimeout(onSolved, 700));
  }, [onProgress, onSolved]);

  /* ant walks the recorded path (~3px per frame) with a wiggle */
  useEffect(() => {
    if (phase !== "walking") return;
    const f = fieldRef.current;
    if (!f) return;
    const fr = f.getBoundingClientRect();
    const baseX = fr.width * ANT.x;
    const baseY = fr.height * ANT.y;
    const pts = [{ x: baseX, y: baseY }, ...pointsRef.current];
    let i = 1;
    let cx = pts[0].x;
    let cy = pts[0].y;
    let frame = 0;
    let raf = 0;
    const step = () => {
      frame += 1;
      const t = pts[Math.min(i, pts.length - 1)];
      const dx = t.x - cx;
      const dy = t.y - cy;
      const d = Math.hypot(dx, dy);
      if (d <= 3) { cx = t.x; cy = t.y; i += 1; }
      else { cx += (dx / d) * 3; cy += (dy / d) * 3; }
      antT.current = `translate(calc(-50% + ${cx - baseX}px), calc(-94% + ${cy - baseY}px)) rotate(${Math.sin(frame * 0.5) * 9}deg)`;
      if (antInnerRef.current) antInnerRef.current.style.transform = antT.current;
      if (i >= pts.length) { finish(); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase, finish]);

  const fieldPt = (e: React.PointerEvent): Pt | null => { const f = fieldRef.current; if (!f) return null; const fr = f.getBoundingClientRect(); return { x: e.clientX - fr.left, y: e.clientY - fr.top }; };

  const onDown = (e: React.PointerEvent) => {
    if (solved || done || phase !== "idle") return;
    const p = fieldPt(e);
    const f = fieldRef.current;
    if (!p || !f) return;
    const fr = f.getBoundingClientRect();
    const ax = fr.width * ANT.x;
    const ay = fr.height * ANT.y;
    if (Math.hypot(p.x - ax, p.y - ay) <= 40) {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      pointsRef.current = [p];
      lastRef.current = p;
      setPoints([p]);
      setPhase("draw");
      sfx.click();
    } else {
      sfx.pop();
    }
  };

  const onMove = (e: React.PointerEvent) => {
    if (phase !== "draw") return;
    const p = fieldPt(e);
    if (!p) return;
    if (Math.hypot(p.x - lastRef.current.x, p.y - lastRef.current.y) < 10) return;
    lastRef.current = p;
    pointsRef.current = [...pointsRef.current, p];
    setPoints(pointsRef.current);
  };

  const onUp = () => {
    if (phase !== "draw") return;
    const f = fieldRef.current;
    const pts = pointsRef.current;
    if (!f || pts.length === 0) { setPhase("idle"); return; }
    const fr = f.getBoundingClientRect();
    const obs = OBSTACLES.map((o) => ({ x: fr.width * o.x, y: fr.height * o.y }));
    const hit = pts.some((p) => obs.some((c) => Math.hypot(p.x - c.x, p.y - c.y) <= 26));
    const cookieC = { x: fr.width * COOKIE.x, y: fr.height * COOKIE.y };
    const lastP = pts[pts.length - 1];
    const near = Math.hypot(lastP.x - cookieC.x, lastP.y - cookieC.y) <= 45;
    if (hit) {
      setPhase("bad");
      timers.current.push(window.setTimeout(() => { pointsRef.current = []; setPoints([]); setPhase("idle"); }, 560));
      onMistake({ fa: "مسیر از روی مانع رد نمیشه!", en: "The path can't cross the obstacles!" });
    } else if (near) {
      setPhase("walking");
      onProgress(0.5);
    } else {
      setPhase("fade");
      timers.current.push(window.setTimeout(() => { pointsRef.current = []; setPoints([]); setPhase("idle"); }, 480));
      onMistake({ fa: "کشیدنت تا رسیدنی ادامه بده", en: "Keep drawing until you reach it" });
    }
  };

  const poly = points.map((p) => `${p.x},${p.y}`).join(" ");
  const antMoved = phase === "walking" || phase === "arrived";

  return (
    <Scene bg="#FBF6EC">
      <div
        ref={fieldRef}
        className="absolute inset-0 touch-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,107,129,0.09) 0 26px, transparent 26px 52px), repeating-linear-gradient(90deg, rgba(255,107,129,0.09) 0 26px, transparent 26px 52px)",
        }}
      >
        {/* obstacles */}
        {OBSTACLES.map((o, i) => (
          <div key={i} className="absolute w-[15%] min-w-[64px]" style={{ left: `${o.x * 100}%`, top: `${o.y * 100}%`, transform: "translate(-50%,-50%)" }} aria-hidden>
            {o.kind === "stone" && <StoneSvg className="h-auto w-full" />}
            {o.kind === "apple" && <AppleCoreSvg className="h-auto w-full" />}
            {o.kind === "puddle" && <PuddleSvg className="h-auto w-full" />}
          </div>
        ))}

        {/* the cookie + nibble crumbs */}
        <div className="absolute w-[19%] min-w-[84px]" style={{ left: `${COOKIE.x * 100}%`, top: `${COOKIE.y * 100}%`, transform: "translate(-50%,-50%)" }}>
          <CookieSvg bitten={phase === "arrived"} className="h-auto w-full" />
          {phase === "arrived" &&
            [0, 1, 2, 3].map((k) => (
              <motion.span
                key={k} className="absolute h-2.5 w-2.5 rounded-full border border-[#3B2E5A] bg-[#8B5E3C]"
                style={{ left: `${28 + k * 14}%`, top: "62%" }}
                initial={{ opacity: 0, y: 0 }} animate={{ opacity: [0, 1, 0], y: -34 }} transition={{ duration: 1.1, delay: 0.15 * k }}
                aria-hidden
              />
            ))}
        </div>

        {/* drawn dashed path */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {points.length > 1 && (
            <polyline
              points={poly}
              fill="none"
              stroke={phase === "bad" ? "#E23B3B" : "#6C4AB6"}
              strokeWidth="4"
              strokeDasharray="6 8"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: phase === "fade" ? 0.25 : 1, transition: "opacity 0.4s ease, stroke 0.15s ease" }}
            />
          )}
        </svg>
        {/* the ant */}
        <div className="absolute z-20 h-0 w-0" style={{ left: `${ANT.x * 100}%`, top: `${ANT.y * 100}%` }}>
          <Pulse active={hintPulse > 0 && !done}>
            <div
              ref={antInnerRef}
              className="relative h-16 w-[72px]"
              style={{ transform: antMoved ? undefined : "translate(-50%,-94%)", transformOrigin: "50% 100%" }}
            >
              <AntSvg happy={phase === "arrived"} className="h-full w-full drop-shadow-[0_2px_2px_rgba(59,46,90,0.25)]" />
            </div>
          </Pulse>
        </div>
      </div>
    </Scene>
  );
}
