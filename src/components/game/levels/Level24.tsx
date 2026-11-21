"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Pulse, Scene, sfx, useDragMove } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 24 — Dog vs water bowl: drag the big bowl out of the fence    */
/* gap so the puppy can run through and reach his bone.                */
/* ------------------------------------------------------------------ */

function DogSvg({ happy, className, style }: { happy: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 230 175" className={className} style={style} aria-hidden>
      {/* wagging curled tail */}
      <motion.g
        animate={happy ? { rotate: 0 } : { rotate: [-9, 9] }}
        transition={happy ? { duration: 0.2 } : { duration: 0.4, repeat: Infinity, repeatType: "mirror" }}
        style={{ transformOrigin: "44px 88px" }}
      >
        <path d="M46 92 Q16 84 22 50 Q26 34 44 38" stroke="#3B2E5A" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M46 92 Q19 85 25 53 Q29 40 43 43" stroke="#C98A4B" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M40 42 Q46 36 50 42" stroke="#E3B57E" strokeWidth="6" fill="none" strokeLinecap="round" />
      </motion.g>

      {/* back haunch + back leg */}
      <ellipse cx="74" cy="116" rx="26" ry="22" fill="#B87B3F" stroke="#3B2E5A" strokeWidth="4.5" />
      <rect x="62" y="124" width="16" height="30" rx="8" fill="#B87B3F" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="70" cy="156" rx="14" ry="7" fill="#E3B57E" stroke="#3B2E5A" strokeWidth="3.4" />
      <path d="M64 154 l2 3 M70 155 l2 3" stroke="#3B2E5A" strokeWidth="1.6" strokeLinecap="round" />

      {/* body with chest */}
      <path d="M62 100 Q60 72 96 66 Q136 60 158 76 Q172 88 168 108 Q164 130 132 134 Q92 138 70 126 Q62 118 62 100 Z" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      {/* cream chest + belly */}
      <path d="M132 78 Q152 86 152 104 Q152 122 128 128 Q112 130 104 122 Q112 96 132 78 Z" fill="#E3B57E" />
      {/* body spot */}
      <ellipse cx="92" cy="92" rx="12" ry="9" fill="#8B5E3C" opacity="0.55" />

      {/* front legs with paws */}
      <rect x="128" y="122" width="15" height="30" rx="7.5" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="152" y="118" width="15" height="34" rx="7.5" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="136" cy="154" rx="13" ry="6.5" fill="#E3B57E" stroke="#3B2E5A" strokeWidth="3.4" />
      <ellipse cx="160" cy="154" rx="13" ry="6.5" fill="#E3B57E" stroke="#3B2E5A" strokeWidth="3.4" />
      <path d="M130 152 l2 3 M136 153 l2 3 M142 152 l2 3 M154 152 l2 3 M160 153 l2 3 M166 152 l2 3" stroke="#3B2E5A" strokeWidth="1.6" strokeLinecap="round" />

      {/* head */}
      <circle cx="172" cy="62" r="38" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="5" />
      {/* head top fur tuft */}
      <path d="M162 26 Q172 18 182 26 Q176 30 172 29 Q168 30 162 26 Z" fill="#8B5E3C" />
      {/* left floppy ear (behind) */}
      <path d="M138 34 Q120 40 126 70 Q132 90 150 80 Q156 56 148 36 Z" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* right floppy ear (front, slightly lifted) */}
      <path d="M196 30 Q216 34 212 66 Q208 86 190 78 Q182 52 190 32 Z" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M199 40 Q206 48 202 62" stroke="#6E4526" strokeWidth="2.6" fill="none" strokeLinecap="round" />

      {/* muzzle */}
      <ellipse cx="188" cy="76" rx="22" ry="15" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="199" cy="68" rx="8.5" ry="6.5" fill="#3B2E5A" />
      <circle cx="196.5" cy="65.5" r="2" fill="#FAFAFA" />
      <path d="M188 82 Q188 88 182 88 M188 82 Q188 88 194 88" stroke="#3B2E5A" strokeWidth="2.6" fill="none" strokeLinecap="round" />

      {/* face */}
      {happy ? (
        <>
          <path d="M150 52 Q156 44 163 51" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M169 52 Q175 44 182 51" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M178 80 Q188 88 198 79" stroke="#3B2E5A" strokeWidth="3.6" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="156" cy="52" r="7.5" fill="#3B2E5A" />
          <circle cx="176" cy="52" r="7.5" fill="#3B2E5A" />
          <circle cx="158.8" cy="49.2" r="2.6" fill="#FAFAFA" />
          <circle cx="178.8" cy="49.2" r="2.6" fill="#FAFAFA" />
          <path d="M146 42 Q152 38 158 41 M170 41 Q176 38 182 42" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M180 80 Q188 86 196 79" stroke="#3B2E5A" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          {/* panting tongue */}
          <path d="M184 86 Q184 104 191 104 Q198 104 197 86 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
          <path d="M190 92 L190 99" stroke="#E14B60" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
      {/* blush + collar with tag */}
      <ellipse cx="150" cy="68" rx="6.5" ry="4.5" fill="#FF9FB2" opacity="0.85" />
      <path d="M142 90 Q168 102 194 90" stroke="#FF6B81" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="168" cy="99" r="6" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.6" />
      <circle cx="168" cy="98.4" r="1.8" fill="#FAFAFA" />
    </svg>
  );
}

function BowlSvg({ tilt, className, style }: { tilt: number; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 220 112" className={className} style={style} aria-hidden>
      {/* sloshing water */}
      <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "110px 46px", transition: "transform 0.35s ease" }}>
        <ellipse cx="110" cy="46" rx="84" ry="17" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
        <path d="M38 44 Q70 36 104 44 Q142 52 182 44" stroke="#FAFAFA" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.85" />
      </g>
      <path d="M24 48 Q26 106 110 106 Q194 106 196 48 Z" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M24 48 L196 48" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      <path d="M50 72 Q58 88 76 94" stroke="#FAFAFA" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

function FenceSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 210" className={className} style={style} aria-hidden>
      {[4, 24, 44].map((x) => (
        <rect key={x} x={x} y="6" width="12" height="198" rx="6" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      ))}
      <rect x="0" y="50" width="60" height="13" rx="6" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="0" y="132" width="60" height="13" rx="6" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  );
}

function BoneSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 150 70" className={className} style={style} aria-hidden>
      <g fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5">
        <circle cx="33" cy="27" r="13" />
        <circle cx="33" cy="43" r="13" />
        <circle cx="117" cy="27" r="13" />
        <circle cx="117" cy="43" r="13" />
        <rect x="33" y="27" width="84" height="16" rx="8" />
      </g>
      <path d="M56 35 L94 35" stroke="#E8E2F2" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export default function Level24({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [cleared, setCleared] = useState(false);
  const [dogRun, setDogRun] = useState(false);
  const [munch, setMunch] = useState(false);
  const [bark, setBark] = useState(false);
  const [done, setDone] = useState(false);
  const finishRef = useRef(false);

  const win = () => {
    setDone(true);
    sfx.cheer();
    onProgress(1);
    window.setTimeout(onSolved, 700);
  };

  const bowlDrag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || cleared) return;
        if (Math.hypot(d.x, d.y) >= 55) {
          api.reset();
          setCleared(true);
          sfx.whoosh();
          onProgress(0.5);
          window.setTimeout(() => setDogRun(true), 750);
        } else if (d.everMoved) {
          api.reset();
        }
      },
      [solved, done, cleared, onProgress]
    )
  );

  const tapDog = () => {
    if (solved || done || dogRun) return;
    if (cleared) {
      sfx.pop();
      return;
    }
    setBark(true);
    sfx.boing();
    window.setTimeout(() => setBark(false), 550);
    onMistake({ fa: "اول مانع رو بردار!", en: "Clear the obstacle first!" });
  };

  const tapBone = () => {
    if (solved || done || dogRun) return;
    sfx.pop();
  };

  const dogArrived = () => {
    if (done || finishRef.current) return;
    finishRef.current = true;
    setMunch(true);
    sfx.pop();
    window.setTimeout(() => sfx.pop(), 240);
    window.setTimeout(win, 750);
  };

  return (
    <Scene bg="linear-gradient(180deg,#CDEFF6 0%,#EAF7EC 58%,#E3F2E0 100%)">
      {/* sun + cloud */}
      <div className="absolute end-[7%] top-[5%] h-14 w-14 rounded-full border-4 border-[#3B2E5A] bg-[#FFD154]" style={{ animation: "breathe 3s ease-in-out infinite" }} aria-hidden />
      <div className="absolute start-[10%] top-[8%] h-8 w-24 rounded-full border-4 border-[#3B2E5A] bg-[#FAFAFA] opacity-90" aria-hidden />
      {/* grass */}
      <div className="absolute inset-x-0 bottom-0 h-[30%] border-t-4 border-[#3B2E5A]" style={{ background: "linear-gradient(180deg,#5DBB63 0%,#4CAF50 100%)" }} aria-hidden />

      {/* fence; the gap near the ground is blocked by the bowl */}
      <div className="absolute left-[41%] top-[12%] z-10 h-[48%] w-[15%]" aria-hidden>
        <FenceSvg className="h-full w-full" />
      </div>

      {/* mat + bone */}
      <div className="absolute bottom-[5%] right-[4%] z-20 w-[27%]">
        <div className="rounded-2xl border-4 border-[#3B2E5A] bg-[#FF6B81] px-[8%] py-[6%]">
          <div onClick={tapBone} role="button" aria-label={lang === "fa" ? "استخوان" : "bone"} className={dogRun ? "" : "cursor-pointer"}>
            {munch ? (
              <div className="grid h-8 place-items-center">
                <span className="text-sm font-extrabold text-[#FAFAFA]">{lang === "fa" ? "نوش جان!" : "Yum!"}</span>
              </div>
            ) : (
              <BoneSvg className="h-auto w-full" />
            )}
          </div>
        </div>
      </div>

      {/* the puppy */}
      <motion.div
        onClick={tapDog}
        role="button"
        aria-label={lang === "fa" ? "سگ" : "dog"}
        className={`absolute bottom-[8%] left-[2%] z-20 w-[34%] ${dogRun || munch ? "" : "cursor-pointer"}`}
        animate={dogRun ? { left: ["2%", "58%"], y: [0, -16, 0, -16, 0, -16, 0] } : { left: "2%", y: bark ? [0, -6, 6, -4, 0] : 0 }}
        transition={dogRun ? { duration: 2, ease: "easeInOut" } : { duration: 0.5 }}
        onAnimationComplete={dogRun ? dogArrived : undefined}
      >
        <DogSvg happy={munch} className="h-auto w-full" />
      </motion.div>

      {/* happy hearts while munching */}
      {munch &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="pointer-events-none absolute z-40"
            style={{ left: `${74 + i * 5}%`, bottom: `${26 + (i % 2) * 7}%` }}
            initial={{ opacity: 0, y: 0, scale: 0.4 }}
            animate={{ opacity: [0, 1, 1, 0], y: -46, scale: 1.1 }}
            transition={{ duration: 1.5, delay: i * 0.3 }}
          >
            <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
              <path d="M12 21C7 16.5 2 12.8 2 8.5 2 5.5 4.5 3 7.5 3 9.2 3 11 4 12 5.5 13 4 14.8 3 16.5 3 19.5 3 22 5.5 22 8.5c0 4.3-5 8-10 12.5z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="1.5" />
            </svg>
          </motion.span>
        ))}

      {/* draggable water bowl blocking the gap */}
      <div
        className="absolute z-30 w-[27%]"
        style={{
          left: cleared ? "60%" : "34%",
          bottom: cleared ? "40%" : "21%",
          transform: `translate(${bowlDrag.x}px, ${bowlDrag.y}px)`,
          transition: bowlDrag.dragging
            ? "none"
            : "transform 0.55s cubic-bezier(0.34,1.4,0.64,1), left 0.6s ease, bottom 0.6s ease",
        }}
      >
        <Pulse active={hintPulse > 0 && !cleared && !done}>
          <div
            {...(cleared ? {} : bowlDrag.bind)}
            onClick={() => {
              if (solved || done || cleared) return;
              sfx.pop();
            }}
            className={cleared ? "" : "cursor-grab active:cursor-grabbing"}
          >
            <BowlSvg tilt={bowlDrag.dragging ? -9 : cleared ? -14 : 0} className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.3)]" />
          </div>
        </Pulse>
      </div>
    </Scene>
  );
}
