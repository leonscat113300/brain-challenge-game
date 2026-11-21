"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useShake, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 78 — The key fell inside the bottle! Flip the bottle upside   */
/* down, then shake it (device shake on mobile, taps on desktop).      */
/* ------------------------------------------------------------------ */

function BottleSvg() {
  return (
    <svg viewBox="0 0 110 240" className="h-auto w-full" aria-hidden>
      {/* glass body */}
      <path
        d="M38 12 L72 12 L72 58 Q92 74 92 104 L92 214 Q92 228 78 228 L32 228 Q18 228 18 214 L18 104 Q18 74 38 58 Z"
        fill="#BFE7F5"
        fillOpacity="0.55"
        stroke="#3B2E5A"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* neck rim */}
      <rect x="30" y="6" width="50" height="12" rx="6" fill="#8FDCE0" stroke="#3B2E5A" strokeWidth="4" />
      {/* glass shine */}
      <path d="M34 84 Q30 120 32 196" stroke="#FAFAFA" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
      {/* liquid slosh */}
      <path d="M22 190 Q55 178 88 190 L88 212 Q88 224 76 224 L34 224 Q22 224 22 212 Z" fill="#8FDCE0" opacity="0.4" />
    </svg>
  );
}

function KeySvg({ tone = "#FFD154" }: { tone?: string }) {
  return (
    <svg viewBox="0 0 50 90" className="h-auto w-full" aria-hidden>
      <circle cx="25" cy="18" r="13" fill="none" stroke={tone} strokeWidth="8" />
      <circle cx="25" cy="18" r="13" fill="none" stroke="#3B2E5A" strokeWidth="3" opacity="0.35" />
      <rect x="20" y="28" width="10" height="52" rx="4" fill={tone} stroke="#3B2E5A" strokeWidth="3.5" />
      <rect x="30" y="62" width="12" height="7" rx="3" fill={tone} stroke="#3B2E5A" strokeWidth="3" />
      <rect x="30" y="72" width="9" height="7" rx="3" fill={tone} stroke="#3B2E5A" strokeWidth="3" />
    </svg>
  );
}

function CorkSvg() {
  return (
    <svg viewBox="0 0 70 60" className="h-auto w-full" aria-hidden>
      <ellipse cx="35" cy="34" rx="26" ry="18" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4.5" />
      <ellipse cx="35" cy="26" rx="26" ry="16" fill="#D9A468" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="26" cy="22" r="2.4" fill="#A96F35" />
      <circle cx="42" cy="26" r="2" fill="#A96F35" />
    </svg>
  );
}

const SHAKES_NEEDED = 3;

export default function Level78({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [flipped, setFlipped] = useState(false);
  const [shakeCount, setShakeCount] = useState(0);
  const [out, setOut] = useState(false);
  const [shakeTick, setShakeTick] = useState(0);
  const shakeCountRef = useRef(0);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const handleShake = useCallback(() => {
    if (solved || out || !flipped) return;
    const n = shakeCountRef.current + 1;
    shakeCountRef.current = n;
    setShakeCount(n);
    setShakeTick((t) => t + 1);
    if (n >= SHAKES_NEEDED) {
      setOut(true);
      sfx.coin();
      onProgress(1);
      timers.current.push(setTimeout(() => sfx.sparkle(), 300));
      timers.current.push(setTimeout(() => sfx.cheer(), 600));
      timers.current.push(setTimeout(onSolved, 1700));
    } else {
      sfx.tick();
      onProgress(n === 1 ? 0.6 : 0.8);
    }
  }, [solved, out, flipped, onProgress, onSolved]);

  const shakeCtl = useShake(handleShake, flipped && !out && !solved);

  const tapBottle = useCallback(() => {
    if (solved || out) {
      sfx.pop();
      return;
    }
    if (!flipped) {
      setFlipped(true);
      sfx.whoosh();
      onProgress(0.4);
      return;
    }
    handleShake();
  }, [solved, out, flipped, handleShake, onProgress]);

  const tapCork = useCallback(() => {
    if (solved || out) return;
    sfx.fail();
    onMistake({
      fa: "چوب‌پنبه را ول کن! فقط بطری را برعکس کن و تکانش بده.",
      en: "Leave the cork alone! Just flip the bottle and shake it.",
    });
  }, [solved, out, onMistake]);

  /* key slides toward the mouth with each shake (0 → 26px) */
  const keyOffset = out ? 0 : Math.min(shakeCount * 13, 26);

  return (
    <Scene bg="linear-gradient(180deg,#FFF3E4 0%,#FAE7CF 55%,#EFD9B8 66%,#C98A4B 68%,#A96F35 100%)">
      {/* window light */}
      <div className="absolute left-[6%] top-[8%] w-[22%] opacity-80" aria-hidden>
        <svg viewBox="0 0 100 120">
          <rect x="6" y="6" width="88" height="108" rx="10" fill="#BFE7F5" stroke="#3B2E5A" strokeWidth="5" />
          <line x1="50" y1="6" x2="50" y2="114" stroke="#3B2E5A" strokeWidth="4" />
          <line x1="6" y1="60" x2="94" y2="60" stroke="#3B2E5A" strokeWidth="4" />
          <circle cx="28" cy="32" r="10" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>

      {/* table */}
      <div className="absolute bottom-[8%] left-[10%] right-[10%] h-[11%] rounded-2xl border-4 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
      <div className="absolute bottom-[2%] left-[18%] h-[7%] w-[9%] rounded-b-lg border-x-4 border-b-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />
      <div className="absolute bottom-[2%] right-[18%] h-[7%] w-[9%] rounded-b-lg border-x-4 border-b-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />

      {/* bottle (tap: flip, then shake) */}
      <div className="absolute bottom-[19%] left-[52%] w-[19%]">
        <Pulse active={hintPulse > 0 && !out}>
          <div
            role="button"
            tabIndex={0}
            aria-label={lang === "fa" ? "بطری" : "bottle"}
            onClick={tapBottle}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") tapBottle();
            }}
            className="relative cursor-pointer transition-transform active:scale-95"
          >
            <div key={shakeTick} style={{ animation: flipped && shakeTick > 0 ? "shake-hard 0.45s ease" : undefined }}>
              <div
                style={{
                  transform: flipped ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.75s cubic-bezier(0.5,0,0.3,1.2)",
                }}
              >
                <BottleSvg />
              </div>
              {/* key inside: near mouth when flipped */}
              {!out && (
                <div
                  className="absolute left-[30%] w-[40%]"
                  style={flipped ? { bottom: "7%", transform: `translateY(-${keyOffset}px)`, transition: "transform 0.3s ease" } : { bottom: "6%" }}
                  aria-hidden
                >
                  <KeySvg />
                </div>
              )}
            </div>
          </div>
        </Pulse>
        {/* shake hint chip (desktop fallback note) */}
        {flipped && !out && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 border-[#3B2E5A] bg-[#FFD154] px-3 py-1 text-[11px] font-black text-[#33205E]">
            {lang === "fa" ? `تکانش بده! (${shakeCount}/${SHAKES_NEEDED})` : `Shake it! (${shakeCount}/${SHAKES_NEEDED})`}
          </div>
        )}
      </div>

      {/* the key fell out on the table */}
      {out && (
        <div className="absolute bottom-[10%] left-[38%] w-[13%]" style={{ animation: "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <KeySvg tone="#FFD154" />
          <div className="pointer-events-none absolute -inset-3 -z-10 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,209,84,0.5) 0%, transparent 70%)" }} aria-hidden />
        </div>
      )}

      {/* cork (mistake trap) */}
      <div className="absolute bottom-[10%] right-[20%] w-[14%]">
        <button
          type="button"
          onClick={tapCork}
          aria-label={lang === "fa" ? "چوب‌پنبه" : "cork"}
          className="block w-full cursor-pointer transition-transform active:scale-90"
        >
          <Pulse active={hintPulse > 0 && !flipped}>
            <CorkSvg />
          </Pulse>
        </button>
      </div>
    </Scene>
  );
}
