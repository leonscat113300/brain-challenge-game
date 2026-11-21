"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx, type DragState } from "./shared";
import { num } from "@/lib/game/utils";

/* ------------------------------------------------------------------ */
/* Level 36 — Count the stars: a draggable cloud hides two of them.    */
/* ------------------------------------------------------------------ */

interface StarSpot { left: number; top: number; size: number; delay: number }

const VISIBLE: StarSpot[] = [
  { left: 9, top: 12, size: 30, delay: 0 },
  { left: 24, top: 42, size: 22, delay: 0.5 },
  { left: 70, top: 10, size: 34, delay: 0.9 },
  { left: 86, top: 40, size: 20, delay: 0.25 },
  { left: 15, top: 64, size: 24, delay: 0.7 },
];
const HIDDEN: StarSpot[] = [
  { left: 45, top: 20, size: 26, delay: 0.2 },
  { left: 55, top: 27, size: 21, delay: 0.45 },
];

function StarSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 44 44" className={className} style={style} aria-hidden>
      <path d="M22 3 L27.5 15.5 41 16.6 30.8 25.6 33.9 38.8 22 31.6 10.1 38.8 13.2 25.6 3 16.6 16.5 15.5 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
      <circle cx="17" cy="20" r="2.2" fill="#3B2E5A" />
      <circle cx="27" cy="20" r="2.2" fill="#3B2E5A" />
      <circle cx="17.8" cy="19.2" r="0.8" fill="#fff" />
      <circle cx="27.8" cy="19.2" r="0.8" fill="#fff" />
      <path d="M19 25 Q22 28 25 25" stroke="#3B2E5A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="13.5" cy="24" r="1.8" fill="#FF9FB2" />
      <circle cx="30.5" cy="24" r="1.8" fill="#FF9FB2" />
    </svg>
  );
}

function CloudSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 190 110" className={className} style={style} aria-hidden>
      <path d="M40 88 Q14 88 14 66 Q14 46 36 44 Q40 20 66 18 Q88 6 108 20 Q136 12 146 36 Q172 40 172 62 Q172 88 146 88 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="72" cy="52" r="5" fill="#3B2E5A" />
      <circle cx="104" cy="52" r="5" fill="#3B2E5A" />
      <circle cx="73.8" cy="50" r="1.8" fill="#fff" />
      <circle cx="105.8" cy="50" r="1.8" fill="#fff" />
      <path d="M82 62 Q88 68 94 62" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="62" cy="60" rx="5" ry="3.2" fill="#FF9FB2" />
      <ellipse cx="114" cy="60" rx="5" ry="3.2" fill="#FF9FB2" />
    </svg>
  );
}

function MoonSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={style} aria-hidden>
      <circle cx="28" cy="30" r="23" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="41" cy="22" r="17" fill="#241B40" />
      <circle cx="20" cy="22" r="3" fill="#FFE59A" />
      <circle cx="16" cy="34" r="2.2" fill="#FFE59A" />
    </svg>
  );
}

export default function Level36({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [cloudAway, setCloudAway] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [ticker, setTicker] = useState<number | null>(null);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [wrongTick, setWrongTick] = useState(0);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);

  /* stage 1: drag the cloud aside (release >= 55px) */
  const cloudDrag = useDragMove(
    useCallback(
      (d: DragState, api) => {
        if (solved || done || cloudAway) { api.reset(); return; }
        if (d.everMoved && Math.hypot(d.x, d.y) >= 55) {
          setCloudAway(true);
          sfx.whoosh();
          onProgress(0.5);
        } else {
          api.reset();
        }
      },
      [solved, done, cloudAway, onProgress]
    )
  );

  /* stage 2: tap the correct chip -> staggered blink + count ticker */
  const win = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    setCelebrate(true);
    sfx.chime();
    onProgress(1);
    let c = 1;
    setTicker(c);
    const iv = window.setInterval(() => {
      c += 1;
      if (c > 7) { window.clearInterval(iv); setTicker(null); return; }
      setTicker(c);
    }, 85);
    timers.current.push(iv);
    timers.current.push(window.setTimeout(() => sfx.cheer(), 620));
    timers.current.push(window.setTimeout(onSolved, 700));
  }, [onProgress, onSolved]);

  const tapChip = (v: number, i: number) => {
    if (solved || done) return;
    if (v === 7) { win(); return; }
    setWrongIdx(i);
    setWrongTick((t) => t + 1);
    onMistake({ fa: "دوباره بشمار! چیزی پنهانه...", en: "Count again! Something is hidden..." });
    timers.current.push(window.setTimeout(() => setWrongIdx(null), 520));
  };

  const starStyle = (s: StarSpot, idx: number, hidden: boolean): React.CSSProperties => {
    const st: React.CSSProperties = { left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size };
    if (hidden && !cloudAway) { st.opacity = 0; return st; }
    const popDelay = hidden ? s.delay : 0;
    const anims: string[] = [];
    if (hidden) anims.push(`star-pop 0.55s cubic-bezier(0.34,1.56,0.64,1) ${popDelay}s both`);
    if (celebrate) anims.push(`glow 0.45s ease ${(hidden ? popDelay + 0.6 : idx * 0.12).toFixed(2)}s 3`);
    else anims.push(`glow 2.6s ease-in-out ${s.delay}s infinite alternate`);
    st.animation = anims.join(", ");
    return st;
  };

  const cloudStyle: React.CSSProperties = cloudAway
    ? { transform: "translate(240px, -80px) rotate(10deg) scale(0.7)", opacity: 0, pointerEvents: "none", transition: "transform 0.85s ease-in, opacity 0.85s ease-in" }
    : { transform: `translate(${cloudDrag.x}px, ${cloudDrag.y}px)`, transition: cloudDrag.dragging ? "none" : "transform 0.4s ease" };

  return (
    <Scene bg="linear-gradient(180deg,#241B40 0%,#2E2354 62%,#3A2C64 100%)">
      {/* tiny fixed sky dots + moon */}
      {[[6, 30], [34, 8], [52, 55], [78, 62], [92, 18], [40, 74], [64, 80]].map(([l, t], i) => (
        <div key={i} className="absolute h-1.5 w-1.5 rounded-full bg-[#FAFAFA] opacity-60" style={{ left: `${l}%`, top: `${t}%` }} aria-hidden />
      ))}
      <div className="absolute right-[5%] top-[6%] w-14" aria-hidden>
        <MoonSvg className="h-auto w-full" />
      </div>

      {/* hidden stars revealed once the cloud slides away */}
      {HIDDEN.map((s, i) => (
        <div key={`h${i}`} className="absolute z-[8]" style={starStyle(s, i, true)}>
          <StarSvg className="h-full w-full drop-shadow-[0_0_8px_rgba(255,209,84,0.8)]" />
        </div>
      ))}

      {/* the five twinkling stars */}
      {VISIBLE.map((s, i) => (
        <div key={`v${i}`} className="absolute z-[6]" style={starStyle(s, i, false)}>
          <StarSvg className="h-full w-full drop-shadow-[0_0_8px_rgba(255,209,84,0.8)]" />
        </div>
      ))}

      {/* count ticker */}
      {done && ticker !== null && (
        <div className="absolute left-1/2 top-[6%] z-30 -translate-x-1/2">
          <div
            className="rounded-2xl border-4 border-[#3B2E5A] bg-[#FFD154] px-5 py-1.5 text-3xl font-black text-[#3B2E5A] shadow-lg"
            style={{ animation: "pop-in 0.25s ease both" }}
            aria-live="polite"
          >
            {num(ticker, lang)}
          </div>
        </div>
      )}

      {/* the big fluffy cloud covering two stars */}
      <div className="absolute left-[33%] top-[14%] z-[15] w-[36%] min-w-[170px]" style={cloudStyle}>
        <Pulse active={hintPulse > 0 && !cloudAway && !done}>
          <div {...cloudDrag.bind} className="cursor-grab active:cursor-grabbing">
            <CloudSvg className="h-auto w-full drop-shadow-[0_6px_10px_rgba(0,0,0,0.25)]" />
          </div>
        </Pulse>
      </div>

      {/* answer chips */}
      <div className="absolute inset-x-0 bottom-[5%] z-30 flex items-center justify-center gap-3 sm:gap-5">
        {[5, 6, 7].map((v, i) => (
          <button
            key={`c-${i}-${wrongTick}`}
            type="button"
            onClick={() => tapChip(v, i)}
            aria-label={lang === "fa" ? `${num(v, lang)} ستاره` : `${v} stars`}
            className={`min-h-[56px] min-w-[68px] rounded-2xl border-4 border-[#3B2E5A] px-4 text-3xl font-black text-[#3B2E5A] shadow-md transition-transform active:scale-95 ${
              ["bg-[#FFD154]", "bg-[#1EC8CF]", "bg-[#FF9FB2]"][i]
            }`}
            style={wrongIdx === i ? { animation: "shake-hard 0.45s ease" } : undefined}
          >
            {num(v, lang)}
          </button>
        ))}
      </div>
    </Scene>
  );
}
