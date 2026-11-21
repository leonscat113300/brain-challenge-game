"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 20 — Help the bird fly: drag the heavy branch off its wing.   */
/* ------------------------------------------------------------------ */

function BirdSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 130" className={className} aria-hidden>
      {/* tail feathers */}
      <path d="M30 96 L4 84 L12 100 L4 112 L32 106 Z" fill="#E14B60" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      {/* body */}
      <ellipse cx="78" cy="78" rx="44" ry="38" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" />
      {/* belly */}
      <ellipse cx="88" cy="92" rx="26" ry="19" fill="#FFE3E9" />
      {/* feet */}
      <path d="M64 114 v9 M80 116 v7" stroke="#3B2E5A" strokeWidth="4.5" strokeLinecap="round" />
      {/* crest */}
      <path d="M98 40 q10 -14 22 -10 q-6 8 -4 14" fill="#E14B60" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      {/* hopeful eyes */}
      <circle cx="94" cy="56" r="10" fill="#fff" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="96" cy="52" r="5" fill="#3B2E5A" />
      <circle cx="98" cy="50" r="1.8" fill="#fff" />
      <circle cx="118" cy="56" r="10" fill="#fff" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="120" cy="52" r="5" fill="#3B2E5A" />
      <circle cx="122" cy="50" r="1.8" fill="#fff" />
      {/* beak + cheek */}
      <path d="M104 68 L126 73 L104 80 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="86" cy="72" r="5" fill="#FF9FB2" opacity="0.9" />
    </svg>
  );
}

function WingSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 44" className={className} aria-hidden>
      <path d="M6 34 Q4 12 26 8 Q66 4 84 16 Q64 26 52 26 Q34 40 6 34 Z" fill="#E14B60" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M20 20 Q40 12 62 16" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function BranchSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 90" className={className} aria-hidden>
      <path d="M8 62 Q60 44 110 46 Q170 48 212 34" stroke="#3B2E5A" strokeWidth="22" fill="none" strokeLinecap="round" />
      <path d="M8 62 Q60 44 110 46 Q170 48 212 34" stroke="#8B5E3C" strokeWidth="14" fill="none" strokeLinecap="round" />
      <path d="M40 54 Q70 48 96 50" stroke="#6E4526" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7" />
      <ellipse cx="52" cy="32" rx="16" ry="9" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" transform="rotate(-18 52 32)" />
      <ellipse cx="92" cy="24" rx="17" ry="10" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" transform="rotate(-10 92 24)" />
      <ellipse cx="140" cy="28" rx="16" ry="9" fill="#66BB6A" stroke="#3B2E5A" strokeWidth="4" transform="rotate(12 140 28)" />
      <ellipse cx="182" cy="16" rx="15" ry="9" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" transform="rotate(-14 182 16)" />
      <ellipse cx="120" cy="58" rx="14" ry="8" fill="#66BB6A" stroke="#3B2E5A" strokeWidth="4" transform="rotate(16 120 58)" />
    </svg>
  );
}

function StumpSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 110" className={className} aria-hidden>
      <path d="M24 30 L24 92 Q24 100 32 100 L108 100 Q116 100 116 92 L116 30 Z" fill="#8B5E3C" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="70" cy="30" rx="46" ry="16" fill="#D9A05B" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="70" cy="30" rx="28" ry="9" fill="none" stroke="#B67E3F" strokeWidth="3.5" />
      <ellipse cx="70" cy="30" rx="12" ry="4.5" fill="none" stroke="#B67E3F" strokeWidth="3" />
    </svg>
  );
}

function FeatherSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 56" className={className} aria-hidden>
      <path d="M20 4 Q36 22 24 44 Q20 52 16 44 Q6 22 20 4 Z" fill="#FFB3C0" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M20 10 L20 46" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function FlowerSvg({ petal, className }: { petal: string; className?: string }) {
  return (
    <svg viewBox="0 0 40 48" className={className} aria-hidden>
      <path d="M20 28 v16" stroke="#3B2E5A" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M20 36 q-8 -2 -10 -8 q8 0 10 6" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="20" cy="10" r="6" fill={petal} stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="11" cy="16" r="6" fill={petal} stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="29" cy="16" r="6" fill={petal} stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="14" cy="24" r="6" fill={petal} stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="26" cy="24" r="6" fill={petal} stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="20" cy="17" r="5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
    </svg>
  );
}

const FEATHERS = [
  { x: -50, r: -50, left: "28%", bottom: "40%" },
  { x: 30, r: 30, left: "40%", bottom: "44%" },
  { x: 80, r: 70, left: "48%", bottom: "38%" },
];

export default function Level20({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [freed, setFreed] = useState(false);
  const [flying, setFlying] = useState(false);
  const [struggle, setStruggle] = useState(false);
  const [done, setDone] = useState(false);

  const branchDrag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || freed) return;
        if (Math.hypot(d.x, d.y) >= 55) {
          setFreed(true);
          sfx.whoosh();
          onProgress(0.5);
          window.setTimeout(() => {
            setFlying(true);
            setDone(true);
            sfx.cheer();
            onProgress(1);
            window.setTimeout(onSolved, 1300);
          }, 550);
        } else if (d.everMoved && Math.hypot(d.x, d.y) > 10) {
          api.reset();
        }
      },
      [solved, done, freed, onProgress, onSolved]
    )
  );

  const tapBird = () => {
    if (solved || done || freed) return;
    setStruggle(true);
    window.setTimeout(() => setStruggle(false), 560);
    onMistake({ fa: "بال من لای شاخه گیر کرده!", en: "My wing is stuck under the branch!" });
  };

  return (
    <Scene bg="linear-gradient(180deg,#CFF0F7 0%,#DFF6E3 62%,#B4E197 63%,#9CCE7F 100%)">
      {/* sun */}
      <svg viewBox="0 0 90 90" className="absolute top-[4%] left-[5%] w-[15%]" aria-hidden>
        <g stroke="#E8A81C" strokeWidth="5" strokeLinecap="round">
          <path d="M45 4 v11 M45 75 v11 M4 45 h11 M75 45 h11 M15 15 l8 8 M67 67 l8 8 M75 15 l-8 8 M23 67 l-8 8" />
        </g>
        <circle cx="45" cy="45" r="20" fill="#FFD154" stroke="#3B2E5A" strokeWidth="5" />
        <circle cx="38" cy="40" r="3" fill="#3B2E5A" />
        <circle cx="52" cy="40" r="3" fill="#3B2E5A" />
        <path d="M39 50 Q45 55 51 50" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
      {/* clouds */}
      <div className="absolute top-[10%] right-[10%] w-[24%] h-[9%] rounded-full bg-white/85 border-[3px] border-[#3B2E5A]" aria-hidden />
      <div className="absolute top-[23%] right-[30%] w-[16%] h-[7%] rounded-full bg-white/75 border-[3px] border-[#3B2E5A]" aria-hidden />
      {/* flowers */}
      <FlowerSvg petal="#FF6B81" className="absolute bottom-[3%] left-[8%] w-[8%]" />
      <FlowerSvg petal="#FFD154" className="absolute bottom-[4%] left-[62%] w-[7%]" />
      <FlowerSvg petal="#FF9FB2" className="absolute bottom-[3%] left-[86%] w-[8%]" />

      {/* stump */}
      <div className="absolute bottom-[6%] left-[31%] w-[24%]" aria-hidden>
        <StumpSvg className="w-full h-auto" />
      </div>

      {/* bird: struggles while pinned, then lifts off */}
      <motion.div
        className="absolute bottom-[27%] left-[32%] z-[8] w-[22%]"
        initial={false}
        animate={flying ? { y: -360, x: 120, rotate: -8, scale: 0.7, opacity: [1, 1, 0] } : { y: 0, x: 0, rotate: 0, scale: 1, opacity: 1 }}
        transition={flying ? { duration: 2.1, ease: "easeIn", times: [0, 0.55, 1] } : { duration: 0.25 }}
        onClick={tapBird}
        aria-label={lang === "fa" ? "پرنده کوچک" : "little bird"}
      >
        <div className="relative" style={{ animation: struggle ? "shake-hard 0.5s ease-in-out" : undefined }}>
          <BirdSvg className="w-full h-auto cursor-pointer drop-shadow-[0_3px_2px_rgba(59,46,90,0.2)]" />
          {/* wing: blocked wiggles under the branch, fast flaps when free */}
          <motion.div
            className="absolute left-[-16%] top-[14%] w-[62%]"
            initial={false}
            animate={flying ? { rotate: [-32, 22] } : { rotate: [0, -9, 0] }}
            transition={{ repeat: Infinity, duration: flying ? 0.18 : 1.4, ease: "easeInOut" }}
          >
            <WingSvg className="w-full h-auto" />
          </motion.div>
        </div>
      </motion.div>

      {/* feathers pop when the bird takes off */}
      {flying &&
        FEATHERS.map((f, i) => (
          <motion.div
            key={i}
            className="absolute w-[7%]"
            style={{ left: f.left, bottom: f.bottom }}
            initial={{ opacity: 1, y: 0, x: 0, rotate: 0 }}
            animate={{ opacity: [1, 1, 0], y: -90, x: f.x, rotate: f.r }}
            transition={{ duration: 1.2, delay: i * 0.12, ease: "easeOut" }}
          >
            <FeatherSvg className="w-full h-auto" />
          </motion.div>
        ))}

      {/* the heavy leafy branch pinning the wing */}
      <div
        className="absolute z-[12] left-[6%] bottom-[33%] w-[48%]"
        style={{
          transform: `translate(${branchDrag.x}px, ${branchDrag.y}px)`,
          transition: branchDrag.dragging || freed ? "none" : "transform 0.35s ease",
        }}
      >
        <Pulse active={hintPulse > 0 && !freed && !done}>
          <motion.div
            {...(freed ? {} : branchDrag.bind)}
            initial={false}
            animate={freed ? { x: 120, y: 60, rotate: 36 } : { x: 0, y: 0, rotate: -7 }}
            transition={{ duration: 0.9, ease: "easeIn" }}
            className={freed ? "" : "cursor-grab active:cursor-grabbing"}
            aria-label={lang === "fa" ? "شاخه سنگین" : "heavy branch"}
          >
            <BranchSvg className="w-full h-auto drop-shadow-[0_4px_3px_rgba(59,46,90,0.25)]" />
          </motion.div>
        </Pulse>
      </div>
    </Scene>
  );
}
