"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 80 — Which shoe is good for going out? Pick the one with a    */
/* complete healthy pair and tieable laces.                            */
/* ------------------------------------------------------------------ */

function BootSvg({ lone }: { lone: boolean }) {
  return (
    <svg viewBox="0 0 120 90" className="h-auto w-full" aria-hidden>
      <path d="M26 12 L64 12 L64 48 Q84 50 96 60 Q106 70 100 78 L30 78 Q20 78 22 62 Z" fill="#A96F35" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <rect x="26" y="8" width="40" height="10" rx="5" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="3.5" />
      <path d="M22 76 L102 76" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      <circle cx="48" cy="34" r="3.4" fill="#3B2E5A" />
      <circle cx="49.2" cy="32.8" r="1.1" fill="#FAFAFA" />
      <path d="M56 38 Q62 42 66 38" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
      {lone && (
        <g style={{ transformOrigin: "104px 26px", animation: "breathe 1.6s ease-in-out infinite" }}>
          <circle cx="104" cy="24" r="15" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
          <text x="104" y="31" textAnchor="middle" fontSize="17" fontWeight="900" fill="#33205E">؟</text>
        </g>
      )}
    </svg>
  );
}

function SneakerSvg({ broken }: { broken: boolean }) {
  return (
    <svg viewBox="0 0 130 80" className="h-auto w-full" aria-hidden>
      {/* sole */}
      <path d="M10 62 Q10 72 24 72 L104 72 Q118 72 120 62 L120 56 L12 54 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* body */}
      <path d="M12 56 L12 34 Q14 22 28 22 L52 24 Q76 26 92 44 L118 52 L120 58 L12 58 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* toe cap */}
      <path d="M92 44 Q106 48 118 52 L118 58 L86 58 Q84 48 92 44 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
      {/* laces */}
      {!broken ? (
        <>
          <path d="M36 30 L54 38 M54 30 L36 38 M42 22 L62 30 M62 22 L42 30" stroke="#FFD154" strokeWidth="4" strokeLinecap="round" />
          {/* bow */}
          <circle cx="44" cy="26" r="5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.6" />
          <path d="M40 24 Q34 18 38 26 Q30 26 36 30" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.2" />
          <path d="M48 28 Q56 34 52 26 Q60 28 54 32" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.2" />
        </>
      ) : (
        <>
          <path d="M36 30 L44 34" stroke="#FFD154" strokeWidth="4" strokeLinecap="round" />
          <path d="M44 34 L40 46 M44 34 L50 44" stroke="#FFD154" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M62 26 L58 40" stroke="#FFD154" strokeWidth="3.4" strokeLinecap="round" />
          {/* bandage patch */}
          <rect x="78" y="48" width="22" height="10" rx="5" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.6" transform="rotate(-8 89 53)" />
        </>
      )}
      <circle cx="34" cy="44" r="3.2" fill="#3B2E5A" />
      <circle cx="35.2" cy="42.8" r="1" fill="#FAFAFA" />
    </svg>
  );
}

function SandalSvg() {
  return (
    <svg viewBox="0 0 120 80" className="h-auto w-full" aria-hidden>
      <path d="M14 58 Q14 70 30 70 L94 70 Q108 70 108 58 Q108 50 92 50 L30 50 Q14 50 14 58 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M34 50 L56 30 L78 50 M52 50 L62 24 L74 50" fill="none" stroke="#33205E" strokeWidth="5" strokeLinecap="round" />
      <circle cx="62" cy="24" r="5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.6" />
    </svg>
  );
}

interface Slot {
  id: number;
  art: React.ReactNode;
  correct: boolean;
  msg: { fa: string; en: string };
}

const SLOTS: Slot[] = [
  {
    id: 0,
    art: <BootSvg lone />,
    correct: false,
    msg: { fa: "جفت این بوت گم شده؛ با یک لنگه نمی‌شود بیرون رفت!", en: "This boot lost its pair; you can't go out with a single shoe!" },
  },
  {
    id: 1,
    art: (
      <div className="flex items-end justify-center gap-1">
        <div className="w-1/2">
          <SneakerSvg broken={false} />
        </div>
        <div className="w-1/2">
          <SneakerSvg broken={false} />
        </div>
      </div>
    ),
    correct: true,
    msg: { fa: "", en: "" },
  },
  {
    id: 2,
    art: (
      <div className="flex items-end justify-center gap-1">
        <div className="w-1/2">
          <SandalSvg />
        </div>
        <div className="w-1/2">
          <SandalSvg />
        </div>
      </div>
    ),
    correct: false,
    msg: { fa: "دمپایی بند ندارد؛ برای بیرون رفتن مناسب نیست!", en: "Sandals have no laces; they are not for going out!" },
  },
  {
    id: 3,
    art: (
      <div className="flex items-end justify-center gap-1">
        <div className="w-1/2">
          <SneakerSvg broken={false} />
        </div>
        <div className="w-1/2">
          <SneakerSvg broken />
        </div>
      </div>
    ),
    correct: false,
    msg: { fa: "بند یکی از این کفش‌ها پاره شده؛ اول باید درستش کرد!", en: "One of these sneakers has a torn lace; it needs fixing first!" },
  },
];

export default function Level80({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [wrong, setWrong] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pick = useCallback(
    (idx: number) => {
      if (solved || winner !== null) return;
      const s = SLOTS[idx];
      if (s.correct) {
        setWinner(idx);
        sfx.chime();
        onProgress(1);
        timers.current.push(setTimeout(() => sfx.sparkle(), 250));
        timers.current.push(setTimeout(onSolved, 1400));
        return;
      }
      sfx.fail();
      setWrong(idx);
      timers.current.push(setTimeout(() => setWrong(null), 550));
      onMistake(s.msg);
    },
    [solved, winner, onMistake, onProgress, onSolved]
  );

  return (
    <Scene bg="linear-gradient(180deg,#EFE9FB 0%,#E6DDF6 55%,#DCD0EE 64%,#D9BE8F 66%,#C9A87B 100%)">
      {/* door */}
      <div className="absolute left-[3%] top-[6%] w-[17%]" aria-hidden>
        <svg viewBox="0 0 90 170">
          <rect x="8" y="8" width="74" height="154" rx="10" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
          <rect x="20" y="24" width="50" height="56" rx="8" fill="#BFE7F5" stroke="#3B2E5A" strokeWidth="3.5" />
          <rect x="20" y="92" width="50" height="50" rx="8" fill="#BFE7F5" stroke="#3B2E5A" strokeWidth="3.5" />
          <circle cx="72" cy="88" r="6" fill="#33205E" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>

      {/* coat hooks */}
      <div className="absolute right-[6%] top-[4%] w-[26%]" aria-hidden>
        <svg viewBox="0 0 160 70">
          <rect x="6" y="10" width="148" height="12" rx="6" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
          <path d="M40 22 L34 40 M80 22 L80 40 M120 22 L126 40" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
          <path d="M22 44 Q40 30 58 44 L52 62 L28 62 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" />
          <path d="M100 44 Q120 32 140 44 L136 60 L104 60 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="3.5" />
        </svg>
      </div>

      {/* shoe rack: two shelves, two slots each */}
      <div className="absolute bottom-[8%] left-[7%] right-[7%] top-[22%]">
        {/* backboard */}
        <div className="absolute inset-0 rounded-2xl border-4 border-[#3B2E5A] bg-[#E3CFA4]" aria-hidden />
        {/* shelf bars */}
        <div className="absolute left-[4%] right-[4%] top-[42%] h-3 rounded-xl border-4 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
        <div className="absolute bottom-[2%] left-[4%] right-[4%] h-3 rounded-xl border-4 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
        {SLOTS.map((s, i) => {
          const topRow = i < 2;
          const leftCol = i % 2 === 0;
          return (
            <div key={s.id} className={`absolute w-[44%] ${topRow ? "top-[4%]" : "top-[48%]"} ${leftCol ? "left-[5%]" : "right-[5%]"}`}>
              <Pulse active={hintPulse > 0 && winner === null}>
                <button
                  type="button"
                  onClick={() => pick(s.id)}
                  aria-label={lang === "fa" ? `کفش ${i + 1}` : `shoe ${i + 1}`}
                  className="block w-full cursor-pointer rounded-xl bg-[#FAFAFA]/90 p-1 transition-transform active:scale-95"
                  style={{
                    animation: wrong === s.id ? "shake-hard 0.5s ease" : undefined,
                    outline: winner === s.id ? "6px solid #4CAF50" : "3px solid #3B2E5A",
                    filter: winner === s.id ? "drop-shadow(0 0 14px rgba(76,175,80,0.8))" : undefined,
                  }}
                >
                  {s.art}
                </button>
              </Pulse>
            </div>
          );
        })}
      </div>

      {/* doormat */}
      <div className="absolute bottom-[2%] left-1/2 w-[30%] -translate-x-1/2" aria-hidden>
        <svg viewBox="0 0 140 40">
          <rect x="4" y="4" width="132" height="32" rx="10" fill="#FFB84D" stroke="#3B2E5A" strokeWidth="4" />
          <path d="M24 20 L116 20" stroke="#3B2E5A" strokeWidth="3" strokeDasharray="8 6" />
        </svg>
      </div>
    </Scene>
  );
}
