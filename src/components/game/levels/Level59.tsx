"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 59 — A gray layer hides a big number. Rub the pointer over    */
/* the golden frame to erase the layer; at ~65% scratched it pops off  */
/* and the number (7) is revealed.                                     */
/* ------------------------------------------------------------------ */

const COLS = 10;
const ROWS = 6;
const CELLS = COLS * ROWS;

export default function Level59({ lang, solved, onSolved, onProgress, hintPulse }: LevelProps) {
  const [erased, setErased] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);
  const [scratching, setScratching] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);
  const erasedRef = useRef<Set<number>>(new Set());
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const eraseAt = useCallback(
    (clientX: number, clientY: number) => {
      if (revealed || done) return;
      const grid = gridRef.current;
      if (!grid) return;
      const rect = grid.getBoundingClientRect();
      const col = Math.max(0, Math.min(COLS - 1, Math.floor(((clientX - rect.left) / rect.width) * COLS)));
      const row = Math.max(0, Math.min(ROWS - 1, Math.floor(((clientY - rect.top) / rect.height) * ROWS)));
      const idx = row * COLS + col;
      if (erasedRef.current.has(idx)) return;
      const next = new Set(erasedRef.current);
      next.add(idx);
      erasedRef.current = next;
      setErased(next);
      const frac = next.size / CELLS;
      onProgress(Math.min(0.95, frac));
      if (frac >= 0.65 && !doneRef.current) {
        doneRef.current = true;
        setRevealed(true);
        setDone(true);
        sfx.sparkle();
        timers.current.push(setTimeout(() => sfx.cheer(), 300));
        onProgress(1);
        timers.current.push(setTimeout(onSolved, 1100));
      }
    },
    [revealed, done, onProgress, onSolved]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (solved || done) return;
      setScratching(true);
      eraseAt(e.clientX, e.clientY);
      sfx.tick();
    },
    [solved, done, eraseAt]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!scratching || solved || done) return;
      eraseAt(e.clientX, e.clientY);
    },
    [scratching, solved, done, eraseAt]
  );

  const endScratch = useCallback(() => setScratching(false), []);

  return (
    <Scene bg="linear-gradient(180deg,#FFF3D6 0%,#FFE9BC 100%)">
      {/* room dots */}
      <div className="absolute top-[6%] start-[8%] flex gap-2" aria-hidden>
        <div className="h-3 w-3 rounded-full border-2 border-[#3B2E5A] bg-[#FF6B81]" />
        <div className="h-3 w-3 rounded-full border-2 border-[#3B2E5A] bg-[#1EC8CF]" />
        <div className="h-3 w-3 rounded-full border-2 border-[#3B2E5A] bg-[#4CAF50]" />
      </div>
      <div className="absolute top-[6%] end-[8%] flex gap-2" aria-hidden>
        <div className="h-3 w-3 rounded-full border-2 border-[#3B2E5A] bg-[#4CAF50]" />
        <div className="h-3 w-3 rounded-full border-2 border-[#3B2E5A] bg-[#1EC8CF]" />
        <div className="h-3 w-3 rounded-full border-2 border-[#3B2E5A] bg-[#FF6B81]" />
      </div>

      {/* golden picture frame */}
      <div
        className="absolute left-1/2 top-1/2 w-[76%] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-[#FAFAFA] p-3 shadow-[0_8px_0_rgba(59,46,90,0.25)]"
        style={{ border: "10px solid #FFD154", outline: "5px solid #3B2E5A" }}
      >
        <div
          className="relative w-full overflow-hidden rounded-xl border-[3px] border-[#3B2E5A] bg-white"
          style={{ aspectRatio: "5 / 4", touchAction: "none" }}
        >
          {/* the hidden number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div style={{ animation: revealed ? "star-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) both" : undefined }} className="relative">
              <svg viewBox="0 0 100 90" className="w-[46vh] max-w-[240px]" aria-label={lang === "fa" ? "عدد ۷" : "number seven"}>
                <text x="50" y="72" textAnchor="middle" fontSize="78" fontWeight="900" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="2.5" paintOrder="stroke">
                  7
                </text>
                <circle cx="38" cy="46" r="4" fill="#3B2E5A" />
                <circle cx="62" cy="46" r="4" fill="#3B2E5A" />
                <circle cx="39.5" cy="44.5" r="1.4" fill="#fff" />
                <circle cx="63.5" cy="44.5" r="1.4" fill="#fff" />
                <path d="M42 58 Q50 64 58 58" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
                <ellipse cx="32" cy="54" rx="4" ry="2.6" fill="#FF9FB2" />
                <ellipse cx="68" cy="54" rx="4" ry="2.6" fill="#FF9FB2" />
              </svg>
            </div>
          </div>

          {/* scratchable gray layer: grid of cells */}
          <div
            ref={gridRef}
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              gap: 2,
              opacity: revealed ? 0 : 1,
              transition: "opacity 0.45s ease",
              pointerEvents: revealed ? "none" : "auto",
              cursor: revealed ? "default" : scratching ? "grabbing" : "grab",
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endScratch}
            onPointerLeave={endScratch}
            onPointerCancel={endScratch}
            role="button"
            aria-label={lang === "fa" ? "لایهٔ خاکستری؛ بکش تا پاک شود" : "gray layer; rub to erase"}
          >
            {Array.from({ length: CELLS }).map((_, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: "#C9C4D8",
                  backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 6px, transparent 6px 12px)",
                  borderRadius: 5,
                  opacity: erased.has(i) ? 0 : 1,
                  transition: "opacity 0.18s ease",
                }}
              />
            ))}
          </div>

          {/* hint ring on the layer */}
          {hintPulse > 0 && !done && (
            <div className="pointer-events-none absolute -inset-2 animate-pulse-ring" style={{ border: "4px dashed #FFD154", borderRadius: 14 }} />
          )}
        </div>
      </div>

      {/* decorative sparkles once revealed */}
      {revealed &&
        [0, 1, 2, 3].map((i) => (
          <span
            key={`sp-${i}`}
            className="absolute z-30"
            style={{
              left: `${20 + i * 20}%`,
              top: `${22 + (i % 2) * 30}%`,
              width: 20,
              height: 20,
              animation: `star-pop 0.5s ${i * 0.15}s both`,
            }}
            aria-hidden
          >
            <svg viewBox="0 0 20 20" className="h-full w-full">
              <path d="M10 0 L12.4 7.6 L20 10 L12.4 12.4 L10 20 L7.6 12.4 L0 10 L7.6 7.6 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.5" />
            </svg>
          </span>
        ))}
    </Scene>
  );
}
