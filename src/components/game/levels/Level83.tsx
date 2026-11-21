"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 83 — Cut the cake into 4 equal pieces: drag the knife from    */
/* the center in two perpendicular directions.                         */
/* ------------------------------------------------------------------ */

function CakeSvg({ showFace }: { showFace: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className="h-auto w-full" aria-hidden>
      {/* plate */}
      <ellipse cx="100" cy="172" rx="92" ry="18" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* cake body */}
      <circle cx="100" cy="100" r="78" fill="#FFD1DC" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="100" cy="100" r="58" fill="#FFF3D6" stroke="#E8A9B8" strokeWidth="3" />
      {/* frosting drips */}
      <path d="M40 78 Q52 94 62 78 Q74 94 86 78 Q98 94 110 78 Q122 94 134 78 Q146 94 158 78" fill="none" stroke="#FF6B81" strokeWidth="6" strokeLinecap="round" />
      {/* sprinkles */}
      {[
        { x: 70, y: 60, r: 12 },
        { x: 120, y: 52, r: -20 },
        { x: 148, y: 90, r: 40 },
        { x: 66, y: 116, r: 70 },
        { x: 108, y: 138, r: -14 },
      ].map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width="12" height="5" rx="2.5" fill={["#1EC8CF", "#4CAF50", "#FFD154", "#6C4AB6", "#FF6B81"][i]} stroke="#3B2E5A" strokeWidth="1.6" transform={`rotate(${s.r} ${s.x + 6} ${s.y + 2.5})`} />
      ))}
      {/* cherry */}
      <circle cx="100" cy="34" r="9" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.5" />
      <path d="M100 26 Q104 16 112 14" fill="none" stroke="#3B2E5A" strokeWidth="2.6" strokeLinecap="round" />
      {showFace && (
        <>
          <circle cx="84" cy="102" r="5" fill="#3B2E5A" />
          <circle cx="116" cy="102" r="5" fill="#3B2E5A" />
          <circle cx="85.5" cy="100.5" r="1.6" fill="#FAFAFA" />
          <circle cx="117.5" cy="100.5" r="1.6" fill="#FAFAFA" />
          <path d="M86 116 Q100 126 114 116" fill="none" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function QuarterSvg({ q }: { q: number }) {
  /* q: 0=TL 1=TR 2=BR 3=BL */
  const paths = [
    "M100 100 L100 22 A78 78 0 0 0 22 100 Z",
    "M100 100 L178 100 A78 78 0 0 0 100 22 Z",
    "M100 100 L100 178 A78 78 0 0 0 178 100 Z",
    "M100 100 L22 100 A78 78 0 0 0 100 178 Z",
  ];
  const off = [
    { x: -8, y: -8 },
    { x: 8, y: -8 },
    { x: 8, y: 8 },
    { x: -8, y: 8 },
  ][q];
  return (
    <svg viewBox="0 0 200 200" className="h-auto w-full" style={{ transform: `translate(${off.x}px, ${off.y}px)` }} aria-hidden>
      {/* plate */}
      <ellipse cx="100" cy="172" rx="92" ry="18" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d={paths[q]} fill="#FFD1DC" stroke="#3B2E5A" strokeWidth="5" />
      <path d={paths[q]} fill="#FFF3D6" opacity="0.65" transform="scale(0.72) translate(39 39)" />
    </svg>
  );
}

function KnifeSvg() {
  return (
    <svg viewBox="0 0 170 60" className="h-auto w-full" aria-hidden>
      {/* blade */}
      <path d="M18 24 L118 20 Q132 20 132 30 Q132 40 118 40 L18 34 Z" fill="#BFE7F5" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M30 28 L112 26" stroke="#FAFAFA" strokeWidth="4" strokeLinecap="round" />
      {/* handle */}
      <rect x="126" y="20" width="36" height="20" rx="9" fill="#33205E" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="135" cy="30" r="3" fill="#FFD154" />
    </svg>
  );
}

export default function Level83({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [firstCut, setFirstCut] = useState<null | "h" | "v">(null);
  const [done, setDone] = useState(false);
  const firstCutRef = useRef<null | "h" | "v">(null);
  const knifeRef = useRef<HTMLDivElement>(null);
  const cakeRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const knifeDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || done) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(knifeRef, cakeRef, 22)) {
          const moved = Math.abs(d.x) + Math.abs(d.y);
          if (moved < 26) {
            api.reset();
            return;
          }
          const dir: "h" | "v" = Math.abs(d.x) >= Math.abs(d.y) ? "h" : "v";
          if (!firstCutRef.current) {
            firstCutRef.current = dir;
            setFirstCut(dir);
            sfx.whoosh();
            sfx.tick();
            onProgress(0.5);
            api.reset();
            return;
          }
          if (firstCutRef.current === dir) {
            api.reset();
            sfx.fail();
            onMistake({
              fa: "این برش همان جهت قبلی است؛ این‌بار عمود بر آن بکش!",
              en: "That cut matches the first one; drag perpendicular this time!",
            });
            return;
          }
          api.reset();
          setDone(true);
          sfx.whoosh();
          onProgress(1);
          timers.current.push(setTimeout(() => sfx.sparkle(), 250));
          timers.current.push(setTimeout(() => sfx.cheer(), 650));
          timers.current.push(setTimeout(onSolved, 1700));
          return;
        }
        api.reset();
      },
      [solved, done, onMistake, onProgress, onSolved]
    )
  );

  return (
    <Scene bg="linear-gradient(180deg,#FFF3E4 0%,#FAE7CF 55%,#F0DCC0 64%,#D9BE8F 66%,#C9A87B 100%)">
      {/* bunting */}
      <div className="absolute left-[4%] top-[3%] w-[92%]" aria-hidden>
        <svg viewBox="0 0 400 40">
          <path d="M4 8 Q200 30 396 8" fill="none" stroke="#3B2E5A" strokeWidth="3.4" />
          {[40, 90, 140, 190, 240, 290, 340].map((x, i) => (
            <path key={i} d={`M${x} ${12 + i * 0.6} L${x + 11} ${34 + i * 0.6} L${x + 22} ${12 + i * 0.6} Z`} fill={["#FF6B81", "#FFD154", "#1EC8CF", "#4CAF50", "#FFD154", "#FF6B81", "#1EC8CF"][i]} stroke="#3B2E5A" strokeWidth="2.6" />
          ))}
        </svg>
      </div>

      {/* table */}
      <div className="absolute bottom-[8%] left-[6%] right-[6%] h-[11%] rounded-2xl border-4 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
      <div className="absolute bottom-[2%] left-[14%] h-[7%] w-[9%] rounded-b-lg border-x-4 border-b-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />
      <div className="absolute bottom-[2%] right-[14%] h-[7%] w-[9%] rounded-b-lg border-x-4 border-b-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />

      {/* cake (centered on table) */}
      <div className="absolute bottom-[17%] left-1/2 w-[46%] -translate-x-1/2">
        <div className="relative">
          {!done ? (
            <>
              <Pulse active={hintPulse > 0 && !done}>
                <CakeSvg showFace />
              </Pulse>
              {/* first cut line */}
              {firstCut === "h" && <div className="absolute left-[6%] right-[6%] top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#3B2E5A]" aria-hidden />}
              {firstCut === "v" && <div className="absolute bottom-[6%] left-1/2 top-[8%] w-[3px] -translate-x-1/2 rounded-full bg-[#3B2E5A]" aria-hidden />}
            </>
          ) : (
            <div className="relative">
              {/* first quarter defines the box size; the rest overlay it */}
              <div style={{ animation: "pop-in 0.4s 0s ease both" }}>
                <QuarterSvg q={0} />
              </div>
              {[1, 2, 3].map((q) => (
                <div key={q} className="absolute inset-0" style={{ animation: `pop-in 0.4s ${q * 0.08}s ease both` }}>
                  <QuarterSvg q={q} />
                </div>
              ))}
            </div>
          )}
          <div ref={cakeRef} className="pointer-events-none absolute left-[2%] right-[2%] top-[10%] bottom-[8%]" aria-hidden />
        </div>
      </div>

      {/* candle flame on cake when whole */}
      {!done && (
        <div className="pointer-events-none absolute bottom-[62%] left-[55%] w-[5%]" aria-hidden>
          <svg viewBox="0 0 30 40" style={{ animation: "breathe 0.8s ease-in-out infinite" }}>
            <path d="M15 4 Q22 14 15 26 Q8 14 15 4 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
            <path d="M15 14 Q19 19 15 25 Q11 19 15 14 Z" fill="#FF6B81" opacity="0.85" />
          </svg>
        </div>
      )}

      {/* knife (draggable) */}
      <div className="absolute bottom-[32%] right-[4%] w-[26%]">
        <div
          ref={knifeRef}
          {...knifeDrag.bind}
          role="button"
          aria-label={lang === "fa" ? "چاقو" : "knife"}
          className={done ? "" : "cursor-grab active:cursor-grabbing"}
          style={{
            transform: `translate(${knifeDrag.x}px, ${knifeDrag.y}px) rotate(-18deg)`,
            transition: knifeDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
            zIndex: 20,
          }}
        >
          <Pulse active={hintPulse > 0 && !done}>
            <KnifeSvg />
          </Pulse>
        </div>
      </div>

      {/* direction hint arrows before first cut */}
      {!firstCut && !done && (
        <div className="pointer-events-none absolute bottom-[38%] left-[28%] w-[44%]" aria-hidden>
          <svg viewBox="0 0 160 60" className="w-full opacity-70">
            <path d="M14 30 L74 30 M74 30 L64 22 M74 30 L64 38" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M80 30 L146 30 M146 30 L136 22 M146 30 L136 38" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* success sparkles */}
      {done && (
        <>
          {[
            { l: "30%", t: "30%" },
            { l: "62%", t: "24%" },
            { l: "50%", t: "52%" },
          ].map((p, i) => (
            <div key={i} className="pointer-events-none absolute" style={{ left: p.l, top: p.t, animation: `star-pop 0.7s ${i * 0.15}s ease both` }} aria-hidden>
              <svg viewBox="0 0 40 40" className="w-8">
                <path d="M20 2 L24 14 L36 14 L26 22 L30 34 L20 26 L10 34 L14 22 L4 14 L16 14 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" />
              </svg>
            </div>
          ))}
        </>
      )}
    </Scene>
  );
}
