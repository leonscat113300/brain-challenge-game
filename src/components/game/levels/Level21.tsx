"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";
import { num } from "@/lib/game/utils";

/* ------------------------------------------------------------------ */
/* Level 21 — Which ice cream melts first? The one in direct "sun".    */
/* ------------------------------------------------------------------ */

const DRIPS = [
  { left: "30%", delay: "0s" },
  { left: "48%", delay: "0.3s" },
  { left: "64%", delay: "0.6s" },
];

function ConeSvg({ melted, scoop, className }: { melted: boolean; scoop: string; className?: string }) {
  return (
    <svg viewBox="0 0 100 150" className={className} aria-hidden>
      <path d="M28 84 L50 142 L72 84 Z" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M36 98 L58 96 M40 110 L62 108 M44 122 L64 120" stroke="#B67E3F" strokeWidth="3" strokeLinecap="round" />
      {melted ? (
        <>
          <path d="M22 66 Q24 44 50 44 Q76 44 78 66 Q78 80 62 82 L38 82 Q22 80 22 66 Z" fill={scoop} stroke="#3B2E5A" strokeWidth="5" />
          <path d="M34 82 q-2 12 -8 14 M50 84 q0 12 -6 16 M66 82 q2 10 8 12" stroke={scoop} strokeWidth="7" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <path d="M24 66 Q24 40 50 40 Q76 40 76 66 Q76 84 50 84 Q24 84 24 66 Z" fill={scoop} stroke="#3B2E5A" strokeWidth="5" />
      )}
      <path d="M50 40 Q52 30 62 28" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <circle cx="64" cy="26" r="7" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
      {melted ? (
        <>
          <path d="M38 62 Q43 57 48 62 M56 62 Q61 57 66 62" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="52" cy="72" rx="5" ry="4" fill="#3B2E5A" />
        </>
      ) : (
        <>
          <circle cx="40" cy="62" r="5.5" fill="#3B2E5A" />
          <circle cx="60" cy="62" r="5.5" fill="#3B2E5A" />
          <circle cx="42" cy="60" r="1.8" fill="#fff" />
          <circle cx="62" cy="60" r="1.8" fill="#fff" />
          <path d="M45 72 Q50 77 55 72" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      )}
      <circle cx="32" cy="70" r="4.5" fill="#FF9FB2" opacity="0.9" />
      <circle cx="68" cy="70" r="4.5" fill="#FF9FB2" opacity="0.9" />
    </svg>
  );
}

function SunLampSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 100" className={className} aria-hidden>
      <g stroke="#E8A81C" strokeWidth="6" strokeLinecap="round">
        <path d="M70 4 v12 M30 14 l8 10 M110 14 l-8 10 M12 44 h12 M116 44 h12" />
      </g>
      <path d="M30 66 Q30 34 70 34 Q110 34 110 66 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="70" cy="66" rx="40" ry="8" fill="#FFE99A" stroke="#3B2E5A" strokeWidth="5" />
    </svg>
  );
}

function UmbrellaSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 110" className={className} aria-hidden>
      <path d="M80 10 Q84 4 90 6" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M10 58 Q10 16 80 16 Q150 16 150 58 Q136 46 124 58 Q112 46 100 58 Q90 46 80 58 Q70 46 60 58 Q48 46 36 58 Q24 46 10 58 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M45 26 Q80 12 115 26" stroke="#FAFAFA" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.85" />
      <path d="M80 16 v86" stroke="#3B2E5A" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

function FridgeSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden>
      <rect x="34" y="8" width="80" height="136" rx="10" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="44" y="26" width="60" height="34" rx="4" fill="#DFF3F7" stroke="#3B2E5A" strokeWidth="3" />
      <rect x="44" y="70" width="60" height="34" rx="4" fill="#DFF3F7" stroke="#3B2E5A" strokeWidth="3" />
      <path d="M34 10 L34 142 L6 130 L6 20 Z" fill="#E8E4F2" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <circle cx="29" cy="76" r="4" fill="#3B2E5A" />
    </svg>
  );
}

function BadgeSunSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden>
      <g stroke="#E8A81C" strokeWidth="5" strokeLinecap="round">
        <path d="M40 2 v10 M40 68 v10 M2 40 h10 M68 40 h10 M13 13 l7 7 M60 60 l7 7 M67 13 l-7 7 M20 60 l-7 7" />
      </g>
      <circle cx="40" cy="40" r="22" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="33" cy="36" r="3" fill="#3B2E5A" />
      <circle cx="47" cy="36" r="3" fill="#3B2E5A" />
      <path d="M33 46 Q40 52 47 46" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function ShimmerSvg({ className, delay }: { className?: string; delay: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} style={{ animation: "wobble 1s ease-in-out infinite", animationDelay: delay }} aria-hidden>
      <path d="M16 54 Q10 42 16 30 Q22 18 16 6" stroke="#E8A81C" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M34 56 Q28 44 34 32 Q40 20 34 8" stroke="#E8A81C" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function MistSvg({ className, delay }: { className?: string; delay: string }) {
  return (
    <svg viewBox="0 0 60 70" className={className} style={{ animation: "breathe 1.6s ease-in-out infinite", animationDelay: delay }} aria-hidden>
      <path d="M18 62 Q10 50 18 38 Q26 26 18 14" stroke="#1EC8CF" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M40 64 Q32 52 40 40 Q48 28 40 16" stroke="#7FDFE5" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export default function Level21({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [melting, setMelting] = useState(false);
  const [badge, setBadge] = useState(false);
  const [shakeIdx, setShakeIdx] = useState(-1);
  const [done, setDone] = useState(false);

  const tapCone = (i: number) => {
    if (solved || done || melting) return;
    if (i === 0) {
      setMelting(true);
      sfx.pop();
      window.setTimeout(() => {
        setBadge(true);
        setDone(true);
        sfx.cheer();
        onProgress(1);
        window.setTimeout(onSolved, 700);
      }, 1600);
    } else {
      setShakeIdx(i);
      window.setTimeout(() => setShakeIdx(-1), 560);
      onMistake({ fa: "اون زیر نور مستقیم نیست!", en: "That one isn't in direct sun!" });
    }
  };

  const cones = [
    { scoop: "#FF8FAB", left: "4%" },
    { scoop: "#FFF3D6", left: "27%" },
    { scoop: "#A8E6CF", left: "50%" },
  ];

  return (
    <Scene bg="linear-gradient(180deg,#FFF7EA 0%,#FFEFD6 86%,#E7C9A0 87%,#DBBB92 100%)">
      {/* sun lamp above cone A */}
      <div className="absolute top-[4%] left-[1%] w-[24%]" aria-hidden>
        <div
          className="absolute inset-[-35%]"
          style={{ background: "radial-gradient(circle, rgba(255,209,84,0.5), transparent 68%)", animation: "glow 1.8s ease-in-out infinite" }}
        />
        <SunLampSvg className="relative w-full h-auto" />
      </div>
      <div className="absolute top-[24%] bottom-[4%] left-[11.5%] w-[1.6%] bg-[#8B5E3C] border-x-[3px] border-[#3B2E5A]" aria-hidden />
      {/* heat shimmer over cone A */}
      <ShimmerSvg className="absolute top-[29%] left-[6%] w-[13%]" delay="0s" />
      <ShimmerSvg className="absolute top-[30%] left-[13%] w-[10%]" delay="0.4s" />

      {/* patio umbrella shading cone B */}
      <UmbrellaSvg className="absolute top-[5%] left-[19%] w-[32%]" />
      <div className="absolute top-[27%] bottom-[4%] left-[34.4%] w-[1.6%] bg-[#3B2E5A] rounded-full" aria-hidden />

      {/* mini fridge with open door beside cone C */}
      <FridgeSvg className="absolute bottom-[5%] left-[70%] w-[22%]" />
      <MistSvg className="absolute bottom-[30%] left-[66%] w-[15%]" delay="0s" />
      <MistSvg className="absolute bottom-[28%] left-[73%] w-[12%]" delay="0.5s" />

      {/* wooden stand */}
      <div className="absolute bottom-[22%] left-[2%] w-[66%] h-[4.5%] rounded-lg bg-[#8B5E3C] border-4 border-[#3B2E5A]" aria-hidden />
      <div className="absolute bottom-0 left-[6%] w-[3%] h-[22%] bg-[#8B5E3C] border-x-4 border-[#3B2E5A]" aria-hidden />
      <div className="absolute bottom-0 left-[60%] w-[3%] h-[22%] bg-[#8B5E3C] border-x-4 border-[#3B2E5A]" aria-hidden />

      {/* the three cones */}
      {cones.map((c, i) => (
        <div key={c.scoop} className="absolute bottom-[26%] w-[17%]" style={{ left: c.left }}>
          <Pulse active={hintPulse > 0 && i === 0 && !done}>
            <button
              type="button"
              onClick={() => tapCone(i)}
              aria-label={lang === "fa" ? `بستنی ${num(i + 1, lang)}` : `ice cream ${i + 1}`}
              className={`relative block w-full ${melting && i === 0 ? "" : "cursor-pointer"}`}
              style={{ animation: shakeIdx === i ? "shake-hard 0.5s ease-in-out" : undefined }}
            >
              <ConeSvg melted={i === 0 && melting} scoop={c.scoop} className={`w-full h-auto ${i === 0 ? "drop-shadow-[0_3px_2px_rgba(59,46,90,0.2)]" : ""}`} />
              {i === 0 && melting &&
                DRIPS.map((d) => (
                  <span
                    key={d.left}
                    className="absolute top-[48%] w-[10%] aspect-square rounded-full"
                    style={{ left: d.left, background: c.scoop, border: "2px solid #3B2E5A", animation: "drop-fall 1s ease-in infinite", animationDelay: d.delay }}
                    aria-hidden
                  />
                ))}
            </button>
          </Pulse>
        </div>
      ))}

      {/* sun badge pops over the melting cone */}
      <motion.div
        className="absolute top-[34%] left-[7%] w-[14%] z-[20] pointer-events-none"
        initial={false}
        animate={badge ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -40 }}
        transition={{ type: "spring", stiffness: 260, damping: 15 }}
        aria-hidden
      >
        <BadgeSunSvg className="w-full h-auto" />
      </motion.div>
    </Scene>
  );
}
