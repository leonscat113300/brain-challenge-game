"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { DragState } from "./shared";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { LevelProps } from "@/lib/game/types";

/* ------------------------------------------------------------------ */
/* Level 30 — Escape the rain: carry the cloud ALL the way across to   */
/* the kid's side; a short drag springs it back home.                  */
/* ------------------------------------------------------------------ */

const DROPS = [
  { x: 8, delay: 0 }, { x: 24, delay: 0.22 }, { x: 40, delay: 0.44 },
  { x: 56, delay: 0.12 }, { x: 72, delay: 0.34 }, { x: 88, delay: 0.55 },
];

function CloudSvg({ happy, className, style }: { happy: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 260 170" className={className} style={style} aria-hidden>
      <path
        d="M62 128 a36 36 0 0 1 4 -71 a46 46 0 0 1 86 -18 a40 40 0 0 1 58 34 a32 32 0 0 1 -10 55 Z"
        fill="#9BA8C9"
        stroke="#3B2E5A"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <path d="M88 52 a30 30 0 0 1 44 -14" stroke="#7F8CAB" strokeWidth="6" fill="none" strokeLinecap="round" />
      {happy ? (
        <>
          <path d="M96 92 q8 8 16 0 M148 92 q8 8 16 0" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M110 112 q20 14 40 0" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="92" cy="106" rx="7" ry="5" fill="#FF9FB2" />
          <ellipse cx="168" cy="106" rx="7" ry="5" fill="#FF9FB2" />
        </>
      ) : (
        <>
          <circle cx="104" cy="94" r="6" fill="#3B2E5A" />
          <circle cx="106" cy="92" r="2" fill="#FAFAFA" />
          <circle cx="156" cy="94" r="6" fill="#3B2E5A" />
          <circle cx="158" cy="92" r="2" fill="#FAFAFA" />
          <path d="M112 118 q18 -8 36 0" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function KidSvg({ happy, className, style }: { happy: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 230" className={className} style={style} aria-hidden>
      {/* tiny broken umbrella */}
      <g transform="rotate(-15 62 70)">
        <path d="M16 72 Q62 20 108 72 Q85 62 62 72 Q39 62 16 72 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M104 66 L118 88" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
        <path d="M62 72 L62 118" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
        <path d="M62 118 q0 12 -12 12" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      {/* head */}
      <circle cx="104" cy="92" r="32" fill="#F7CFA0" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M76 80 Q104 56 132 80 Q118 70 104 72 Q90 70 76 80 Z" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      {happy ? (
        <>
          <path d="M86 88 q7 7 14 0 M108 88 q7 7 14 0" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          <path d="M94 104 q10 10 20 0" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="93" cy="88" r="5" fill="#3B2E5A" />
          <circle cx="95" cy="86" r="1.7" fill="#FAFAFA" />
          <circle cx="115" cy="88" r="5" fill="#3B2E5A" />
          <circle cx="117" cy="86" r="1.7" fill="#FAFAFA" />
          <path d="M98 108 q6 -6 12 0" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        </>
      )}
      <ellipse cx="86" cy="100" rx="5" ry="3.5" fill="#FF9FB2" />
      <ellipse cx="122" cy="100" rx="5" ry="3.5" fill="#FF9FB2" />
      {/* body + limbs */}
      <rect x="84" y="126" width="40" height="54" rx="14" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M84 140 L66 158 M124 140 L142 156" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      <path d="M92 180 L92 200 M112 180 L112 200" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="95" cy="206" rx="12" ry="7" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="113" cy="206" rx="12" ry="7" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  );
}

function RainbowSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 105" className={className} style={style} aria-hidden>
      <path d="M12 100 A88 88 0 0 1 188 100" stroke="#FF6B81" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M28 100 A72 72 0 0 1 172 100" stroke="#FFD154" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M44 100 A56 56 0 0 1 156 100" stroke="#4CAF50" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M60 100 A40 40 0 0 1 140 100" stroke="#1EC8CF" strokeWidth="11" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Level30({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [parked, setParked] = useState(false);
  const [done, setDone] = useState(false);
  const cloudRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const homeRef = useRef<{ x: number; y: number } | null>(null);
  const lastProgRef = useRef(0);

  const cloudDrag = useDragMove(
    useCallback(
      (d: DragState, api) => {
        if (solved || done || parked) return;
        const dist = Math.hypot(d.x, d.y);
        if (dist < 10) {
          sfx.pop();
          return;
        }
        if (overElement(cloudRef, zoneRef, 40)) {
          setParked(true);
          sfx.sparkle();
          onProgress(0.7);
          setTimeout(() => {
            setDone(true);
            sfx.cheer();
            onProgress(1);
            setTimeout(onSolved, 700);
          }, 900);
        } else {
          api.reset();
          if (dist > 40) onMistake({ fa: "تا آن طرف صفحه ببرش!", en: "Carry it all the way across!" });
        }
      },
      [solved, done, parked, onProgress, onSolved, onMistake]
    )
  );

  /* remember where the cloud started (before any drag) */
  useEffect(() => {
    if (homeRef.current) return;
    const r = cloudRef.current?.getBoundingClientRect();
    if (r) homeRef.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  /* live progress: fraction of the journey across the screen */
  useEffect(() => {
    if (solved || done || parked || !cloudDrag.dragging) return;
    const r = cloudRef.current?.getBoundingClientRect();
    const z = zoneRef.current?.getBoundingClientRect();
    const home = homeRef.current;
    if (!r || !z || !home) return;
    const cx = r.left + r.width / 2;
    const span = Math.max(1, Math.abs(z.left + z.width / 2 - home.x));
    const frac = Math.min(1, Math.abs(cx - home.x) / span);
    if (frac - lastProgRef.current >= 0.12) {
      lastProgRef.current = frac;
      onProgress(frac * 0.7);
    }
  }, [cloudDrag.x, cloudDrag.y, cloudDrag.dragging, solved, done, parked, onProgress]);

  const tapKid = () => {
    if (solved || done || parked) return;
    sfx.pop();
  };

  return (
    <Scene bg="linear-gradient(180deg,#DCEBF5 0%,#EFF3F8 70%,#DDE6F2 100%)">
      {/* invisible target zone on the kid's side */}
      <div ref={zoneRef} aria-hidden className="pointer-events-none absolute end-0 top-0 h-[50%] w-[40%]" />

      {/* rainbow appears once the rain stops */}
      <div
        className="absolute end-[2%] top-[14%] w-[44%] z-[6]"
        style={{
          opacity: parked ? 1 : 0,
          transform: parked ? "translateY(0) scale(1)" : "translateY(14px) scale(0.8)",
          transition: "opacity 0.7s ease 0.25s, transform 0.7s ease 0.25s",
        }}
        aria-hidden
      >
        <RainbowSvg className="w-full h-auto" />
      </div>

      {/* sun peeks back out of the corner the cloud left */}
      <div
        className="absolute top-[1%] start-[1%] w-[16%] z-[7]"
        style={{
          opacity: parked ? 1 : 0,
          transform: parked ? "translate(0,0) scale(1)" : "translate(-70%,-70%) scale(0.6)",
          transition: "opacity 0.6s ease, transform 0.8s cubic-bezier(0.34,1.3,0.64,1)",
        }}
        aria-hidden
      >
        <svg viewBox="0 0 100 100" className="w-full h-auto">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="50" y1="8" x2="50" y2="20" stroke="#FFD154" strokeWidth="6" strokeLinecap="round" transform={`rotate(${a} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="26" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
        </svg>
      </div>

      {/* wet ground */}
      <div className="absolute inset-x-0 bottom-0 h-[13%] border-t-4 border-[#3B2E5A] bg-[#B9C4DE]" aria-hidden />

      {/* puddles fade away when the sun returns */}
      <div
        className="absolute bottom-[6%] end-[8%] flex w-[30%] gap-[8%] z-[9]"
        style={{
          opacity: parked ? 0 : 1,
          transform: parked ? "scale(0.5)" : "scale(1)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
        aria-hidden
      >
        <div className="h-3 w-1/2 rounded-full bg-[#8FA0C4]/80" />
        <div className="h-3 w-1/3 rounded-full bg-[#8FA0C4]/80" />
      </div>

      {/* the kid with the broken umbrella */}
      <div
        className="absolute bottom-[9%] end-[5%] w-[32%] z-[10] cursor-pointer"
        onClick={tapKid}
        role="button"
        aria-label={lang === "fa" ? "کودک" : "kid"}
      >
        <div style={{ animation: parked ? "bob 0.9s ease-in-out infinite" : undefined }}>
          <KidSvg happy={parked} className="w-full h-auto drop-shadow-[0_3px_2px_rgba(59,46,90,0.2)]" />
        </div>
      </div>

      {/* draggable rain cloud (rain follows it) */}
      <div
        ref={cloudRef}
        className="absolute top-[6%] start-[4%] w-[36%] z-[20]"
        style={{
          transform: `translate(${cloudDrag.x}px, ${cloudDrag.y}px)${cloudDrag.dragging ? " scale(1.06)" : ""}`,
          transition: cloudDrag.dragging ? "none" : "transform 0.55s cubic-bezier(0.34,1.3,0.64,1)",
        }}
      >
        <div
          className="pointer-events-none absolute start-[15%] top-[92%] h-[110%] w-[70%]"
          style={{ opacity: parked ? 0 : 1, transition: "opacity 0.4s ease" }}
          aria-hidden
        >
          {DROPS.map((d, i) => (
            <div
              key={i}
              className="absolute top-0 h-7 w-2 rounded-[40%] bg-[#1EC8CF]/85"
              style={{ left: `${d.x}%`, animation: parked ? undefined : `drop-fall 0.9s linear ${d.delay}s infinite` }}
            />
          ))}
        </div>
        <Pulse active={hintPulse > 0 && !parked && !done}>
          <div {...(parked || solved || done ? {} : cloudDrag.bind)} className="cursor-grab active:cursor-grabbing">
            <CloudSvg happy={parked} className="w-full h-auto drop-shadow-[0_3px_3px_rgba(59,46,90,0.25)]" />
          </div>
        </Pulse>
      </div>
    </Scene>
  );
}
