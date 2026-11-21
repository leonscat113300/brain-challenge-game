"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 1 — Hungry Cat: drag the fish to the cat.                     */
/* ------------------------------------------------------------------ */

function CatSvg({ happy, className, style }: { happy: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 160 160" className={className} style={style} aria-hidden>
      {/* tail */}
      <path d="M118 118 Q146 112 142 84" stroke="#3B2E5A" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M118 118 Q146 112 142 84" stroke="#F4A259" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="78" cy="112" rx="46" ry="34" fill="#F4A259" stroke="#3B2E5A" strokeWidth="5" />
      {/* head */}
      <circle cx="66" cy="66" r="34" fill="#F4A259" stroke="#3B2E5A" strokeWidth="5" />
      {/* ears */}
      <path d="M40 44 L34 20 L58 34 Z" fill="#F4A259" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M92 44 L100 20 L74 32 Z" fill="#F4A259" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M42 38 L39 26 L52 34 Z" fill="#FF6B81" />
      <path d="M90 38 L95 27 L81 33 Z" fill="#FF6B81" />
      {/* stripes */}
      <path d="M60 34 Q66 30 72 34" stroke="#D97E32" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M55 44 Q66 39 77 44" stroke="#D97E32" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* face */}
      {happy ? (
        <>
          <path d="M52 62 Q58 54 64 62" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M74 62 Q80 54 86 62" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="68" cy="76" rx="10" ry="7" fill="#3B2E5A" />
          <ellipse cx="65" cy="74" rx="3" ry="2" fill="#fff" />
        </>
      ) : (
        <>
          <circle cx="56" cy="62" r="5.5" fill="#3B2E5A" />
          <circle cx="80" cy="62" r="5.5" fill="#3B2E5A" />
          <circle cx="58" cy="60" r="1.8" fill="#fff" />
          <circle cx="82" cy="60" r="1.8" fill="#fff" />
          <path d="M62 74 Q68 79 74 74" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* nose + whiskers */}
      <path d="M66 70 L69 74 L63 74 Z" fill="#FF6B81" />
      <path d="M44 72 L28 70 M44 76 L28 80" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M90 72 L106 70 M90 76 L106 80" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" />
      {/* paws */}
      <ellipse cx="58" cy="142" rx="14" ry="8" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="94" cy="142" rx="14" ry="8" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4" />
      {/* thought: fish */}
      {!happy && (
        <g opacity="0.85">
          <circle cx="118" cy="38" r="4" fill="#fff" stroke="#3B2E5A" strokeWidth="2" />
          <circle cx="130" cy="26" r="6" fill="#fff" stroke="#3B2E5A" strokeWidth="2" />
          <path d="M134 22 q6 -2 8 4 q-2 6 -8 4 q-3 -4 0 -8" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

function FishSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 80" className={className} style={style} aria-hidden>
      {/* plate */}
      <ellipse cx="60" cy="62" rx="52" ry="12" fill="#fff" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="60" cy="58" rx="40" ry="7" fill="#EFF7F8" />
      {/* tail */}
      <path d="M28 36 L10 22 L14 40 L10 56 L28 42 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      {/* body */}
      <ellipse cx="62" cy="38" rx="34" ry="22" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M46 30 Q60 24 74 30" stroke="#12A3A9" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M44 46 Q60 52 76 46" stroke="#12A3A9" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* eye + mouth */}
      <circle cx="82" cy="32" r="6" fill="#fff" stroke="#3B2E5A" strokeWidth="2.5" />
      <circle cx="84" cy="32" r="2.6" fill="#3B2E5A" />
      <path d="M92 42 q4 2 6 0" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Level1({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [eaten, setEaten] = useState(false);
  const fishRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const drag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || eaten) return;
        if (overElement(fishRef, catRef, 20)) {
          setEaten(true);
          sfx.pop();
          setTimeout(() => sfx.cheer(), 250);
          onProgress(1);
          setTimeout(onSolved, 700);
        } else if (d.everMoved && (Math.abs(d.x) > 30 || Math.abs(d.y) > 30)) {
          api.reset();
        }
      },
      [solved, eaten, onSolved, onProgress]
    )
  );

  const tapCat = () => {
    if (solved || eaten) return;
    sfx.pop();
    onMistake(
      lang === "fa"
        ? { fa: "گربه ماهی می‌خواهد، نه دست!", en: "The cat wants fish, not your finger!" }
        : { fa: "گربه ماهی می‌خواهد، نه دست!", en: "The cat wants fish, not your finger!" }
    );
  };

  return (
    <Scene bg="linear-gradient(180deg,#FDF3E3 0%,#FBEAD0 62%,#EAD9C0 63%,#E3CFB0 100%)">
      {/* window */}
      <div className="absolute top-[8%] start-[8%] w-[26%] aspect-square rounded-2xl border-4 border-[#3B2E5A] bg-[#BEE9F5] overflow-hidden">
        <div className="absolute top-2 left-2 w-3 h-3 rounded-full bg-[#FFD154]" />
        <div className="absolute inset-x-0 top-1/2 h-1 bg-[#3B2E5A]" />
      </div>

      {/* cat */}
      <div
        ref={catRef}
        onClick={tapCat}
        className={`absolute bottom-[10%] start-[6%] w-[44%] ${eaten ? "" : "cursor-grab"}`}
        style={{ animation: eaten ? "wobble 0.6s ease-in-out" : undefined }}
      >
        <CatSvg happy={eaten} className="w-full h-auto" />
        {eaten && (
          <motion.div
            className="absolute top-0 end-0"
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1.2, y: -18, opacity: [1, 1, 0] }}
            transition={{ duration: 1.2 }}
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8" aria-hidden>
              <path d="M12 21C7 16.5 2 12.8 2 8.5 2 5.5 4.5 3 7.5 3 9.2 3 11 4 12 5.5 13 4 14.8 3 16.5 3 19.5 3 22 5.5 22 8.5c0 4.3-5 8-10 12.5z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="1.5" />
            </svg>
          </motion.div>
        )}
      </div>

      {/* table */}
      <div className="absolute bottom-[8%] end-[4%] w-[46%]">
        <div className="h-3.5 rounded-lg bg-[#8B5E3C] border-[3px] border-[#3B2E5A]" />
        <div className="flex justify-between px-[6%]">
          <div className="w-2.5 h-16 bg-[#8B5E3C] border-x-[3px] border-[#3B2E5A]" />
          <div className="w-2.5 h-16 bg-[#8B5E3C] border-x-[3px] border-[#3B2E5A]" />
        </div>
      </div>

      {/* draggable fish */}
      <div
        ref={fishRef}
        className={`absolute bottom-[34%] end-[12%] w-[34%] ${eaten ? "invisible" : ""}`}
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px) ${drag.dragging ? "scale(1.15) rotate(-6deg)" : ""}`,
          transition: drag.dragging ? "none" : "transform 0.3s ease",
          zIndex: 20,
        }}
      >
        <Pulse active={hintPulse > 0 && !drag.dragging}>
          <div {...drag.bind} className="cursor-grab active:cursor-grabbing">
            <FishSvg className="w-full h-auto drop-shadow-[0_3px_2px_rgba(59,46,90,0.25)]" />
          </div>
        </Pulse>
      </div>
    </Scene>
  );
}
