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
    <svg viewBox="0 0 210 160" className={className} style={style} aria-hidden>
      {/* wagging tail */}
      <motion.g
        animate={happy ? { rotate: 0 } : { rotate: [-10, 10] }}
        transition={happy ? { duration: 0.2 } : { duration: 0.4, repeat: Infinity, repeatType: "mirror" }}
        style={{ transformOrigin: "48px 92px" }}
      >
        <path d="M52 96 Q22 84 28 52" stroke="#3B2E5A" strokeWidth="13" fill="none" strokeLinecap="round" />
        <path d="M52 96 Q24 85 30 56" stroke="#C98A4B" strokeWidth="7" fill="none" strokeLinecap="round" />
      </motion.g>
      {/* back leg */}
      <rect x="58" y="118" width="15" height="34" rx="7" fill="#B87B3F" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="66" cy="152" rx="13" ry="6" fill="#B87B3F" stroke="#3B2E5A" strokeWidth="3.4" />
      {/* body */}
      <ellipse cx="102" cy="102" rx="52" ry="34" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="5" />
      {/* belly patch */}
      <ellipse cx="106" cy="114" rx="34" ry="17" fill="#E3B57E" />
      {/* front legs */}
      <rect x="116" y="122" width="15" height="30" rx="7" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="140" y="120" width="15" height="32" rx="7" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="124" cy="152" rx="13" ry="6" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="3.4" />
      <ellipse cx="148" cy="152" rx="13" ry="6" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="3.4" />
      {/* head */}
      <circle cx="160" cy="60" r="36" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="5" />
      {/* floppy ear */}
      <path d="M148 28 Q128 32 132 64 Q140 84 156 74 Q162 52 156 30 Z" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      {/* snout */}
      <ellipse cx="184" cy="72" rx="19" ry="13" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="196" cy="66" rx="6" ry="4.6" fill="#3B2E5A" />
      {/* face */}
      {happy ? (
        <>
          <path d="M144 50 Q150 44 156 50" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M164 50 Q170 44 176 50" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M176 76 Q184 82 192 75" stroke="#3B2E5A" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="148" cy="52" r="7" fill="#3B2E5A" />
          <circle cx="170" cy="52" r="7" fill="#3B2E5A" />
          <circle cx="150.5" cy="49.5" r="2.4" fill="#FAFAFA" />
          <circle cx="172.5" cy="49.5" r="2.4" fill="#FAFAFA" />
          <path d="M178 76 Q184 80 190 76" stroke="#3B2E5A" strokeWidth="3.4" fill="none" strokeLinecap="round" />
          {/* panting tongue */}
          <path d="M180 82 Q180 100 187 100 Q194 100 193 82 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
          <path d="M186 88 L186 96" stroke="#E14B60" strokeWidth="2.4" strokeLinecap="round" />
        </>
      )}
      {/* blush + collar with tag */}
      <ellipse cx="146" cy="66" rx="6" ry="4" fill="#FF9FB2" opacity="0.85" />
      <path d="M134 86 Q158 100 180 88" stroke="#FF6B81" strokeWidth="7" fill="none" strokeLinecap="round" />
      <circle cx="157" cy="96" r="5.5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" />
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
