"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 55 — A cat is fast asleep. Drag the bell close to its ear;    */
/* the ring wakes it up. Tapping the cat only makes it sleep deeper.   */
/* ------------------------------------------------------------------ */

function CatSvg({ awake }: { awake: boolean }) {
  return (
    <svg viewBox="0 0 180 140" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.2)]" aria-hidden>
      {/* tail */}
      <path d="M150 104 Q176 96 170 72 Q167 60 156 62" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M150 104 Q176 96 170 72 Q167 60 156 62" stroke="#FF9FB2" strokeWidth="12" fill="none" strokeLinecap="round" />
      {/* cushion */}
      <ellipse cx="90" cy="122" rx="66" ry="14" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="90" cy="118" rx="58" ry="10" fill="#8B6FD0" />
      {/* body */}
      <ellipse cx="88" cy="92" rx="46" ry="26" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="5" />
      {/* head */}
      <g style={{ transformBox: "fill-box", transformOrigin: "50% 80%" }}>
        <path d="M52 44 L48 20 L68 32 Z" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M118 44 L122 20 L102 32 Z" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M54 40 L52 27 L63 34 Z" fill="#FF6B81" />
        <path d="M116 40 L118 27 L107 34 Z" fill="#FF6B81" />
        <circle cx="85" cy="58" r="34" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="5" />
        {awake ? (
          <>
            <circle cx="73" cy="54" r="6" fill="#3B2E5A" />
            <circle cx="97" cy="54" r="6" fill="#3B2E5A" />
            <circle cx="75" cy="52" r="2" fill="#fff" />
            <circle cx="99" cy="52" r="2" fill="#fff" />
            <path d="M80 66 Q85 71 90 66" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <path d="M68 54 Q73 59 78 54" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M92 54 Q97 59 102 54" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <ellipse cx="85" cy="63" rx="3" ry="2.2" fill="#FF6B81" />
          </>
        )}
        <path d="M56 62 L66 64 M56 70 L66 68 M114 62 L104 64 M114 70 L104 68" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" />
        {/* stripes */}
        <path d="M76 30 Q85 36 94 30" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
      </g>
    </svg>
  );
}

function BellSvg() {
  return (
    <svg viewBox="0 0 100 110" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.22)]" aria-hidden>
      <path d="M50 6 Q62 6 62 16 L62 22 L38 22 L38 16 Q38 6 50 6" fill="#3B2E5A" />
      <path d="M22 78 Q20 44 50 40 Q80 44 78 78 L84 86 L16 86 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <ellipse cx="50" cy="88" rx="36" ry="7" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="50" cy="98" r="8" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M34 52 Q38 46 44 44" stroke="#FAFAFA" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.75" />
    </svg>
  );
}

function HeartSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 21C7 16.5 2 12.8 2 8.5 2 5.5 4.5 3 7.5 3 9.2 3 11 4 12 5.5 13 4 14.8 3 16.5 3 19.5 3 22 5.5 22 8.5c0 4.3-5 8-10 12.5z"
        fill="#FF6B81"
        stroke="#3B2E5A"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function Level55({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [woke, setWoke] = useState(false);
  const [done, setDone] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const progRef = useRef(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const bellDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => {
        if (solved || done || woke) return;
        const bell = bellRef.current;
        const cat = catRef.current;
        if (bell && cat) {
          const a = bell.getBoundingClientRect();
          const b = cat.getBoundingClientRect();
          const dist = Math.hypot(
            a.left + a.width / 2 - (b.left + b.width * 0.62),
            a.top + a.height / 2 - (b.top + b.height * 0.38)
          );
          if (dist <= 110) {
            /* snap the bell beside the cat's ear and ring it */
            api.setPos(
              d.x + (b.left + b.width * 0.24 - (a.left + a.width / 2)),
              d.y + (b.top + b.height * 0.52 - (a.top + a.height / 2))
            );
            setWoke(true);
            setDone(true);
            sfx.coin();
            timers.current.push(setTimeout(() => sfx.cheer(), 250));
            onProgress(1);
            timers.current.push(setTimeout(onSolved, 900));
            return;
          }
        }
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        api.reset();
      },
      [solved, done, woke, onProgress, onSolved]
    )
  );

  const tapCat = useCallback(() => {
    if (solved || done) return;
    sfx.pop();
    onMistake({
      fa: "هنوز خواب است... زنگوله را بکش!",
      en: "Still asleep... drag the bell!",
    });
  }, [solved, done, onMistake]);

  const startBell = useCallback(() => {
    if (solved || done || progRef.current) return;
    progRef.current = true;
    onProgress(0.3);
  }, [solved, done, onProgress]);

  return (
    <Scene bg="linear-gradient(180deg,#FFF3D6 0%,#FFE9BC 58%,#F3E3C8 59%,#EBD9B8 100%)">
      {/* wall art: little frames */}
      <div className="absolute start-[8%] top-[8%] w-[10%] rotate-[-6deg]" aria-hidden>
        <svg viewBox="0 0 40 34" className="h-auto w-full">
          <rect x="2" y="2" width="36" height="30" rx="5" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="3.5" />
          <circle cx="20" cy="14" r="6" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" />
        </svg>
      </div>
      <div className="absolute end-[10%] top-[10%] w-[9%] rotate-[5deg]" aria-hidden>
        <svg viewBox="0 0 40 34" className="h-auto w-full">
          <rect x="2" y="2" width="36" height="30" rx="5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" />
          <path d="M10 24 L20 12 L30 24 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      </div>

      {/* sleeping cat on cushion */}
      <div ref={catRef} className="absolute bottom-[6%] end-[4%] w-[46%]">
        <button
          type="button"
          onClick={tapCat}
          aria-label={lang === "fa" ? "گربه" : "cat"}
          className="block w-full cursor-pointer border-0 bg-transparent p-0"
          style={{ animation: woke ? undefined : "breathe 2.6s ease-in-out infinite" }}
        >
          <CatSvg awake={woke} />
        </button>

        {/* floating zzz */}
        {!woke &&
          [
            { l: "64%", t: "6%", s: 13, d: 0 },
            { l: "74%", t: "0%", s: 17, d: 0.5 },
            { l: "84%", t: "-8%", s: 22, d: 1 },
          ].map((z, i) => (
            <span
              key={`z-${i}`}
              className="absolute z-30 font-black text-[#6C4AB6]"
              style={{ left: z.l, top: z.t, fontSize: z.s, animation: `float-up 2.2s ${z.d}s ease-in-out infinite` }}
              aria-hidden
            >
              z
            </span>
          ))}

        {/* wake-up hearts */}
        {woke &&
          [
            { l: "12%", t: "10%", d: 0 },
            { l: "55%", t: "2%", d: 0.3 },
            { l: "78%", t: "16%", d: 0.6 },
          ].map((h, i) => (
            <span
              key={`h-${i}`}
              className="absolute z-30"
              style={{ left: h.l, top: h.t, width: 20, height: 20, animation: `float-up 1.4s ${h.d}s ease-out infinite` }}
              aria-hidden
            >
              <HeartSvg className="h-full w-full" />
            </span>
          ))}
      </div>

      {/* draggable bell on a little shelf */}
      <div className="absolute bottom-[20%] start-[6%] w-[30%]" aria-hidden>
        <svg viewBox="0 0 120 18" className="h-auto w-full">
          <rect x="0" y="4" width="120" height="10" rx="5" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
        </svg>
      </div>
      <div className="absolute bottom-[27%] start-[10%] w-[20%]">
        <div
          ref={bellRef}
          style={{
            transform: `translate(${bellDrag.x}px, ${bellDrag.y}px)`,
            transition: bellDrag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.4,0.64,1)",
            zIndex: bellDrag.dragging ? 45 : 20,
          }}
        >
          <Pulse active={hintPulse > 0 && !done}>
            <div
              {...(solved || done ? {} : bellDrag.bind)}
              onPointerDownCapture={startBell}
              role="button"
              aria-label={lang === "fa" ? "زنگوله" : "bell"}
              className={solved || done ? "" : "cursor-grab active:cursor-grabbing"}
              style={{ animation: woke ? "wobble 0.5s ease-in-out" : undefined }}
            >
              <BellSvg />
            </div>
          </Pulse>
        </div>
      </div>

      {/* ring waves when it wakes the cat */}
      {woke &&
        [0, 1, 2].map((i) => (
          <span
            key={`w-${i}`}
            className="absolute rounded-full border-4 border-[#FFD154]"
            style={{
              left: "18%",
              top: "38%",
              width: 46,
              height: 46,
              opacity: 0,
              animation: `float-up 1.2s ${i * 0.2}s ease-out infinite`,
              zIndex: 30,
            }}
            aria-hidden
          />
        ))}
    </Scene>
  );
}
