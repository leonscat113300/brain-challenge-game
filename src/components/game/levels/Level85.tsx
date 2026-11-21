"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 85 — The plant is thirsty: drag the pitcher and pour water    */
/* onto the SOIL (not the leaves).                                     */
/* ------------------------------------------------------------------ */

function PlantSvg({ happy }: { happy: boolean }) {
  return (
    <svg viewBox="0 0 150 200" className="h-auto w-full" aria-hidden>
      {/* pot */}
      <path d="M40 140 L110 140 L102 190 Q75 196 48 190 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <rect x="34" y="130" width="82" height="16" rx="7" fill="#FF8FA0" stroke="#3B2E5A" strokeWidth="4" />
      {/* soil */}
      <ellipse cx="75" cy="132" rx="36" ry="8" fill="#8C5A2B" stroke="#3B2E5A" strokeWidth="3" />
      {/* stem */}
      <path d="M75 130 Q72 100 75 76" fill="none" stroke="#3B8F42" strokeWidth="6" strokeLinecap="round" />
      {/* leaves */}
      {happy ? (
        <>
          <path d="M75 108 Q40 100 34 66 Q70 62 78 96 Q80 104 75 108 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" />
          <path d="M75 100 Q112 92 118 56 Q80 52 72 88 Q70 96 75 100 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" />
          {/* bloom */}
          <circle cx="75" cy="52" r="7" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="75" cy="36" rx="7" ry="11" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.6" transform={`rotate(${a} 75 52)`} />
          ))}
          <circle cx="75" cy="52" r="7" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
        </>
      ) : (
        <>
          <path d="M75 112 Q46 112 38 88 Q44 74 62 84 Q76 94 75 112 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" />
          <path d="M75 104 Q104 104 112 80 Q106 66 88 76 Q74 86 75 104 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" />
        </>
      )}
      {/* face on pot */}
      {happy ? (
        <>
          <circle cx="62" cy="160" r="4.4" fill="#3B2E5A" />
          <circle cx="88" cy="160" r="4.4" fill="#3B2E5A" />
          <circle cx="63.4" cy="158.6" r="1.4" fill="#FAFAFA" />
          <circle cx="89.4" cy="158.6" r="1.4" fill="#FAFAFA" />
          <path d="M64 170 Q75 178 86 170" fill="none" stroke="#3B2E5A" strokeWidth="3.2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="62" cy="160" r="4.4" fill="#3B2E5A" />
          <circle cx="88" cy="160" r="4.4" fill="#3B2E5A" />
          <circle cx="63.4" cy="158.6" r="1.4" fill="#FAFAFA" />
          <circle cx="89.4" cy="158.6" r="1.4" fill="#FAFAFA" />
          <path d="M64 174 Q75 168 86 174" fill="none" stroke="#3B2E5A" strokeWidth="3.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function PitcherSvg({ pouring }: { pouring: boolean }) {
  return (
    <svg viewBox="0 0 130 120" className="h-auto w-full" aria-hidden>
      <g style={pouring ? { transform: "rotate(-42deg)", transformOrigin: "60px 90px", transition: "transform 0.5s ease" } : undefined}>
        {/* body */}
        <path d="M34 34 L96 34 L92 108 Q65 116 38 108 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
        {/* water window */}
        <path d="M44 58 L86 58 L85 102 Q65 108 45 102 Z" fill="#8FDCE0" stroke="#3B2E5A" strokeWidth="3" />
        {/* spout */}
        <path d="M34 34 L18 22 Q14 30 24 40 L34 44" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
        {/* handle */}
        <path d="M96 44 Q118 52 112 74 Q108 88 92 88" fill="none" stroke="#3B2E5A" strokeWidth="7" strokeLinecap="round" />
        {/* water surface */}
        <path d="M46 62 Q65 54 84 62" fill="none" stroke="#FAFAFA" strokeWidth="4" strokeLinecap="round" />
      </g>
      {/* stream */}
      {pouring && (
        <path d="M20 26 Q14 60 18 108" fill="none" stroke="#1EC8CF" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
      )}
    </svg>
  );
}

/* decoy: an EMPTY watering can — the full pitcher is the real tool */
function EmptyCanSvg() {
  return (
    <svg viewBox="0 0 100 80" className="h-auto w-full" aria-hidden>
      {/* body */}
      <path d="M28 30 L72 30 L68 68 Q50 74 32 68 Z" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* spout */}
      <path d="M28 36 L10 26 Q6 34 14 42 L28 44" fill="#8FA6BD" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* rim */}
      <ellipse cx="50" cy="30" rx="22" ry="6" fill="#A9BDD0" stroke="#3B2E5A" strokeWidth="3.6" />
      {/* handle */}
      <path d="M72 40 Q92 44 88 60" fill="none" stroke="#6C4AB6" strokeWidth="7" strokeLinecap="round" />
      {/* dry window: no water inside */}
      <path d="M38 44 L62 44 L60 62 Q50 66 40 62 Z" fill="#E3CFA4" stroke="#3B2E5A" strokeWidth="3" />
    </svg>
  );
}

/* decoy: a butterfly fluttering around the leaves */
function ButterflySvg() {
  return (
    <svg viewBox="0 0 90 70" className="h-auto w-full" aria-hidden>
      <ellipse cx="30" cy="28" rx="16" ry="20" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.6" transform="rotate(-20 30 28)" />
      <ellipse cx="60" cy="28" rx="16" ry="20" fill="#FF8A3C" stroke="#3B2E5A" strokeWidth="3.6" transform="rotate(20 60 28)" />
      <ellipse cx="45" cy="34" rx="6" ry="18" fill="#3B2E5A" />
      <path d="M42 18 Q38 8 32 6 M48 18 Q52 8 58 6" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="41" cy="22" r="2.4" fill="#FAFAFA" />
      <circle cx="49" cy="22" r="2.4" fill="#FAFAFA" />
    </svg>
  );
}

export default function Level85({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [pouring, setPouring] = useState(false);
  const [happy, setHappy] = useState(false);

  const pitcherRef = useRef<HTMLDivElement>(null);
  const soilRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pitcherDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || pouring || happy) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(pitcherRef, soilRef, 8)) {
          api.reset();
          setPouring(true);
          sfx.whoosh();
          timers.current.push(setTimeout(() => sfx.sparkle(), 600));
          timers.current.push(
            setTimeout(() => {
              setHappy(true);
              setPouring(false);
              sfx.chime();
              onProgress(1);
              timers.current.push(setTimeout(() => sfx.cheer(), 350));
              timers.current.push(setTimeout(onSolved, 1600));
            }, 1300)
          );
          return;
        }
        if (overElement(pitcherRef, leafRef, 8)) {
          api.reset();
          sfx.fail();
          onMistake({
            fa: "روی خاک بریز، نه روی برگ‌ها!",
            en: "Pour onto the soil, not on the leaves!",
          });
          return;
        }
        api.reset();
      },
      [solved, pouring, happy, onMistake, onProgress, onSolved]
    )
  );

  const tapCan = useCallback(() => {
    if (solved || happy) return;
    sfx.boing();
    onMistake({
      fa: "این قوطی خالی است؛ پارچ پر از آب است!",
      en: "That can is empty; the pitcher is full!",
    });
  }, [solved, happy, onMistake]);

  const tapButterfly = useCallback(() => {
    if (solved || happy) return;
    sfx.pop();
    onMistake({
      fa: "پروانه آب نمی‌دهد؛ پارچ را روی خاک ببر!",
      en: "Butterflies don't water plants; bring the pitcher to the soil!",
    });
  }, [solved, happy, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#BFE7F5 0%,#DFF2E1 52%,#F2E3C2 62%,#E3CFA4 64%,#D9BE8F 100%)">
      {/* window behind */}
      <div className="absolute left-[6%] top-[6%] w-[42%]" aria-hidden>
        <svg viewBox="0 0 200 130">
          <rect x="6" y="6" width="188" height="118" rx="12" fill="#BFE7F5" stroke="#3B2E5A" strokeWidth="5" />
          <line x1="100" y1="6" x2="100" y2="124" stroke="#3B2E5A" strokeWidth="4" />
          <line x1="6" y1="64" x2="194" y2="64" stroke="#3B2E5A" strokeWidth="4" />
          <circle cx="54" cy="36" r="14" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.4" />
          <path d="M118 96 Q142 70 178 88 L178 118 L118 118 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3.4" />
        </svg>
        {/* windowsill */}
        <div className="mx-auto mt-[-6px] h-4 w-[108%] -translate-x-[4%] rounded-xl border-4 border-[#3B2E5A] bg-[#FAFAFA]" />
      </div>

      {/* plant on the sill */}
      <div className="absolute bottom-[34%] left-[22%] w-[24%]">
        <div ref={leafRef} className="pointer-events-none absolute left-[-12%] right-[-12%] top-[-6%] h-[46%]" aria-hidden />
        {/* tighter drop zone: only the soil patch, aligned with the soil ellipse */}
        <div ref={soilRef} className="pointer-events-none absolute bottom-[24%] left-[18%] right-[18%] h-[16%]" aria-hidden />
        <div style={{ transformOrigin: "bottom center", animation: happy ? "breathe 1.6s ease-in-out infinite" : "wobble 3s ease-in-out infinite" }}>
          <Pulse active={hintPulse > 0 && !happy}>
            <PlantSvg happy={happy} />
          </Pulse>
        </div>
      </div>

      {/* decoy: empty watering can on the floor */}
      <button
        type="button"
        onClick={tapCan}
        aria-label={lang === "fa" ? "قوطی آبیاری خالی" : "empty watering can"}
        className="absolute bottom-[9%] left-[7%] w-[16%] cursor-pointer transition-transform active:scale-90"
        aria-hidden={happy}
      >
        <div style={{ animation: "wobble 3.4s ease-in-out infinite" }}>
          <EmptyCanSvg />
        </div>
      </button>

      {/* decoy: butterfly near the leaves */}
      <button
        type="button"
        onClick={tapButterfly}
        aria-label={lang === "fa" ? "پروانه" : "butterfly"}
        className="absolute bottom-[52%] left-[43%] w-[9%] cursor-pointer transition-transform active:scale-90"
        aria-hidden={happy}
      >
        <div style={{ animation: "bob 1.6s ease-in-out infinite" }}>
          <ButterflySvg />
        </div>
      </button>

      {/* pitcher (draggable) */}
      <div className="absolute bottom-[10%] right-[8%] w-[24%]">
        <div
          ref={pitcherRef}
          {...pitcherDrag.bind}
          role="button"
          aria-label={lang === "fa" ? "پارچ آب" : "water pitcher"}
          className="cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate(${pitcherDrag.x}px, ${pitcherDrag.y}px)`,
            transition: pitcherDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
            zIndex: 20,
          }}
        >
          <Pulse active={hintPulse > 0 && !happy}>
            <PitcherSvg pouring={pouring} />
          </Pulse>
        </div>
      </div>

      {/* water drops while pouring */}
      {pouring && (
        <>
          {[0, 1, 2].map((i) => (
            <div key={i} className="pointer-events-none absolute bottom-[46%] left-[27%] w-[3%]" style={{ animation: `drop-fall 0.7s ${i * 0.18}s linear infinite` }} aria-hidden>
              <svg viewBox="0 0 16 20">
                <path d="M8 2 Q13 9 8 16 Q3 9 8 2 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="2" />
              </svg>
            </div>
          ))}
        </>
      )}

      {/* little table under pitcher */}
      <div className="absolute bottom-[7%] right-[6%] w-[28%]">
        <div className="h-3 rounded-xl border-4 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
        <div className="mx-auto h-[26px] w-[22%] rounded-b-lg border-x-4 border-b-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />
      </div>
    </Scene>
  );
}
