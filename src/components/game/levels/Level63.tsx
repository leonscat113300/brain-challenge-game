"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 63 — Morning! The owner won't wake up. Drag BOTH curtain      */
/* panels aside so sunlight floods the room and wakes him.             */
/* ------------------------------------------------------------------ */

function SleepingMan({ awake }: { awake: boolean }) {
  return (
    <svg viewBox="0 0 230 130" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.18)]" aria-hidden>
      {/* headboard */}
      <rect x="6" y="14" width="18" height="100" rx="8" fill="#8B6F4E" stroke="#3B2E5A" strokeWidth="4" />
      {/* mattress + blanket */}
      <rect x="18" y="70" width="196" height="40" rx="12" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M60 70 Q110 58 168 70 L206 70 L206 110 Q110 122 18 110 L18 70 Z" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M40 84 Q80 74 120 84 M60 98 Q104 88 148 98" stroke="#4A2E88" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {/* pillow */}
      <rect x="24" y="52" width="52" height="24" rx="11" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      {/* body under blanket */}
      <path d="M92 70 Q108 60 124 70" fill="none" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
      {/* head */}
      <circle cx="102" cy="52" r="22" fill="#FFCFB3" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* hair */}
      <path d="M82 44 Q92 26 118 34 Q124 36 122 42 Q106 34 88 46 Z" fill="#5B4233" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
      {awake ? (
        <>
          <circle cx="94" cy="52" r="4.4" fill="#3B2E5A" />
          <circle cx="110" cy="52" r="4.4" fill="#3B2E5A" />
          <circle cx="95.5" cy="50.5" r="1.6" fill="#fff" />
          <circle cx="111.5" cy="50.5" r="1.6" fill="#fff" />
          <path d="M94 62 Q102 69 110 62" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M90 52 Q94 56 98 52 M106 52 Q110 56 114 52" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M96 63 Q102 66 108 63" stroke="#3B2E5A" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* snore bubble / joy spark */}
      {awake ? (
        <g style={{ animation: "star-pop 0.5s 0.1s both" }}>
          <path d="M136 40 L140 30 L144 40 L154 44 L144 48 L140 58 L136 48 L126 44 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      ) : (
        <g style={{ animation: "float-up 1.8s ease-in-out infinite" }}>
          <text x="132" y="46" fontSize="15" fontWeight="800" fill="#3B2E5A">z</text>
          <text x="144" y="34" fontSize="19" fontWeight="800" fill="#3B2E5A">Z</text>
        </g>
      )}
    </svg>
  );
}

export default function Level63({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [awake, setAwake] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const openCount = (leftOpen ? 1 : 0) + (rightOpen ? 1 : 0);

  /* wake sequence when both panels are aside */
  useEffect(() => {
    if (openCount < 2 || done || awake) return;
    const t1 = setTimeout(() => {
      setAwake(true);
      setDone(true);
      sfx.chime();
      timers.current.push(setTimeout(() => sfx.cheer(), 300));
      onProgress(1);
      timers.current.push(setTimeout(onSolved, 1500));
    }, 900);
    timers.current.push(t1);
    return () => clearTimeout(t1);
  }, [openCount, done, awake, onProgress, onSolved]);

  const tapMan = useCallback(() => {
    if (solved || awake) return;
    sfx.laugh();
    onMistake({
      fa: "بیدار نمی‌شود! نور خورشید را وارد اتاق کن.",
      en: "He won't wake up! Let the sunlight into the room.",
    });
  }, [solved, awake, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#E7DDF4 0%,#D8CCEC 58%,#C9BBE2 100%)">
      {/* wall pattern */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.14) 0 3px, transparent 3px 58px)" }} aria-hidden />

      {/* window with sun */}
      <div className="absolute left-[6%] top-[8%] h-[42%] w-[34%] overflow-hidden rounded-2xl border-[6px] border-[#8B6F4E] bg-[#BFE7F5] shadow-[0_4px_0_rgba(59,46,90,0.2)]">
        <svg viewBox="0 0 200 170" className="h-full w-full" aria-hidden>
          <circle cx="128" cy="52" r="30" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="128" y1="10" x2="128" y2="18" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" transform={`rotate(${a} 128 52)`} />
          ))}
          <circle cx="115" cy="46" r="3" fill="#3B2E5A" />
          <circle cx="139" cy="46" r="3" fill="#3B2E5A" />
          <path d="M119 57 Q128 64 137 57" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M18 96 Q34 84 50 96 M60 110 Q76 98 92 110" stroke="#7FB8D9" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.7" />
          <rect x="96" y="0" width="8" height="170" fill="#8B6F4E" stroke="#3B2E5A" strokeWidth="3" />
          <rect x="0" y="82" width="200" height="8" fill="#8B6F4E" stroke="#3B2E5A" strokeWidth="3" />
        </svg>
      </div>

      {/* sunlight beam — grows as curtains open */}
      <div
        className="absolute"
        style={{
          left: "16%",
          top: "20%",
          width: "78%",
          height: "62%",
          clipPath: "polygon(0 0, 34% 0, 100% 88%, 100% 100%, 74% 100%, 0 34%)",
          background: "linear-gradient(115deg, rgba(255,209,84,0.85) 0%, rgba(255,209,84,0.4) 45%, rgba(255,209,84,0) 78%)",
          opacity: openCount === 0 ? 0 : openCount === 1 ? 0.45 : 0.95,
          transition: "opacity 0.7s ease",
          pointerEvents: "none",
        }}
        aria-hidden
      />

      {/* curtains */}
      <CurtainPanel side="left" open={leftOpen} hintActive={hintPulse > 0 && !done && !leftOpen} onOpen={() => { setLeftOpen(true); onProgress(0.25); }} />
      <CurtainPanel side="right" open={rightOpen} hintActive={hintPulse > 0 && !done && !rightOpen} onOpen={() => { setRightOpen(true); onProgress(0.5); }} />

      {/* bed + man */}
      <div className="absolute bottom-[6%] left-[14%] w-[52%]">
        <button type="button" onClick={tapMan} aria-label={lang === "fa" ? "صاحب‌خانه" : "owner"} className="block w-full cursor-pointer border-0 bg-transparent p-0" style={{ animation: awake ? "bob 0.8s ease-in-out" : undefined }}>
          <SleepingMan awake={awake} />
        </button>
      </div>

      {/* rug */}
      <div className="absolute bottom-[2%] end-[6%] h-[12%] w-[26%] rounded-[50%] border-4 border-[#3B2E5A] bg-[#FF9FB2] opacity-80" aria-hidden />
    </Scene>
  );
}

function CurtainPanel({
  side,
  open,
  hintActive,
  onOpen,
}: {
  side: "left" | "right";
  open: boolean;
  hintActive: boolean;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (open) return;
        const toward = side === "left" ? -d.x : d.x;
        if (!d.everMoved) {
          sfx.click();
          api.reset();
          return;
        }
        if (toward > 55) {
          sfx.whoosh();
          api.reset();
          onOpen();
        } else {
          api.reset();
        }
      },
      [open, onOpen, side]
    )
  );

  const shift = open ? (side === "left" ? "-86%" : "86%") : `${drag.x}px`;

  return (
    <div className="absolute left-[6%] top-[8%] h-[46%] w-[34%]" style={{ pointerEvents: "none" }}>
      <Pulse active={hintActive} className="h-full w-full">
        <div
          ref={ref}
          {...(open ? {} : drag.bind)}
          role="button"
          aria-label={lang2(side)}
          className="absolute top-0 h-full w-[52%] cursor-grab active:cursor-grabbing"
          style={{
            pointerEvents: "auto",
            [side]: "0%",
            transform: `translateX(${shift})`,
            transition: drag.dragging ? "none" : "transform 0.55s cubic-bezier(0.5,0,0.3,1)",
            zIndex: 25,
          } as React.CSSProperties}
        >
          <svg viewBox="0 0 60 150" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
            <path d="M2 4 L58 4 L58 128 Q44 142 30 128 Q16 142 2 128 Z" fill={side === "left" ? "#FF7B54" : "#FF9B77"} stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
            <path d="M16 8 L16 120 M30 8 L30 124 M44 8 L44 120" stroke="#3B2E5A" strokeWidth="2.4" opacity="0.35" />
            <rect x="0" y="0" width="60" height="10" rx="5" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="3.5" />
          </svg>
        </div>
      </Pulse>
    </div>
  );
}

function lang2(side: "left" | "right") {
  return side === "left" ? "پردهٔ چپ" : "پردهٔ راست";
}
