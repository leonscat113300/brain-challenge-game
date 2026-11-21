"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 56 — Four tangled paths start at the traveler, but only one   */
/* really reaches the house. The trick: trace from the HOUSE side.     */
/* Dashed stubs near the house fake the other three connections.       */
/* Portrait viewBox so every target stays fully visible on phones.     */
/* ------------------------------------------------------------------ */

const PATH_A = "M40 350 C 100 330, 80 240, 140 200 C 190 168, 224 158, 246 140";   /* pink -> doghouse */
const PATH_B = "M40 350 C 60 380, 120 370, 160 340 C 200 310, 220 280, 240 248";   /* green -> house (correct) */
const PATH_C = "M40 350 C 90 390, 150 408, 200 392 C 230 382, 244 370, 248 360";   /* cyan -> pond */
const PATH_D = "M40 350 C 110 350, 140 300, 180 270 C 204 252, 220 242, 232 232";  /* orange -> dead end near house */

export default function Level56({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [picked, setPicked] = useState<"a" | "b" | "c" | "d" | null>(null);
  const [walking, setWalking] = useState(0); /* key to (re)start the SMIL walk */
  const [openDoor, setOpenDoor] = useState(false);
  const [done, setDone] = useState(false);
  const progRef = useRef(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tryPath = useCallback(
    (id: "a" | "b" | "c" | "d") => {
      if (solved || done) return;
      setPicked(id);
      if (!progRef.current) {
        progRef.current = true;
        onProgress(0.35);
      }
      if (id === "b") {
        setWalking((k) => k + 1);
        sfx.whoosh();
        timers.current.push(
          setTimeout(() => {
            setOpenDoor(true);
            sfx.unlock();
            timers.current.push(setTimeout(() => sfx.cheer(), 350));
            onProgress(1);
            setDone(true);
            timers.current.push(setTimeout(onSolved, 1000));
          }, 1900)
        );
        return;
      }
      sfx.boing();
      onMistake({
        fa: "بن‌بست است! مسیر را از سمت خانه دنبال کن.",
        en: "Dead end! Trace the path from the house side.",
      });
    },
    [solved, done, onMistake, onProgress, onSolved]
  );

  const hintOn = hintPulse > 0 && !done;

  return (
    <Scene bg="linear-gradient(180deg,#EAF7FB 0%,#DFF3F7 55%,#E7F3DF 56%,#DFF0D8 100%)">
      <svg viewBox="0 0 320 440" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
        {/* sun */}
        <g transform="translate(42 46)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="0" y1="-16" x2="0" y2="-22" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" transform={`rotate(${a})`} />
          ))}
          <circle cx="0" cy="0" r="13" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
          <circle cx="-4" cy="-2" r="1.8" fill="#3B2E5A" />
          <circle cx="4" cy="-2" r="1.8" fill="#3B2E5A" />
          <path d="M-3 4 Q0 7 3 4" stroke="#3B2E5A" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>

        {/* small clouds */}
        <g opacity="0.85">
          <ellipse cx="140" cy="34" rx="26" ry="12" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
          <ellipse cx="236" cy="24" rx="20" ry="10" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
        </g>

        {/* ---- the four paths ---- */}
        <path d={PATH_A} stroke="#FF6B81" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d={PATH_C} stroke="#1EC8CF" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d={PATH_D} stroke="#FF8A3C" strokeWidth="10" fill="none" strokeLinecap="round" />
        <path d={PATH_B} stroke="#4CAF50" strokeWidth="10" fill="none" strokeLinecap="round" />

        {/* decoy dashed stubs: pretend pink, cyan & orange also reach the house */}
        <path d="M248 148 Q262 190 252 234" stroke="#FF6B81" strokeWidth="6" fill="none" strokeDasharray="2 9" strokeLinecap="round" opacity="0.55" />
        <path d="M250 348 Q260 300 250 258" stroke="#1EC8CF" strokeWidth="6" fill="none" strokeDasharray="2 9" strokeLinecap="round" opacity="0.55" />
        <path d="M234 230 Q240 236 242 244" stroke="#FF8A3C" strokeWidth="6" fill="none" strokeDasharray="2 9" strokeLinecap="round" opacity="0.55" />

        {/* invisible wide hit areas */}
        {(
          [
            { id: "a", d: PATH_A },
            { id: "b", d: PATH_B },
            { id: "c", d: PATH_C },
            { id: "d", d: PATH_D },
          ] as const
        ).map((p) => (
          <path
            key={p.id}
            d={p.d}
            stroke="rgba(0,0,0,0)"
            strokeWidth="36"
            fill="none"
            style={{ pointerEvents: "stroke", cursor: done ? "default" : "pointer" }}
            onClick={() => tryPath(p.id)}
          />
        ))}

        {/* doghouse at the end of path A */}
        <g transform="translate(252 108)">
          <path d="M-26 30 L0 4 L26 30 L26 46 L-26 46 Z" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
          <circle cx="0" cy="32" r="11" fill="#33205E" />
          <ellipse cx="-2" cy="52" rx="14" ry="6" fill="#A9A3B8" stroke="#3B2E5A" strokeWidth="3" />
          <path d="M-8 50 Q-12 46 -8 44" stroke="#3B2E5A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>

        {/* pond at the end of path C */}
        <g transform="translate(250 356)">
          <ellipse cx="0" cy="6" rx="30" ry="14" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" opacity="0.85" />
          <ellipse cx="-8" cy="2" rx="9" ry="4" fill="#FAFAFA" opacity="0.7" />
          <g transform="translate(10 -8)">
            <ellipse cx="0" cy="4" rx="12" ry="9" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
            <circle cx="8" cy="-4" r="6" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
            <path d="M13 -4 L20 -2 L13 0 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2" strokeLinejoin="round" />
            <circle cx="9" cy="-5" r="1.4" fill="#3B2E5A" />
          </g>
        </g>

        {/* the house */}
        <g transform="translate(244 218)">
          <rect x="-30" y="4" width="60" height="40" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
          <path d="M-36 6 L0 -22 L36 6 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
          <rect x="-11" y="18" width="22" height="26" rx="4" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4" />
          <circle cx="6" cy="32" r="2.6" fill="#FFD154" />
          <rect x="-24" y="10" width="10" height="10" rx="2" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
          <rect x="14" y="10" width="10" height="10" rx="2" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
          {openDoor && <circle cx="0" cy="30" r="17" fill="#FFD154" opacity="0.45" />}
        </g>

        {/* traveler at the start */}
        <g transform="translate(40 350)">
          <line x1="0" y1="-34" x2="0" y2="-6" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
          <path d="M0 -34 L18 -28 L0 -22 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
          <g>
            <circle cx="0" cy="4" r="12" fill="#FFE1E7" stroke="#3B2E5A" strokeWidth="4" />
            <circle cx="-4" cy="2" r="1.7" fill="#3B2E5A" />
            <circle cx="4" cy="2" r="1.7" fill="#3B2E5A" />
            <path d="M-3 8 Q0 11 3 8" stroke="#3B2E5A" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M-12 14 Q0 10 12 14 L10 30 Q0 34 -10 30 Z" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
          </g>
        </g>

        {/* hint ring around the green path */}
        {hintOn && (
          <path d={PATH_B} stroke="#FFD154" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.45" style={{ animation: "pulse-ring 1.4s ease-in-out infinite" }} />
        )}

        {/* the walking dot along the green path */}
        {walking > 0 && (
          <g key={walking}>
            <circle r="10" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4">
              <animateMotion dur="1.9s" fill="freeze" path={PATH_B} />
            </circle>
            <circle r="4" fill="#FAFAFA">
              <animateMotion dur="1.9s" fill="freeze" path={PATH_B} />
            </circle>
          </g>
        )}

        {/* hearts when solved */}
        {done &&
          [0, 1, 2].map((i) => (
            <circle key={`s-${i}`} cx={280 + i * 16} cy={180 - i * 10} r="5" fill="#FF6B81" style={{ animation: `float-up 1.3s ${i * 0.2}s ease-out infinite` }} />
          ))}
      </svg>

      {/* caption chip */}
      {picked === null && !done && (
        <div className="absolute top-[3%] left-1/2 -translate-x-1/2 rounded-full border-[3px] border-[#3B2E5A] bg-[#FAFAFA] px-4 py-1 text-xs font-bold text-[#3B2E5A] shadow-[0_3px_0_rgba(59,46,90,0.25)]">
          {lang === "fa" ? "یک مسیر را لمس کن" : "Tap a path"}
        </div>
      )}
    </Scene>
  );
}
