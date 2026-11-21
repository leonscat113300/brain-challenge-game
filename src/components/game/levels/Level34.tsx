"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";
import { num } from "@/lib/game/utils";

/* ------------------------------------------------------------------ */
/* Level 34 — Try the door handles: one random door is not locked.     */
/* ------------------------------------------------------------------ */

interface DoorTheme { body: string; dark: string; soft: string }

const DOORS: DoorTheme[] = [
  { body: "#FF6B81", dark: "#D9485E", soft: "#FF9FB2" },
  { body: "#FFD154", dark: "#DFA51B", soft: "#FFE59A" },
  { body: "#1EC8CF", dark: "#149BA1", soft: "#9BEAED" },
];

function MouseSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 110" className={className} style={style} aria-hidden>
      <path d="M62 96 Q84 92 80 72" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="42" cy="88" rx="24" ry="18" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="42" cy="56" r="22" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="26" cy="40" r="9" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="58" cy="40" r="9" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M26 34 Q42 14 58 34 Q42 28 26 34 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M33 26 Q42 22 51 26" stroke="#FFD154" strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="34" cy="56" r="4" fill="#3B2E5A" />
      <circle cx="50" cy="56" r="4" fill="#3B2E5A" />
      <circle cx="35.4" cy="54.6" r="1.4" fill="#fff" />
      <circle cx="51.4" cy="54.6" r="1.4" fill="#fff" />
      <ellipse cx="28" cy="64" rx="3.4" ry="2.2" fill="#FF9FB2" />
      <ellipse cx="56" cy="64" rx="3.4" ry="2.2" fill="#FF9FB2" />
      <path d="M39 64 Q42 68 45 64" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M20 82 Q12 74 16 66" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M64 82 Q72 74 68 66" stroke="#3B2E5A" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M36 76 L42 79 L36 82 Z M48 76 L42 79 L48 82 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function PadlockSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 28" className={className} aria-hidden>
      <rect x="3" y="12" width="18" height="13" rx="4" fill="#8A819B" stroke="#3B2E5A" strokeWidth="3" />
      <path d="M7 12 V9 a5 5 0 0 1 10 0 V12" stroke="#3B2E5A" strokeWidth="3" fill="none" />
      <circle cx="12" cy="18" r="2.4" fill="#3B2E5A" />
    </svg>
  );
}

export default function Level34({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [unlocked] = useState(() => Math.floor(Math.random() * 3));
  const [tried, setTried] = useState<boolean[]>([false, false, false]);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [rattleIdx, setRattleIdx] = useState<number | null>(null);
  const [rattleTick, setRattleTick] = useState(0);
  const [done, setDone] = useState(false);
  const doneRef = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => { timers.current.forEach((t) => window.clearTimeout(t)); }, []);

  const triedCount = tried.filter(Boolean).length;

  const openDoor = useCallback((i: number) => {
    if (doneRef.current) return;
    doneRef.current = true;
    setDone(true);
    setOpenIdx(i);
    sfx.unlock();
    onProgress(1);
    timers.current.push(window.setTimeout(() => sfx.cheer(), 500));
    timers.current.push(window.setTimeout(onSolved, 1000));
  }, [onProgress, onSolved]);

  const tapDoor = (i: number) => {
    if (solved || done) return;
    if (i === unlocked) { openDoor(i); return; }
    setRattleIdx(i);
    setRattleTick((t) => t + 1);
    sfx.click();
    onMistake({ fa: "این قفله!", en: "This one is locked!" });
    timers.current.push(window.setTimeout(() => setRattleIdx(null), 480));
    if (!tried[i]) {
      const next = [...tried];
      next[i] = true;
      setTried(next);
      onProgress(0.33 * next.filter(Boolean).length);
    }
  };

  return (
    <Scene bg="linear-gradient(180deg,#F4EEFA 0%,#EFE8F7 68%,#E7DCF2 100%)">
      {/* wallpaper + wooden floor */}
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.05) 0 20px, transparent 20px 46px)" }} aria-hidden />
      <div
        className="absolute inset-x-0 bottom-0 h-[19%] border-t-4 border-[#3B2E5A]"
        style={{ background: "#D9A05B", backgroundImage: "repeating-linear-gradient(90deg, rgba(139,94,60,0.4) 0 4px, transparent 4px 56px)" }}
        aria-hidden
      />

      {/* little sign */}
      <div className="absolute left-1/2 top-[4%] z-20 -translate-x-1/2 rounded-full border-4 border-[#3B2E5A] bg-[#FAFAFA] px-4 py-1 text-xs font-extrabold text-[#3B2E5A] shadow">
        {lang === "fa" ? "دستگیره‌ها را امتحان کن" : "Try the handles"}
      </div>

      <div className="absolute inset-x-[6%] bottom-[20%] top-[13%] flex items-end justify-center gap-[5%]">
        {DOORS.map((c, i) => {
          const isOpen = openIdx === i;
          return (
            <Pulse key={i} active={triedCount >= 2 && !done && i === unlocked} className="h-[96%] w-[27%] max-w-[168px]">
              <div className="relative h-full w-full">
                {/* frame */}
                <div className="absolute inset-0 rounded-t-2xl border-4 border-[#3B2E5A] bg-[#6E4526]" />
                {/* opening: warm light + doorman mouse */}
                <div className="absolute overflow-hidden rounded-t-xl" style={{ left: "5%", right: "5%", top: "3%", bottom: "3%" }}>
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "radial-gradient(ellipse at 50% 82%, rgba(255,209,84,0.95) 0%, rgba(232,168,28,0.5) 45%, #221735 88%)",
                      opacity: isOpen ? 1 : 0.3,
                      transition: "opacity 0.7s ease",
                    }}
                    aria-hidden
                  />
                  {isOpen && (
                    <div className="absolute bottom-0 left-1/2 h-[62%] -translate-x-1/2">
                      <motion.div
                        className="h-full"
                        initial={{ y: 26, opacity: 0 }}
                        animate={{ y: 0, opacity: 1, rotate: [0, 14, 10] }}
                        transition={{ duration: 1.1, delay: 0.35 }}
                        style={{ transformOrigin: "50% 100%" }}
                      >
                        <MouseSvg className="h-full w-auto" />
                      </motion.div>
                    </div>
                  )}
                </div>
                {/* swinging panel = tap target */}
                <button
                  key={`p-${rattleTick}`}
                  type="button"
                  disabled={solved || done}
                  aria-label={`${lang === "fa" ? "در" : "door"} ${num(i + 1, lang)}`}
                  onClick={() => tapDoor(i)}
                  className="absolute rounded-t-xl border-4 border-[#3B2E5A]"
                  style={{
                    left: "5%",
                    right: "5%",
                    top: "3%",
                    bottom: "3%",
                    background: c.body,
                    backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.14) 0 3px, transparent 3px 22px)",
                    transformOrigin: "left center",
                    transform: isOpen ? "perspective(700px) rotateY(-80deg)" : "rotateY(0deg)",
                    transition: "transform 0.9s ease-in-out",
                    animation: rattleIdx === i ? "shake-hard 0.45s ease" : undefined,
                  }}
                >
                  <span className="absolute rounded-lg border-[3px]" style={{ left: "12%", right: "12%", top: "8%", height: "34%", borderColor: c.dark, background: c.soft }} aria-hidden />
                  <span className="absolute rounded-lg border-[3px]" style={{ left: "12%", right: "12%", top: "50%", height: "38%", borderColor: c.dark, background: c.soft }} aria-hidden />
                  <span className="absolute grid place-items-center rounded-full" style={{ left: "66%", top: "42%", width: "26%", aspectRatio: "1", background: "#E8A81C", border: "3px solid #3B2E5A" }} aria-hidden>
                    <span className="block rounded-full bg-[#3B2E5A]" style={{ width: "26%", aspectRatio: "1" }} />
                  </span>
                  <span className="absolute" style={{ left: "75%", top: "72%", width: "9%", aspectRatio: "0.82" }} aria-hidden>
                    <PadlockSvg className="h-full w-full opacity-70" />
                  </span>
                </button>
                {/* tried badge */}
                {tried[i] && !isOpen && (
                  <div className="absolute -end-2.5 -top-3 z-20 grid h-8 w-7 place-items-center rounded-lg border-[3px] border-[#3B2E5A] bg-[#FAFAFA] shadow" aria-hidden>
                    <PadlockSvg className="h-5 w-4" />
                  </div>
                )}
              </div>
            </Pulse>
          );
        })}
      </div>
    </Scene>
  );
}
