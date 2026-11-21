"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { overElement, useDragMove, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 22 — Light up the room: bridge the cut wire with the battery, */
/* then flip the wall switch (2 stages).                               */
/* ------------------------------------------------------------------ */

function BedSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 210 110" className={className} aria-hidden>
      <rect x="8" y="12" width="16" height="88" rx="6" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="8" y="50" width="196" height="34" rx="8" fill="#FFE3E9" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="24" y="32" width="46" height="24" rx="8" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M80 50 Q104 42 128 50 Q158 60 204 50 L204 84 L80 84 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="118" cy="64" r="4" fill="#FFD154" />
      <circle cx="148" cy="66" r="4" fill="#FFD154" />
      <circle cx="178" cy="62" r="4" fill="#FFD154" />
      <rect x="184" y="84" width="14" height="16" rx="2" fill="#6E4526" stroke="#3B2E5A" strokeWidth="4.5" />
      <rect x="12" y="84" width="14" height="16" rx="2" fill="#6E4526" stroke="#3B2E5A" strokeWidth="4.5" />
    </svg>
  );
}

function BatterySvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 130 50" className={className} aria-hidden>
      <rect x="6" y="8" width="104" height="34" rx="10" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="110" y="14" width="14" height="22" rx="4" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="54" y="8" width="20" height="34" fill="#6C4AB6" />
      <path d="M92 25 h14 M99 18 v14" stroke="#FAFAFA" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M16 25 h12" stroke="#FAFAFA" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M14 20 q6 -6 14 -4" stroke="#FAFAFA" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

function BulbSvg({ on, className }: { on: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 80 120" className={className} aria-hidden>
      <rect x="30" y="2" width="20" height="16" rx="4" fill="#C7C2D8" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="27" y="18" width="26" height="9" rx="3" fill="#C7C2D8" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="40" cy="64" r="33" fill={on ? "#FFD154" : "#CBC6DE"} stroke="#3B2E5A" strokeWidth="5" />
      <path d="M40 40 v20 M33 46 q7 7 14 0" stroke={on ? "#B67E1F" : "#9A94B8"} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {on && <circle cx="29" cy="54" r="7" fill="#FFF6D8" opacity="0.9" />}
    </svg>
  );
}

function SparkSvg({ className, delay }: { className?: string; delay: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={{ animation: `star-pop 0.8s ease-in-out ${delay} infinite` }} aria-hidden>
      <path d="M12 2 L14 9 L21 9 L15.5 13.5 L17.5 21 L12 16.5 L6.5 21 L8.5 13.5 L3 9 L10 9 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2" />
    </svg>
  );
}

export default function Level22({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [connected, setConnected] = useState(false);
  const [lightsOn, setLightsOn] = useState(false);
  const [flicker, setFlicker] = useState(false);
  const [done, setDone] = useState(false);
  const batteryRef = useRef<HTMLDivElement>(null);
  const gapRef = useRef<HTMLDivElement>(null);

  const drag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || connected) return;
        if (overElement(batteryRef, gapRef, 30)) {
          api.reset();
          setConnected(true);
          sfx.click();
          onProgress(0.5);
        } else if (d.everMoved && (Math.abs(d.x) > 25 || Math.abs(d.y) > 25)) {
          api.reset();
          onMistake({ fa: "باتری باید دو سر سیم رو وصل کنه", en: "The battery must connect the two wire ends" });
        } else if (d.everMoved) {
          api.reset();
        }
      },
      [solved, done, connected, onProgress, onMistake]
    )
  );

  const tapSwitch = () => {
    if (solved || done) return;
    if (!connected) {
      setFlicker(true);
      window.setTimeout(() => setFlicker(false), 900);
      onMistake({ fa: "جریان برق وصل نیست!", en: "The power isn't connected!" });
      return;
    }
    setLightsOn(true);
    setDone(true);
    sfx.chime();
    onProgress(1);
    window.setTimeout(onSolved, 750);
  };

  const batteryHome: React.CSSProperties = connected ? { left: "40.5%", top: "17%" } : { left: "7%", bottom: "8%" };

  return (
    <Scene bg="linear-gradient(180deg,#DCCFF0 0%,#CDBAE8 62%,#D9A05B 63%,#C98D4B 100%)">
      {/* window with night sky */}
      <div className="absolute top-[8%] right-[6%] w-[22%] aspect-[4/5] rounded-xl border-4 border-[#3B2E5A] overflow-hidden bg-[#2A2350]" aria-hidden>
        <div className="absolute right-[14%] top-[10%] w-[36%] aspect-square rounded-full bg-[#FFD154]" />
        <div className="absolute right-[4%] top-[4%] w-[30%] aspect-square rounded-full bg-[#2A2350]" />
        <div className="absolute left-[18%] bottom-[26%] w-[10%] aspect-square rounded-full bg-white" />
        <div className="absolute left-[38%] bottom-[14%] w-[7%] aspect-square rounded-full bg-white/80" />
        <div className="absolute inset-x-0 top-[46%] h-[3px] bg-[#3B2E5A]" />
        <div className="absolute inset-y-0 left-[48%] w-[3px] bg-[#3B2E5A]" />
      </div>

      {/* bed + rug */}
      <div className="absolute bottom-[5%] left-[3%] w-[36%]" aria-hidden>
        <BedSvg className="w-full h-auto" />
      </div>
      <div className="absolute bottom-[3%] left-[40%] w-[24%] h-[9%] rounded-full border-4 border-[#3B2E5A] bg-[#FFD154] overflow-hidden" aria-hidden>
        <div className="absolute inset-x-[12%] top-[30%] h-[14%] rounded-full bg-[#FF6B81]" />
      </div>

      {/* hanging lamp wire with the cut */}
      <div className="absolute left-[47%] top-0 h-[13%] w-1 bg-[#3B2E5A]" aria-hidden />
      <div className="absolute left-[47%] top-[30%] h-[13%] w-1 bg-[#3B2E5A]" aria-hidden />
      {/* invisible drop target for the battery */}
      <div ref={gapRef} className="absolute left-[42%] top-[13%] w-[13%] h-[17%]" aria-hidden />
      {/* solid wire drawn once the battery bridges the gap */}
      <div
        className="absolute left-[47%] top-[12%] h-[19%] w-1 bg-[#3B2E5A]"
        style={{ opacity: connected ? 1 : 0, transition: "opacity 0.25s ease" }}
        aria-hidden
      />
      {/* sparks flickering at the two cut ends */}
      {!connected && (
        <>
          <SparkSvg className="absolute left-[44.5%] top-[10.8%] w-[5%] aspect-square z-[40]" delay="0s" />
          <SparkSvg className="absolute left-[44.5%] top-[28.2%] w-[5%] aspect-square z-[40]" delay="0.4s" />
        </>
      )}

      {/* bulb */}
      <div className="absolute left-[41%] top-[41%] w-[13%]" style={{ animation: flicker ? "breathe 0.35s ease-in-out 2" : undefined }}>
        <div
          className="absolute left-[-60%] top-[-40%] w-[220%] aspect-square rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(255,209,84,0.8), rgba(255,209,84,0.25) 55%, transparent 72%)",
            animation: lightsOn ? "glow 1.8s ease-in-out infinite" : undefined,
            opacity: lightsOn ? 1 : 0,
            transition: "opacity 0.7s ease",
          }}
          aria-hidden
        />
        <BulbSvg on={lightsOn} className="relative w-full h-auto" />
      </div>

      {/* darkness over the whole room, fades away when the light turns on */}
      <motion.div
        className="absolute inset-0 z-[30] pointer-events-none"
        style={{ background: "rgba(30,24,56,0.87)" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: lightsOn ? 0 : 1 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        aria-hidden
      />

      {/* wall switch */}
      <div className="absolute z-[40] right-[7%] top-[38%] w-[15%] min-w-[56px]">
        <Pulse active={hintPulse > 0 && connected && !done}>
          <button
            type="button"
            onClick={tapSwitch}
            aria-label={lang === "fa" ? "کلید چراغ" : "light switch"}
            className="block w-full cursor-pointer rounded-2xl border-4 border-[#3B2E5A] bg-[#FAFAFA] p-[4%] shadow-[0_4px_0_rgba(59,46,90,0.25)]"
          >
            <span
              className={`block w-full aspect-[3/4] rounded-lg border-[3px] border-[#3B2E5A] ${lightsOn ? "bg-[#FFD154]" : "bg-[#6C4AB6]"}`}
              style={{ animation: flicker ? "breathe 0.3s ease-in-out 2" : undefined }}
            />
          </button>
        </Pulse>
      </div>

      {/* the draggable battery */}
      <div
        ref={batteryRef}
        className="absolute z-[40] w-[16%]"
        style={{
          ...batteryHome,
          transform: `translate(${drag.x}px, ${drag.y}px)`,
          transition: drag.dragging ? "none" : connected ? "opacity 0.4s ease" : "transform 0.35s ease",
        }}
      >
        <Pulse active={hintPulse > 0 && !connected && !done}>
          <motion.div
            {...(connected ? {} : drag.bind)}
            animate={{ rotate: connected ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 170, damping: 15 }}
            className={connected ? "" : "cursor-grab active:cursor-grabbing"}
            aria-label={lang === "fa" ? "باتری" : "battery"}
          >
            <BatterySvg className="w-full h-auto drop-shadow-[0_3px_2px_rgba(59,46,90,0.3)]" />
          </motion.div>
        </Pulse>
      </div>
    </Scene>
  );
}
