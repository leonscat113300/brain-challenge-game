"use client";

import React, { useCallback, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 53 — One framed picture hangs upside-down. The player can     */
/* rotate the whole gallery 180° to compare, then taps the flipped     */
/* picture (the cat). Tapping a correct picture is only a mistake.     */
/* ------------------------------------------------------------------ */

function FishArt() {
  return (
    <svg viewBox="0 0 100 80" className="h-auto w-full" aria-hidden>
      <path d="M26 40 L10 24 L14 40 L10 56 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="55" cy="40" rx="28" ry="18" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M46 24 Q55 34 46 44" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
      <circle cx="66" cy="36" r="4" fill="#3B2E5A" />
      <circle cx="67.5" cy="34.5" r="1.4" fill="#fff" />
      <path d="M74 44 Q70 47 66 45" stroke="#3B2E5A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="48" cy="42" r="2" fill="#FF6B81" />
    </svg>
  );
}

function CatArt() {
  return (
    <svg viewBox="0 0 100 80" className="h-auto w-full" aria-hidden>
      <path d="M30 26 L26 8 L44 16 Z" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M70 26 L74 8 L56 16 Z" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="50" cy="42" r="26" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="40" cy="38" r="3.4" fill="#3B2E5A" />
      <circle cx="60" cy="38" r="3.4" fill="#3B2E5A" />
      <circle cx="41.2" cy="36.8" r="1.2" fill="#fff" />
      <circle cx="61.2" cy="36.8" r="1.2" fill="#fff" />
      <path d="M47 48 Q50 51 53 48" stroke="#3B2E5A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="45" rx="2.6" ry="1.8" fill="#FF6B81" />
      <path d="M24 44 L36 46 M24 52 L36 51 M76 44 L64 46 M76 52 L64 51" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function HouseArt() {
  return (
    <svg viewBox="0 0 100 80" className="h-auto w-full" aria-hidden>
      <path d="M14 38 L50 12 L86 38 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <rect x="22" y="38" width="56" height="30" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="44" y="46" width="14" height="22" rx="3" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="3" />
      <rect x="27" y="44" width="11" height="11" rx="2" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
      <rect x="63" y="44" width="11" height="11" rx="2" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
    </svg>
  );
}

function FlowerArt() {
  return (
    <svg viewBox="0 0 100 80" className="h-auto w-full" aria-hidden>
      <path d="M50 66 Q48 56 50 46" stroke="#4CAF50" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M49 58 Q40 54 37 60 Q44 64 49 60 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
      <g transform="translate(50 32)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx="0" cy="-11" rx="6.5" ry="11" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="3" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
        <circle cx="-2.5" cy="-1" r="1.2" fill="#3B2E5A" />
        <circle cx="2.5" cy="-1" r="1.2" fill="#3B2E5A" />
        <path d="M-2 3 Q0 5 2 3" stroke="#3B2E5A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function Frame({
  children,
  flipped,
  onPick,
  label,
  pulse,
}: {
  children: React.ReactNode;
  flipped?: boolean;
  onPick: () => void;
  label: string;
  pulse: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      aria-label={label}
      className="block cursor-pointer border-0 bg-transparent p-0"
    >
      <Pulse active={pulse}>
        <div
          className="rounded-xl bg-[#FAFAFA] p-[7%] shadow-[0_4px_0_rgba(59,46,90,0.25)]"
          style={{
            border: "4px solid #3B2E5A",
            transform: flipped ? "rotate(180deg)" : undefined,
            transition: "transform 0.5s ease",
          }}
        >
          {children}
        </div>
      </Pulse>
    </button>
  );
}

export default function Level53({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [rot, setRot] = useState(false);
  const [done, setDone] = useState(false);
  const rotProgRef = useRef(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const rotate = useCallback(() => {
    if (solved || done) return;
    setRot((v) => !v);
    sfx.whoosh();
    if (!rotProgRef.current) {
      rotProgRef.current = true;
      onProgress(0.5);
    }
  }, [solved, done, onProgress]);

  const pick = useCallback(
    (isCat: boolean) => {
      if (solved || done) return;
      if (isCat) {
        setDone(true);
        sfx.cheer();
        sfx.sparkle();
        onProgress(1);
        timers.current.push(setTimeout(onSolved, 750));
        return;
      }
      onMistake({
        fa: "این یکی نیست! تصویر وارونه را پیدا کن.",
        en: "Not this one! Find the upside-down picture.",
      });
    },
    [solved, done, onMistake, onProgress, onSolved]
  );

  return (
    <Scene bg="linear-gradient(180deg,#FFF3D6 0%,#FFE9BC 62%,#E8D9C3 63%,#E0CFAF 100%)">
      {/* wooden floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[18%] border-t-4 border-[#3B2E5A]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(139,94,60,0.28) 0 4px, transparent 4px 54px)" }}
        aria-hidden
      />

      {/* rotating gallery */}
      <div
        className="absolute inset-x-[6%] inset-y-[10%]"
        style={{
          transform: rot ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.75s cubic-bezier(0.45,0.05,0.25,1.2)",
        }}
      >
        {/* nail + strings for charm */}
        <div className="absolute start-[24%] top-[-4%] h-3 w-3 rounded-full bg-[#3B2E5A]" aria-hidden />
        <div className="absolute end-[24%] top-[-4%] h-3 w-3 rounded-full bg-[#3B2E5A]" aria-hidden />

        <div className="absolute start-[4%] top-[6%] w-[40%]">
          <Frame label={lang === "fa" ? "تصویر ماهی" : "fish picture"} onPick={() => pick(false)} pulse={false}>
            <FishArt />
          </Frame>
        </div>
        <div className="absolute end-[4%] top-[6%] w-[40%]">
          <Frame label={lang === "fa" ? "تصویر گربه" : "cat picture"} flipped onPick={() => pick(true)} pulse={hintPulse > 0 && !done}>
            <CatArt />
          </Frame>
        </div>
        <div className="absolute bottom-[8%] start-[4%] w-[40%]">
          <Frame label={lang === "fa" ? "تصویر خانه" : "house picture"} onPick={() => pick(false)} pulse={false}>
            <HouseArt />
          </Frame>
        </div>
        <div className="absolute bottom-[8%] end-[4%] w-[40%]">
          <Frame label={lang === "fa" ? "تصویر گل" : "flower picture"} onPick={() => pick(false)} pulse={false}>
            <FlowerArt />
          </Frame>
        </div>
      </div>

      {/* rotate stage button (outside the rotating container) */}
      <button
        type="button"
        onClick={rotate}
        aria-label={lang === "fa" ? "چرخاندن گالری" : "rotate the gallery"}
        className="absolute bottom-[3%] left-1/2 z-50 flex h-12 w-12 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border-4 border-[#3B2E5A] bg-[#FFD154] shadow-[0_4px_0_rgba(59,46,90,0.35)] active:translate-y-[2px]"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
          <path d="M4 12a8 8 0 0 1 14-5.3" stroke="#3B2E5A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M18 3 v4 h-4" stroke="#3B2E5A" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 12a8 8 0 0 1-14 5.3" stroke="#3B2E5A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <path d="M6 21 v-4 h4" stroke="#3B2E5A" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </Scene>
  );
}
