"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { overElement, useDragMove, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 18 — The cat can't pass the door: drag the key to the lock.   */
/* ------------------------------------------------------------------ */

function KeySvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 100" className={className} aria-hidden>
      {/* paper tag */}
      <path d="M26 52 q-2 12 8 14" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="14" y="64" width="36" height="26" rx="6" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="23" cy="73" r="3" fill="#3B2E5A" />
      {/* bow + shaft */}
      <circle cx="26" cy="34" r="20" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="26" cy="34" r="8" fill="#3B2E5A" />
      <rect x="44" y="27" width="54" height="14" rx="7" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="70" y="39" width="9" height="15" rx="3.5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
      <rect x="86" y="39" width="9" height="11" rx="3.5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
      <path d="M14 24 q8 -8 18 -6" stroke="#FAFAFA" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

function CatSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 150" className={className} aria-hidden>
      {/* tail */}
      <path d="M128 118 Q158 112 152 80" stroke="#3B2E5A" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M128 118 Q158 112 152 80" stroke="#F4A259" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="88" cy="112" rx="44" ry="30" fill="#F4A259" stroke="#3B2E5A" strokeWidth="5" />
      {/* legs: one raised, tapping impatiently */}
      <ellipse cx="66" cy="138" rx="13" ry="8" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="104" cy="128" rx="12" ry="7.5" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4" transform="rotate(-20 104 128)" />
      {/* head */}
      <circle cx="70" cy="58" r="33" fill="#F4A259" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M44 38 L38 14 L62 26 Z" fill="#F4A259" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M96 38 L104 14 L80 26 Z" fill="#F4A259" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M47 32 L44 21 L56 28 Z" fill="#FF6B81" />
      <path d="M93 32 L98 22 L84 28 Z" fill="#FF6B81" />
      <path d="M64 28 Q70 24 76 28 M58 38 Q70 33 82 38" stroke="#D97E32" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* face */}
      <circle cx="58" cy="54" r="6" fill="#3B2E5A" />
      <circle cx="84" cy="54" r="6" fill="#3B2E5A" />
      <circle cx="60" cy="52" r="2" fill="#fff" />
      <circle cx="86" cy="52" r="2" fill="#fff" />
      <circle cx="50" cy="66" r="5" fill="#FF9FB2" opacity="0.9" />
      <circle cx="92" cy="66" r="5" fill="#FF9FB2" opacity="0.9" />
      <path d="M70 62 L73 66 L67 66 Z" fill="#FF6B81" />
      <path d="M66 70 Q71 75 76 70" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M48 60 L32 58 M48 65 L32 70 M94 60 L110 58 M94 65 L110 70" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Level18({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [grabbed, setGrabbed] = useState(false);
  const [inserted, setInserted] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [walking, setWalking] = useState(false);
  const [rattle, setRattle] = useState(false);
  const [done, setDone] = useState(false);
  const keyRef = useRef<HTMLDivElement>(null);
  const keyholeRef = useRef<HTMLDivElement>(null);

  const drag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || inserted) return;
        if (overElement(keyRef, keyholeRef, 25)) {
          api.reset();
          setInserted(true);
          sfx.unlock();
          onProgress(0.7);
          window.setTimeout(() => setDoorOpen(true), 550);
          window.setTimeout(() => setWalking(true), 1500);
          window.setTimeout(() => {
            setDone(true);
            sfx.cheer();
            onProgress(1);
            window.setTimeout(onSolved, 700);
          }, 3950);
        } else if (d.everMoved && (Math.abs(d.x) > 25 || Math.abs(d.y) > 25)) {
          api.reset();
          onMistake({ fa: "کلید باید تو قفل بره!", en: "The key goes into the lock!" });
        } else if (d.everMoved) {
          api.reset();
        }
      },
      [solved, done, inserted, onProgress, onMistake, onSolved]
    )
  );

  const grabKey = (e: React.PointerEvent) => {
    if (solved || done || inserted) return;
    drag.bind.onPointerDown(e);
    if (!grabbed) {
      setGrabbed(true);
      onProgress(0.3);
    }
  };

  const tapDoor = () => {
    if (solved || done || inserted) return;
    setRattle(true);
    window.setTimeout(() => setRattle(false), 560);
    onMistake({ fa: "در قفله!", en: "The door is locked!" });
  };

  return (
    <Scene bg="linear-gradient(180deg,#F3EDFB 0%,#E6DAF5 100%)">
      {/* wooden floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[26%] border-t-4 border-[#3B2E5A]"
        style={{ background: "#D9A05B", backgroundImage: "repeating-linear-gradient(90deg, rgba(139,94,60,0.35) 0 3px, transparent 3px 54px)" }}
        aria-hidden
      />
      {/* rug */}
      <div className="absolute bottom-[3%] left-[7%] w-[30%] h-[12%] rounded-full border-4 border-[#3B2E5A] bg-[#FF6B81] overflow-hidden" aria-hidden>
        <div className="absolute inset-x-[10%] top-[28%] h-[13%] rounded-full bg-[#FFD154]" />
        <div className="absolute inset-x-[10%] bottom-[28%] h-[13%] rounded-full bg-[#FFD154]" />
      </div>
      {/* window */}
      <div className="absolute top-[9%] left-[6%] w-[20%] aspect-square rounded-xl border-4 border-[#3B2E5A] bg-[#BEE9F5] overflow-hidden" aria-hidden>
        <div className="absolute left-[14%] top-[16%] w-[30%] aspect-square rounded-full bg-[#FFD154]" />
        <div className="absolute right-[8%] bottom-[18%] w-[36%] h-[16%] rounded-full bg-white" />
        <div className="absolute inset-x-0 top-1/2 h-1 bg-[#3B2E5A]" />
        <div className="absolute inset-y-0 left-1/2 w-1 bg-[#3B2E5A]" />
      </div>

      {/* wall hook */}
      <svg viewBox="0 0 40 44" className="absolute top-[1.5%] left-[6%] w-[5%]" aria-hidden>
        <circle cx="20" cy="15" r="11" fill="#C7C2D8" stroke="#3B2E5A" strokeWidth="4" />
        <path d="M20 15 v9 q0 7 -8 7" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* the door */}
      <div className="absolute z-[6]" style={{ left: "57%", top: "10%", width: "31%", height: "70%" }}>
        <div className="absolute inset-0 rounded-t-3xl border-4 border-[#3B2E5A]" />
        {/* doorway behind the panel: cat walks through the light */}
        <div
          className="absolute rounded-t-2xl overflow-hidden"
          style={{ left: "6%", right: "6%", top: "4%", bottom: "3%", background: "linear-gradient(180deg, rgba(51,32,94,0.35), rgba(51,32,94,0.12))" }}
          aria-hidden
        >
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(255,209,84,0.75), rgba(255,209,84,0.25) 55%, transparent 80%)", opacity: doorOpen ? 1 : 0, transition: "opacity 0.8s ease" }}
          />
        </div>
        {/* swinging panel */}
        <div
          onClick={tapDoor}
          className={`absolute rounded-t-2xl overflow-hidden border-4 border-[#3B2E5A] ${inserted ? "" : "cursor-pointer"}`}
          style={{
            left: "6%",
            right: "6%",
            top: "4%",
            bottom: "3%",
            background: "#6C4AB6",
            backgroundImage: "repeating-linear-gradient(90deg, rgba(51,32,94,0.25) 0 3px, transparent 3px 26px)",
            transformOrigin: "left center",
            transform: doorOpen ? "perspective(700px) rotateY(-76deg)" : "rotateY(0deg)",
            transition: "transform 0.9s ease-in-out",
            animation: rattle ? "shake-hard 0.5s ease-in-out" : undefined,
          }}
        >
          <div className="absolute left-[12%] right-[12%] top-[8%] h-[32%] rounded-md bg-[#8B72CC] border-[3px] border-[#33205E]" />
          <div className="absolute left-[12%] right-[12%] top-[48%] h-[14%] rounded-md bg-[#8B72CC] border-[3px] border-[#33205E]" />
          {/* handle */}
          <div className="absolute left-[66%] top-[44%] w-[14%] aspect-square rounded-full bg-[#FFD154] border-[3px] border-[#3B2E5A]" aria-hidden />
          {/* golden keyhole below the handle */}
          <div
            ref={keyholeRef}
            className="absolute left-[58%] top-[60%] w-[28%] grid place-items-center rounded-lg bg-[#FFD154] border-[3px] border-[#3B2E5A]"
            style={{ aspectRatio: "3 / 4" }}
            aria-hidden
          >
            <svg viewBox="0 0 20 28" className="w-[42%]" aria-hidden>
              <circle cx="10" cy="9" r="5.5" fill="#3B2E5A" />
              <path d="M7.5 13 L6 24 L14 24 L12.5 13 Z" fill="#3B2E5A" />
            </svg>
          </div>
        </div>
      </div>

      {/* the impatient cat: bobs, then walks through the open door */}
      <motion.div
        className="absolute bottom-[11%] z-[5] w-[30%]"
        initial={{ left: "6%", opacity: 1 }}
        animate={walking ? { left: "55%", opacity: [1, 1, 0] } : { left: "6%", opacity: 1 }}
        transition={walking ? { duration: 2.3, times: [0, 0.62, 1], ease: "easeInOut" } : { duration: 0.2 }}
        aria-label={lang === "fa" ? "گربه بی‌حوصله" : "impatient cat"}
      >
        <div style={{ animation: walking ? "bob 0.4s ease-in-out infinite" : "bob 1.8s ease-in-out infinite" }}>
          <CatSvg className="w-full h-auto drop-shadow-[0_3px_2px_rgba(59,46,90,0.2)]" />
        </div>
      </motion.div>

      {/* the key with its tag, hanging from the hook */}
      <div
        ref={keyRef}
        className="absolute z-[20] w-[19%]"
        style={{
          left: inserted ? "69%" : "3.5%",
          top: inserted ? "47%" : "6%",
          transform: `translate(${drag.x}px, ${drag.y}px)`,
          transition: drag.dragging ? "none" : inserted ? "opacity 0.4s ease" : "transform 0.35s ease",
          opacity: doorOpen ? 0 : 1,
        }}
      >
        <Pulse active={hintPulse > 0 && !inserted && !done}>
          <motion.div
            {...(inserted ? {} : drag.bind)}
            onPointerDown={grabKey}
            animate={{ rotate: inserted ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 180, damping: 15 }}
            className={inserted ? "" : "cursor-grab active:cursor-grabbing"}
            aria-label={lang === "fa" ? "کلید" : "key"}
          >
            <KeySvg className="w-full h-auto drop-shadow-[0_3px_2px_rgba(59,46,90,0.3)]" />
          </motion.div>
        </Pulse>
      </div>
    </Scene>
  );
}
