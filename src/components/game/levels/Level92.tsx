"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import { animalSfx } from "@/lib/game/audio";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 92 — The cat's food is finished: open the can (tap), then     */
/* drag it over the bowl to pour. The cat runs to eat.                 */
/* ------------------------------------------------------------------ */

function CatSvg({ eating }: { eating: boolean }) {
  return (
    <svg viewBox="0 0 130 120" className="h-auto w-full" aria-hidden>
      {/* tail */}
      <path d="M96 92 Q118 88 116 66 Q114 52 102 54" fill="none" stroke="#3B2E5A" strokeWidth="8" strokeLinecap="round" />
      <path d="M96 92 Q118 88 116 66 Q114 52 102 54" fill="none" stroke="#FFB84D" strokeWidth="4.4" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="72" cy="90" rx="34" ry="24" fill="#FFB84D" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* stripes */}
      <path d="M58 74 Q60 84 58 92 M74 70 Q76 82 74 92 M90 76 Q92 86 90 92" stroke="#E89B2E" strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* head */}
      <circle cx="44" cy="52" r="24" fill="#FFB84D" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* ears */}
      <path d="M28 34 L24 14 L44 26 Z" fill="#FFB84D" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M60 34 L64 14 L44 26 Z" fill="#FFB84D" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M30 30 L28 20 L38 27 Z" fill="#FF6B81" />
      <path d="M58 30 L60 20 L50 27 Z" fill="#FF6B81" />
      {/* face */}
      <circle cx="36" cy="50" r="4.6" fill="#3B2E5A" />
      <circle cx="54" cy="50" r="4.6" fill="#3B2E5A" />
      <circle cx="37.4" cy="48.6" r="1.5" fill="#FAFAFA" />
      <circle cx="55.4" cy="48.6" r="1.5" fill="#FAFAFA" />
      <path d="M45 58 L43 62 L47 62 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="1.6" />
      {eating ? (
        <path d="M38 68 Q44 74 50 68" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
      ) : (
        <circle cx="45" cy="66" r="3.4" fill="#3B2E5A" />
      )}
      {/* whiskers */}
      <path d="M22 56 L10 52 M22 62 L10 64 M68 56 L80 52 M68 62 L80 64" stroke="#3B2E5A" strokeWidth="2.4" strokeLinecap="round" />
      {/* hungry tummy rumble */}
      {!eating && (
        <path d="M70 98 Q76 94 70 90" stroke="#8FA6BD" strokeWidth="3" fill="none" strokeLinecap="round" style={{ animation: "breathe 1.4s ease-in-out infinite" }} />
      )}
    </svg>
  );
}

function CanSvg({ open, pouring }: { open: boolean; pouring: boolean }) {
  return (
    <svg viewBox="0 0 90 110" className="h-auto w-full" aria-hidden>
      <g style={pouring ? { transform: "rotate(-38deg)", transformOrigin: "45px 90px", transition: "transform 0.5s ease" } : undefined}>
        {/* body */}
        <rect x="20" y="26" width="50" height="72" rx="8" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4.5" />
        {/* label */}
        <rect x="26" y="46" width="38" height="28" rx="6" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.6" />
        <circle cx="45" cy="60" r="8" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.4" />
        <path d="M39 58 Q45 52 51 58" fill="none" stroke="#3B2E5A" strokeWidth="2" />
        {/* lid */}
        {open ? (
          <g>
            <ellipse cx="45" cy="28" rx="25" ry="8" fill="#33205E" stroke="#3B2E5A" strokeWidth="3.4" />
            <ellipse cx="45" cy="26" rx="21" ry="6" fill="#171034" />
            {/* food inside */}
            <ellipse cx="45" cy="27" rx="16" ry="4.6" fill="#C98A4B" />
          </g>
        ) : (
          <g>
            <ellipse cx="45" cy="28" rx="25" ry="8" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="3.6" />
            {/* pull tab */}
            <circle cx="45" cy="28" r="4.6" fill="#EDE9F4" stroke="#3B2E5A" strokeWidth="2.4" />
            <path d="M45 28 Q58 24 62 30" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
      </g>
      {/* pour stream */}
      {pouring && (
        <>
          <circle cx="14" cy="66" r="4" fill="#C98A4B" style={{ animation: "drop-fall 0.5s linear infinite" }} />
          <circle cx="20" cy="84" r="3.4" fill="#A96F35" style={{ animation: "drop-fall 0.6s 0.15s linear infinite" }} />
        </>
      )}
    </svg>
  );
}

function BowlSvg({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 130 70" className="h-auto w-full" aria-hidden>
      {/* bowl */}
      <path d="M20 32 L110 32 Q112 58 65 62 Q18 58 20 32 Z" fill={filled ? "#FF6B81" : "#FF8FA0"} stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <ellipse cx="65" cy="32" rx="45" ry="10" fill={filled ? "#FFD1DC" : "#FFB3BE"} stroke="#3B2E5A" strokeWidth="3.4" />
      {/* kibble mound sits on top of the rim */}
      {filled && (
        <>
          <ellipse cx="65" cy="30" rx="34" ry="8" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="2.6" />
          <circle cx="52" cy="27" r="3.4" fill="#A96F35" stroke="#3B2E5A" strokeWidth="1.6" />
          <circle cx="66" cy="25" r="3.6" fill="#A96F35" stroke="#3B2E5A" strokeWidth="1.6" />
          <circle cx="78" cy="28" r="3.2" fill="#A96F35" stroke="#3B2E5A" strokeWidth="1.6" />
        </>
      )}
    </svg>
  );
}

export default function Level92({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [opened, setOpened] = useState(false);
  const [pouring, setPouring] = useState(false);
  const [filled, setFilled] = useState(false);
  const [eating, setEating] = useState(false);
  const openedRef = useRef(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const canRef = useRef<HTMLDivElement>(null);
  const bowlRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapCan = useCallback(() => {
    if (solved || opened) return;
    openedRef.current = true;
    setOpened(true);
    sfx.pop();
    timers.current.push(setTimeout(() => sfx.sparkle(), 200));
    onProgress(0.5);
  }, [solved, opened, onProgress]);

  const canDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || filled || eating) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(canRef, bowlRef, 14)) {
          if (!openedRef.current) {
            api.reset();
            sfx.fail();
            onMistake({
              fa: "اول قوطی را با زدن روی درپوش باز کن!",
              en: "First open the can by tapping its lid!",
            });
            return;
          }
          api.reset();
          setPouring(true);
          sfx.whoosh();
          timers.current.push(
            setTimeout(() => {
              setPouring(false);
              setFilled(true);
              sfx.pop();
              onProgress(1);
              timers.current.push(setTimeout(() => animalSfx.cat(), 250));
              timers.current.push(setTimeout(() => setEating(true), 900));
              timers.current.push(setTimeout(() => sfx.cheer(), 1500));
              timers.current.push(setTimeout(onSolved, 2400));
            }, 1200)
          );
          return;
        }
        api.reset();
      },
      [solved, filled, eating, onMistake, onProgress, onSolved]
    )
  );

  const tapBowl = useCallback(() => {
    if (solved || filled) return;
    animalSfx.cat();
    onMistake({
      fa: "گربه گرسنه است! اول غذایش را آماده کن.",
      en: "The cat is hungry! Prepare his food first.",
    });
  }, [solved, filled, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#FFF3E4 0%,#FAE7CF 55%,#F0DCC0 64%,#E3CFA4 66%,#D9BE8F 100%)">
      {/* cat bowl on the floor */}
      <div ref={bowlRef} className="absolute bottom-[8%] left-[16%] w-[26%]">
        <button
          type="button"
          onClick={tapBowl}
          aria-label={lang === "fa" ? "ظرف غذای گربه" : "cat bowl"}
          className="block w-full cursor-pointer transition-transform active:scale-95"
        >
          <Pulse active={hintPulse > 0 && opened && !filled}>
            <BowlSvg filled={filled} />
          </Pulse>
        </button>
      </div>

      {/* cat */}
      <div
        className="absolute bottom-[16%] right-[10%] w-[30%]"
        style={{ transition: "right 1s cubic-bezier(0.5,0,0.3,1), bottom 0.6s" }}
      >
        <div style={{ transformOrigin: "bottom center", animation: eating ? "breathe 1s ease-in-out infinite" : "wobble 2.6s ease-in-out infinite" }}>
          <Pulse active={hintPulse > 0 && !filled}>
            <CatSvg eating={eating} />
          </Pulse>
        </div>
      </div>

      {/* can on the shelf */}
      <div className="absolute bottom-[52%] right-[36%] w-[15%]">
        <button
          type="button"
          onClick={tapCan}
          aria-label={lang === "fa" ? "قوطی غذای گربه" : "cat food can"}
          className="block w-full cursor-pointer transition-transform active:scale-95"
        >
          <CanSvg open={opened} pouring={pouring} />
        </button>
        {/* shelf under the can */}
        <div className="mx-auto mt-1 h-3 w-[130%] -translate-x-[11%] rounded-xl border-4 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
      </div>

      {/* draggable ghost of the can (appears after opening) */}
      {opened && !filled && !pouring && (
        <div className="absolute bottom-[30%] right-[38%] w-[13%]">
          <div
            ref={canRef}
            {...canDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "قوطی باز" : "opened can"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${canDrag.x}px, ${canDrag.y}px)`,
              transition: canDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <CanSvg open pouring={false} />
          </div>
        </div>
      )}

      {/* pour target highlight */}
      {pouring && (
        <div className="pointer-events-none absolute bottom-[12%] left-[20%] w-[8%]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 16 20" className="absolute w-full" style={{ left: i * 12, animation: `drop-fall 0.6s ${i * 0.15}s linear infinite` }}>
              <path d="M8 2 Q13 9 8 16 Q3 9 8 2 Z" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="1.6" />
            </svg>
          ))}
        </div>
      )}

      {/* hearts when eating */}
      {eating && (
        <>
          {[
            { l: "64%", t: "42%" },
            { l: "74%", t: "36%" },
          ].map((p, i) => (
            <div key={i} className="pointer-events-none absolute" style={{ left: p.l, top: p.t, animation: `float-up 1.4s ${i * 0.2}s ease-out infinite` }} aria-hidden>
              <svg viewBox="0 0 24 24" className="w-6">
                <path d="M12 21 Q3 14 3 8 Q3 3 8 3 Q11 3 12 6 Q13 3 16 3 Q21 3 21 8 Q21 14 12 21 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2" />
              </svg>
            </div>
          ))}
        </>
      )}
    </Scene>
  );
}
