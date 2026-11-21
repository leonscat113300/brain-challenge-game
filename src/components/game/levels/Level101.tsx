"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 101 — Help the rabbit escape the fox: drag the carrot to the  */
/* far side of the screen so the fox chases it and the rabbit runs.    */
/* ------------------------------------------------------------------ */

function RabbitSvg({ scared, hopping }: { scared: boolean; hopping: boolean }) {
  return (
    <svg viewBox="0 0 110 120" className="h-auto w-full" aria-hidden style={hopping ? { animation: "bob 0.55s ease-in-out infinite" } : undefined}>
      {/* ears */}
      <ellipse cx="40" cy="18" rx="9" ry="20" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" transform="rotate(-12 40 18)" />
      <ellipse cx="62" cy="16" rx="9" ry="20" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" transform="rotate(10 62 16)" />
      <ellipse cx="40" cy="18" rx="4" ry="12" fill="#FF6B81" transform="rotate(-12 40 18)" />
      <ellipse cx="62" cy="16" rx="4" ry="12" fill="#FF6B81" transform="rotate(10 62 16)" />
      {/* head + body */}
      <circle cx="52" cy="48" r="24" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      <ellipse cx="58" cy="88" rx="30" ry="22" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* face */}
      {scared ? (
        <>
          <circle cx="43" cy="46" r="6" fill="#3B2E5A" />
          <circle cx="62" cy="46" r="6" fill="#3B2E5A" />
          <circle cx="44.6" cy="44.2" r="1.9" fill="#FAFAFA" />
          <circle cx="63.6" cy="44.2" r="1.9" fill="#FAFAFA" />
          <ellipse cx="52" cy="62" rx="5" ry="7" fill="#3B2E5A" />
        </>
      ) : (
        <>
          <path d="M38 46 Q43 41 48 46 M57 46 Q62 41 67 46" fill="none" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M47 58 Q52 63 57 58" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {/* tail */}
      <circle cx="88" cy="84" r="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.4" />
    </svg>
  );
}

function FoxSvg({ chasing }: { chasing: boolean }) {
  return (
    <svg viewBox="0 0 130 110" className="h-auto w-full" aria-hidden style={chasing ? { animation: "bob 0.4s ease-in-out infinite" } : undefined}>
      {/* tail */}
      <path d="M100 84 Q124 80 122 58 Q120 44 106 48" fill="#FF8C42" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M112 62 Q118 66 114 76" fill="none" stroke="#FAFAFA" strokeWidth="6" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="66" cy="86" rx="36" ry="20" fill="#FF8C42" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* head */}
      <circle cx="40" cy="50" r="24" fill="#FF8C42" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* snout */}
      <path d="M22 56 L4 62 L24 68 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.4" strokeLinejoin="round" />
      <circle cx="7" cy="61" r="3" fill="#3B2E5A" />
      {/* ears */}
      <path d="M28 32 L22 10 L42 22 Z" fill="#FF8C42" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M52 30 L58 8 L62 28 Z" fill="#FF8C42" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      {/* face */}
      <circle cx="36" cy="48" r="4.6" fill="#3B2E5A" />
      <circle cx="52" cy="48" r="4.6" fill="#3B2E5A" />
      <circle cx="37.4" cy="46.6" r="1.5" fill="#FAFAFA" />
      <circle cx="53.4" cy="46.6" r="1.5" fill="#FAFAFA" />
    </svg>
  );
}

function CarrotSvg() {
  return (
    <svg viewBox="0 0 70 110" className="h-auto w-full" aria-hidden>
      {/* leaves */}
      <path d="M35 26 Q20 8 12 22 Q24 26 32 30" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M35 26 Q50 6 60 18 Q48 26 40 30" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M35 24 L35 8" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      <path d="M35 24 L35 8" stroke="#4CAF50" strokeWidth="2.6" strokeLinecap="round" />
      {/* body */}
      <path d="M22 30 Q35 20 48 30 Q52 52 38 92 Q35 102 32 92 Q18 52 22 30 Z" fill="#FF8C42" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M28 46 H42 M30 60 H40 M32 74 H38" stroke="#E89B2E" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Level101({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [foxChasing, setFoxChasing] = useState(false);
  const [rabbitFree, setRabbitFree] = useState(false);
  const carrotRef = useRef<HTMLDivElement>(null);
  const farZoneRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const animalEscape = useCallback(() => {
    sfx.sparkle();
    onProgress(1);
  }, [onProgress]);

  const carrotDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || foxChasing) return;
        if (!d.everMoved) {
          sfx.click();
          api.reset();
          return;
        }
        if (overElement(carrotRef, farZoneRef, 16)) {
          api.reset();
          setFoxChasing(true);
          sfx.whoosh();
          onProgress(0.7);
          timers.current.push(
            setTimeout(() => {
              setRabbitFree(true);
              animalEscape();
              timers.current.push(setTimeout(() => sfx.cheer(), 1100));
              timers.current.push(setTimeout(onSolved, 2200));
            }, 1200)
          );
          return;
        }
        api.reset();
        sfx.fail();
        onMistake({
          fa: "هویج را تا آن طرفِ صفحه ببر تا روباه کامل منحرف شود!",
          en: "Drag the carrot all the way to the far side to fool the fox!",
        });
      },
      [solved, foxChasing, animalEscape, onMistake, onProgress, onSolved]
    )
  );

  const tapRabbit = useCallback(() => {
    if (solved || rabbitFree) return;
    onMistake({
      fa: "خرگوش می‌لرزد! با هویج حواس روباه را پرت کن.",
      en: "The rabbit is trembling! Distract the fox with the carrot.",
    });
  }, [solved, rabbitFree, onMistake]);

  const tapFox = useCallback(() => {
    if (solved || foxChasing) return;
    onMistake({
      fa: "روباه دارد به خرگوش نگاه می‌کند! هویج را به آن‌سو بکش.",
      en: "The fox is watching the rabbit! Drag the carrot away.",
    });
  }, [solved, foxChasing, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#CDEFF7 0%,#DFF6E9 46%,#A8DF9C 48%,#7EC973 72%,#67B25C 100%)">
      {/* sun + clouds */}
      <div className="pointer-events-none absolute left-[8%] top-[6%] w-[16%]" aria-hidden>
        <svg viewBox="0 0 60 60" style={{ animation: "spin 10s linear infinite" }}>
          <circle cx="30" cy="30" r="14" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.4" />
          <path d="M30 4 V12 M30 48 V56 M4 30 H12 M48 30 H56" stroke="#FFD154" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      <div className="pointer-events-none absolute left-[52%] top-[10%] w-[26%]" aria-hidden>
        <svg viewBox="0 0 90 40">
          <ellipse cx="45" cy="24" rx="34" ry="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>

      {/* rabbit burrow */}
      <div className="absolute bottom-[10%] left-[6%] w-[30%]">
        <div className="relative">
          {/* burrow mound */}
          <div className="absolute bottom-0 left-0 w-full" aria-hidden>
            <svg viewBox="0 0 140 70">
              <path d="M0 66 Q30 6 70 10 Q112 14 138 66 Z" fill="#8a5a2b" stroke="#3B2E5A" strokeWidth="4.5" />
              <ellipse cx="66" cy="62" rx="30" ry="18" fill="#33205E" />
              <path d="M36 62 Q66 40 96 62" fill="none" stroke="#3B2E5A" strokeWidth="4" />
            </svg>
          </div>
          {/* rabbit */}
          <div
            className="relative w-[62%] translate-x-[10%]"
            style={{
              transition: "transform 1.4s cubic-bezier(0.4,0,0.6,1), opacity 1.2s",
              transform: rabbitFree ? "translate(-160%, -6%)" : "translate(10%, 0)",
              opacity: rabbitFree ? 0 : 1,
            }}
          >
            <button type="button" onClick={tapRabbit} aria-label={lang === "fa" ? "خرگوش" : "rabbit"} className="block w-full cursor-pointer">
              <Pulse active={hintPulse > 0 && !foxChasing}>
                <RabbitSvg scared={!rabbitFree} hopping={rabbitFree} />
              </Pulse>
            </button>
          </div>
          {/* freed rabbit hops on the grass */}
          {rabbitFree && (
            <div className="absolute -left-[70%] bottom-2 w-[80%]" style={{ animation: "pop-in 0.5s ease-out both" }} aria-hidden>
              <RabbitSvg scared={false} hopping />
            </div>
          )}
        </div>
      </div>

      {/* fox */}
      <div
        className="absolute bottom-[16%] right-[10%] w-[30%]"
        style={{
          transition: "transform 1.6s cubic-bezier(0.5,0,0.4,1), opacity 1.4s",
          transform: foxChasing ? "translateX(190%) scaleX(-1)" : "scaleX(-1)",
          opacity: foxChasing ? 0 : 1,
        }}
      >
        <button type="button" onClick={tapFox} aria-label={lang === "fa" ? "روباه" : "fox"} className="block w-full cursor-pointer">
          <FoxSvg chasing={foxChasing} />
        </button>
      </div>

      {/* carrot (drag) */}
      {!foxChasing && (
        <div className="absolute bottom-[20%] left-[44%] w-[15%]">
          <div
            ref={carrotRef}
            {...carrotDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "هویج" : "carrot"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${carrotDrag.x}px, ${carrotDrag.y}px)`,
              transition: carrotDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && !foxChasing}>
              <CarrotSvg />
            </Pulse>
          </div>
        </div>
      )}

      {/* far-side drop zone */}
      <div ref={farZoneRef} className="absolute bottom-[6%] right-[0%] h-[36%] w-[16%] rounded-l-3xl border-[3px] border-dashed border-[#e0e9c0] bg-[#FFF6E0]/40" aria-hidden />

      {/* carrot flying off with the fox */}
      {foxChasing && (
        <div
          className="pointer-events-none absolute bottom-[24%] right-[10%] w-[12%]"
          style={{ transition: "transform 1.6s cubic-bezier(0.5,0,0.4,1), opacity 1.4s", transform: "translateX(210%) scaleX(-1)", opacity: 0 }}
          aria-hidden
        >
          <CarrotSvg />
        </div>
      )}

      {/* happy hearts */}
      {rabbitFree &&
        [
          { l: "18%", t: "34%" },
          { l: "30%", t: "28%" },
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
