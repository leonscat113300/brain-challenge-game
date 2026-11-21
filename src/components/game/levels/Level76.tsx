"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 76 — Clean the dirty dish! Scrub all stains with the sponge,  */
/* then rinse it under the tap.                                        */
/* ------------------------------------------------------------------ */

interface Stain {
  id: number;
  left: string;
  top: string;
}

const STAINS: Stain[] = [
  { id: 0, left: "22%", top: "20%" },
  { id: 1, left: "58%", top: "34%" },
  { id: 2, left: "36%", top: "58%" },
];

function StainSvg() {
  return (
    <svg viewBox="0 0 40 40" className="h-auto w-full" aria-hidden>
      <circle cx="20" cy="20" r="13" fill="#C98A4B" opacity="0.9" />
      <circle cx="14" cy="16" r="5" fill="#A96F35" />
      <circle cx="26" cy="24" r="4" fill="#A96F35" />
      <circle cx="24" cy="12" r="3" fill="#A96F35" opacity="0.8" />
    </svg>
  );
}

function SpongeSvg() {
  return (
    <svg viewBox="0 0 90 60" className="h-auto w-full" aria-hidden>
      <rect x="6" y="10" width="78" height="44" rx="10" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      <rect x="6" y="10" width="78" height="16" rx="8" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="30" cy="40" r="4" fill="#E8B93C" />
      <circle cx="52" cy="44" r="3.4" fill="#E8B93C" />
      <circle cx="66" cy="36" r="3" fill="#E8B93C" />
    </svg>
  );
}

function PlateSvg({ dirty }: { dirty: boolean }) {
  return (
    <svg viewBox="0 0 200 120" className="h-auto w-full" aria-hidden>
      <ellipse cx="100" cy="64" rx="88" ry="34" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="100" cy="62" rx="58" ry="20" fill="#EDE9F4" stroke="#C9C4D8" strokeWidth="3" />
      {dirty && (
        <text x="100" y="24" textAnchor="middle" fontSize="15" fontWeight="800" fill="#3B2E5A">
          {`\u06A9\u062B\u06CC\u0641!`}
        </text>
      )}
    </svg>
  );
}

export default function Level76({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [cleaned, setCleaned] = useState<boolean[]>([false, false, false]);
  const [rinsing, setRinsing] = useState(false);
  const [done, setDone] = useState(false);

  const spongeRef = useRef<HTMLDivElement>(null);
  const stainRefs = useRef<Array<HTMLDivElement | null>>([null, null, null]);
  const cleanedRef = useRef<boolean[]>([false, false, false]);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const allClean = cleaned.every(Boolean);

  const spongeDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || rinsing || done) return;
        api.reset();
        void d;
      },
      [solved, rinsing, done]
    )
  );

  /* while the sponge sweeps across the plate, stains under it fade away */
  const scrubMove = (e: React.PointerEvent) => {
    spongeDrag.bind.onPointerMove(e);
    if (solved || rinsing || done) return;
    STAINS.forEach((s, i) => {
      if (cleanedRef.current[i]) return;
      const el = stainRefs.current[i];
      if (!el) return;
      const r = el.getBoundingClientRect();
      const pad = 16;
      if (e.clientX >= r.left - pad && e.clientX <= r.right + pad && e.clientY >= r.top - pad && e.clientY <= r.bottom + pad) {
        cleanedRef.current = cleanedRef.current.map((v, j) => (j === i ? true : v));
        setCleaned([...cleanedRef.current]);
        sfx.tick();
        sfx.sparkle();
        const n = cleanedRef.current.filter(Boolean).length;
        onProgress(n === 1 ? 0.25 : n === 2 ? 0.5 : 0.75);
      }
    });
  };

  const tapFaucet = useCallback(() => {
    if (solved || rinsing || done) return;
    if (!allClean) {
      sfx.fail();
      onMistake({
        fa: "اول با اسفنج لکه‌ها را پاک کن، بعد آبکشی!",
        en: "First scrub the stains with the sponge, then rinse!",
      });
      return;
    }
    setRinsing(true);
    sfx.whoosh();
    timers.current.push(setTimeout(() => sfx.sparkle(), 500));
    timers.current.push(
      setTimeout(() => {
        setDone(true);
        sfx.chime();
        onProgress(1);
        timers.current.push(setTimeout(() => sfx.cheer(), 300));
        timers.current.push(setTimeout(onSolved, 1500));
      }, 1200)
    );
  }, [solved, rinsing, done, allClean, onMistake, onProgress, onSolved]);

  return (
    <Scene bg="linear-gradient(180deg,#E9F5F7 0%,#DFF0F2 58%,#CFE7EA 66%,#D9BE8F 68%,#C9A87B 100%)">
      {/* wall tiles */}
      <div className="absolute inset-x-0 top-0 h-[64%] opacity-40" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(59,46,90,0.15) 0 3px, transparent 3px 40px), repeating-linear-gradient(90deg, rgba(59,46,90,0.15) 0 3px, transparent 3px 40px)" }} aria-hidden />

      {/* faucet */}
      <div className="absolute left-1/2 top-[8%] w-[26%] -translate-x-1/2">
        <Pulse active={hintPulse > 0 && allClean && !done && !rinsing}>
          <button
            type="button"
            onClick={tapFaucet}
            aria-label={lang === "fa" ? "شیر آب" : "faucet"}
            className="block w-full cursor-pointer transition-transform active:scale-95"
          >
            <svg viewBox="0 0 120 110" className="h-auto w-full" aria-hidden>
              <path d="M24 100 L24 52 Q24 28 52 28 L96 28 L96 62" fill="none" stroke="#3B2E5A" strokeWidth="11" strokeLinecap="round" />
              <path d="M24 100 L24 52 Q24 28 52 28 L96 28 L96 62" fill="none" stroke="#1EC8CF" strokeWidth="6" strokeLinecap="round" />
              <rect x="82" y="60" width="28" height="14" rx="6" fill="#33205E" stroke="#3B2E5A" strokeWidth="3" />
              {/* valve */}
              <circle cx="24" cy="100" r="0" />
              <rect x="8" y="88" width="34" height="10" rx="5" fill="#3B2E5A" />
              <circle cx="24" cy="82" r="13" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
              <rect x="20" y="66" width="8" height="10" rx="3" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" />
            </svg>
          </button>
        </Pulse>
      </div>

      {/* water stream while rinsing */}
      {rinsing && (
        <div className="pointer-events-none absolute left-[56%] top-[30%] h-[34%] w-[3%]" aria-hidden>
          <div className="h-full w-full rounded-full bg-[#8FDCE0] opacity-80" style={{ animation: "breathe 0.5s ease-in-out infinite" }} />
        </div>
      )}

      {/* sink basin */}
      <div className="absolute bottom-[10%] left-1/2 w-[58%] -translate-x-1/2">
        <div className="relative rounded-3xl border-[5px] border-[#3B2E5A] bg-[#CFE7EA] p-3 shadow-[0_5px_0_rgba(59,46,90,0.25)]">
          {/* plate inside sink */}
          <div className="relative mx-auto w-[86%] py-2">
            <PlateSvg dirty={!done} />
            {/* stains */}
            {STAINS.map((s, i) =>
              !cleaned[i] ? (
                <div
                  key={s.id}
                  ref={(el) => {
                    stainRefs.current[i] = el;
                  }}
                  className="pointer-events-none absolute w-[16%]"
                  style={{ left: s.left, top: s.top, animation: "bob 1.6s ease-in-out infinite" }}
                  aria-hidden
                >
                  <StainSvg />
                </div>
              ) : null
            )}
            {done && (
              <div className="pointer-events-none absolute -top-8 left-1/2 h-10 w-16 -translate-x-1/2" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <svg key={i} viewBox="0 0 20 44" className="absolute bottom-0" style={{ left: i * 16, animation: `float-up 1.5s ${i * 0.22}s ease-out infinite` }}>
                    <path d="M10 40 Q4 30 10 20 Q16 10 10 2" stroke="#8FA6BD" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
                  </svg>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* sink legs */}
        <div className="mx-auto mt-1 h-3 w-[70%] rounded-xl border-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />
      </div>

      {/* sponge (draggable) */}
      <div className="absolute bottom-[34%] right-[4%] w-[18%]">
        <div
          ref={spongeRef}
          {...spongeDrag.bind}
          onPointerMove={scrubMove}
          role="button"
          aria-label={lang === "fa" ? "اسفنج" : "sponge"}
          className={done ? "" : "cursor-grab active:cursor-grabbing"}
          style={{
            transform: `translate(${spongeDrag.x}px, ${spongeDrag.y}px) rotate(-8deg)`,
            transition: spongeDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
            zIndex: 20,
          }}
        >
          <Pulse active={hintPulse > 0 && !allClean && !done}>
            <SpongeSvg />
          </Pulse>
        </div>
      </div>

      {/* soap bubbles when done */}
      {done && (
        <>
          {[
            { left: "30%", top: "40%" },
            { left: "62%", top: "48%" },
            { left: "48%", top: "34%" },
          ].map((p, i) => (
            <div key={i} className="pointer-events-none absolute" style={{ left: p.left, top: p.top, animation: `float-up 1.4s ${i * 0.2}s ease-out infinite` }} aria-hidden>
              <svg viewBox="0 0 24 24" className="w-5">
                <circle cx="12" cy="12" r="9" fill="#BFE7F5" stroke="#3B2E5A" strokeWidth="2.5" />
                <circle cx="9" cy="9" r="2.6" fill="#FAFAFA" />
              </svg>
            </div>
          ))}
        </>
      )}
    </Scene>
  );
}
