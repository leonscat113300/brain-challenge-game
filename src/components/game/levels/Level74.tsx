"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 74 — The wall clock fell! Put the hands back on the face,     */
/* then hang the clock on the wall nail.                               */
/* ------------------------------------------------------------------ */

function ClockFaceSvg({ happy, hands }: { happy: boolean; hands: boolean }) {
  return (
    <svg viewBox="0 0 160 170" className="h-auto w-full" aria-hidden>
      {/* hanger ring */}
      <circle cx="80" cy="16" r="9" fill="none" stroke="#3B2E5A" strokeWidth="5" />
      {/* body */}
      <circle cx="80" cy="95" r="62" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="80" cy="95" r="52" fill="none" stroke="#C9C4D8" strokeWidth="3" />
      {/* ticks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a) => (
        <line
          key={a}
          x1="80"
          y1="48"
          x2="80"
          y2={a % 90 === 0 ? "56" : "54"}
          stroke="#3B2E5A"
          strokeWidth={a % 90 === 0 ? 4.5 : 3}
          strokeLinecap="round"
          transform={`rotate(${a} 80 95)`}
        />
      ))}
      {/* face */}
      {happy ? (
        <>
          <circle cx="63" cy="88" r="5" fill="#3B2E5A" />
          <circle cx="97" cy="88" r="5" fill="#3B2E5A" />
          <circle cx="64.5" cy="86.5" r="1.6" fill="#FAFAFA" />
          <circle cx="98.5" cy="86.5" r="1.6" fill="#FAFAFA" />
          <path d="M64 106 Q80 118 96 106" fill="none" stroke="#3B2E5A" strokeWidth="3.6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M57 84 L69 92 M69 84 L57 92" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M91 84 L103 92 M103 84 L91 92" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="80" cy="108" r="5" fill="#3B2E5A" />
        </>
      )}
      {/* hub */}
      {hands && <circle cx="80" cy="95" r="7" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />}
    </svg>
  );
}

function HandSvg({ minute }: { minute: boolean }) {
  return minute ? (
    <svg viewBox="0 0 30 100" className="h-auto w-full" aria-hidden>
      <rect x="11" y="8" width="8" height="72" rx="4" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="15" cy="84" r="10" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  ) : (
    <svg viewBox="0 0 30 80" className="h-auto w-full" aria-hidden>
      <rect x="10" y="10" width="10" height="50" rx="5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="15" cy="64" r="10" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  );
}

export default function Level74({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [hourIn, setHourIn] = useState(false);
  const [minIn, setMinIn] = useState(false);
  const [hung, setHung] = useState(false);
  const [done, setDone] = useState(false);

  const faceRef = useRef<HTMLDivElement>(null);
  const nailRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* minute hand drag */
  const minDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || minIn || hung) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(minRef, faceRef, 10)) {
          api.reset();
          setMinIn(true);
          sfx.pop();
          onProgress(hourIn ? 0.67 : 0.34);
          return;
        }
        api.reset();
      },
      [solved, minIn, hung, hourIn, onProgress]
    )
  );

  /* hour hand drag */
  const hourDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || hourIn || hung) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(hourRef, faceRef, 10)) {
          api.reset();
          setHourIn(true);
          sfx.pop();
          onProgress(minIn ? 0.67 : 0.34);
          return;
        }
        api.reset();
      },
      [solved, hourIn, hung, minIn, onProgress]
    )
  );

  /* clock body drag → nail */
  const clockDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || hung) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(clockRef, nailRef, 18)) {
          if (!hourIn || !minIn) {
            api.reset();
            sfx.fail();
            onMistake({
              fa: "اول عقربه‌ها را روی صفحه جا بگذار!",
              en: "First put the hands back on the face!",
            });
            return;
          }
          api.reset();
          setHung(true);
          sfx.unlock();
          [250, 550, 850].forEach((ms) => timers.current.push(setTimeout(() => sfx.tick(), ms)));
          onProgress(1);
          timers.current.push(
            setTimeout(() => {
              sfx.chime();
              setDone(true);
              timers.current.push(setTimeout(() => sfx.sparkle(), 200));
              timers.current.push(setTimeout(onSolved, 1500));
            }, 950)
          );
          return;
        }
        api.reset();
      },
      [solved, hung, hourIn, minIn, onMistake, onProgress, onSolved]
    )
  );

  const floorClock = !hung;

  return (
    <Scene bg="linear-gradient(180deg,#EFE9FB 0%,#E2D8F5 62%,#D9C8EC 68%,#E3CFA4 70%,#D9BE8F 100%)">
      {/* wall decorations */}
      <div className="absolute left-[6%] top-[10%] w-[18%] opacity-90" aria-hidden>
        <svg viewBox="0 0 100 80">
          <rect x="6" y="6" width="88" height="68" rx="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
          <path d="M20 60 Q50 20 82 54" fill="none" stroke="#4CAF50" strokeWidth="5" strokeLinecap="round" />
          <circle cx="72" cy="30" r="9" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" />
        </svg>
      </div>
      <div className="absolute left-[16%] top-[34%] w-[10%]" aria-hidden>
        <svg viewBox="0 0 60 60">
          <rect x="8" y="8" width="44" height="44" rx="8" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
          <rect x="20" y="22" width="20" height="4" rx="2" fill="#FAFAFA" />
        </svg>
      </div>

      {/* nail on wall */}
      <div ref={nailRef} className="pointer-events-none absolute left-[59%] top-[4%] h-[16%] w-[22%]" aria-hidden>
        <div className="absolute left-1/2 top-[62%] h-4 w-4 -translate-x-1/2 rounded-full bg-[#3B2E5A]" />
        <div className="absolute left-1/2 top-[calc(62%+8px)] h-3 w-1 -translate-x-1/2 bg-[#3B2E5A]" />
      </div>

      {/* hung clock on wall */}
      {hung && (
        <div className="absolute left-[47%] top-[7%] w-[26%]" style={{ transformOrigin: "top center", animation: "pop-in 0.55s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <div style={{ transformOrigin: "top center", animation: done ? "wobble 2.4s ease-in-out infinite" : undefined }}>
            <div className="relative">
              <ClockFaceSvg happy={done} hands={hourIn && minIn} />
              {hourIn && (
                <div
                  className="absolute left-[50%] top-[55.9%] w-[9%]"
                  style={{ transform: "translate(-50%, -80%) rotate(-60deg)", transformOrigin: "50% 80%" }}
                  aria-hidden
                >
                  <HandSvg minute={false} />
                </div>
              )}
              {minIn && (
                <div
                  className="absolute left-[50%] top-[55.9%] w-[12%]"
                  style={{ transform: "translate(-50%, -80%) rotate(60deg)", transformOrigin: "50% 80%" }}
                  aria-hidden
                >
                  <HandSvg minute />
                </div>
              )}
            </div>
          </div>
          {done && (
            <div className="pointer-events-none absolute -right-2 -top-2 w-10" aria-hidden>
              <svg viewBox="0 0 40 40" style={{ animation: "star-pop 0.6s ease both" }}>
                <path d="M20 2 L24 14 L36 14 L26 22 L30 34 L20 26 L10 34 L14 22 L4 14 L16 14 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* clock body on floor (draggable) */}
      {floorClock && (
        <div className="absolute bottom-[6%] right-[8%] w-[36%]">
          <div
            ref={clockRef}
            {...clockDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "بدنهٔ ساعت" : "clock body"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${clockDrag.x}px, ${clockDrag.y}px) rotate(6deg)`,
              transition: clockDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && hourIn && minIn}>
              <div className="relative">
                <ClockFaceSvg happy={false} hands={hourIn && minIn} />
                {hourIn && (
                  <div
                    className="absolute left-[50%] top-[55.9%] w-[9%]"
                    style={{ transform: "translate(-50%, -80%) rotate(-60deg)", transformOrigin: "50% 80%" }}
                    aria-hidden
                  >
                    <HandSvg minute={false} />
                  </div>
                )}
                {minIn && (
                  <div
                    className="absolute left-[50%] top-[55.9%] w-[12%]"
                    style={{ transform: "translate(-50%, -80%) rotate(60deg)", transformOrigin: "50% 80%" }}
                    aria-hidden
                  >
                    <HandSvg minute />
                  </div>
                )}
              </div>
            </Pulse>
          </div>
        </div>
      )}

      {/* face drop zone follows the floor clock (same visual box) */}
      {floorClock && <div ref={faceRef} className="pointer-events-none absolute bottom-[18%] right-[19%] h-[22%] w-[13%]" aria-hidden />}

      {/* hands on floor */}
      {!hourIn && !hung && (
        <div className="absolute bottom-[9%] left-[10%] w-[13%]">
          <div
            ref={hourRef}
            {...hourDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "عقربهٔ ساعت‌شمار" : "hour hand"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${hourDrag.x}px, ${hourDrag.y}px) rotate(-24deg)`,
              transition: hourDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 22,
            }}
          >
            <Pulse active={hintPulse > 0 && !hourIn}>
              <HandSvg minute={false} />
            </Pulse>
          </div>
        </div>
      )}
      {!minIn && !hung && (
        <div className="absolute bottom-[5%] left-[28%] w-[16%]">
          <div
            ref={minRef}
            {...minDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "عقربهٔ دقیقه‌شمار" : "minute hand"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${minDrag.x}px, ${minDrag.y}px) rotate(18deg)`,
              transition: minDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 22,
            }}
          >
            <Pulse active={hintPulse > 0 && hourIn && !minIn}>
              <HandSvg minute />
            </Pulse>
          </div>
        </div>
      )}
    </Scene>
  );
}
