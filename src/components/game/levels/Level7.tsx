"use client";

import React, { useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 7 — Which is Bigger?: a huge mouse stands up close while a    */
/* tiny elephant waits far away. The elephant is the real answer.      */
/* ------------------------------------------------------------------ */

function MouseSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 220 210" className={className} style={style} aria-hidden>
      {/* tail */}
      <path d="M150 150 Q210 144 202 94 Q196 64 170 72" stroke="#3B2E5A" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M150 150 Q210 144 202 94 Q196 64 170 72" stroke="#FF9FB2" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="100" cy="150" rx="56" ry="44" fill="#C7C3D4" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="100" cy="160" rx="34" ry="25" fill="#E6E3EF" />
      {/* arms (proud pose) */}
      <ellipse cx="50" cy="138" rx="10" ry="18" fill="#C7C3D4" stroke="#3B2E5A" strokeWidth="4" transform="rotate(18 50 138)" />
      <ellipse cx="150" cy="138" rx="10" ry="18" fill="#C7C3D4" stroke="#3B2E5A" strokeWidth="4" transform="rotate(-18 150 138)" />
      {/* ears */}
      <circle cx="54" cy="42" r="25" fill="#C7C3D4" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="54" cy="42" r="13" fill="#FF9FB2" />
      <circle cx="118" cy="42" r="25" fill="#C7C3D4" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="118" cy="42" r="13" fill="#FF9FB2" />
      {/* head */}
      <circle cx="86" cy="82" r="42" fill="#C7C3D4" stroke="#3B2E5A" strokeWidth="5" />
      {/* proud eyebrows */}
      <path d="M64 62 Q72 55 80 61" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M92 61 Q100 55 108 62" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* eyes */}
      <circle cx="72" cy="76" r="6" fill="#3B2E5A" />
      <circle cx="100" cy="76" r="6" fill="#3B2E5A" />
      <circle cx="74" cy="74" r="2" fill="#FAFAFA" />
      <circle cx="102" cy="74" r="2" fill="#FAFAFA" />
      {/* blush */}
      <ellipse cx="60" cy="92" rx="7" ry="4" fill="#FF9FB2" opacity="0.7" />
      <ellipse cx="112" cy="92" rx="7" ry="4" fill="#FF9FB2" opacity="0.7" />
      {/* nose + mouth + buck teeth */}
      <ellipse cx="86" cy="90" rx="7" ry="5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.5" />
      <path d="M78 100 Q86 106 94 100" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <rect x="79.5" y="102" width="6" height="12" rx="2.5" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.5" />
      <rect x="86.5" y="102" width="6" height="12" rx="2.5" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.5" />
      {/* whiskers */}
      <path d="M56 88 L38 84 M56 94 L38 98" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M116 88 L134 84 M116 94 L134 98" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" />
      {/* feet */}
      <ellipse cx="76" cy="196" rx="17" ry="9" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="124" cy="196" rx="17" ry="9" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  );
}

function ElephantSvg({ happy, className, style }: { happy: boolean; className?: string; style?: React.CSSProperties }) {
  const trunkDown = "M28 68 Q12 92 22 114 Q26 122 34 118";
  const trunkUp = "M28 66 Q8 52 16 28 Q20 18 30 24";
  const trunk = happy ? trunkUp : trunkDown;
  return (
    <svg viewBox="0 0 170 145" className={className} style={style} aria-hidden>
      {/* tail */}
      <path d="M156 76 Q170 88 162 102" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="106" cy="86" rx="52" ry="40" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="5" />
      {/* legs */}
      <rect x="72" y="106" width="16" height="30" rx="7" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="96" y="110" width="16" height="28" rx="7" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="122" y="106" width="16" height="30" rx="7" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
      {/* toenails */}
      <ellipse cx="80" cy="136" rx="4" ry="2.5" fill="#FAFAFA" />
      <ellipse cx="104" cy="138" rx="4" ry="2.5" fill="#FAFAFA" />
      <ellipse cx="130" cy="136" rx="4" ry="2.5" fill="#FAFAFA" />
      {/* ear */}
      <ellipse cx="66" cy="52" rx="20" ry="27" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="68" cy="54" rx="11" ry="17" fill="#12A3A9" />
      {/* head */}
      <circle cx="46" cy="62" r="30" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="5" />
      {/* trunk (lifts up when happy: trumpet pose) */}
      <path d={trunk} stroke="#3B2E5A" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d={trunk} stroke="#1EC8CF" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {/* tusk */}
      <path d="M40 88 Q38 100 50 102" stroke="#3B2E5A" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M40 88 Q38 100 50 102" stroke="#FAFAFA" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {/* eye */}
      {happy ? (
        <path d="M32 52 Q38 45 44 52" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="38" cy="54" r="5" fill="#3B2E5A" />
          <circle cx="40" cy="52" r="1.8" fill="#FAFAFA" />
        </>
      )}
      {/* blush */}
      <ellipse cx="56" cy="72" rx="6" ry="3.5" fill="#FF6B81" opacity="0.5" />
    </svg>
  );
}

function StarSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden>
      <path d="M20 3 L24 15 L36 16 L26 24 L30 36 L20 28 L10 36 L14 24 L4 16 L16 15 Z" fill="#FFD154" stroke="#E8A81C" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function Level7({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [correct, setCorrect] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [bubble, setBubble] = useState(false);

  const pickElephant = () => {
    if (correct || solved) return;
    setCorrect(true);
    sfx.cheer();
    onProgress(1);
    window.setTimeout(onSolved, 800);
  };

  const pickMouse = () => {
    if (correct || solved) return;
    setWrongCount((c) => c + 1);
    setBubble(true);
    sfx.fail();
    onMistake({ fa: "موش فقط از نزدیک بزرگ دیده می‌شود!", en: "The mouse only looks big up close!" });
    window.setTimeout(() => setBubble(false), 1900);
  };

  return (
    <Scene bg="linear-gradient(180deg,#BEE9F5 0%,#D6F2EC 52%,#CDEFE9 100%)">
      {/* sun */}
      <svg viewBox="0 0 80 80" className="absolute top-[4%] end-[5%] w-[13%]" aria-hidden>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={40 + Math.cos(a) * 26}
              y1={40 + Math.sin(a) * 26}
              x2={40 + Math.cos(a) * 34}
              y2={40 + Math.sin(a) * 34}
              stroke="#E8A81C"
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })}
        <circle cx="40" cy="40" r="20" fill="#FFD154" stroke="#E8A81C" strokeWidth="4" />
      </svg>

      {/* meadow hills */}
      <svg viewBox="0 0 400 120" className="absolute bottom-0 left-0 w-full" preserveAspectRatio="none" aria-hidden>
        <path d="M0 55 Q100 12 200 50 T400 40 L400 120 L0 120 Z" fill="#7ED491" />
        <path d="M0 82 Q120 45 240 78 T400 68 L400 120 L0 120 Z" fill="#4CAF50" />
        <circle cx="52" cy="98" r="6" fill="#FFD154" />
        <circle cx="330" cy="102" r="6" fill="#FF6B81" />
        <circle cx="205" cy="104" r="6" fill="#1EC8CF" />
      </svg>

      {/* elephant — small and far away (the correct answer) */}
      <div className="absolute bottom-[21%] start-[7%] w-[18%] z-[1]">
        <Pulse active={hintPulse > 0 && !correct}>
          <button
            type="button"
            aria-label={lang === "fa" ? "فیل" : "elephant"}
            onClick={pickElephant}
            className="relative block w-full min-w-[56px] min-h-[44px]"
            style={{ animation: correct ? "bob 0.55s ease-in-out 2" : undefined }}
          >
            <ElephantSvg happy={correct} className="w-full h-auto" />
            {correct && (
              <>
                <StarSvg className="absolute -top-3 -start-4 w-7 h-7" style={{ animation: "pop-in 0.4s 0.05s both" }} />
                <StarSvg className="absolute top-4 -end-5 w-6 h-6" style={{ animation: "pop-in 0.4s 0.2s both" }} />
                <StarSvg className="absolute -bottom-2 start-1/2 w-5 h-5" style={{ animation: "pop-in 0.4s 0.35s both" }} />
              </>
            )}
          </button>
        </Pulse>
        <div className="mx-auto mt-1 h-[7px] w-[70%] rounded-[50%] bg-[#3B2E5A]/15" aria-hidden />
      </div>

      {/* mouse — huge and up close (the visual trick) */}
      <div className="absolute bottom-[2%] start-[21%] w-[56%] z-10">
        <button type="button" aria-label={lang === "fa" ? "موش" : "mouse"} onClick={pickMouse} className="block w-full">
          <div key={wrongCount} style={{ animation: wrongCount > 0 ? "shake-hard 0.5s ease" : undefined }}>
            <MouseSvg className="w-full h-auto drop-shadow-[0_6px_4px_rgba(59,46,90,0.18)]" />
          </div>
        </button>
      </div>

      {/* mouse speech bubble on wrong tap */}
      {bubble && (
        <div
          className="absolute top-[30%] start-[30%] z-20 max-w-[46%] rounded-2xl bg-[#FAFAFA] border-4 border-[#3B2E5A] px-3 py-2 text-center font-extrabold text-[#3B2E5A] shadow-[0_4px_0_rgba(59,46,90,0.25)]"
          style={{ animation: "pop-in 0.3s both", direction: lang === "fa" ? "rtl" : "ltr" }}
          role="status"
        >
          {lang === "fa" ? "من از نزدیک اومدم!" : "I'm just up close!"}
          <div className="absolute -bottom-[9px] left-10 h-4 w-4 rotate-45 bg-[#FAFAFA] border-b-4 border-r-4 border-[#3B2E5A]" aria-hidden />
        </div>
      )}
    </Scene>
  );
}
