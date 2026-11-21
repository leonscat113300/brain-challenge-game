"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 52 — Inverted drag: the bee is stuck hovering, so the player  */
/* drags the FLOWER POT toward it. Drop within ~110px of the bee and   */
/* it lands on the bloom. Dragging the bee only makes it dodge.        */
/* ------------------------------------------------------------------ */

function BeeSvg({ landed, className, style }: { landed: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 100" className={className} style={style} aria-hidden>
      <motion.g
        animate={landed ? { rotate: 0 } : { rotate: [-16, 8, -16] }}
        transition={landed ? { duration: 0.25 } : { duration: 0.18, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
      >
        <ellipse cx="42" cy="20" rx="17" ry="9" fill="#FFFFFF" opacity="0.8" stroke="#3B2E5A" strokeWidth="3" transform="rotate(-24 42 20)" />
        <ellipse cx="66" cy="16" rx="15" ry="8" fill="#FFFFFF" opacity="0.65" stroke="#3B2E5A" strokeWidth="3" transform="rotate(18 66 16)" />
      </motion.g>
      <path d="M48 34 Q42 22 34 20 M62 32 Q66 20 74 16" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="58" cy="56" rx="31" ry="23" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M48 35 Q44 56 48 77" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M68 35 Q64 56 68 77" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M88 50 L104 56 L88 62 Z" fill="#3B2E5A" />
      <circle cx="48" cy="52" r="5.5" fill="#3B2E5A" />
      <circle cx="68" cy="52" r="5.5" fill="#3B2E5A" />
      <circle cx="50" cy="50" r="1.8" fill="#fff" />
      <circle cx="70" cy="50" r="1.8" fill="#fff" />
      <ellipse cx="40" cy="62" rx="4.5" ry="3" fill="#FF9FB2" />
      <ellipse cx="76" cy="62" rx="4.5" ry="3" fill="#FF9FB2" />
      <path d="M53 63 Q58 67 63 63" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function FlowerSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 180" className={className} style={style} aria-hidden>
      <path d="M60 112 Q54 84 60 60" stroke="#4CAF50" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M59 92 Q38 86 34 100 Q46 108 59 98 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M59 102 Q80 96 85 110 Q72 118 59 108 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
      <g transform="translate(60 42)">
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <ellipse key={a} cx="0" cy="-17" rx="9.5" ry="16" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" transform={`rotate(${a})`} />
        ))}
        <circle cx="0" cy="0" r="13" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
        <circle cx="-4" cy="-2" r="2" fill="#3B2E5A" />
        <circle cx="4" cy="-2" r="2" fill="#3B2E5A" />
        <path d="M-3 4 Q0 7 3 4" stroke="#3B2E5A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="-9" cy="5" rx="2.6" ry="1.6" fill="#FF9FB2" />
        <ellipse cx="9" cy="5" rx="2.6" ry="1.6" fill="#FF9FB2" />
      </g>
      <rect x="22" y="110" width="76" height="18" rx="8" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M32 128 L88 128 L80 170 L40 170 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M46 138 L74 138 L71 160 L49 160 Z" fill="#FF9FB2" opacity="0.5" />
    </svg>
  );
}

function HeartSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path
        d="M12 21C7 16.5 2 12.8 2 8.5 2 5.5 4.5 3 7.5 3 9.2 3 11 4 12 5.5 13 4 14.8 3 16.5 3 19.5 3 22 5.5 22 8.5c0 4.3-5 8-10 12.5z"
        fill="#FF6B81"
        stroke="#3B2E5A"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export default function Level52({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [done, setDone] = useState(false);
  const [land, setLand] = useState<{ x: number; y: number } | null>(null);
  const [dodge, setDodge] = useState(0);
  const beeRef = useRef<HTMLDivElement>(null);
  const potRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const potDrag = useDragMove(
    useCallback(
      (d) => {
        if (solved || done) return;
        const a = potRef.current?.getBoundingClientRect();
        const b = beeRef.current?.getBoundingClientRect();
        if (a && b) {
          const dist = Math.hypot(
            a.left + a.width / 2 - (b.left + b.width / 2),
            a.top + a.height / 2 - (b.top + b.height / 2)
          );
          if (dist <= 110) {
            setLand({
              x: b.left + b.width / 2 - (a.left + a.width / 2),
              y: b.top + b.height / 2 - (a.top + a.height / 2) - 14,
            });
            setDodge(0);
            setDone(true);
            sfx.cheer();
            onProgress(1);
            timers.current.push(setTimeout(onSolved, 750));
            return;
          }
        }
        if (!d.everMoved) {
          sfx.pop();
          return;
        }
        if (Math.hypot(d.x, d.y) > 60) {
          onMistake({ fa: "نزدیک‌ترش کن!", en: "Bring it closer!" });
        }
        /* pot stays exactly where it was dropped */
      },
      [solved, done, onMistake, onProgress, onSolved]
    )
  );

  const startDragProgress = () => {
    if (solved || done) return;
    onProgress(0.5);
  };

  const tapBee = () => {
    if (solved || done) return;
    setDodge((k) => k + 1);
    sfx.pop();
    onMistake({ fa: "زنبور نمی‌تونه جابه‌جا شه! گل رو بکش", en: "The bee can't move! Drag the flower" });
  };

  return (
    <Scene bg="linear-gradient(180deg,#EAF7FB 0%,#DFF3F7 55%,#E7F3DF 56%,#DFF0D8 100%)">
      {/* ground strip */}
      <div className="absolute inset-x-0 bottom-0 h-[16%] border-t-4 border-[#3B2E5A] bg-[#DFF0D8]" aria-hidden />

      {/* little sun */}
      <div className="absolute start-[6%] top-[6%] w-[10%]" style={{ animation: "breathe 3s ease-in-out infinite" }} aria-hidden>
        <svg viewBox="0 0 60 60" className="h-auto w-full">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="30" y1="8" x2="30" y2="13" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 30 30)`} />
          ))}
          <circle cx="30" cy="30" r="16" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
          <circle cx="24" cy="27" r="2" fill="#3B2E5A" />
          <circle cx="36" cy="27" r="2" fill="#3B2E5A" />
          <path d="M26 34 Q30 37 34 34" stroke="#3B2E5A" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* dotted flight trail (mid-air between the two) */}
      {!land &&
        [0, 1, 2, 3].map((i) => (
          <span
            key={`t-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${34 + i * 8}%`,
              top: "44%",
              width: 9,
              height: 9,
              background: "#FFD154",
              opacity: 0.7,
              animation: `breathe 1.6s ${i * 0.2}s ease-in-out infinite`,
            }}
            aria-hidden
          />
        ))}

      {/* the hovering bee (dodges when tapped, lands on the flower) */}
      <div
        ref={beeRef}
        className="absolute start-[7%] top-[30%] w-[24%]"
        style={{
          zIndex: land ? 40 : 10,
          transform: land ? `translate(${land.x}px, ${land.y}px)` : undefined,
          transition: "transform 0.55s cubic-bezier(0.34,1.4,0.64,1)",
        }}
      >
        <motion.div animate={{ x: dodge % 2 === 1 ? 30 : 0 }} transition={{ type: "spring", stiffness: 280, damping: 13 }}>
          <button
            type="button"
            onClick={tapBee}
            aria-label={lang === "fa" ? "زنبور" : "bee"}
            className="block w-full cursor-pointer border-0 bg-transparent p-0"
            style={{ animation: land ? undefined : "bob 1.9s ease-in-out infinite" }}
          >
            <BeeSvg landed={!!land} className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" />
          </button>
        </motion.div>
      </div>

      {/* celebration: hearts + pollen sparkles near the flower */}
      {land &&
        [
          { l: "58%", t: "28%", d: 0 },
          { l: "68%", t: "32%", d: 0.35 },
          { l: "63%", t: "36%", d: 0.7 },
        ].map((h, i) => (
          <span
            key={`h-${i}`}
            className="absolute z-30"
            style={{ left: h.l, top: h.t, width: 22, height: 22, animation: `float-up 1.5s ${h.d}s ease-out infinite` }}
            aria-hidden
          >
            <HeartSvg className="h-full w-full" />
          </span>
        ))}
      {land &&
        [0, 1, 2, 3].map((i) => (
          <span
            key={`p-${i}`}
            className="absolute z-30 rounded-full"
            style={{ left: `${52 + (i % 2) * 10}%`, top: `${38 + i * 6}%`, width: 7, height: 7, background: "#FFD154", animation: `star-pop 0.5s ${i * 0.12}s both` }}
            aria-hidden
          />
        ))}

      {/* the draggable flower pot */}
      <div
        ref={potRef}
        className="absolute bottom-[10%] end-[8%] w-[24%]"
        style={{
          zIndex: potDrag.dragging ? 50 : 30,
          transform: `translate(${potDrag.x}px, ${potDrag.y}px)`,
          transition: potDrag.dragging ? "none" : "transform 0.3s ease",
        }}
        onPointerDownCapture={startDragProgress}
      >
        <Pulse active={hintPulse > 0 && !done}>
          <div {...(done ? {} : potDrag.bind)} className={done ? "" : "cursor-grab active:cursor-grabbing"}>
            <FlowerSvg className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" />
          </div>
        </Pulse>
      </div>
    </Scene>
  );
}
