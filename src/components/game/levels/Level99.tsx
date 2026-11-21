"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 99 — Which container leaks? Pour water into A, B and C with   */
/* the jug, watch the levels, then tap the leaky one (it drains).      */
/* ------------------------------------------------------------------ */

const LEAKY = 1; // index of the leaky container (B)

function ContainerSvg({
  letter,
  filled,
  level,
  leaky,
  found,
}: {
  letter: string;
  filled: boolean;
  level: number; // 0..1 water height fraction
  leaky: boolean;
  found: boolean;
}) {
  const top = 96 - level * 62; // y of water surface inside cup (cup inner y 34..96)
  return (
    <svg viewBox="0 0 120 150" className="h-auto w-full" aria-hidden>
      {/* cup body */}
      <path d="M22 30 L28 124 Q60 134 92 124 L98 30 Z" fill={found ? "#DFF3E1" : "#FAFAFA"} stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* water */}
      {filled && (
        <path d={`M26 ${top} L31 121 Q60 130 89 121 L94 ${top} Z`} fill={leaky && level < 0.9 ? "#1EC8CF" : "#5FD4DD"} stroke="#3B2E5A" strokeWidth="2.6" strokeLinejoin="round" style={{ transition: "d 0.9s ease" }} />
      )}
      {/* crack reveal */}
      {found && (
        <path d="M74 52 L66 66 L76 78 L68 92 L74 104" fill="none" stroke="#FF6B81" strokeWidth="4" strokeLinecap="round" />
      )}
      {/* letter tag */}
      <circle cx="60" cy="20" r="16" fill={found ? "#4CAF50" : "#FFD154"} stroke="#3B2E5A" strokeWidth="3.4" />
      <text x="60" y="27" textAnchor="middle" fontSize="19" fontWeight="800" fill="#3B2E5A">
        {letter}
      </text>
      {/* drips */}
      {leaky && filled && level > 0.05 && !found && (
        <>
          <circle cx="74" cy="126" r="4" fill="#1EC8CF" style={{ animation: "drop-fall 0.7s linear infinite" }} />
          <circle cx="72" cy="126" r="3" fill="#5FD4DD" style={{ animation: "drop-fall 0.85s 0.25s linear infinite" }} />
        </>
      )}
    </svg>
  );
}

function JugSvg() {
  return (
    <svg viewBox="0 0 130 140" className="h-auto w-full" aria-hidden>
      {/* handle */}
      <path d="M96 52 Q124 56 122 84 Q120 108 94 106" fill="none" stroke="#3B2E5A" strokeWidth="9" strokeLinecap="round" />
      <path d="M96 52 Q124 56 122 84 Q120 108 94 106" fill="none" stroke="#1EC8CF" strokeWidth="4.4" strokeLinecap="round" />
      {/* body */}
      <path d="M30 30 L26 108 Q62 122 98 108 L94 30 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* spout */}
      <path d="M30 30 L14 18 L32 14" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* water inside */}
      <path d="M34 66 L37 106 Q62 116 87 106 L90 66 Q62 76 34 66 Z" fill="#7FDCE4" />
      {/* face */}
      <circle cx="52" cy="52" r="5" fill="#3B2E5A" />
      <circle cx="72" cy="52" r="5" fill="#3B2E5A" />
      <circle cx="53.6" cy="50.4" r="1.7" fill="#FAFAFA" />
      <circle cx="73.6" cy="50.4" r="1.7" fill="#FAFAFA" />
      <path d="M54 64 Q62 70 70 64" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Level99({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [filled, setFilled] = useState([false, false, false]);
  const [level, setLevel] = useState(1); // water level of leaky container 0..1
  const [poured, setPoured] = useState<number | null>(null); // currently pouring target
  const [found, setFound] = useState(false);
  const jugRef = useRef<HTMLDivElement>(null);
  const cupRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* drain the leaky cup once all three are filled */
  useEffect(() => {
    if (filled.every(Boolean) && !found) {
      const iv = setInterval(() => {
        setLevel((l) => Math.max(0.08, l - 0.05));
      }, 220);
      return () => clearInterval(iv);
    }
  }, [filled, found]);

  const jugDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || poured !== null) return;
        if (!d.everMoved) {
          sfx.click();
          api.reset();
          return;
        }
        for (let i = 0; i < 3; i++) {
          if (overElement(jugRef, cupRefs[i], 16)) {
            if (filled[i]) {
              api.reset();
              sfx.fail();
              onMistake({
                fa: "این ظرف از قبل پر است؛ بقیه را امتحان کن!",
                en: "That one is already full; try the others!",
              });
              return;
            }
            api.reset();
            setPoured(i);
            sfx.whoosh();
            timers.current.push(
              setTimeout(() => {
                setPoured(null);
                const next = filled.slice();
                next[i] = true;
                setFilled(next);
                sfx.pop();
                onProgress((next.filter(Boolean).length / 3) * 0.8);
                if (next.every(Boolean)) {
                  timers.current.push(
                    setTimeout(() => {
                      sfx.tick();
                    }, 500)
                  );
                }
              }, 800)
            );
            return;
          }
        }
        api.reset();
        sfx.fail();
        onMistake({
          fa: "قوری را روی یکی از ظرف‌ها ببر تا آب بریزد!",
          en: "Bring the jug over one of the containers to pour!",
        });
      },
      [solved, poured, filled, cupRefs, onMistake, onProgress]
    )
  );

  const tapCup = useCallback(
    (i: number) => {
      if (solved) return;
      if (!filled[i]) {
        sfx.fail();
        onMistake({
          fa: "اول با قوری داخلش آب بریز تا بفهمی کدام نشتی دارد!",
          en: "First pour water with the jug to find the leaky one!",
        });
        return;
      }
      if (i !== LEAKY) {
        sfx.fail();
        onMistake({
          fa: "این ظرف سالم است؛ سطح آبش ثابت می‌ماند!",
          en: "This one is fine; its water level stays put!",
        });
        return;
      }
      setFound(true);
      sfx.sparkle();
      onProgress(1);
      timers.current.push(setTimeout(() => sfx.cheer(), 500));
      timers.current.push(setTimeout(onSolved, 1800));
    },
    [solved, filled, onMistake, onProgress, onSolved]
  );

  const letters = ["A", "B", "C"];
  const cupPos = [
    "bottom-[24%] left-[6%] w-[24%]",
    "bottom-[24%] left-1/2 w-[24%] -translate-x-1/2",
    "bottom-[24%] right-[6%] w-[24%]",
  ];

  return (
    <Scene bg="linear-gradient(180deg,#E7FAFB 0%,#D2F1F4 58%,#C3E7EC 62%,#B3DDE4 100%)">
      {/* bench */}
      <div className="absolute bottom-[6%] left-[2%] w-[96%]" aria-hidden>
        <div className="h-8 rounded-2xl border-[5px] border-[#3B2E5A] bg-[#C98A4B]" />
      </div>

      {/* three containers */}
      {letters.map((L, i) => (
        <div key={L} ref={cupRefs[i]} className={`absolute ${cupPos[i]}`}>
          <button
            type="button"
            onClick={() => tapCup(i)}
            aria-label={lang === "fa" ? `ظرف ${L}` : `container ${L}`}
            className="block w-full cursor-pointer transition-transform active:scale-95"
          >
            <Pulse active={hintPulse > 0 && filled.every(Boolean) && !found && i === LEAKY}>
              <ContainerSvg letter={L} filled={filled[i]} level={i === LEAKY && filled[i] ? level : 1} leaky={i === LEAKY} found={found && i === LEAKY} />
            </Pulse>
          </button>
        </div>
      ))}

      {/* pour stream into active cup */}
      {poured !== null && (
        <div className={`pointer-events-none absolute ${cupPos[poured]} z-10 -mb-2 w-[6%]`} style={{ bottom: "44%" }} aria-hidden>
          {[0, 1, 2].map((k) => (
            <svg key={k} viewBox="0 0 16 20" className="absolute w-full" style={{ left: k * 14 - 14, animation: `drop-fall 0.5s ${k * 0.14}s linear infinite` }}>
              <path d="M8 2 Q13 9 8 16 Q3 9 8 2 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="1.6" />
            </svg>
          ))}
        </div>
      )}

      {/* jug (drag to pour) */}
      <div className="absolute bottom-[38%] right-[10%] w-[26%]">
        <div
          ref={jugRef}
          {...jugDrag.bind}
          role="button"
          aria-label={lang === "fa" ? "قوری آب" : "water jug"}
          className="cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate(${jugDrag.x}px, ${jugDrag.y}px) ${poured !== null ? "rotate(-38deg)" : ""}`,
            transition: jugDrag.dragging ? "transform 0.1s" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
            zIndex: 20,
          }}
        >
          <Pulse active={hintPulse > 0 && filled.every((f, i) => !f)}>
            <JugSvg />
          </Pulse>
        </div>
      </div>

      {/* caption */}
      <div className="pointer-events-none absolute left-1/2 top-[4%] w-[86%] -translate-x-1/2 text-center text-sm font-bold text-[#3B2E5A] opacity-75">
        {lang === "fa"
          ? filled.every(Boolean)
            ? "سطح آب‌ها را ببین؛ کدام پایین می‌آید؟"
            : "قوری را روی هر سه ظرف ببر و آب بریز!"
          : filled.every(Boolean)
            ? "Watch the levels; which one goes down?"
            : "Pour water into all three containers!"}
      </div>

      {/* found! badge */}
      {found && (
        <div className="pointer-events-none absolute left-1/2 top-[16%] w-[46%] -translate-x-1/2" style={{ animation: "star-pop 0.6s ease-out both" }} aria-hidden>
          <svg viewBox="0 0 200 70">
            <rect x="4" y="4" width="192" height="62" rx="20" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
            <text x="100" y="44" textAnchor="middle" fontSize="26" fontWeight="800" fill="#3B2E5A">
              {lang === "fa" ? "ظرف B سوراخ است!" : "Container B leaks!"}
            </text>
          </svg>
        </div>
      )}
    </Scene>
  );
}
