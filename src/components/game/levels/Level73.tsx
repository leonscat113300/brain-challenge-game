"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 73 — The clothes are wet! Hang each one on the line under     */
/* the sun. Avoid the water bucket (it re-wets them).                  */
/* ------------------------------------------------------------------ */

type ClothId = "shirt" | "sock" | "towel";

function ShirtSvg({ wet }: { wet: boolean }) {
  return (
    <svg viewBox="0 0 100 90" className="h-auto w-full" aria-hidden>
      <path
        d="M30 12 L42 6 Q50 14 58 6 L70 12 L88 30 L76 42 L70 34 L70 78 Q50 84 30 78 L30 34 L24 42 L12 30 Z"
        fill="#FF6B81"
        stroke="#3B2E5A"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path d="M42 6 Q50 14 58 6" fill="none" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="42" cy="42" r="4" fill="#3B2E5A" />
      <circle cx="58" cy="42" r="4" fill="#3B2E5A" />
      <circle cx="43.5" cy="40.5" r="1.4" fill="#FAFAFA" />
      <circle cx="59.5" cy="40.5" r="1.4" fill="#FAFAFA" />
      <path d="M44 52 Q50 57 56 52" fill="none" stroke="#3B2E5A" strokeWidth="3.2" strokeLinecap="round" />
      {wet && <path d="M24 60 Q30 66 24 72" stroke="#1EC8CF" strokeWidth="3.4" fill="none" strokeLinecap="round" />}
    </svg>
  );
}

function SockSvg({ wet }: { wet: boolean }) {
  return (
    <svg viewBox="0 0 70 100" className="h-auto w-full" aria-hidden>
      <path
        d="M22 8 L52 8 L52 56 Q52 76 36 84 Q20 90 12 78 Q6 68 18 62 Q26 58 22 50 Z"
        fill="#1EC8CF"
        stroke="#3B2E5A"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path d="M22 20 L52 20" stroke="#FAFAFA" strokeWidth="6" strokeLinecap="round" />
      <circle cx="34" cy="40" r="3.6" fill="#3B2E5A" />
      <circle cx="46" cy="40" r="3.6" fill="#3B2E5A" />
      <circle cx="35.2" cy="38.8" r="1.2" fill="#FAFAFA" />
      <circle cx="47.2" cy="38.8" r="1.2" fill="#FAFAFA" />
      <path d="M36 48 Q40 51 44 48" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
      {wet && <path d="M52 62 Q58 68 52 74" stroke="#1EC8CF" strokeWidth="3.2" fill="none" strokeLinecap="round" />}
    </svg>
  );
}

function TowelSvg({ wet }: { wet: boolean }) {
  return (
    <svg viewBox="0 0 120 80" className="h-auto w-full" aria-hidden>
      <rect x="8" y="10" width="104" height="62" rx="10" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M8 26 L112 26" stroke="#FF6B81" strokeWidth="5" />
      <path d="M8 56 L112 56" stroke="#FF6B81" strokeWidth="5" />
      <circle cx="48" cy="42" r="3.6" fill="#3B2E5A" />
      <circle cx="64" cy="42" r="3.6" fill="#3B2E5A" />
      <circle cx="49.2" cy="40.8" r="1.2" fill="#FAFAFA" />
      <circle cx="65.2" cy="40.8" r="1.2" fill="#FAFAFA" />
      <path d="M50 50 Q56 55 62 50" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
      {wet && <path d="M112 40 Q120 46 112 52" stroke="#1EC8CF" strokeWidth="3.2" fill="none" strokeLinecap="round" />}
    </svg>
  );
}

const CLOTH_SVG: Record<ClothId, (p: { wet: boolean }) => React.JSX.Element> = {
  shirt: ShirtSvg,
  sock: SockSvg,
  towel: TowelSvg,
};

/* hanging slot positions along the line (% of scene width) — peg sits on the rope */
const SLOTS: Record<ClothId, { left: string; top: string; w: string }> = {
  shirt: { left: "16%", top: "50%", w: "17%" },
  sock: { left: "43%", top: "55%", w: "9%" },
  towel: { left: "58%", top: "53%", w: "20%" },
};

/* floor start positions */
const FLOOR: Record<ClothId, { left: string; bottom: string; w: string }> = {
  shirt: { left: "5%", bottom: "16%", w: "20%" },
  sock: { left: "38%", bottom: "12%", w: "10%" },
  towel: { left: "56%", bottom: "18%", w: "24%" },
};

/** custom hook: drag one cloth; hanging on the line succeeds, bucket = mistake */
function useClothDrag(
  id: ClothId,
  opts: {
    solved: boolean;
    drying: boolean;
    hung: boolean;
    hungCount: number;
    onMistake: LevelProps["onMistake"];
    onProgress: LevelProps["onProgress"];
    setHung: React.Dispatch<React.SetStateAction<Record<ClothId, boolean>>>;
    onAllHung: () => void;
  }
) {
  const { solved, drying, hung, hungCount, onMistake, onProgress, setHung, onAllHung } = opts;
  return useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || drying || hung) return;
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        if (overElement(clothElRefs[id], bucketRef, 6)) {
          api.reset();
          sfx.fail();
          onMistake({
            fa: "آخ! لباس دوباره توی سطل آب افتاد؛ دور از آب خشک می‌شود!",
            en: "Oops! The cloth fell in the water bucket; it dries away from water!",
          });
          return;
        }
        if (overElement(clothElRefs[id], lineRef, 16)) {
          api.reset();
          setHung((h) => ({ ...h, [id]: true }));
          sfx.pop();
          const nextCount = hungCount + 1;
          onProgress(nextCount === 1 ? 0.34 : nextCount === 2 ? 0.67 : 1);
          if (nextCount === 3) {
            onAllHung();
          }
          return;
        }
        api.reset();
      },
      [solved, drying, hung, hungCount, id, onMistake, onProgress, setHung, onAllHung]
    )
  );
}

const clothElRefs: Record<ClothId, React.RefObject<HTMLDivElement | null>> = {
  shirt: React.createRef(),
  sock: React.createRef(),
  towel: React.createRef(),
};
const lineRef = React.createRef<HTMLDivElement>();
const bucketRef = React.createRef<HTMLDivElement>();

export default function Level73({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [hung, setHung] = useState<Record<ClothId, boolean>>({ shirt: false, sock: false, towel: false });
  const [drying, setDrying] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const hungCount = useMemo(() => Object.values(hung).filter(Boolean).length, [hung]);

  /* called from the drag handler when the third cloth lands on the line */
  const celebrateAllHung = useCallback(() => {
    setDrying(true);
    sfx.sparkle();
    timers.current.push(setTimeout(() => sfx.cheer(), 350));
    timers.current.push(setTimeout(onSolved, 1600));
  }, [onSolved]);

  const shirtDrag = useClothDrag("shirt", { solved, drying, hung: hung.shirt, hungCount: Object.values(hung).filter(Boolean).length - (hung.shirt ? 1 : 0), onMistake, onProgress, setHung, onAllHung: celebrateAllHung });
  const sockDrag = useClothDrag("sock", { solved, drying, hung: hung.sock, hungCount: Object.values(hung).filter(Boolean).length - (hung.sock ? 1 : 0), onMistake, onProgress, setHung, onAllHung: celebrateAllHung });
  const towelDrag = useClothDrag("towel", { solved, drying, hung: hung.towel, hungCount: Object.values(hung).filter(Boolean).length - (hung.towel ? 1 : 0), onMistake, onProgress, setHung, onAllHung: celebrateAllHung });
  const drags: Record<ClothId, ReturnType<typeof useDragMove>> = { shirt: shirtDrag, sock: sockDrag, towel: towelDrag };

  const Sun = (
    <svg viewBox="0 0 120 120" className="h-auto w-full" aria-hidden style={{ animation: "breathe 3s ease-in-out infinite" }}>
      <g style={{ transformOrigin: "60px 60px", animation: "spin 14s linear infinite" }}>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <line key={a} x1="60" y1="14" x2="60" y2="2" stroke="#FFD154" strokeWidth="6" strokeLinecap="round" transform={`rotate(${a} 60 60)`} />
        ))}
      </g>
      <circle cx="60" cy="60" r="30" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="50" cy="55" r="4.5" fill="#3B2E5A" />
      <circle cx="70" cy="55" r="4.5" fill="#3B2E5A" />
      <circle cx="51.5" cy="53.5" r="1.5" fill="#FAFAFA" />
      <circle cx="71.5" cy="53.5" r="1.5" fill="#FAFAFA" />
      <path d="M50 66 Q60 74 70 66" fill="none" stroke="#3B2E5A" strokeWidth="3.6" strokeLinecap="round" />
    </svg>
  );

  const Peg = () => (
    <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-12 rounded-[3px] border-2 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
  );

  return (
    <Scene bg="linear-gradient(180deg,#BFE7F5 0%,#DFF2E1 55%,#F2E3C2 100%)">
      {/* soft clouds */}
      <div className="pointer-events-none absolute left-[38%] top-[6%] w-[16%] opacity-80" aria-hidden>
        <svg viewBox="0 0 120 60">
          <path d="M20 45 Q8 45 8 34 Q8 24 20 24 Q24 12 38 12 Q52 12 56 24 Q70 22 72 34 Q74 45 60 45 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
        </svg>
      </div>

      {/* sun */}
      <div className="absolute left-[4%] top-[4%] w-[16%]">{Sun}</div>

      {/* clothesline */}
      <div className="absolute bottom-[38%] left-0 right-0">
        {/* posts */}
        <div className="absolute bottom-[-52px] left-[10%] h-[110px] w-[10px] rounded-t-md border-2 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
        <div className="absolute bottom-[-52px] right-[10%] h-[110px] w-[10px] rounded-t-md border-2 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
        {/* rope */}
        <svg viewBox="0 0 400 30" className="mx-auto block w-[86%]" preserveAspectRatio="none" aria-hidden>
          <path d="M6 6 Q200 26 394 6" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
        </svg>
        <div ref={lineRef as React.RefObject<HTMLDivElement>} className="absolute inset-x-[5%] -top-4 h-20" aria-hidden />
      </div>

      {/* hung clothes */}
      {(Object.keys(SLOTS) as ClothId[]).map((id) =>
        hung[id] ? (
          <div key={id} className="absolute" style={{ left: SLOTS[id].left, top: SLOTS[id].top, width: SLOTS[id].w, transformOrigin: "top center", animation: "wobble 2.6s ease-in-out infinite" }}>
            <Peg />
            <div className="relative pt-1">
              {drying && (
                <div className="pointer-events-none absolute -top-9 left-1/2 h-8 w-10 -translate-x-1/2" aria-hidden>
                  {[0, 1].map((i) => (
                    <svg key={i} viewBox="0 0 20 44" className="absolute bottom-0" style={{ left: i * 12, animation: `float-up 1.5s ${i * 0.3}s ease-out infinite` }}>
                      <path d="M10 40 Q4 30 10 20 Q16 10 10 2" stroke="#8FA6BD" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75" />
                    </svg>
                  ))}
                </div>
              )}
              {React.createElement(CLOTH_SVG[id], { wet: !drying })}
            </div>
          </div>
        ) : null
      )}

      {/* floor clothes (draggable) */}
      {(Object.keys(FLOOR) as ClothId[]).map((id) =>
        !hung[id] ? (
          <div key={id} className="absolute" style={{ left: FLOOR[id].left, bottom: FLOOR[id].bottom, width: FLOOR[id].w }}>
            <div
              ref={clothElRefs[id]}
              {...drags[id].bind}
              role="button"
              aria-label={lang === "fa" ? "لباس خیس" : "wet cloth"}
              className="cursor-grab active:cursor-grabbing"
              style={{
                transform: `translate(${drags[id].x}px, ${drags[id].y}px) rotate(${hung[id] ? 0 : -4 + Object.keys(FLOOR).indexOf(id) * 4}deg)`,
                transition: drags[id].dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
                zIndex: 20,
              }}
            >
              <Pulse active={hintPulse > 0 && !drying}>
                {React.createElement(CLOTH_SVG[id], { wet: true })}
              </Pulse>
            </div>
          </div>
        ) : null
      )}

      {/* floor strip */}
      <div className="absolute bottom-0 left-0 right-0 h-[10%] rounded-t-[40px] border-t-4 border-[#3B2E5A] bg-[#E3CFA4]" aria-hidden />

      {/* water bucket (mistake trap) */}
      <div ref={bucketRef as React.RefObject<HTMLDivElement>} className="absolute bottom-[7%] right-[4%] w-[12%]" aria-hidden>
        <svg viewBox="0 0 80 80">
          <path d="M16 30 L64 30 L58 72 Q40 78 22 72 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
          <ellipse cx="40" cy="30" rx="24" ry="7" fill="#8FDCE0" stroke="#3B2E5A" strokeWidth="4" />
          <path d="M22 30 Q40 6 58 30" fill="none" stroke="#3B2E5A" strokeWidth="4" />
        </svg>
      </div>
    </Scene>
  );
}
