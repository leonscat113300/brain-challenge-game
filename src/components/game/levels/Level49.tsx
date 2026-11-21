"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";
import { num } from "@/lib/game/utils";

/* ------------------------------------------------------------------ */
/* Level 49 — Lights out (3x3): tapping a lamp toggles it plus its     */
/* orthogonal neighbours. Board starts from 3 random presses, so it    */
/* is always solvable. Turn every lamp off to win.                     */
/* ------------------------------------------------------------------ */

function randomBoard(): boolean[] {
  let b: boolean[] = [];
  let lit = 0;
  do {
    b = new Array<boolean>(9).fill(false);
    const picks: number[] = [];
    while (picks.length < 3) {
      const i = Math.floor(Math.random() * 9);
      if (!picks.includes(i)) picks.push(i);
    }
    for (const p of picks) {
      b[p] = !b[p];
      if (p % 3 > 0) b[p - 1] = !b[p - 1];
      if (p % 3 < 2) b[p + 1] = !b[p + 1];
      if (p >= 3) b[p - 3] = !b[p - 3];
      if (p < 6) b[p + 3] = !b[p + 3];
    }
    lit = b.filter(Boolean).length;
  } while (lit === 0);
  return b;
}

function LampSvg({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 64 66" className="h-auto w-[76%]" aria-hidden>
      <rect x="23" y="50" width="18" height="10" rx="4" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="3.5" />
      <circle cx="32" cy="30" r="21" fill={on ? "#FFD154" : "#E4E1EE"} stroke="#3B2E5A" strokeWidth="4.5" />
      {on ? (
        <>
          <circle cx="24" cy="26" r="4.5" fill="#3B2E5A" />
          <circle cx="40" cy="26" r="4.5" fill="#3B2E5A" />
          <circle cx="25.5" cy="24.5" r="1.5" fill="#fff" />
          <circle cx="41.5" cy="24.5" r="1.5" fill="#fff" />
          <path d="M25 35 Q32 41 39 35" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="17" cy="33" rx="3.5" ry="2.2" fill="#FF9FB2" />
          <ellipse cx="47" cy="33" rx="3.5" ry="2.2" fill="#FF9FB2" />
        </>
      ) : (
        <>
          <path d="M20 26 Q24 30 28 26" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M36 26 Q40 30 44 26" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M29 37 Q32 39 35 37" stroke="#3B2E5A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <ellipse cx="17" cy="33" rx="3" ry="2" fill="#FF9FB2" opacity="0.5" />
          <ellipse cx="47" cy="33" rx="3" ry="2" fill="#FF9FB2" opacity="0.5" />
        </>
      )}
    </svg>
  );
}

function LampButton({
  on,
  label,
  disabled,
  onTap,
  index,
}: {
  on: boolean;
  label: string;
  disabled: boolean;
  onTap: () => void;
  index: number;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      disabled={disabled}
      onClick={onTap}
      className="relative grid aspect-square w-full place-items-center rounded-full border-4 border-[#3B2E5A]"
      style={{
        minWidth: 44,
        minHeight: 44,
        background: on ? "#FFD154" : "#E4E1EE",
        boxShadow: "inset 0 -4px 0 rgba(59,46,90,0.18)",
        transition: "background 0.25s ease",
        animation: "pop-in 0.4s both",
        animationDelay: `${index * 0.06}s`,
      }}
    >
      {on && (
        <span
          className="pointer-events-none absolute -inset-2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(255,209,84,0.55) 0%, transparent 70%)", animation: "glow 1.7s ease-in-out infinite" }}
          aria-hidden
        />
      )}
      <LampSvg on={on} />
    </button>
  );
}

export default function Level49({ lang, solved, onSolved, onProgress, hintPulse }: LevelProps) {
  const [board, setBoard] = useState<boolean[]>(() => randomBoard());
  const [lit0] = useState(() => Math.max(1, board.filter(Boolean).length));
  const [done, setDone] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const press = useCallback(
    (i: number) => {
      if (solved || done) return;
      const nb = [...board];
      nb[i] = !nb[i];
      if (i % 3 > 0) nb[i - 1] = !nb[i - 1];
      if (i % 3 < 2) nb[i + 1] = !nb[i + 1];
      if (i >= 3) nb[i - 3] = !nb[i - 3];
      if (i < 6) nb[i + 3] = !nb[i + 3];
      setBoard(nb);
      sfx.pop();
      const lit = nb.filter(Boolean).length;
      if (lit === 0) {
        setDone(true);
        sfx.chime();
        onProgress(1);
        timers.current.push(setTimeout(onSolved, 750));
      } else {
        onProgress(Math.max(0, 1 - lit / lit0));
      }
    },
    [board, solved, done, lit0, onProgress, onSolved]
  );

  return (
    <Scene bg="linear-gradient(180deg,#EFE9F8 0%,#E3DBF2 100%)">
      {/* night wall dots */}
      {[
        { l: 12, t: 16 },
        { l: 82, t: 12 },
        { l: 90, t: 30 },
        { l: 20, t: 34 },
        { l: 8, t: 62 },
        { l: 92, t: 58 },
      ].map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#FFD154]"
          style={{ left: `${p.l}%`, top: `${p.t}%`, width: 6, height: 6, opacity: 0.65, animation: `breathe ${2 + i * 0.3}s ease-in-out infinite` }}
          aria-hidden
        />
      ))}

      {/* crescent moon */}
      <div className="absolute start-[6%] top-[5%] w-10" aria-hidden>
        <svg viewBox="0 0 40 40" className="h-auto w-full">
          <path d="M26 4 A16 16 0 1 0 36 26 A13 13 0 1 1 26 4 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
        </svg>
      </div>

      {/* wooden lamp panel */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: "min(86%, 340px)" }}>
        {done && (
          <div className="pointer-events-none absolute inset-x-0 -top-[15%] z-10 flex justify-center gap-[20%]" aria-hidden>
            {[0, 1, 2].map((i) => (
              <svg key={i} viewBox="0 0 24 24" className="h-9 w-9" style={{ animation: `star-pop 0.55s ${i * 0.13}s both` }}>
                <path
                  d="M12 2 L14.8 8.6 L22 9.3 L16.6 13.9 L18.3 20.8 L12 17 L5.7 20.8 L7.4 13.9 L2 9.3 L9.2 8.6 Z"
                  fill="#FFD154"
                  stroke="#3B2E5A"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            ))}
          </div>
        )}
        <div
          className="relative rounded-3xl border-4 border-[#3B2E5A] p-[4%]"
          style={{ background: "linear-gradient(180deg,#8B5E3C,#6E4526)", boxShadow: "0 8px 0 rgba(59,46,90,0.22)" }}
        >
          {[["left-2 top-2"], ["right-2 top-2"], ["left-2 bottom-2"], ["right-2 bottom-2"]].map(([pos], i) => (
            <span key={i} className={`absolute ${pos} h-2 w-2 rounded-full bg-[#3B2E5A]`} aria-hidden />
          ))}
          <div className="relative rounded-2xl border-[3px] border-[#3B2E5A] bg-[#FAFAFA] p-[6%]">
            {/* decorative circuit wires behind the lamps */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-25" aria-hidden>
              <path d="M17 17 H83 M17 50 H83 M17 83 H83 M17 17 V83 M50 17 V83 M83 17 V83" stroke="#6C4AB6" strokeWidth="2" fill="none" />
              {[
                [17, 17],
                [83, 17],
                [17, 83],
                [83, 83],
                [50, 50],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="2.4" fill="#6C4AB6" />
              ))}
            </svg>
            <div className="relative grid grid-cols-3 gap-[6%]">
              {board.map((on, i) => (
                <div key={i} className="relative">
                  {i === 4 ? (
                    <Pulse active={hintPulse > 0 && !done} className="rounded-full">
                      <LampButton
                        on={on}
                        index={i}
                        label={lang === "fa" ? `چراغ ${num(i + 1, lang)}` : `lamp ${i + 1}`}
                        disabled={solved || done}
                        onTap={() => press(i)}
                      />
                    </Pulse>
                  ) : (
                    <LampButton
                      on={on}
                      index={i}
                      label={lang === "fa" ? `چراغ ${num(i + 1, lang)}` : `lamp ${i + 1}`}
                      disabled={solved || done}
                      onTap={() => press(i)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Scene>
  );
}
