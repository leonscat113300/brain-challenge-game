"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 47 — Help the mouse get the cheese: first drag the sausage to */
/* the sleeping cat to distract it, then drag the cheese to the hole.  */
/* ------------------------------------------------------------------ */

function CatSvg({ mode, className, style }: { mode: "sleep" | "alert" | "munch"; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 290 155" className={className} style={style} aria-hidden>
      {/* tail */}
      <path d="M238 108 Q276 98 268 60" stroke="#3B2E5A" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M238 108 Q276 98 268 60" stroke="#E8A165" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="152" cy="108" rx="88" ry="37" fill="#E8A165" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="152" cy="120" rx="60" ry="19" fill="#FFD9A8" />
      <path d="M122 78 Q128 92 122 104 M152 74 Q158 90 152 104 M182 78 Q188 92 182 104" stroke="#C77E3D" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* ears */}
      <path d="M40 50 L34 22 L60 38 Z" fill="#E8A165" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M94 50 L100 22 L74 38 Z" fill="#E8A165" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M44 42 L41 30 L54 38 Z M92 42 L95 30 L82 38 Z" fill="#FF6B81" />
      <circle cx="67" cy="78" r="37" fill="#E8A165" stroke="#3B2E5A" strokeWidth="5" />
      {mode === "alert" ? (
        <g>
          <circle cx="52" cy="72" r="8" fill="#3B2E5A" />
          <circle cx="84" cy="72" r="8" fill="#3B2E5A" />
          <circle cx="54.5" cy="69.5" r="2.6" fill="#FAFAFA" />
          <circle cx="86.5" cy="69.5" r="2.6" fill="#FAFAFA" />
          <path d="M44 60 L54 63 M96 60 L86 63" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="68" cy="92" rx="8" ry="6" fill="#3B2E5A" />
        </g>
      ) : (
        <g>
          <path d="M46 74 Q52 81 58 74 M78 74 Q84 81 90 74" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          {mode === "munch" ? <ellipse cx="68" cy="93" rx="7" ry="5" fill="#3B2E5A" /> : <path d="M62 90 Q68 95 74 90" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />}
        </g>
      )}
      <path d="M65 82 L68 86 L71 82" stroke="#FF6B81" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M37 88 a7 4 0 1 0 14 0 a7 4 0 1 0 -14 0 M85 88 a7 4 0 1 0 14 0 a7 4 0 1 0 -14 0" fill="#FF9FB2" opacity="0.7" />
      <path d="M40 86 L24 82 M40 92 L24 96 M94 86 L110 82 M94 92 L110 96" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="122" cy="140" rx="17" ry="9" fill="#FFD9A8" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="184" cy="140" rx="17" ry="9" fill="#FFD9A8" stroke="#3B2E5A" strokeWidth="4" />
      {mode === "munch" && (
        <g>
          <rect x="84" y="106" width="58" height="20" rx="10" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
          <path d="M96 112 Q106 108 118 112" stroke="#C2445C" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <ellipse cx="122" cy="138" rx="17" ry="9" fill="#FFD9A8" stroke="#3B2E5A" strokeWidth="4" />
        </g>
      )}
    </svg>
  );
}

function MouseSvg({ happy, className, style }: { happy: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 110 100" className={className} style={style} aria-hidden>
      <circle cx="30" cy="30" r="17" fill="#C7C3D4" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="82" cy="30" r="17" fill="#C7C3D4" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M22 30 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M74 30 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0" fill="#FF9FB2" />
      <circle cx="56" cy="56" r="34" fill="#C7C3D4" stroke="#3B2E5A" strokeWidth="4.5" />
      {happy ? (
        <path d="M40 50 Q46 43 52 50 M62 50 Q68 43 74 50" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      ) : (
        <g>
          <circle cx="46" cy="50" r="5.5" fill="#3B2E5A" />
          <circle cx="68" cy="50" r="5.5" fill="#3B2E5A" />
          <path d="M46 48 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0 M68 48 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0" fill="#FAFAFA" />
        </g>
      )}
      <ellipse cx="56" cy="62" rx="7" ry="5" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.5" />
      <path d="M50 72 Q56 77 62 72" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <path d="M34 62 L18 58 M34 68 L18 72 M78 62 L94 58 M78 68 L94 72" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CheeseSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 150 95" className={className} style={style} aria-hidden>
      <path d="M10 78 L138 78 L138 22 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M10 78 L138 22" stroke="#E8A81C" strokeWidth="4" strokeLinecap="round" />
      <path d="M89 62 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0 M116 46 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0 M116 68 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0" fill="#E8A81C" />
    </svg>
  );
}

function SausageSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 170 100" className={className} style={style} aria-hidden>
      <ellipse cx="85" cy="76" rx="70" ry="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="85" cy="72" rx="52" ry="8" fill="#EFF7F8" />
      <rect x="26" y="38" width="118" height="28" rx="14" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" transform="rotate(-6 85 52)" />
      <path d="M46 46 Q66 40 88 44" stroke="#C2445C" strokeWidth="4" fill="none" strokeLinecap="round" transform="rotate(-6 85 52)" />
      <path d="M26 52 L16 46 M144 50 L154 44" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function HeartSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 21C7 16.5 2 12.8 2 8.5 2 5.5 4.5 3 7.5 3 9.2 3 11 4 12 5.5 13 4 14.8 3 16.5 3 19.5 3 22 5.5 22 8.5c0 4.3-5 8-10 12.5z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="1.5" />
    </svg>
  );
}

export default function Level47({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [distracted, setDistracted] = useState(false);
  const [fed, setFed] = useState(false);
  const [done, setDone] = useState(false);
  const [pounceCount, setPounceCount] = useState(0);
  const [wiggleKey, setWiggleKey] = useState(0);
  const sausageRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const cheeseRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef<HTMLDivElement>(null);

  const sausageDrag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || distracted) return;
        if (overElement(sausageRef, catRef, 35)) {
          setDistracted(true);
          sfx.coin();
          onProgress(0.5);
        } else if (d.everMoved) {
          api.reset();
        }
      },
      [solved, done, distracted, onProgress]
    )
  );

  /* stage 2: cheese -> mouse hole; the cat pounces if you try too early */
  const cheeseDrag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || fed) return;
        if (!distracted) {
          const dist = Math.hypot(d.x, d.y);
          if (dist > 30) {
            setPounceCount((c) => c + 1);
            api.reset();
            onMistake({ fa: "گربه بیداره! اول حواسشو پرت کن", en: "The cat is awake! Distract it first" });
          } else if (d.everMoved && dist > 8) {
            sfx.pop();
            setWiggleKey((k) => k + 1);
            api.reset();
          }
          return;
        }
        if (overElement(cheeseRef, mouseRef, 35)) {
          setFed(true);
          setDone(true);
          sfx.sparkle();
          window.setTimeout(() => sfx.cheer(), 380);
          onProgress(1);
          window.setTimeout(onSolved, 1150);
        } else if (d.everMoved) {
          api.reset();
        }
      },
      [solved, done, fed, distracted, onMistake, onProgress, onSolved]
    )
  );

  const tapCat = () => {
    if (solved || done) return;
    sfx.pop();
  };

  const catMode: "sleep" | "alert" | "munch" = distracted ? "munch" : pounceCount > 0 ? "alert" : "sleep";
  const pounceX = lang === "fa" ? -80 : 80;

  return (
    <Scene bg="linear-gradient(180deg,#F2F7F9 0%,#EAF1F4 66%,#E4EDF0 100%)">
      <div
        className="absolute inset-x-0 top-0 h-[66%]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(59,46,90,0.06) 0 2px, transparent 2px 36px), repeating-linear-gradient(90deg, rgba(59,46,90,0.06) 0 2px, transparent 2px 36px)",
        }}
        aria-hidden
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[34%] border-t-4 border-[#3B2E5A]"
        style={{ background: "repeating-conic-gradient(#F6ECDA 0% 25%, #E4D2B6 0% 50%)", backgroundSize: "54px 54px" }}
        aria-hidden
      />
      {/* mouse hole (drop target for the cheese) */}
      <div ref={mouseRef} className="absolute bottom-[5%] start-[2%] w-[20%] z-[12]">
        <div className="relative w-full aspect-[5/4] rounded-t-[999px] bg-[#33205E] border-4 border-b-0 border-[#3B2E5A]">
          <MouseSvg happy={fed} className="absolute bottom-[2%] start-[14%] w-[64%]" />
        </div>
        {fed && (
          <div className="pointer-events-none absolute -top-10 inset-x-0 h-12" aria-hidden>
            {[0, 1, 2].map((i) => (
              <HeartSvg key={i} className="absolute w-6 h-6" style={{ left: `${12 + i * 28}%`, animation: `float-up 1.1s ease-out ${i * 0.18}s both` }} />
            ))}
          </div>
        )}
      </div>
      {/* sleeping / distracted cat across the path */}
      <div ref={catRef} className="absolute bottom-[26%] start-[33%] w-[46%] z-20">
        <motion.div key={pounceCount} animate={pounceCount > 0 ? { x: [0, pounceX, pounceX, 0], y: [0, -44, 0, 0] } : undefined} transition={{ duration: 0.7, ease: "easeOut" }}>
          <motion.div animate={{ rotate: distracted ? 160 : 0 }} transition={{ type: "spring", stiffness: 150, damping: 13 }}>
            <button type="button" aria-label={lang === "fa" ? "گربه" : "cat"} onClick={tapCat} className="relative block w-full cursor-default">
              <div style={{ animation: catMode === "munch" ? "bob 0.45s ease-in-out infinite" : undefined }}>
                <CatSvg mode={catMode} className="w-full h-auto drop-shadow-[0_5px_4px_rgba(59,46,90,0.22)]" />
              </div>
            </button>
            {catMode === "sleep" && (
              <div className="pointer-events-none absolute -top-4 end-[16%] w-16 h-16" aria-hidden>
                {["Z", "Z", "Z"].map((z, i) => (
                  <span key={i} className="absolute font-black text-[#6C4AB6] text-xl" style={{ left: i * 17, bottom: i * 6, animation: `float-up 1.9s ease-in-out ${i * 0.55}s infinite` }}>{z}</span>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
      {/* cheese (draggable once the cat is distracted) */}
      <div
        ref={cheeseRef}
        className={`absolute bottom-[9%] end-[6%] w-[22%] z-30 ${fed ? "" : distracted ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
        style={{
          transform: fed ? undefined : `translate(${cheeseDrag.x}px, ${cheeseDrag.y}px)${cheeseDrag.dragging ? " scale(1.12)" : ""}`,
          transition: cheeseDrag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.3,0.64,1)",
        }}
      >
        <Pulse active={hintPulse > 0 && distracted && !fed && !done}>
          <div {...(fed || done || solved ? {} : cheeseDrag.bind)} className="min-w-[48px] min-h-[44px]" style={{ animation: wiggleKey > 0 && !distracted ? "wobble 0.45s ease" : undefined }}>
            <motion.div animate={fed ? { x: lang === "fa" ? "320%" : "-320%", y: "-14%", scale: 0.4, opacity: 0 } : { x: 0, y: 0, scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: "easeIn" }}>
              <CheeseSvg className="w-full h-auto drop-shadow-[0_3px_2px_rgba(59,46,90,0.25)]" />
            </motion.div>
          </div>
        </Pulse>
      </div>
      {/* sausage on a plate (stage 1 bait) */}
      <div
        ref={sausageRef}
        className={`absolute bottom-[3%] start-[38%] w-[24%] z-30 ${distracted ? "invisible" : "cursor-grab active:cursor-grabbing"}`}
        style={{
          transform: `translate(${sausageDrag.x}px, ${sausageDrag.y}px)${sausageDrag.dragging ? " scale(1.1) rotate(-8deg)" : ""}`,
          transition: sausageDrag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.3,0.64,1)",
        }}
      >
        <Pulse active={hintPulse > 0 && !distracted && !done}>
          <div {...(distracted || done || solved ? {} : sausageDrag.bind)} className="min-w-[52px] min-h-[44px]">
            <SausageSvg className="w-full h-auto drop-shadow-[0_3px_2px_rgba(59,46,90,0.25)]" />
          </div>
        </Pulse>
      </div>
    </Scene>
  );
}
