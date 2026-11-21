"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 81 — The TV won't turn on! Plug the cord into the socket,     */
/* then press the power button.                                        */
/* ------------------------------------------------------------------ */

function TvSvg({ on }: { on: boolean }) {
  return (
    <svg viewBox="0 0 220 160" className="h-auto w-full" aria-hidden>
      {/* frame */}
      <rect x="8" y="6" width="204" height="128" rx="14" fill="#33205E" stroke="#3B2E5A" strokeWidth="5" />
      {/* screen */}
      <rect x="20" y="18" width="168" height="104" rx="8" fill={on ? "#BFE7F5" : "#171034"} stroke="#171034" strokeWidth="3" />
      {on && (
        <>
          {/* sky + sun + hills cartoon */}
          <circle cx="60" cy="48" r="16" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1="60" y1="26" x2="60" y2="20" stroke="#FFD154" strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 60 48)`} />
          ))}
          <path d="M20 122 L20 106 Q60 88 100 106 Q140 122 188 104 L188 122 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" />
          <path d="M20 122 Q60 100 100 116 Q140 130 188 112" fill="none" stroke="#3B8F42" strokeWidth="3" />
          {/* bunny */}
          <ellipse cx="140" cy="102" rx="14" ry="10" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.6" />
          <circle cx="132" cy="88" r="4" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.2" />
          <circle cx="140" cy="86" r="4" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.2" />
          <circle cx="134" cy="101" r="1.6" fill="#3B2E5A" />
          <circle cx="141" cy="101" r="1.6" fill="#3B2E5A" />
          {/* shine */}
          <path d="M28 26 L44 26 L28 44 Z" fill="#FAFAFA" opacity="0.5" />
        </>
      )}
      {!on && <path d="M28 26 L44 26 L28 44 Z" fill="#3D2C6E" />}
      {/* stand */}
      <rect x="80" y="134" width="60" height="12" rx="6" fill="#33205E" stroke="#3B2E5A" strokeWidth="4" />
      {/* power button */}
      <circle cx="198" cy="118" r="9" fill={on ? "#4CAF50" : "#FF6B81"} stroke="#3B2E5A" strokeWidth="3.5" />
      <path d="M198 113 L198 120" stroke="#FAFAFA" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="198" cy="123.5" r="2.6" fill="#FAFAFA" opacity="0.9" />
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
          <path d="M45 66 Q45 84 60 90" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
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

export default function Level81({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [plugged, setPlugged] = useState(false);
  const [on, setOn] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const plugRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const plugDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || plugged || on) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(plugRef, socketRef, 14)) {
          api.reset();
          setPlugged(true);
          sfx.unlock();
          timers.current.push(setTimeout(() => sfx.sparkle(), 220));
          onProgress(0.5);
          return;
        }
        api.reset();
      },
      [solved, plugged, on, onProgress]
    )
  );

  const pressPower = useCallback(() => {
    if (solved || on) return;
    if (!plugged) {
      sfx.fail();
      onMistake({
        fa: "اول دوشاخه را به پریز وصل کن!",
        en: "First plug the cord into the socket!",
      });
      return;
    }
    setOn(true);
    sfx.chime();
    timers.current.push(setTimeout(() => sfx.fanfare(), 350));
    onProgress(1);
    timers.current.push(setTimeout(onSolved, 1700));
  }, [solved, on, plugged, onMistake, onProgress, onSolved]);

  return (
    <Scene bg="linear-gradient(180deg,#FDF3E3 0%,#F7E6C8 58%,#EFD6AF 66%,#E3CFA4 68%,#D9BE8F 100%)">
      {/* rug */}
      <div className="absolute bottom-[3%] left-[30%] w-[46%]" aria-hidden>
        <svg viewBox="0 0 200 60">
          <ellipse cx="100" cy="30" rx="94" ry="24" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
          <ellipse cx="100" cy="30" rx="66" ry="15" fill="#FF8FA0" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>

      {/* wall picture */}
      <div className="absolute left-[6%] top-[8%] w-[16%]" aria-hidden>
        <svg viewBox="0 0 90 70">
          <rect x="6" y="6" width="78" height="58" rx="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
          <path d="M16 52 Q45 18 74 48" fill="none" stroke="#4CAF50" strokeWidth="5" strokeLinecap="round" />
          <circle cx="66" cy="24" r="8" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>

      {/* socket on right wall */}
      <div ref={socketRef} className="absolute right-[2%] top-[26%] w-[13%]">
        <SocketSvg plugged={plugged} />
        {plugged && !on && (
          <div className="pointer-events-none absolute -left-4 -top-4 w-8" aria-hidden style={{ animation: "star-pop 0.6s ease both" }}>
            <svg viewBox="0 0 40 40">
              <path d="M20 2 L24 14 L36 14 L26 22 L30 34 L20 26 L10 34 L14 22 L4 14 L16 14 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" />
            </svg>
          </div>
        )}
      </div>

      {/* cable from TV across the floor to the plug */}
      <svg viewBox="0 0 400 80" preserveAspectRatio="none" className="pointer-events-none absolute bottom-[13%] left-[20%] w-[50%] h-[9%]" aria-hidden>
        <path d="M2 10 Q120 40 250 46 Q330 50 392 64" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      </svg>

      {/* TV + cabinet */}
      <div className="absolute bottom-[22%] left-1/2 w-[52%] -translate-x-1/2">
        <Pulse active={hintPulse > 0 && plugged && !on}>
          <button
            type="button"
            onClick={pressPower}
            aria-label={lang === "fa" ? "دکمهٔ روشن تلویزیون" : "TV power button"}
            className="block w-full cursor-pointer transition-transform active:scale-95"
          >
            <TvSvg on={on} />
          </button>
        </Pulse>
        <Pulse active={hintPulse > 0 && !plugged && !on} className="mt-1">
          <div className="mx-auto h-4 w-[92%] rounded-xl border-4 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
          <div className="mx-auto h-[26px] w-[24%] rounded-b-lg border-x-4 border-b-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />
        </Pulse>
      </div>

      {/* loose plug (draggable) */}
      {!plugged && (
        <div className="absolute bottom-[11%] right-[24%] w-[11%]">
          <div
            ref={plugRef}
            {...plugDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "دوشاخهٔ برق" : "power plug"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${plugDrag.x}px, ${plugDrag.y}px) rotate(6deg)`,
              transition: plugDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && !plugged && !on}>
              <PlugSvg />
            </Pulse>
          </div>
        </div>
      )}

      {/* sound waves from TV when on */}
      {on && (
        <>
          {[
            { l: "22%", t: "40%", d: "0s" },
            { l: "74%", t: "34%", d: "0.2s" },
          ].map((p, i) => (
            <div key={i} className="pointer-events-none absolute" style={{ left: p.l, top: p.t, animation: `float-up 1.6s ${p.d} ease-out infinite` }} aria-hidden>
              <svg viewBox="0 0 30 26" className="w-6">
                <path d="M4 18 Q8 10 4 4 M10 20 Q15 11 10 2" stroke="#FF6B81" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          ))}
        </>
      )}
    </Scene>
  );
}
