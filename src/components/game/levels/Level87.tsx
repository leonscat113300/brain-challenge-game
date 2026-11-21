"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 87 — Which two socks really pair? Same PATTERN, not just      */
/* same color.                                                         */
/* ------------------------------------------------------------------ */

type Pattern = "dots" | "stripes" | "zigzag";

interface Sock {
  id: number;
  body: string;
  pattern: Pattern;
  patternColor: string;
}

const SOCKS: Sock[] = [
  { id: 0, body: "#FF6B81", pattern: "dots", patternColor: "#FAFAFA" },
  { id: 1, body: "#FF6B81", pattern: "stripes", patternColor: "#FFD154" },
  { id: 2, body: "#1EC8CF", pattern: "dots", patternColor: "#FAFAFA" },
  { id: 3, body: "#4CAF50", pattern: "zigzag", patternColor: "#FFD154" },
];

function SockSvg({ s, selected }: { s: Sock; selected: boolean }) {
  return (
    <svg viewBox="0 0 70 110" className="h-auto w-full" aria-hidden>
      <path
        d="M20 8 L54 8 L54 60 Q54 84 36 93 Q18 100 10 86 Q4 74 18 68 Q26 64 20 54 Z"
        fill={s.body}
        stroke={selected ? "#33205E" : "#3B2E5A"}
        strokeWidth={selected ? 5.5 : 4.5}
        strokeLinejoin="round"
      />
      <path d="M20 20 L54 20" stroke="#FAFAFA" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
      {/* patterns */}
      {s.pattern === "dots" &&
        [
          { x: 34, y: 36 },
          { x: 44, y: 48 },
          { x: 30, y: 56 },
          { x: 40, y: 68 },
          { x: 28, y: 78 },
        ].map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill={s.patternColor} stroke="#3B2E5A" strokeWidth="1.4" />
        ))}
      {s.pattern === "stripes" && (
        <>
          <path d="M24 34 L54 30" stroke={s.patternColor} strokeWidth="5" strokeLinecap="round" />
          <path d="M24 46 L54 42" stroke={s.patternColor} strokeWidth="5" strokeLinecap="round" />
          <path d="M26 58 L54 54" stroke={s.patternColor} strokeWidth="5" strokeLinecap="round" />
          <path d="M24 70 L52 66" stroke={s.patternColor} strokeWidth="5" strokeLinecap="round" />
        </>
      )}
      {s.pattern === "zigzag" && (
        <path d="M24 34 L32 42 L40 34 L48 42 L54 36 M22 48 L30 56 L38 48 L46 56 L54 50 M24 62 L32 70 L40 62 L48 70 L54 64" fill="none" stroke={s.patternColor} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function Level87({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[] | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tap = useCallback(
    (id: number) => {
      if (solved || matched) return;
      const sock = SOCKS[id];
      if (selected.includes(id)) {
        setSelected((s) => s.filter((x) => x !== id));
        sfx.click();
        return;
      }
      if (selected.length === 0) {
        setSelected([id]);
        sfx.tick();
        return;
      }
      const first = SOCKS[selected[0]];
      if (first.pattern === sock.pattern) {
        /* correct pair */
        setMatched([first.id, id]);
        setSelected([]);
        sfx.chime();
        timers.current.push(setTimeout(() => sfx.sparkle(), 250));
        timers.current.push(setTimeout(() => sfx.cheer(), 600));
        onProgress(1);
        timers.current.push(setTimeout(onSolved, 1600));
      } else {
        /* wrong pairing */
        sfx.fail();
        setWrong(id);
        setSelected([]);
        timers.current.push(setTimeout(() => setWrong(null), 550));
        onMistake({
          fa: "رنگشان یکی است ولی طرح‌ها فرق دارند؛ طرح یکسان انتخاب کن!",
          en: "Same color but different patterns; match the pattern!",
        });
      }
    },
    [solved, matched, selected, onMistake, onProgress, onSolved]
  );

  const slotPos = [
    { left: "5%", top: "8%" },
    { left: "30%", top: "4%" },
    { left: "55%", top: "8%" },
    { left: "80%", top: "4%" },
  ];

  return (
    <Scene bg="linear-gradient(180deg,#E9F5F7 0%,#DFF0F2 55%,#D5E7EA 64%,#E3CFA4 66%,#D9BE8F 100%)">
      {/* laundry line */}
      <div className="absolute left-[4%] top-[30%] w-[92%]" aria-hidden>
        <svg viewBox="0 0 400 20">
          <path d="M6 8 Q200 16 394 8" fill="none" stroke="#3B2E5A" strokeWidth="4.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* socks hanging with clips */}
      {SOCKS.map((s, i) => {
        const isMatched = matched?.includes(s.id) ?? false;
        const isSel = selected.includes(s.id);
        return (
          <div key={s.id} className="absolute w-[16%]" style={{ ...slotPos[i], transform: isMatched ? "scale(1.12)" : undefined }}>
            {/* peg */}
            <div className="mx-auto h-3.5 w-3.5 rounded-[3px] border-2 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
            <Pulse active={hintPulse > 0 && !matched && !isSel}>
              <button
                type="button"
                onClick={() => tap(s.id)}
                aria-label={lang === "fa" ? `جوراب ${i + 1}` : `sock ${i + 1}`}
                className="block w-full cursor-pointer transition-transform active:scale-95"
                style={{
                  animation: wrong === s.id ? "shake-hard 0.5s ease" : undefined,
                  outline: isSel || isMatched ? "4px solid #FFD154" : undefined,
                  borderRadius: 14,
                  filter: isMatched ? "drop-shadow(0 0 12px rgba(255,209,84,0.9))" : undefined,
                }}
              >
                <SockSvg s={s} selected={isSel || isMatched} />
              </button>
            </Pulse>
          </div>
        );
      })}

      {/* matched hearts */}
      {matched && (
        <>
          {[
            { l: "26%", t: "56%" },
            { l: "62%", t: "58%" },
          ].map((p, i) => (
            <div key={i} className="pointer-events-none absolute" style={{ left: p.l, top: p.t, animation: `float-up 1.5s ${i * 0.25}s ease-out infinite` }} aria-hidden>
              <svg viewBox="0 0 24 24" className="w-7">
                <path d="M12 21 Q3 14 3 8 Q3 3 8 3 Q11 3 12 6 Q13 3 16 3 Q21 3 21 8 Q21 14 12 21 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2" />
              </svg>
            </div>
          ))}
        </>
      )}

      {/* basket */}
      <div className="absolute bottom-[4%] left-1/2 w-[30%] -translate-x-1/2" aria-hidden>
        <svg viewBox="0 0 120 60">
          <path d="M14 14 L106 14 L98 54 Q60 60 22 54 Z" fill="#FFB84D" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
          <path d="M14 14 Q60 -6 106 14" fill="none" stroke="#3B2E5A" strokeWidth="4" />
          <path d="M28 26 L92 26 M32 38 L88 38" stroke="#E89B2E" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    </Scene>
  );
}
