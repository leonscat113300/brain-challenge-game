"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 95 — The house is cold: first open the gas valve, then press  */
/* the heater button. The room warms up and the cat stops shivering.   */
/* ------------------------------------------------------------------ */

function CatSvg({ warm }: { warm: boolean }) {
  return (
    <svg viewBox="0 0 130 120" className="h-auto w-full" aria-hidden>
      <path d="M96 92 Q118 88 116 66 Q114 52 102 54" fill="none" stroke="#3B2E5A" strokeWidth="8" strokeLinecap="round" />
      <path d="M96 92 Q118 88 116 66 Q114 52 102 54" fill="none" stroke="#F59E5B" strokeWidth="4.4" strokeLinecap="round" />
      <ellipse cx="72" cy="90" rx="34" ry="24" fill="#F59E5B" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M58 74 Q60 84 58 92 M74 70 Q76 82 74 92 M90 76 Q92 86 90 92" stroke="#D97F35" strokeWidth="5" strokeLinecap="round" fill="none" />
      <circle cx="44" cy="52" r="24" fill="#F59E5B" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M28 34 L24 14 L44 26 Z" fill="#F59E5B" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M60 34 L64 14 L44 26 Z" fill="#F59E5B" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M30 30 L28 20 L38 27 Z" fill="#FF6B81" />
      <path d="M58 30 L60 20 L50 27 Z" fill="#FF6B81" />
      {warm ? (
        <>
          {/* happy closed eyes */}
          <path d="M31 50 Q36 45 41 50 M49 50 Q54 45 59 50" fill="none" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M38 60 Q44 66 50 60" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="36" cy="50" r="4.6" fill="#3B2E5A" />
          <circle cx="54" cy="50" r="4.6" fill="#3B2E5A" />
          <circle cx="37.4" cy="48.6" r="1.5" fill="#FAFAFA" />
          <circle cx="55.4" cy="48.6" r="1.5" fill="#FAFAFA" />
          <path d="M40 62 Q44 58 48 62" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      <path d="M22 56 L10 52 M22 62 L10 64 M68 56 L80 52 M68 62 L80 64" stroke="#3B2E5A" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function FlameGroup({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <animateTransform attributeName="transform" type="scale" values="1;1.12;1" dur="0.8s" begin={`${delay}s`} repeatCount="indefinite" additive="sum" />
      <path d="M10 2 Q17 12 13 20 Q12 26 10 27 Q8 26 7 20 Q3 12 10 2 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M10 12 Q13 17 11 22 Q10 24 9 22 Q7 17 10 12 Z" fill="#FF6B81" />
    </g>
  );
}

export default function Level95({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [gasOpen, setGasOpen] = useState(false);
  const [heaterOn, setHeaterOn] = useState(false);
  const [warm, setWarm] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapValve = useCallback(() => {
    if (solved || gasOpen) return;
    setGasOpen(true);
    sfx.click();
    timers.current.push(setTimeout(() => sfx.whoosh(), 150));
    onProgress(0.5);
  }, [solved, gasOpen, onProgress]);

  const tapHeater = useCallback(() => {
    if (solved || heaterOn) return;
    if (!gasOpen) {
      sfx.boing();
      onMistake({
        fa: "بخاری گاز ندارد! اول شیر گاز را باز کن.",
        en: "The heater has no gas! Open the valve first.",
      });
      return;
    }
    setHeaterOn(true);
    sfx.pop();
    onProgress(1);
    timers.current.push(setTimeout(() => sfx.sparkle(), 400));
    timers.current.push(
      setTimeout(() => {
        setWarm(true);
        sfx.cheer();
      }, 1100)
    );
    timers.current.push(setTimeout(onSolved, 2400));
  }, [solved, heaterOn, gasOpen, onMistake, onProgress, onSolved]);

  const tapCat = useCallback(() => {
    if (solved || warm) {
      return;
    }
    onMistake({
      fa: "گربه از سرما می‌لرزد! بخاری را روشن کن.",
      en: "The cat is shivering! Turn on the heater.",
    });
  }, [solved, warm, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#E8F2FA 0%,#D6E6F2 100%)">
      {/* warm overlay */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{ background: "linear-gradient(180deg,#FFF3E4 0%,#FAE3C8 100%)", opacity: warm ? 0.96 : 0 }}
        aria-hidden
      />

      {/* falling snowflakes when cold */}
      {!warm &&
        [
          { l: "12%", d: 0 },
          { l: "30%", d: 0.7 },
          { l: "52%", d: 0.3 },
          { l: "72%", d: 1.1 },
          { l: "88%", d: 0.5 },
        ].map((p, i) => (
          <div key={i} className="pointer-events-none absolute top-0 w-[4%]" style={{ left: p.l, animation: `drop-fall 2.6s ${p.d}s linear infinite` }} aria-hidden>
            <svg viewBox="0 0 16 16">
              <path d="M8 1 V15 M1 8 H15 M3 3 L13 13 M13 3 L3 13" stroke="#FAFAFA" strokeWidth="2.4" strokeLinecap="round" />
            </svg>
          </div>
        ))}

      {/* gas pipe + valve */}
      <div className="absolute left-[6%] top-[14%] w-[13%]">
        <button
          type="button"
          onClick={tapValve}
          aria-label={lang === "fa" ? "شیر گاز" : "gas valve"}
          className="block w-full cursor-pointer transition-transform active:scale-95"
        >
          <Pulse active={hintPulse > 0 && !gasOpen}>
            <svg viewBox="0 0 90 110" className="h-auto w-full" aria-hidden>
              {/* pipe */}
              <rect x="38" y="30" width="14" height="80" rx="6" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="4.5" />
              {/* valve wheel */}
              <g style={{ transform: gasOpen ? "rotate(90deg)" : "rotate(0deg)", transformOrigin: "45px 34px", transition: "transform 0.45s ease" }}>
                <circle cx="45" cy="34" r="20" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" />
                <circle cx="45" cy="34" r="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.4" />
                <path d="M45 14 L45 54 M25 34 L65 34" stroke="#3B2E5A" strokeWidth="4.4" strokeLinecap="round" />
              </g>
              {gasOpen && (
                <text x="70" y="26" fontSize="16" fontWeight="800" fill="#4CAF50" style={{ animation: "star-pop 0.5s ease-out both" }}>
                  ✓
                </text>
              )}
            </svg>
          </Pulse>
        </button>
      </div>

      {/* heater */}
      <div className="absolute bottom-[10%] left-1/2 w-[34%] -translate-x-1/2">
        <button
          type="button"
          onClick={tapHeater}
          aria-label={lang === "fa" ? "دکمهٔ بخاری" : "heater button"}
          className="block w-full cursor-pointer transition-transform active:scale-95"
        >
          <Pulse active={hintPulse > 0 && gasOpen && !heaterOn}>
            <svg viewBox="0 0 150 170" className="h-auto w-full" aria-hidden>
              {/* body */}
              <rect x="12" y="14" width="126" height="146" rx="16" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
              {/* grill window */}
              <rect x="28" y="34" width="94" height="70" rx="12" fill={heaterOn ? "#FFE9C4" : "#DCE8F0"} stroke="#3B2E5A" strokeWidth="3.4" />
              {/* flames */}
              {heaterOn && (
                <g>
                  <FlameGroup x={48} y={52} delay={0} />
                  <FlameGroup x={68} y={50} delay={0.2} />
                  <FlameGroup x={88} y={54} delay={0.35} />
                </g>
              )}
              {/* grill lines */}
              <path d="M28 62 H122 M28 80 H122" stroke={heaterOn ? "#E8B45A" : "#B9CBD8"} strokeWidth="3" />
              {/* button */}
              <circle cx="75" cy="130" r="17" fill={heaterOn ? "#4CAF50" : "#FF6B81"} stroke="#3B2E5A" strokeWidth="4.5" style={heaterOn ? { animation: "glow 1.4s ease-in-out infinite" } : undefined} />
              <circle cx="75" cy="130" r="8" fill="#FAFAFA" opacity={heaterOn ? 0.95 : 0.7} />
            </svg>
          </Pulse>
        </button>
        {/* heater feet */}
        <div className="mx-auto flex w-[70%] justify-between" aria-hidden>
          <div className="h-3 w-8 rounded-b-lg bg-[#3B2E5A]" />
          <div className="h-3 w-8 rounded-b-lg bg-[#3B2E5A]" />
        </div>
      </div>

      {/* cat */}
      <div className="absolute bottom-[12%] right-[8%] w-[26%]">
        <button type="button" onClick={tapCat} aria-label={lang === "fa" ? "گربه" : "cat"} className="block w-full cursor-pointer">
          <div style={{ animation: warm ? "bob 1.6s ease-in-out infinite" : "wobble 0.5s ease-in-out infinite" }}>
            <Pulse active={hintPulse > 0 && !gasOpen}>
              <CatSvg warm={warm} />
            </Pulse>
          </div>
        </button>
        {!warm && (
          <div className="pointer-events-none absolute -top-6 right-2 w-14" aria-hidden>
            <svg viewBox="0 0 60 30">
              <path d="M6 26 Q10 14 4 6 M20 26 Q26 16 20 4 M36 26 Q40 14 34 8" fill="none" stroke="#7FB3D5" strokeWidth="3" strokeLinecap="round" style={{ animation: "float-up 1.6s ease-out infinite" }} />
            </svg>
          </div>
        )}
      </div>

      {/* hearts when warm */}
      {warm &&
        [
          { l: "58%", t: "40%" },
          { l: "70%", t: "30%" },
        ].map((p, i) => (
          <div key={i} className="pointer-events-none absolute" style={{ left: p.l, top: p.t, animation: `float-up 1.4s ${i * 0.25}s ease-out infinite` }} aria-hidden>
            <svg viewBox="0 0 24 24" className="w-6">
              <path d="M12 21 Q3 14 3 8 Q3 3 8 3 Q11 3 12 6 Q13 3 16 3 Q21 3 21 8 Q21 14 12 21 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2" />
            </svg>
          </div>
        ))}
    </Scene>
  );
}
