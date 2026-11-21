"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 69 — The cat sleeps on the sofa. Move the cushion off the     */
/* sofa, then put the empty box near it — the cat will move into it.   */
/* ------------------------------------------------------------------ */

function CatSvg({ sleeping, size = 1 }: { sleeping: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 150 90" className="h-auto w-full" style={{ transform: `scale(${size})` }} aria-hidden>
      {/* tail */}
      <path d="M18 62 Q4 54 12 40" stroke="#3B2E5A" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M18 62 Q4 54 12 40" stroke="#FF9B77" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="62" cy="60" rx="44" ry="24" fill="#FF9B77" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* head */}
      <circle cx="104" cy="46" r="26" fill="#FF9B77" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* ears */}
      <path d="M86 26 L82 8 L98 18 Z" fill="#FF9B77" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M118 24 L124 6 L132 22 Z" fill="#FF9B77" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      {/* stripes */}
      <path d="M52 42 Q58 50 52 58 M66 40 Q72 50 66 60" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
      {sleeping ? (
        <>
          <path d="M94 44 Q98 48 102 44 M110 44 Q114 48 118 44" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M100 58 Q106 62 112 58" stroke="#3B2E5A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          <g style={{ animation: "float-up 1.8s ease-in-out infinite" }}>
            <text x="120" y="26" fontSize="12" fontWeight="800" fill="#3B2E5A">z</text>
            <text x="132" y="16" fontSize="15" fontWeight="800" fill="#3B2E5A">Z</text>
          </g>
        </>
      ) : (
        <>
          <circle cx="97" cy="44" r="4.4" fill="#3B2E5A" />
          <circle cx="115" cy="44" r="4.4" fill="#3B2E5A" />
          <circle cx="98.5" cy="42.5" r="1.6" fill="#fff" />
          <circle cx="116.5" cy="42.5" r="1.6" fill="#fff" />
          <path d="M98 56 Q106 63 114 56" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M104 50 L106 52 L108 50" stroke="#3B2E5A" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* whiskers */}
      <path d="M124 50 L138 46 M124 56 L138 58" stroke="#3B2E5A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CushionSvg() {
  return (
    <svg viewBox="0 0 110 80" className="h-auto w-full" aria-hidden>
      <rect x="8" y="12" width="94" height="56" rx="20" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M20 40 Q55 24 90 40 M20 52 Q55 38 90 52" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.35" />
      <circle cx="55" cy="40" r="10" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" />
    </svg>
  );
}

function BoxSvg({ withCat }: { withCat: boolean }) {
  return (
    <svg viewBox={withCat ? "0 0 150 100" : "0 0 110 90"} className="h-auto w-full" aria-hidden>
      {/* box */}
      <path d="M12 38 L98 38 L90 84 L20 84 Z" fill="#D9A66C" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M12 38 L98 38 L94 26 L16 26 Z" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M55 26 L55 38" stroke="#3B2E5A" strokeWidth="3.5" />
      <path d="M30 52 L44 70 M80 50 L68 70" stroke="#3B2E5A" strokeWidth="2.6" opacity="0.4" strokeLinecap="round" />
      {withCat && (
        <g>
          {/* cat head peeking from the box */}
          <circle cx="55" cy="26" r="20" fill="#FF9B77" stroke="#3B2E5A" strokeWidth="4.5" />
          <path d="M40 12 L36 -2 L50 6 Z" fill="#FF9B77" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" transform="translate(0 4)" />
          <path d="M70 10 L76 -4 L82 8 Z" fill="#FF9B77" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" transform="translate(0 4)" />
          <circle cx="48" cy="24" r="3.4" fill="#3B2E5A" />
          <circle cx="62" cy="24" r="3.4" fill="#3B2E5A" />
          <circle cx="49.4" cy="22.6" r="1.3" fill="#fff" />
          <circle cx="63.4" cy="22.6" r="1.3" fill="#fff" />
          <path d="M49 34 Q55 39 61 34" stroke="#3B2E5A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}

export default function Level69({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [cushionDown, setCushionDown] = useState(false);
  const [boxPlaced, setBoxPlaced] = useState(false);
  const [catMoves, setCatMoves] = useState(false);
  const [done, setDone] = useState(false);
  const cushionZoneRef = useRef<HTMLDivElement>(null);
  const boxZoneRef = useRef<HTMLDivElement>(null);
  const cushionRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapCat = useCallback(() => {
    if (done || solved) return;
    sfx.laugh();
    onMistake({
      fa: "گربه را نمی‌شود جابه‌جا کرد! اول یک جای راحت برایش آماده کن.",
      en: "You can't move the cat! First prepare a cozy spot for it.",
    });
  }, [done, solved, onMistake]);

  const cushionDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => {
        if (cushionDown || done) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(cushionRef, cushionZoneRef, 18)) {
          const b = cushionZoneRef.current!.getBoundingClientRect();
          const a = cushionRef.current!.getBoundingClientRect();
          api.setPos(d.x + (b.left + b.width / 2 - (a.left + a.width / 2)), d.y + (b.top + b.height / 2 - (a.top + a.height / 2)));
          setCushionDown(true);
          sfx.whoosh();
          onProgress(0.4);
          return;
        }
        api.reset();
      },
      [cushionDown, done, onProgress]
    )
  );

  const boxDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => {
        if (boxPlaced || done) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(boxRef, boxZoneRef, 20)) {
          const b = boxZoneRef.current!.getBoundingClientRect();
          const a = boxRef.current!.getBoundingClientRect();
          api.setPos(d.x + (b.left + b.width / 2 - (a.left + a.width / 2)), d.y + (b.top + b.height / 2 - (a.top + a.height / 2)));
          setBoxPlaced(true);
          sfx.pop();
          onProgress(0.8);
          return;
        }
        api.reset();
      },
      [boxPlaced, done, onProgress]
    )
  );

  /* once BOTH the cushion is down and the box is placed, the cat moves */
  useEffect(() => {
    if (!cushionDown || !boxPlaced || catMoves || done) return;
    const t1 = setTimeout(() => {
      setCatMoves(true);
      sfx.cheer();
      onProgress(1);
      setDone(true);
      timers.current.push(setTimeout(onSolved, 1600));
    }, 700);
    timers.current.push(t1);
    return () => clearTimeout(t1);
  }, [cushionDown, boxPlaced, catMoves, done, onProgress, onSolved]);

  return (
    <Scene bg="linear-gradient(180deg,#E7DDF4 0%,#D8CCEC 55%,#D3C7B0 56%,#C5B89C 100%)">
      {/* rug */}
      <div className="absolute bottom-[2%] left-1/2 h-[16%] w-[62%] -translate-x-1/2 rounded-[46px] border-4 border-[#3B2E5A] bg-[#FF9FB2] opacity-70" aria-hidden />

      {/* sofa */}
      <div className="absolute right-[4%] top-[14%] w-[58%]">
        <svg viewBox="0 0 260 140" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.15)]" aria-hidden>
          {/* back */}
          <rect x="10" y="8" width="240" height="60" rx="18" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4.5" />
          {/* armrests */}
          <rect x="2" y="46" width="34" height="70" rx="14" fill="#3E9A44" stroke="#3B2E5A" strokeWidth="4.5" />
          <rect x="224" y="46" width="34" height="70" rx="14" fill="#3E9A44" stroke="#3B2E5A" strokeWidth="4.5" />
          {/* seat */}
          <rect x="30" y="72" width="200" height="44" rx="12" fill="#5FBF66" stroke="#3B2E5A" strokeWidth="4.5" />
          {/* legs */}
          <rect x="26" y="116" width="16" height="18" rx="5" fill="#8B6F4E" stroke="#3B2E5A" strokeWidth="3.5" />
          <rect x="218" y="116" width="16" height="18" rx="5" fill="#8B6F4E" stroke="#3B2E5A" strokeWidth="3.5" />
        </svg>

        {/* cushion on sofa (until removed) */}
        {!cushionDown && (
          <div className="absolute bottom-[30%] right-[16%] w-[32%]">
            <div
              ref={cushionRef}
              {...cushionDrag.bind}
              role="button"
              aria-label={lang === "fa" ? "کوسن" : "cushion"}
              className="cursor-grab active:cursor-grabbing"
              style={{
                transform: `translate(${cushionDrag.x}px, ${cushionDrag.y}px)`,
                transition: cushionDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
                zIndex: 22,
              }}
            >
              <Pulse active={hintPulse > 0 && !done}>
                <CushionSvg />
              </Pulse>
            </div>
          </div>
        )}

        {/* cat on sofa (until it moves to the box) */}
        {!catMoves && (
          <div className="absolute bottom-[28%] left-[12%] w-[46%]" style={{ zIndex: 24 }}>
            <button type="button" onClick={tapCat} aria-label={lang === "fa" ? "گربه" : "cat"} className="block w-full cursor-pointer border-0 bg-transparent p-0">
              <CatSvg sleeping />
            </button>
          </div>
        )}
      </div>

      {/* cushion resting zone (floor right of sofa base) */}
      <div ref={cushionZoneRef} className="absolute bottom-[6%] end-[8%] h-[18%] w-[24%] rounded-xl border-[3px] border-dashed border-[#3B2E5A] opacity-40" aria-hidden />
      {cushionDown && (
        <div className="absolute bottom-[8%] end-[9%] w-[22%]" style={{ zIndex: 21 }}>
          <div ref={cushionRef}>
            <CushionSvg />
          </div>
        </div>
      )}

      {/* box (draggable) */}
      {!catMoves && (
        <div className="absolute bottom-[8%] start-[6%] w-[24%]">
          <div
            ref={boxRef}
            {...(boxPlaced ? {} : boxDrag.bind)}
            role="button"
            aria-label={lang === "fa" ? "جعبهٔ خالی" : "empty box"}
            className={boxPlaced ? "" : "cursor-grab active:cursor-grabbing"}
            style={{
              transform: `translate(${boxDrag.x}px, ${boxDrag.y}px)`,
              transition: boxDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 23,
            }}
          >
            <Pulse active={hintPulse > 0 && cushionDown && !done}>
              <BoxSvg withCat={false} />
            </Pulse>
          </div>
        </div>
      )}

      {/* box target zone (front of sofa) */}
      <div ref={boxZoneRef} className="absolute bottom-[4%] right-[20%] h-[20%] w-[26%] rounded-xl border-[3px] border-dashed border-[#3B2E5A] opacity-40" aria-hidden />

      {/* cat inside box (final) */}
      {catMoves && (
        <div className="absolute bottom-[4%] right-[21%] w-[26%]" style={{ zIndex: 26, animation: "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <BoxSvg withCat />
        </div>
      )}
    </Scene>
  );
}
