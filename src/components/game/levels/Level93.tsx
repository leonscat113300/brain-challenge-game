"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 93 — Foggy mirror: drag your finger across the glass to wipe  */
/* the steam away and reveal the rubber duck behind it.                */
/* ------------------------------------------------------------------ */

const WIPE_TARGET = 1400; // px of finger travel needed

function DuckSvg({ happy }: { happy: boolean }) {
  return (
    <svg viewBox="0 0 150 150" className="h-auto w-full" aria-hidden>
      {/* body */}
      <ellipse cx="78" cy="100" rx="42" ry="30" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      <ellipse cx="112" cy="96" rx="14" ry="10" fill="#FFC93C" stroke="#3B2E5A" strokeWidth="3.4" />
      {/* head */}
      <circle cx="52" cy="56" r="26" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* beak */}
      <ellipse cx="26" cy="62" rx="12" ry="7" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" />
      <path d="M20 62 L32 62" stroke="#3B2E5A" strokeWidth="2" />
      {/* eyes */}
      <circle cx="46" cy="48" r="5.4" fill="#3B2E5A" />
      <circle cx="62" cy="48" r="5.4" fill="#3B2E5A" />
      <circle cx="47.6" cy="46.4" r="1.8" fill="#FAFAFA" />
      <circle cx="63.6" cy="46.4" r="1.8" fill="#FAFAFA" />
      {/* wing */}
      <path d="M62 92 Q84 82 100 96 Q84 108 62 100 Z" fill="#FFC93C" stroke="#3B2E5A" strokeWidth="3.4" />
      {happy && (
        <path d="M44 60 Q52 66 60 60" fill="none" stroke="#3B2E5A" strokeWidth="2.6" strokeLinecap="round" />
      )}
      {/* water bubbles */}
      <circle cx="30" cy="122" r="5" fill="#1EC8CF" opacity="0.7" style={{ animation: "bob 1.8s ease-in-out infinite" }} />
      <circle cx="120" cy="118" r="4" fill="#1EC8CF" opacity="0.7" style={{ animation: "bob 2.2s 0.4s ease-in-out infinite" }} />
    </svg>
  );
}

export default function Level93({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [cleared, setCleared] = useState(0); // 0..1
  const [revealed, setRevealed] = useState(false);
  const lastPt = useRef<{ x: number; y: number } | null>(null);
  const accum = useRef(0);
  const lastStep = useRef(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const reveal = useCallback(() => {
    if (revealed || solved) return;
    setRevealed(true);
    sfx.sparkle();
    onProgress(1);
    timers.current.push(setTimeout(() => sfx.cheer(), 500));
    timers.current.push(setTimeout(onSolved, 1900));
  }, [revealed, solved, onProgress, onSolved]);

  const finishStep = useCallback(
    (c: number) => {
      setCleared(c);
      if (c > lastStep.current + 0.08) {
        lastStep.current = c;
        onProgress(0.8 * c);
        if (c > 0.35 && c < 0.5) sfx.click();
      }
    },
    [onProgress]
  );

  const onDown = useCallback(
    (e: React.PointerEvent) => {
      if (revealed || solved) return;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      lastPt.current = { x: e.clientX, y: e.clientY };
    },
    [revealed, solved]
  );

  const onMove = useCallback(
    (e: React.PointerEvent) => {
      if (revealed || solved || !lastPt.current) return;
      const dx = e.clientX - lastPt.current.x;
      const dy = e.clientY - lastPt.current.y;
      lastPt.current = { x: e.clientX, y: e.clientY };
      accum.current += Math.sqrt(dx * dx + dy * dy);
      const c = Math.min(1, accum.current / WIPE_TARGET);
      finishStep(c);
      if (c >= 1) reveal();
    },
    [revealed, solved, finishStep, reveal]
  );

  const onUp = useCallback(() => {
    lastPt.current = null;
  }, []);

  const tapMirror = useCallback(() => {
    if (revealed || solved) return;
    if (cleared > 0.3) {
      sfx.click();
      return;
    }
    sfx.fail();
    onMistake({
      fa: "با انگشتت روی آینه بکش تا بخار پاک شود!",
      en: "Drag your finger across the mirror to wipe the steam!",
    });
  }, [revealed, solved, cleared, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#DCF7F8 0%,#BEE9EE 60%,#A9DDE4 100%)">
      {/* warm steam wisps */}
      {!revealed &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            className="pointer-events-none absolute w-[10%]"
            style={{ left: `${26 + i * 18}%`, top: `${12 + (i % 2) * 10}%`, animation: `float-up 2.4s ${i * 0.5}s ease-out infinite` }}
            aria-hidden
          >
            <svg viewBox="0 0 30 40">
              <path d="M15 36 Q8 26 15 16 Q22 8 15 2" fill="none" stroke="#FAFAFA" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
            </svg>
          </div>
        ))}

      {/* bathroom wall tiles */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[68%]" aria-hidden>
        <div className="grid h-full w-full grid-cols-6 grid-rows-4 gap-1 p-2 opacity-60">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="rounded-md border-2 border-[#8FD3DC] bg-[#EAFBFC]" />
          ))}
        </div>
      </div>

      {/* mirror */}
      <div className="absolute left-1/2 top-[10%] w-[64%] -translate-x-1/2">
        <Pulse active={hintPulse > 0 && !revealed}>
          <div className="rounded-[2rem] border-[6px] border-[#3B2E5A] bg-gradient-to-b from-[#9EDBE3] to-[#7EC8D2] p-2 shadow-[0_10px_0_rgba(59,46,90,0.25)]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem]">
              {/* reflection: rubber duck */}
              <div className="absolute inset-0 flex items-center justify-center p-[8%]">
                <DuckSvg happy={revealed} />
              </div>
              {/* fog layer */}
              {!revealed && (
                <div
                  role="button"
                  aria-label={lang === "fa" ? "آینهٔ بخارگرفته" : "foggy mirror"}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                  onClick={tapMirror}
                  className="absolute inset-0 cursor-pointer rounded-[1.4rem]"
                  style={{ touchAction: "none" }}
                >
                  <div
                    className="absolute inset-0 rounded-[1.4rem]"
                    style={{
                      background: "linear-gradient(150deg,#F4FDFE 0%,#DFF6F8 45%,#CDEFF3 100%)",
                      opacity: 1 - cleared,
                      transition: "opacity 0.12s linear",
                    }}
                  />
                  {/* wipe shine */}
                  {cleared > 0.05 && cleared < 1 && (
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[1.4rem]"
                      style={{ opacity: 0.5 * cleared }}
                      aria-hidden
                    >
                      <svg viewBox="0 0 200 150" className="h-full w-full">
                        <path d="M30 130 Q80 60 170 20" fill="none" stroke="#FAFAFA" strokeWidth="14" strokeLinecap="round" opacity="0.8" />
                        <path d="M60 140 Q110 80 185 45" fill="none" stroke="#FAFAFA" strokeWidth="8" strokeLinecap="round" opacity="0.6" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
              {/* sparkles on reveal */}
              {revealed &&
                [
                  { l: "14%", t: "18%", d: 0 },
                  { l: "78%", t: "24%", d: 0.2 },
                  { l: "44%", t: "74%", d: 0.4 },
                ].map((p, i) => (
                  <div key={i} className="pointer-events-none absolute" style={{ left: p.l, top: p.t, animation: `star-pop 0.8s ${p.d}s ease-out both` }} aria-hidden>
                    <svg viewBox="0 0 24 24" className="w-5">
                      <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.6" />
                    </svg>
                  </div>
                ))}
            </div>
          </div>
        </Pulse>
      </div>

      {/* sink under the mirror */}
      <div className="absolute bottom-[6%] left-1/2 w-[58%] -translate-x-1/2" aria-hidden>
        <svg viewBox="0 0 240 90" className="h-auto w-full">
          <rect x="20" y="30" width="200" height="34" rx="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
          <ellipse cx="120" cy="32" rx="52" ry="10" fill="#D8F1F4" stroke="#3B2E5A" strokeWidth="3.4" />
          <rect x="46" y="64" width="14" height="22" rx="6" fill="#C9E8EC" stroke="#3B2E5A" strokeWidth="3.4" />
          <rect x="180" y="64" width="14" height="22" rx="6" fill="#C9E8EC" stroke="#3B2E5A" strokeWidth="3.4" />
          {/* faucet */}
          <path d="M120 12 L120 0 M104 0 L136 0" stroke="#3B2E5A" strokeWidth="6" strokeLinecap="round" />
          <path d="M120 4 Q120 -8 96 -6" fill="none" stroke="#3B2E5A" strokeWidth="6" strokeLinecap="round" />
        </svg>
      </div>
    </Scene>
  );
}
