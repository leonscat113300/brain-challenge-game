"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 58 — Make it rain: tap the cloud five times. Every tap        */
/* darkens the cloud and squeezes out drops. At five the shower pours  */
/* and the sad flower blooms. Tapping the sun is a mistake.            */
/* ------------------------------------------------------------------ */

const CLOUD_FILLS = ["#FAFAFA", "#F0EBF6", "#E0DAEE", "#CFC7E4", "#B7ABDA", "#A395CB"];

function CloudSvg({ fill, squeezing }: { fill: string; squeezing: boolean }) {
  return (
    <svg viewBox="0 0 220 130" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.16)]" aria-hidden>
      <g
        style={{
          transform: squeezing ? "scale(1.06, 0.92)" : "scale(1,1)",
          transformOrigin: "50% 60%",
          transition: "transform 0.16s ease",
        }}
      >
        <path
          d="M48 104 Q14 104 14 78 Q14 54 40 52 Q44 26 74 24 Q96 22 106 40 Q120 28 138 34 Q162 40 162 62 Q196 64 196 84 Q196 104 170 104 Z"
          fill={fill}
          stroke="#3B2E5A"
          strokeWidth="5"
          strokeLinejoin="round"
          style={{ transition: "fill 0.25s ease" }}
        />
        <path d="M56 88 Q60 78 70 76 M118 90 Q124 80 134 80" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.25" />
        {/* face */}
        <circle cx="84" cy="66" r="3.4" fill="#3B2E5A" />
        <circle cx="112" cy="66" r="3.4" fill="#3B2E5A" />
        <path d="M90 78 Q98 84 106 78" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="78" cy="74" rx="4" ry="2.6" fill="#FF9FB2" opacity="0.8" />
        <ellipse cx="118" cy="74" rx="4" ry="2.6" fill="#FF9FB2" opacity="0.8" />
      </g>
    </svg>
  );
}

function Drop({ left, delay }: { left: string; delay: number }) {
  return (
    <span className="absolute" style={{ left, top: "52%", width: 12, height: 16, animation: `drop-fall 0.95s ${delay}s ease-in forwards` }} aria-hidden>
      <svg viewBox="0 0 12 16" className="h-full w-full">
        <path d="M6 0 Q11 8 6 14 Q1 8 6 0 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

export default function Level58({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [taps, setTaps] = useState(0);
  const [squeezing, setSqueezing] = useState(false);
  const [drops, setDrops] = useState<Array<{ id: number; left: string; delay: number }>>([]);
  const [pouring, setPouring] = useState(false);
  const [done, setDone] = useState(false);
  const idRef = useRef(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const doneRef = useRef(false);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapCloud = useCallback(() => {
    if (solved || done || pouring) return;
    const n = Math.min(5, taps + 1);
    setTaps(n);
    onProgress(n / 5);
    setSqueezing(true);
    timers.current.push(setTimeout(() => setSqueezing(false), 180));
    sfx.pop();

    /* squeeze out a couple of drops */
    const newDrops = [0, 1].map((k) => {
      idRef.current += 1;
      return {
        id: idRef.current,
        left: `${34 + ((n * 7 + k * 13) % 30)}%`,
        delay: k * 0.15,
      };
    });
    setDrops((prev) => [...prev.slice(-8), ...newDrops]);
    newDrops.forEach((dr) => {
      timers.current.push(setTimeout(() => setDrops((prev) => prev.filter((x) => x.id !== dr.id)), 1400));
    });

    if (n >= 5 && !doneRef.current) {
      doneRef.current = true;
      setPouring(true);
      timers.current.push(setTimeout(() => sfx.sparkle(), 500));
      timers.current.push(setTimeout(() => sfx.cheer(), 900));
      onProgress(1);
      setDone(true);
      timers.current.push(setTimeout(onSolved, 2000));
    }
  }, [solved, done, pouring, taps, onProgress, onSolved]);

  const tapSun = useCallback(() => {
    if (solved || done) return;
    sfx.click();
    onMistake({
      fa: "خورشید باران نمی‌سازد! ابر را فشار بده.",
      en: "The sun can't make rain! Squeeze the cloud.",
    });
  }, [solved, done, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#DFF3F7 0%,#EAF7FB 55%,#DFF0D8 56%,#D5EBCC 100%)">
      {/* ground */}
      <div className="absolute inset-x-0 bottom-0 h-[20%] border-t-4 border-[#3B2E5A] bg-[#DFF0D8]" aria-hidden />

      {/* sun (decoy) */}
      <button
        type="button"
        onClick={tapSun}
        aria-label={lang === "fa" ? "خورشید" : "sun"}
        className="absolute start-[7%] top-[7%] w-[12%] cursor-pointer border-0 bg-transparent p-0"
      >
        <svg viewBox="0 0 60 60" className="h-auto w-full" style={{ animation: "breathe 3s ease-in-out infinite" }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="30" y1="8" x2="30" y2="13" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 30 30)`} />
          ))}
          <circle cx="30" cy="30" r="16" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
          <circle cx="24" cy="27" r="2" fill="#3B2E5A" />
          <circle cx="36" cy="27" r="2" fill="#3B2E5A" />
          <path d="M26 34 Q30 37 34 34" stroke="#3B2E5A" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {/* drop counter */}
      <div className="absolute end-[6%] top-[7%] flex gap-1.5" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} viewBox="0 0 12 16" className="w-3.5">
            <path d="M6 0 Q11 8 6 14 Q1 8 6 0 Z" fill={i < taps ? "#1EC8CF" : "none"} stroke="#3B2E5A" strokeWidth="1.6" />
          </svg>
        ))}
      </div>

      {/* the cloud */}
      <div className="absolute left-1/2 top-[10%] w-[52%] -translate-x-1/2">
        <Pulse active={hintPulse > 0 && !done} color="#1EC8CF">
          <button
            type="button"
            onClick={tapCloud}
            aria-label={lang === "fa" ? "ابر" : "cloud"}
            className="block w-full cursor-pointer border-0 bg-transparent p-0"
            style={{ animation: done ? undefined : "bob 3s ease-in-out infinite" }}
          >
            <CloudSvg fill={CLOUD_FILLS[Math.min(taps, 5)]} squeezing={squeezing} />
          </button>
        </Pulse>
      </div>

      {/* squeezed drops */}
      {drops.map((d) => (
        <Drop key={d.id} left={d.left} delay={d.delay} />
      ))}

      {/* the pouring shower */}
      {pouring &&
        Array.from({ length: 12 }).map((_, i) => (
          <Drop key={`rain-${i}`} left={`${18 + i * 6}%`} delay={(i % 6) * 0.12} />
        ))}

      {/* the flower: sad -> blooming */}
      <div className="absolute bottom-[4%] left-1/2 w-[20%] -translate-x-1/2">
        <svg viewBox="0 0 100 120" className="h-auto w-full">
          <path d="M50 112 Q48 92 50 74" stroke="#4CAF50" strokeWidth="6" fill="none" strokeLinecap="round" />
          {done ? (
            <g style={{ animation: "pop-in 0.6s 0.4s both", transformBox: "fill-box", transformOrigin: "50% 100%" }}>
              <path d="M49 92 Q38 88 35 96 Q43 102 49 97 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
              <g transform="translate(50 58)">
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <ellipse key={a} cx="0" cy="-14" rx="8" ry="13" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" transform={`rotate(${a})`} />
                ))}
                <circle cx="0" cy="0" r="10" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
                <circle cx="-3" cy="-2" r="1.6" fill="#3B2E5A" />
                <circle cx="3" cy="-2" r="1.6" fill="#3B2E5A" />
                <path d="M-2.5 3 Q0 6 2.5 3" stroke="#3B2E5A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
              </g>
            </g>
          ) : (
            <g>
              <path d="M49 92 Q40 88 37 94 Q44 99 49 96 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
              <g transform="translate(50 62) rotate(18)" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
                {[0, 60, 120, 180, 240, 300].map((a) => (
                  <ellipse key={a} cx="0" cy="-11" rx="6.5" ry="10" fill="#B7ABDA" stroke="#3B2E5A" strokeWidth="3.5" transform={`rotate(${a})`} />
                ))}
                <circle cx="0" cy="0" r="8" fill="#E0DAEE" stroke="#3B2E5A" strokeWidth="3.5" />
                <path d="M-3 -6 Q0 -3 3 -6" stroke="#3B2E5A" strokeWidth="1.8" fill="none" strokeLinecap="round" />
                <circle cx="-3" cy="0" r="1.4" fill="#3B2E5A" />
                <circle cx="3" cy="0" r="1.4" fill="#3B2E5A" />
              </g>
            </g>
          )}
        </svg>
      </div>

      {/* puddle */}
      <div
        className="absolute bottom-[3%] left-1/2 h-4 -translate-x-1/2 rounded-full border-2 border-[#3B2E5A] bg-[#1EC8CF] transition-all duration-700"
        style={{ width: pouring ? "34%" : `${8 + taps * 4}%`, opacity: taps === 0 ? 0 : 0.85 }}
        aria-hidden
      />
    </Scene>
  );
}
