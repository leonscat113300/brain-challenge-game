"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 64 — The tea went cold! First tap the stove knob to light     */
/* the flame, then drag the cup onto the burner to warm it up.         */
/* ------------------------------------------------------------------ */

function CupSvg({ warm }: { warm: boolean }) {
  return (
    <svg viewBox="0 0 110 110" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" aria-hidden>
      {/* saucer */}
      <ellipse cx="52" cy="98" rx="34" ry="9" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
      {/* handle */}
      <path d="M78 56 Q96 52 94 68 Q92 82 76 78" fill="none" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M80 62 Q92 60 90 70 Q88 78 78 74" fill="none" stroke="#1EC8CF" strokeWidth="4" />
      {/* cup */}
      <path d="M22 50 L28 92 Q29 98 36 98 L68 98 Q75 98 76 92 L82 50 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* tea surface */}
      <ellipse cx="52" cy="52" rx="29" ry="8" fill={warm ? "#C98A4B" : "#E8DFC8"} stroke="#3B2E5A" strokeWidth="3.5" />
      {/* face on cup */}
      <circle cx="42" cy="74" r="3.4" fill="#3B2E5A" />
      <circle cx="62" cy="74" r="3.4" fill="#3B2E5A" />
      <circle cx="43.4" cy="72.6" r="1.3" fill="#fff" />
      <circle cx="63.4" cy="72.6" r="1.3" fill="#fff" />
      <path d={warm ? "M46 84 Q52 89 58 84" : "M47 84 Q52 81.5 57 84"} stroke="#3B2E5A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {warm && <circle cx="52" cy="84" r="3.2" fill="#FF9FB2" />}
    </svg>
  );
}

function FlameSvg() {
  return (
    <svg viewBox="0 0 60 70" className="h-full w-full" aria-hidden>
      <path d="M30 6 Q42 26 44 40 Q44 56 30 62 Q16 56 16 40 Q18 26 30 6 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" style={{ transformOrigin: "30px 40px", animation: "bob 0.5s ease-in-out infinite alternate" }} />
      <path d="M30 26 Q37 36 37 44 Q37 52 30 55 Q23 52 23 44 Q23 36 30 26 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" />
    </svg>
  );
}

function SteamCurls() {
  return (
    <div className="pointer-events-none absolute -top-14 left-1/2 h-14 w-16 -translate-x-1/2" aria-hidden>
      {[0, 1, 2].map((i) => (
        <svg key={i} viewBox="0 0 20 44" className="absolute bottom-0" style={{ left: i * 18, animation: `float-up 1.6s ${i * 0.25}s ease-out infinite` }}>
          <path d="M10 40 Q4 30 10 20 Q16 10 10 2" stroke="#8FA6BD" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.65" />
        </svg>
      ))}
    </div>
  );
}

export default function Level64({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [flameOn, setFlameOn] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [warm, setWarm] = useState(false);
  const [done, setDone] = useState(false);
  const burnerRef = useRef<HTMLDivElement>(null);
  const cupRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapKnob = useCallback(() => {
    if (solved || flameOn || done) return;
    setFlameOn(true);
    sfx.whoosh();
    onProgress(0.4);
  }, [solved, flameOn, done, onProgress]);

  const cupDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => {
        if (placed || done) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (!flameOn) {
          api.reset();
          sfx.fail();
          onMistake({
            fa: "اول شعلهٔ اجاق را روشن کن!",
            en: "First light the stove flame!",
          });
          return;
        }
        if (overElement(cupRef, burnerRef, 24)) {
          const b = burnerRef.current!.getBoundingClientRect();
          const a = cupRef.current!.getBoundingClientRect();
          api.setPos(d.x + (b.left + b.width / 2 - (a.left + a.width / 2)), d.y + (b.bottom - 14 - (a.top + a.height / 2)));
          setPlaced(true);
          sfx.pop();
          const t1 = setTimeout(() => {
            setWarm(true);
            setDone(true);
            sfx.chime();
            onProgress(1);
            timers.current.push(setTimeout(onSolved, 1300));
          }, 1300);
          timers.current.push(t1);
          return;
        }
        api.reset();
      },
      [placed, done, flameOn, onMistake, onProgress, onSolved]
    )
  );

  return (
    <Scene bg="linear-gradient(180deg,#FDF3E3 0%,#FAE8CC 55%,#F3D9B8 100%)">
      {/* wall tiles */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(59,46,90,0.12) 0 3px, transparent 3px 44px), repeating-linear-gradient(90deg, rgba(59,46,90,0.12) 0 3px, transparent 3px 44px)" }} aria-hidden />

      {/* stove */}
      <div className="absolute bottom-[10%] end-[5%] w-[40%]">
        {/* burner drop zone (invisible, aligned with the burner grid) */}
        <div ref={burnerRef} className="absolute left-1/2 top-[10%] h-[36%] w-[74%] -translate-x-1/2" aria-hidden />
        <svg viewBox="0 0 200 190" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.18)]" aria-hidden>
          {/* body */}
          <rect x="10" y="30" width="180" height="150" rx="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
          <rect x="10" y="30" width="180" height="26" rx="10" fill="#33205E" stroke="#3B2E5A" strokeWidth="4.5" />
          {/* burner top */}
          <rect x="34" y="62" width="132" height="8" rx="4" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="3.5" />
          {/* burner grid */}
          <g stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round">
            <line x1="60" y1="52" x2="60" y2="62" />
            <line x1="84" y1="50" x2="84" y2="62" />
            <line x1="108" y1="52" x2="108" y2="62" />
            <line x1="132" y1="50" x2="132" y2="62" />
          </g>
          {/* oven door */}
          <rect x="30" y="92" width="140" height="70" rx="10" fill="#E7DDF4" stroke="#3B2E5A" strokeWidth="4" />
          <rect x="42" y="104" width="116" height="42" rx="8" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="3" />
          <rect x="76" y="152" width="48" height="8" rx="4" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
        </svg>

        {/* flame (appears when lit) */}
        {flameOn && (
          <div className="absolute bottom-[74%] left-1/2 h-[26%] w-[18%] -translate-x-1/2" style={{ animation: "pop-in 0.3s ease both" }}>
            <FlameSvg />
          </div>
        )}

        {/* knob — tap to ignite */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <Pulse active={hintPulse > 0 && !flameOn && !done}>
            <button
              type="button"
              onClick={tapKnob}
              aria-label={lang === "fa" ? "دکمهٔ اجاق" : "stove knob"}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-4 border-[#3B2E5A] bg-[#FF6B81] shadow-[0_3px_0_rgba(59,46,90,0.35)] transition-transform active:scale-90"
              style={{ transform: `rotate(${flameOn ? 40 : 0}deg)`, transition: "transform 0.3s ease" }}
            >
              <span className="block h-1.5 w-6 rounded-full bg-[#FAFAFA]" aria-hidden />
            </button>
          </Pulse>
        </div>
      </div>

      {/* cup (draggable) */}
      <div className="absolute bottom-[24%] start-[8%] w-[24%]">
        <div
          ref={cupRef}
          {...(placed || done ? {} : cupDrag.bind)}
          role="button"
          aria-label={lang === "fa" ? "فنجان چای" : "tea cup"}
          className={placed || done ? "" : "cursor-grab active:cursor-grabbing"}
          style={{
            transform: `translate(${cupDrag.x}px, ${cupDrag.y}px)`,
            transition: cupDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
            zIndex: placed ? 30 : 20,
          }}
        >
          <Pulse active={hintPulse > 0 && flameOn && !placed && !done}>
            <CupSvg warm={warm} />
            {(warm || (placed && !warm)) && <SteamCurls />}
            {!warm && !placed && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2" style={{ animation: "bob 1.4s ease-in-out infinite" }} aria-hidden>
                <svg viewBox="0 0 30 30" className="h-7 w-7">
                  <path d="M15 2 L15 26 M4 8 L26 22 M26 8 L4 22 M8 4 L22 26 M22 4 L8 26" stroke="#1EC8CF" strokeWidth="3.4" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </Pulse>
        </div>
      </div>

      {/* table under cup */}
      <div className="absolute bottom-[10%] start-[4%] h-[16%] w-[34%] rounded-xl border-[5px] border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
      <div className="absolute bottom-0 start-[9%] h-[11%] w-[9%] rounded-b-lg border-x-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />
      <div className="absolute bottom-0 start-[26%] h-[11%] w-[9%] rounded-b-lg border-x-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />
    </Scene>
  );
}
