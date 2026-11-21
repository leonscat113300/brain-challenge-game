"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 6 — Escape the Rain: drag the rain cloud away.                */
/* ------------------------------------------------------------------ */

const DROPS = [
  { x: "10%", delay: 0 },
  { x: "24%", delay: 0.25 },
  { x: "38%", delay: 0.5 },
  { x: "52%", delay: 0.12 },
  { x: "66%", delay: 0.38 },
  { x: "80%", delay: 0.62 },
];

function RainCloudSvg({
  mood,
  className,
  style,
}: {
  mood: "angry" | "surprised" | "sad";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 260 170" className={className} style={style} aria-hidden>
      <path
        d="M62 128 a36 36 0 0 1 4 -71 a46 46 0 0 1 86 -18 a40 40 0 0 1 58 34 a32 32 0 0 1 -10 55 Z"
        fill="#8B84A3"
        stroke="#3B2E5A"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M88 52 a30 30 0 0 1 44 -14" stroke="#6F6890" strokeWidth="6" fill="none" strokeLinecap="round" />
      {mood === "angry" && (
        <>
          <path d="M92 84 L112 92" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
          <path d="M168 84 L148 92" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
          <circle cx="104" cy="100" r="6" fill="#3B2E5A" />
          <circle cx="156" cy="100" r="6" fill="#3B2E5A" />
          <path d="M108 122 Q130 112 152 122" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      )}
      {mood === "surprised" && (
        <>
          <circle cx="104" cy="96" r="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
          <circle cx="156" cy="96" r="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
          <circle cx="104" cy="98" r="3.5" fill="#3B2E5A" />
          <circle cx="156" cy="98" r="3.5" fill="#3B2E5A" />
          <ellipse cx="130" cy="120" rx="9" ry="11" fill="#3B2E5A" />
        </>
      )}
      {mood === "sad" && (
        <>
          <path d="M96 94 Q104 100 112 94" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M148 94 Q156 100 164 94" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M108 124 Q130 134 152 124" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M172 76 q4 8 0 12" stroke="#1EC8CF" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9" />
        </>
      )}
    </svg>
  );
}

function PersonSvg({
  happy,
  wet,
  className,
  style,
}: {
  happy: boolean;
  wet: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 110 180" className={className} style={style} aria-hidden>
      {/* legs + shoes */}
      <rect x="38" y="112" width="12" height="42" rx="5" fill="#33205E" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="60" y="112" width="12" height="42" rx="5" fill="#33205E" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="42" cy="158" rx="12" ry="6" fill="#3B2E5A" />
      <ellipse cx="68" cy="158" rx="12" ry="6" fill="#3B2E5A" />
      {/* body */}
      <rect x="32" y="62" width="46" height="56" rx="16" fill="#FF9F1C" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* arms */}
      <path d="M32 74 Q20 88 24 104" stroke="#3B2E5A" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M78 74 Q90 88 86 104" stroke="#3B2E5A" strokeWidth="9" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="106" r="6" fill="#FFD9B3" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="86" cy="106" r="6" fill="#FFD9B3" stroke="#3B2E5A" strokeWidth="3" />
      {/* head */}
      <circle cx="55" cy="34" r="26" fill="#FFD9B3" stroke="#3B2E5A" strokeWidth="4.5" />
      <path
        d="M30 30 C30 12 44 6 55 6 C66 6 80 12 80 30 C72 20 64 17 55 17 C46 17 38 20 30 30 Z"
        fill="#8B5E3C"
        stroke="#3B2E5A"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* face */}
      {happy ? (
        <>
          <path d="M40 32 Q46 26 52 32" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M58 32 Q64 26 70 32" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M44 44 Q55 52 66 44" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="42" r="4" fill="#FF6B81" opacity="0.5" />
          <circle cx="74" cy="42" r="4" fill="#FF6B81" opacity="0.5" />
        </>
      ) : (
        <>
          <circle cx="45" cy="32" r="4.5" fill="#3B2E5A" />
          <circle cx="65" cy="32" r="4.5" fill="#3B2E5A" />
          <path d="M38 24 L50 28" stroke="#3B2E5A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M72 24 L60 28" stroke="#3B2E5A" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M46 46 Q55 42 64 46" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* wet droplets */}
      {wet && (
        <>
          <circle cx="33" cy="58" r="3" fill="#1EC8CF" />
          <circle cx="76" cy="60" r="3" fill="#1EC8CF" />
          <path d="M55 6 q3 6 0 9" stroke="#1EC8CF" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function UmbrellaSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 70 180" className={className} style={style} aria-hidden>
      {/* folded canopy */}
      <path d="M35 12 C52 30 58 80 52 128 L18 128 C12 80 18 30 35 12 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M35 16 L35 124" stroke="#C94A5E" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
      <path d="M24 40 Q35 48 46 40" stroke="#C94A5E" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M22 76 Q35 86 48 76" stroke="#C94A5E" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M20 112 Q35 122 50 112" stroke="#C94A5E" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* tip */}
      <path d="M35 12 L35 4" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      {/* strap + handle */}
      <rect x="10" y="126" width="50" height="10" rx="5" fill="#3B2E5A" />
      <path d="M35 136 L35 160 Q35 172 24 172 Q14 172 14 162" stroke="#8B5E3C" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Level6({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [movedAway, setMovedAway] = useState(false);
  const [mood, setMood] = useState<"angry" | "surprised" | "sad">("angry");
  const [bubble, setBubble] = useState(false);
  const [wobbleN, setWobbleN] = useState(0);
  const happy = movedAway;

  // the rain cloud is the solution object
  const drag = useDragMove(
    useCallback(
      (d) => {
        if (solved || movedAway) return;
        const w = sceneRef.current?.clientWidth ?? 340;
        const h = sceneRef.current?.clientHeight ?? 400;
        if (Math.abs(d.x) > w * 0.25 || Math.abs(d.y) > h * 0.25) {
          setMovedAway(true);
          setMood("surprised");
          sfx.sparkle();
          window.setTimeout(() => {
            setMood("sad");
            sfx.cheer();
          }, 700);
          onProgress(1);
          window.setTimeout(onSolved, 800);
        } else if (d.everMoved && (Math.abs(d.x) > 24 || Math.abs(d.y) > 24)) {
          // eslint-disable-next-line react-hooks/immutability -- reset lives on the hook value declared below
          dragReset();
        }
      },
      [solved, movedAway, onProgress, onSolved]
    )
  );
  const dragReset = drag.reset;

  // broken umbrella decoy: dragging or tapping it triggers the mistake
  const dragU = useDragMove(
    useCallback(() => {
      if (solved || movedAway) return;
      sfx.boing();
      setWobbleN((n) => n + 1);
      setBubble(true);
      window.setTimeout(() => setBubble(false), 1500);
      onMistake({ fa: "چتر شکسته است؛ راه دیگری پیدا کن", en: "The umbrella is broken; find another way" });
      // eslint-disable-next-line react-hooks/immutability -- reset lives on the hook value declared below
      dragUReset();
    }, [solved, movedAway, onMistake])
  );
  const dragUReset = dragU.reset;

  return (
    <Scene bg="linear-gradient(180deg,#BFF1F4 0%,#8EE3EA 55%,#A9ECE6 100%)">
      {/* measuring layer */}
      <div ref={sceneRef} className="pointer-events-none absolute inset-0" aria-hidden />

      {/* road */}
      <div className="absolute bottom-0 left-0 h-[13%] w-full border-t-4 border-[#3B2E5A]/40 bg-[#C7C3D4]">
        <div className="absolute left-0 top-1/2 flex w-full -translate-y-1/2 gap-3 px-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-1.5 w-8 rounded-full bg-[#FAFAFA] opacity-80" />
          ))}
        </div>
      </div>

      {/* grass hills */}
      <svg viewBox="0 0 400 90" preserveAspectRatio="none" className="absolute bottom-[11%] left-0 w-full" aria-hidden>
        <path d="M0 55 Q100 15 200 50 T400 40 L400 90 L0 90 Z" fill="#7ED491" />
        <path d="M0 75 Q120 40 240 72 T400 62 L400 90 L0 90 Z" fill="#4CAF50" />
        <circle cx="60" cy="84" r="6" fill="#FFD154" />
        <circle cx="330" cy="86" r="6" fill="#FF6B81" />
      </svg>

      {/* house wall at the side — sits on the grass line */}
      <div className="absolute bottom-[17%] start-0 top-[18%] w-[16%] rounded-e-2xl border-y-4 border-e-4 border-[#3B2E5A] bg-[#F6E7C8]">
        <div className="absolute left-1/2 top-[16%] h-[24%] w-[54%] -translate-x-1/2 rounded-lg border-[3px] border-[#3B2E5A] bg-[#BEE9F5]" />
        <div className="absolute left-1/2 top-[56%] h-[22%] w-[54%] -translate-x-1/2 rounded-lg border-[3px] border-[#3B2E5A] bg-[#BEE9F5]" />
      </div>

      {/* puddle while raining — rests on the grass */}
      {!happy && <div className="absolute bottom-[18%] left-1/2 h-[3.5%] w-[30%] -translate-x-1/2 rounded-[50%] bg-[#1EC8CF] opacity-40" />}

      {/* broken umbrella leaning against the wall (decoy) — planted on the grass */}
      <div
        className="absolute bottom-[18%] start-[7%] z-10 w-[13%] min-w-[44px]"
        style={{
          transform: `translate(${dragU.x}px, ${dragU.y}px) rotate(14deg)`,
          transition: dragU.dragging ? "none" : "transform 0.3s ease",
        }}
      >
        <div {...(happy ? {} : dragU.bind)} className={happy ? "" : "cursor-grab active:cursor-grabbing"}>
          <div key={wobbleN} style={{ animation: wobbleN > 0 ? "wobble 0.5s ease-in-out" : undefined }}>
            <UmbrellaSvg className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.25)]" />
          </div>
        </div>
      </div>

      {/* the character — feet planted on the grass */}
      <div className="absolute bottom-[18.5%] left-1/2 z-10 w-[24%] min-w-[64px] -translate-x-1/2">
        <motion.div animate={happy ? { y: [0, -18, 0, -10, 0] } : { y: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
          <PersonSvg happy={happy} wet={!happy} className="h-auto w-full" />
        </motion.div>
      </div>

      {/* the draggable rain cloud */}
      <div
        className="absolute start-[27%] top-[4%] z-20 w-[46%] min-w-[150px]"
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px) ${drag.dragging ? "scale(1.04)" : ""}`,
          transition: drag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.3,0.64,1)",
          filter: drag.dragging ? "drop-shadow(0 10px 8px rgba(59,46,90,0.3))" : undefined,
        }}
      >
        <Pulse active={hintPulse > 0 && !movedAway} color="#FFD154">
          <div className="relative">
            <div {...(movedAway ? {} : drag.bind)} className={movedAway ? "" : "cursor-grab active:cursor-grabbing"}>
              <RainCloudSvg mood={mood} className="h-auto w-full" />
            </div>
            {/* raindrops (pause while dragging, stop forever after the cloud is moved) */}
            {!movedAway &&
              DROPS.map((d, i) => (
                <div
                  key={i}
                  className="pointer-events-none absolute w-3.5"
                  style={{
                    left: d.x,
                    top: "72%",
                    animation: `drop-fall 0.9s linear ${d.delay}s infinite`,
                    animationPlayState: drag.dragging ? "paused" : "running",
                  }}
                  aria-hidden
                >
                  <svg viewBox="0 0 16 22" className="h-auto w-full">
                    <path d="M8 2 C8 2 3 10 3 14 a5 5 0 0 0 10 0 C13 10 8 2 8 2 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="1.5" />
                  </svg>
                </div>
              ))}
          </div>
        </Pulse>
      </div>

      {/* sun pops out once the rain is gone */}
      {happy && (
        <div className="absolute end-[6%] top-[6%] z-10 w-[20%]" style={{ animation: "pop-in 0.5s both, breathe 2.4s 0.5s ease-in-out infinite" }} aria-hidden>
          <svg viewBox="0 0 100 100" className="h-auto w-full">
            {Array.from({ length: 10 }).map((_, i) => {
              const a = (i * Math.PI * 2) / 10;
              return (
                <line
                  key={i}
                  x1={50 + Math.cos(a) * 30}
                  y1={50 + Math.sin(a) * 30}
                  x2={50 + Math.cos(a) * 42}
                  y2={50 + Math.sin(a) * 42}
                  stroke="#FFD154"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              );
            })}
            <circle cx="50" cy="50" r="26" fill="#FFD154" stroke="#E8A81C" strokeWidth="4" />
            <circle cx="43" cy="46" r="3" fill="#B97E0A" />
            <circle cx="57" cy="46" r="3" fill="#B97E0A" />
            <path d="M42 56 Q50 62 58 56" stroke="#B97E0A" strokeWidth="4" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* speech bubble above the character when the umbrella is used */}
      {bubble && (
        <div
          className="absolute bottom-[62%] left-[26%] z-30 whitespace-nowrap rounded-2xl border-[3px] border-[#3B2E5A] bg-[#FAFAFA] px-3 py-1.5 font-extrabold text-[#3B2E5A] shadow-[0_4px_0_rgba(59,46,90,0.2)]"
          style={{ animation: "pop-in 0.25s both" }}
          role="status"
        >
          {lang === "fa" ? "چترم شکسته است!" : "My umbrella is broken!"}
          <span className="absolute -bottom-[7px] left-8 h-3 w-3 rotate-45 border-b-[3px] border-r-[3px] border-[#3B2E5A] bg-[#FAFAFA]" aria-hidden />
        </div>
      )}
    </Scene>
  );
}
