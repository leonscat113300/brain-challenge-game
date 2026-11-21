"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 88 — The vacuum won't start: plug the cord in AND empty the   */
/* full dust bag. Two steps, any order.                                */
/* ------------------------------------------------------------------ */

function VacuumSvg({ plugged, bagFull, running }: { plugged: boolean; bagFull: boolean; running: boolean }) {
  return (
    <svg viewBox="0 0 200 190" className="h-auto w-full" aria-hidden>
      {/* body */}
      <ellipse cx="100" cy="120" rx="74" ry="58" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="5" />
      {/* bag window */}
      <circle cx="100" cy="112" r="34" fill={bagFull ? "#8FA6BD" : "#EDE9F4"} stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="100" cy="112" r={bagFull ? 26 : 12} fill={bagFull ? "#FF6B81" : "#C9C4D8"} stroke="#3B2E5A" strokeWidth="3" />
      {bagFull && <text x="100" y="118" textAnchor="middle" fontSize="15" fontWeight="900" fill="#FAFAFA">{"\u067E\u064F\u0631!"}</text>}
      {/* face */}
      {running ? (
        <>
          <circle cx="76" cy="52" r="6" fill="#3B2E5A" />
          <circle cx="124" cy="52" r="6" fill="#3B2E5A" />
          <circle cx="78" cy="50" r="2" fill="#FAFAFA" />
          <circle cx="126" cy="50" r="2" fill="#FAFAFA" />
          <path d="M80 64 Q100 76 120 64" fill="none" stroke="#3B2E5A" strokeWidth="3.6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M70 48 L82 56 M82 48 L70 56" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M118 48 L130 56 M130 48 L118 56" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
          <circle cx="100" cy="70" r="5" fill="#3B2E5A" />
        </>
      )}
      {/* handle */}
      <path d="M60 66 Q40 40 66 24" fill="none" stroke="#3B2E5A" strokeWidth="9" strokeLinecap="round" />
      <path d="M60 66 Q40 40 66 24" fill="none" stroke="#8B72D9" strokeWidth="5" strokeLinecap="round" />
      {/* hose */}
      {!plugged && <path d="M168 96 Q186 110 178 136" fill="none" stroke="#3B2E5A" strokeWidth="8" strokeLinecap="round" />}
      {/* wheels */}
      <circle cx="52" cy="176" r="11" fill="#33205E" stroke="#3B2E5A" strokeWidth="3.4" />
      <circle cx="148" cy="176" r="11" fill="#33205E" stroke="#3B2E5A" strokeWidth="3.4" />
      {/* power light */}
      <circle cx="160" cy="60" r="8" fill={plugged ? "#4CAF50" : "#FF6B81"} stroke="#3B2E5A" strokeWidth="3" />
    </svg>
  );
}

function PlugSvg() {
  return (
    <svg viewBox="0 0 70 80" className="h-auto w-full" aria-hidden>
      <rect x="20" y="34" width="30" height="30" rx="8" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" />
      <rect x="28" y="12" width="5" height="24" rx="2.5" fill="#3B2E5A" />
      <rect x="37" y="12" width="5" height="24" rx="2.5" fill="#3B2E5A" />
      <path d="M35 64 Q35 74 24 76" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function SocketSvg({ plugged }: { plugged: boolean }) {
  return (
    <svg viewBox="0 0 90 110" className="h-auto w-full" aria-hidden>
      <rect x="8" y="8" width="74" height="94" rx="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="45" cy="52" r="26" fill="#EDE9F4" stroke="#3B2E5A" strokeWidth="3.5" />
      {plugged ? (
        <>
          <rect x="34" y="24" width="7" height="20" rx="3" fill="#3B2E5A" />
          <rect x="49" y="24" width="7" height="20" rx="3" fill="#3B2E5A" />
          <rect x="30" y="40" width="30" height="26" rx="8" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
        </>
      ) : (
        <>
          <rect x="34" y="42" width="7" height="20" rx="3" fill="#3B2E5A" />
          <rect x="49" y="42" width="7" height="20" rx="3" fill="#3B2E5A" />
        </>
      )}
    </svg>
  );
}

export default function Level88({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [plugged, setPlugged] = useState(false);
  const [bagFull, setBagFull] = useState(true);
  const [puff, setPuff] = useState(false);
  const [running, setRunning] = useState(false);

  const plugRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<HTMLDivElement>(null);
  const bagRef = useRef<HTMLDivElement>(null);
  const pluggedRef = useRef(false);
  const bagFullRef = useRef(true);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /** celebrate once both steps are done */
  const maybeFinish = useCallback(() => {
    if (!pluggedRef.current || bagFullRef.current) return;
    setRunning(true);
    onProgress(1);
    sfx.sparkle();
    timers.current.push(setTimeout(() => sfx.tick(), 500));
    timers.current.push(setTimeout(() => sfx.cheer(), 900));
    timers.current.push(setTimeout(onSolved, 1900));
  }, [onProgress, onSolved]);

  const plugDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || plugged || running) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(plugRef, socketRef, 14)) {
          api.reset();
          pluggedRef.current = true;
          setPlugged(true);
          sfx.unlock();
          timers.current.push(setTimeout(() => sfx.sparkle(), 220));
          onProgress(bagFullRef.current ? 0.5 : 1);
          timers.current.push(setTimeout(maybeFinish, 60));
          return;
        }
        api.reset();
      },
      [solved, plugged, running, onProgress, maybeFinish]
    )
  );

  const emptyBag = useCallback(() => {
    if (solved || !bagFull || running) return;
    setPuff(true);
    sfx.whoosh();
    timers.current.push(
      setTimeout(() => {
        bagFullRef.current = false;
        setBagFull(false);
        setPuff(false);
        sfx.pop();
        onProgress(pluggedRef.current ? 1 : 0.5);
        timers.current.push(setTimeout(maybeFinish, 60));
      }, 700)
    );
  }, [solved, bagFull, running, onProgress, maybeFinish]);

  return (
    <Scene bg="linear-gradient(180deg,#EFE9FB 0%,#E6DDF6 55%,#DCD0EE 64%,#E3CFA4 66%,#D9BE8F 100%)">
      {/* NOTE: the old step-checklist sign was removed — it revealed the whole solution */}

      {/* socket */}
      <div ref={socketRef} className="absolute right-[3%] top-[20%] w-[14%]">
        <SocketSvg plugged={plugged} />
      </div>

      {/* cable path */}
      <svg viewBox="0 0 400 90" preserveAspectRatio="none" className="pointer-events-none absolute bottom-[14%] left-[28%] h-[10%] w-[46%]" aria-hidden>
        <path d="M396 10 Q300 40 220 56 Q140 72 20 82" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      </svg>

      {/* vacuum */}
      <div className="absolute bottom-[22%] left-[10%] w-[46%]">
        <div ref={bagRef} className="absolute left-1/2 top-[34%] h-[38%] w-[46%] -translate-x-1/2" aria-hidden />
        <div style={{ transformOrigin: "bottom center", animation: running ? "wobble 0.7s ease-in-out infinite" : undefined }}>
          <Pulse active={hintPulse > 0 && bagFull && !running}>
            <button
              type="button"
              onClick={emptyBag}
              aria-label={lang === "fa" ? "کیسهٔ گردوخاک" : "dust bag"}
              className="block w-full cursor-pointer transition-transform active:scale-95"
            >
              <VacuumSvg plugged={plugged} bagFull={bagFull} running={running} />
            </button>
          </Pulse>
        </div>
      </div>

      {/* dust puff while emptying */}
      {puff && (
        <div className="pointer-events-none absolute bottom-[38%] left-[34%] w-[20%]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 30 30" className="absolute w-1/3" style={{ left: i * 26, animation: `float-up 0.8s ${i * 0.12}s ease-out infinite` }}>
              <circle cx="15" cy="15" r="10" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="2.4" />
            </svg>
          ))}
        </div>
      )}

      {/* loose plug (draggable) */}
      {!plugged && (
        <div className="absolute bottom-[9%] right-[26%] w-[11%]">
          <div
            ref={plugRef}
            {...plugDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "دوشاخهٔ جاروبرقی" : "vacuum plug"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${plugDrag.x}px, ${plugDrag.y}px) rotate(6deg)`,
              transition: plugDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && !plugged && !running}>
              <PlugSvg />
            </Pulse>
          </div>
        </div>
      )}

      {/* dust bunnies get sucked when running */}
      {running && (
        <div className="pointer-events-none absolute bottom-[12%] left-[56%] w-[34%]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 34 26" className="absolute w-[22%]" style={{ left: i * 30, animation: `float-up 1.1s ${i * 0.3}s ease-out infinite` }}>
              <ellipse cx="17" cy="14" rx="14" ry="9" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="2.4" />
            </svg>
          ))}
        </div>
      )}
    </Scene>
  );
}
