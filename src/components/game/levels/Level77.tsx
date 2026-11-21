"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 77 — The candle went out! Pull the match out of the box       */
/* (it strikes & ignites), then touch the wick with the flame.         */
/* ------------------------------------------------------------------ */

function CandleSvg({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 120 200" className="h-auto w-full" aria-hidden>
      {/* glow */}
      {lit && <circle cx="60" cy="52" r="40" fill="#FFD154" opacity="0.25" />}
      {/* body */}
      <rect x="34" y="72" width="52" height="104" rx="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M34 100 Q60 112 86 100" fill="none" stroke="#EDE9F4" strokeWidth="5" />
      <path d="M34 132 Q60 144 86 132" fill="none" stroke="#EDE9F4" strokeWidth="5" />
      {/* face */}
      {lit ? (
        <>
          <circle cx="48" cy="128" r="5" fill="#3B2E5A" />
          <circle cx="72" cy="128" r="5" fill="#3B2E5A" />
          <circle cx="49.5" cy="126.5" r="1.6" fill="#FAFAFA" />
          <circle cx="73.5" cy="126.5" r="1.6" fill="#FAFAFA" />
          <path d="M50 142 Q60 150 70 142" fill="none" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M43 126 L53 133 M53 126 L43 133" stroke="#3B2E5A" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M67 126 L77 133 M77 126 L67 133" stroke="#3B2E5A" strokeWidth="3.2" strokeLinecap="round" />
          <circle cx="60" cy="145" r="4.6" fill="#3B2E5A" />
        </>
      )}
      {/* wick */}
      <line x1="60" y1="72" x2="60" y2="60" stroke="#3B2E5A" strokeWidth="4.5" strokeLinecap="round" />
      {/* flame */}
      {lit && (
        <g style={{ transformOrigin: "60px 58px", animation: "breathe 0.9s ease-in-out infinite" }}>
          <path d="M60 28 Q72 44 60 58 Q48 44 60 28 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
          <path d="M60 40 Q66 48 60 56 Q54 48 60 40 Z" fill="#FF6B81" opacity="0.85" />
        </g>
      )}
    </svg>
  );
}

function MatchSvg({ ignited }: { ignited: boolean }) {
  return (
    <svg viewBox="0 0 60 160" className="h-auto w-full" aria-hidden>
      {ignited && (
        <g style={{ transformOrigin: "30px 26px", animation: "breathe 0.7s ease-in-out infinite" }}>
          <path d="M30 4 Q42 16 30 30 Q18 16 30 4 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
          <path d="M30 14 Q36 20 30 27 Q24 20 30 14 Z" fill="#FF6B81" opacity="0.85" />
        </g>
      )}
      <circle cx="30" cy="34" r="11" fill={ignited ? "#FF6B81" : "#8FA6BD"} stroke="#3B2E5A" strokeWidth="4" />
      <rect x="24" y="42" width="12" height="106" rx="6" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  );
}

function MatchboxSvg() {
  return (
    <svg viewBox="0 0 160 90" className="h-auto w-full" aria-hidden>
      {/* inner tray */}
      <rect x="18" y="26" width="124" height="34" rx="8" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4.5" />
      <rect x="18" y="26" width="124" height="12" rx="6" fill="#A96F35" stroke="#3B2E5A" strokeWidth="3" />
      {/* outer sleeve */}
      <rect x="6" y="42" width="148" height="40" rx="10" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M40 62 L74 62 M86 62 L120 62" stroke="#FAFAFA" strokeWidth="5" strokeLinecap="round" />
      {/* striker */}
      <rect x="126" y="46" width="22" height="32" rx="6" fill="#33205E" opacity="0.85" />
    </svg>
  );
}

export default function Level77({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [ignited, setIgnited] = useState(false);
  const [lit, setLit] = useState(false);
  const [used, setUsed] = useState(false);

  const matchRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const wickRef = useRef<HTMLDivElement>(null);
  const ignitedRef = useRef(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const matchDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || lit || used) return;
        if (!d.everMoved) {
          sfx.click();
          ignitedRef.current = false;
          setIgnited(false);
          return;
        }
        if (overElement(matchRef, wickRef, 12)) {
          if (!ignitedRef.current) {
            api.reset();
            sfx.fail();
            onMistake({
              fa: "اول کبریت را از جعبه بیرون بکش تا با ساییدن روشن شود!",
              en: "First pull the match out of the box so it strikes & lights!",
            });
            return;
          }
          api.reset();
          ignitedRef.current = false;
          setIgnited(false);
          setUsed(true);
          setLit(true);
          sfx.whoosh();
          timers.current.push(setTimeout(() => sfx.chime(), 350));
          timers.current.push(setTimeout(() => sfx.sparkle(), 700));
          onProgress(1);
          timers.current.push(setTimeout(onSolved, 1600));
          return;
        }
        /* dropped somewhere else: match goes back unlit */
        api.reset();
        ignitedRef.current = false;
        setIgnited(false);
      },
      [solved, lit, used, onMistake, onProgress, onSolved]
    )
  );

  /* striking: once the match travels far enough from the box, it ignites (event-driven) */
  const downPos = useRef({ x: 0, y: 0, active: false });
  const matchDown = (e: React.PointerEvent) => {
    downPos.current = { x: e.clientX, y: e.clientY, active: true };
    matchDrag.bind.onPointerDown(e);
  };
  const matchMove = (e: React.PointerEvent) => {
    matchDrag.bind.onPointerMove(e);
    if (solved || lit || ignitedRef.current || !downPos.current.active) return;
    const far = Math.abs(e.clientX - downPos.current.x) + Math.abs(e.clientY - downPos.current.y);
    if (far > 90) {
      ignitedRef.current = true;
      setIgnited(true);
      sfx.sparkle();
      onProgress(0.5);
    }
  };

  return (
    <Scene bg="linear-gradient(180deg,#33205E 0%,#3D2C6E 55%,#2A1D50 68%,#241A44 70%,#1C1436 100%)">
      {/* stars/motes in the dark */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[
          { l: "12%", t: "12%" },
          { l: "26%", t: "30%" },
          { l: "78%", t: "14%" },
          { l: "88%", t: "38%" },
          { l: "62%", t: "8%" },
        ].map((p, i) => (
          <div key={i} className="absolute" style={{ left: p.l, top: p.t, animation: `breathe 2.2s ${i * 0.3}s ease-in-out infinite` }}>
            <svg viewBox="0 0 20 20" className="w-3 opacity-70">
              <path d="M10 1 L12 8 L19 10 L12 12 L10 19 L8 12 L1 10 L8 8 Z" fill="#FFD154" />
            </svg>
          </div>
        ))}
      </div>

      {/* table */}
      <div className="absolute bottom-[6%] left-[8%] right-[8%] h-[12%] rounded-2xl border-4 border-[#3B2E5A] bg-[#6B4A86]" aria-hidden />
      <div className="absolute bottom-[2%] left-[14%] h-[6%] w-[8%] rounded-b-lg border-x-4 border-b-4 border-[#3B2E5A] bg-[#55396E]" aria-hidden />
      <div className="absolute bottom-[2%] right-[14%] h-[6%] w-[8%] rounded-b-lg border-x-4 border-b-4 border-[#3B2E5A] bg-[#55396E]" aria-hidden />

      {/* candle */}
      <div className="absolute bottom-[17%] left-[56%] w-[22%]">
        <div ref={wickRef} className="absolute left-1/2 top-[-4%] h-[24%] w-[60%] -translate-x-1/2" aria-hidden />
        <Pulse active={hintPulse > 0 && !lit}>
          <CandleSvg lit={lit} />
        </Pulse>
        {lit && (
          <div
            className="pointer-events-none absolute -inset-6 -z-10 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(255,209,84,0.45) 0%, rgba(255,209,84,0.12) 55%, transparent 75%)", animation: "glow 1.6s ease-in-out infinite" }}
            aria-hidden
          />
        )}
      </div>

      {/* smoke when unlit */}
      {!lit && (
        <div className="pointer-events-none absolute bottom-[42%] left-[63%] w-[8%]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 20 44" className="absolute bottom-0" style={{ left: i * 10, animation: `float-up 2.2s ${i * 0.5}s ease-out infinite` }}>
              <path d="M10 40 Q4 30 10 20 Q16 10 10 2" stroke="#8FA6BD" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
            </svg>
          ))}
        </div>
      )}

      {/* matchbox */}
      <div ref={boxRef} className="absolute bottom-[18%] left-[10%] w-[34%]" aria-hidden>
        <MatchboxSvg />
      </div>

      {/* the match (draggable; sticks out of the box) */}
      {!used && (
        <div className="absolute bottom-[24%] left-[26%] w-[11%]">
          <div
            ref={matchRef}
            {...matchDrag.bind}
            onPointerDown={matchDown}
            onPointerMove={matchMove}
            role="button"
            aria-label={lang === "fa" ? "کبریت" : "match"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${matchDrag.x}px, ${matchDrag.y}px) rotate(-30deg)`,
              transition: matchDrag.dragging ? "none" : "transform 0.45s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 24,
            }}
          >
            <Pulse active={hintPulse > 0 && !lit}>
              <MatchSvg ignited={ignited} />
            </Pulse>
          </div>
        </div>
      )}

      {/* warm light pool when lit */}
      {lit && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 66% 45%, rgba(255,209,84,0.22) 0%, transparent 45%)" }}
          aria-hidden
        />
      )}
    </Scene>
  );
}
