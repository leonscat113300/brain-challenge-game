"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 39 — The penguin is cold: unfold the blanket, then drag it     */
/* precisely onto the penguin.                                          */
/* ------------------------------------------------------------------ */

const COLD_MSG = { fa: "بهش پتو بده!", en: "Give it a blanket!" };
const SNOW = [
  { l: 5, t: 6, s: 9 }, { l: 16, t: 14, s: 6 }, { l: 30, t: 4, s: 8 }, { l: 44, t: 11, s: 5 },
  { l: 58, t: 5, s: 9 }, { l: 72, t: 13, s: 6 }, { l: 86, t: 7, s: 8 }, { l: 93, t: 18, s: 5 },
  { l: 10, t: 26, s: 6 }, { l: 66, t: 24, s: 7 }, { l: 82, t: 30, s: 5 }, { l: 24, t: 32, s: 5 },
];
const BLANKET_HOME = { left: "62%", top: "56%", width: "32%" };
const UNFOLDED_HOME = { left: "57%", top: "53%", width: "38%" };

function PenguinSvg({ warm, className, style }: { warm: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 210" className={className} style={style} aria-hidden>
      {/* feet */}
      <ellipse cx="78" cy="198" rx="17" ry="9" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="122" cy="198" rx="17" ry="9" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      {/* body + belly */}
      <ellipse cx="100" cy="112" rx="62" ry="74" fill="#33205E" stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="100" cy="126" rx="42" ry="54" fill="#FAFAFA" />
      {/* flippers */}
      <ellipse cx="36" cy="118" rx="13" ry="30" fill="#33205E" stroke="#3B2E5A" strokeWidth="4" transform="rotate(14 36 118)" />
      <ellipse cx="164" cy="118" rx="13" ry="30" fill="#33205E" stroke="#3B2E5A" strokeWidth="4" transform="rotate(-14 164 118)" />
      {/* eyes */}
      <circle cx="80" cy="70" r="10" fill="#3B2E5A" />
      <circle cx="120" cy="70" r="10" fill="#3B2E5A" />
      <circle cx="83" cy="66" r="3.4" fill="#FAFAFA" />
      <circle cx="123" cy="66" r="3.4" fill="#FAFAFA" />
      {/* cheeks turn pinker once warm */}
      <ellipse cx="63" cy="88" rx="9" ry="5.5" fill={warm ? "#FF6B81" : "#FF9FB2"} />
      <ellipse cx="137" cy="88" rx="9" ry="5.5" fill={warm ? "#FF6B81" : "#FF9FB2"} />
      {/* beak + mouth */}
      <path d="M90 84 L110 84 L100 98 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
      {warm ? (
        <path d="M88 104 Q100 114 112 104" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M90 108 Q100 101 110 108" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      )}
    </svg>
  );
}

function BlanketSvg({ folded = true, className, style }: { folded?: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 160 92" className={className} style={style} aria-hidden>
      <rect x={folded ? 8 : 3} y="12" width={folded ? 144 : 154} height="66" rx="14" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="20" y="24" width="120" height="12" rx="6" fill="#FFD154" />
      <rect x="20" y="54" width="120" height="12" rx="6" fill="#FFD154" />
      {folded && (
        <path d="M22 45 Q80 38 138 45" stroke="#C94B60" strokeWidth="4" fill="none" strokeLinecap="round" strokeDasharray="7 7" />
      )}
    </svg>
  );
}

function SnowPileSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 60" className={className} style={style} aria-hidden>
      <ellipse cx="38" cy="44" rx="30" ry="14" fill="#F2FAFD" stroke="#3B2E5A" strokeWidth="4.5" />
      <ellipse cx="78" cy="46" rx="30" ry="12" fill="#F2FAFD" stroke="#3B2E5A" strokeWidth="4.5" />
      <ellipse cx="58" cy="32" rx="24" ry="13" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4.5" />
    </svg>
  );
}

function BrrSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 44 64" className={className} style={style} aria-hidden>
      <path d="M8 6 q6 7 0 14 q-6 7 0 14 q6 7 0 14" stroke="#1EC8CF" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M24 2 q6 7 0 14 q-6 7 0 14 q6 7 0 14 q-6 7 0 14" stroke="#1EC8CF" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M38 14 q5 6 0 12 q-5 6 0 12" stroke="#1EC8CF" strokeWidth="4" fill="none" strokeLinecap="round" />
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

export default function Level39({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [wrapped, setWrapped] = useState(false);
  const [unfolded, setUnfolded] = useState(false);
  const [done, setDone] = useState(false);
  const [taps, setTaps] = useState(0);
  const penguinRef = useRef<HTMLDivElement>(null);
  const blanketRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  const t = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const drag = useDragMove(
    useCallback(
      (d: DragState, api) => {
        api.reset();
        if (solved || done || wrapped) return;
        /* a plain tap unfolds the blanket — it must be open before it can warm anyone */
        if (!d.everMoved) {
          if (!unfolded) {
            setUnfolded(true);
            sfx.pop();
            onProgress(0.34);
          }
          return;
        }
        if (Math.abs(d.x) <= 25 && Math.abs(d.y) <= 25) return;
        if (overElement(blanketRef, penguinRef, 12)) {
          if (!unfolded) {
            onMistake({ fa: "اول پتو رو باز کن!", en: "Unfold the blanket first!" });
            return;
          }
          setWrapped(true);
          setDone(true);
          sfx.sparkle();
          sfx.cheer();
          onProgress(1);
          t(onSolved, 700);
        } else {
          onProgress(unfolded ? 0.67 : 0.34);
        }
      },
      [solved, done, wrapped, unfolded, onProgress, onMistake, onSolved, t]
    )
  );

  useEffect(() => {
    if (drag.dragging && !wrapped && !done && !solved) onProgress(unfolded ? 0.67 : 0.34);
  }, [drag.dragging, wrapped, done, solved, unfolded, onProgress]);

  const tapPenguin = () => {
    if (solved || done) return;
    if (wrapped) {
      sfx.pop();
      return;
    }
    sfx.pop();
    t(() => sfx.pop(), 150);
    if (taps < 2) {
      setTaps((v) => v + 1);
      onMistake(COLD_MSG);
    }
  };

  const tapSnow = () => {
    if (solved || done || wrapped) return;
    sfx.boing();
    onMistake({ fa: "این که سردترش می‌کنه!", en: "That would make it colder!" });
  };

  const shivering = !wrapped && !done;
  const home = unfolded ? UNFOLDED_HOME : BLANKET_HOME;

  return (
    <Scene bg="linear-gradient(180deg,#DFF4FA 0%,#C9E9F5 55%,#B7DDF0 100%)">
      {/* drifting snow dots */}
      {SNOW.map((f, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/85"
          style={{ left: `${f.l}%`, top: `${f.t}%`, width: f.s, height: f.s, animation: `bob ${2.2 + (i % 4) * 0.5}s ease-in-out infinite` }}
          aria-hidden
        />
      ))}
      {/* icy ground */}
      <div className="absolute inset-x-0 bottom-0 h-[12%] border-t-4 border-[#3B2E5A]" style={{ background: "linear-gradient(180deg,#F2FAFD 0%,#DDEFF7 100%)" }} aria-hidden />

      {/* shivering penguin */}
      <motion.div
        ref={penguinRef}
        onClick={tapPenguin}
        role="button"
        aria-label={lang === "fa" ? "پنگوئن" : "penguin"}
        className="absolute bottom-[9%] start-[6%] z-10 w-[40%] cursor-pointer"
        animate={shivering ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
        transition={shivering ? { duration: 0.32, repeat: Infinity, ease: "linear" } : { duration: 0.25 }}
      >
        <PenguinSvg warm={wrapped} className="h-auto w-full drop-shadow-[0_4px_3px_rgba(51,32,94,0.18)]" />
        {!wrapped && (
          <>
            <BrrSvg className="absolute end-[-3%] top-[-9%] w-[20%]" style={{ animation: "bob 0.9s ease-in-out infinite" }} />
            {[0, 1].map((i) => (
              <motion.div
                key={i}
                className="absolute left-[44%] top-[46%] h-4 w-4 rounded-full border-2 border-[#9AD0E8] bg-[#DDF2FB]"
                animate={{ x: [0, 30], opacity: [0.9, 0], scale: [0.5, 1.4] }}
                transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.65, ease: "easeOut" }}
                aria-hidden
              />
            ))}
          </>
        )}
        {wrapped && (
          <>
            {/* blanket wraps the body */}
            <div className="absolute bottom-[5%] start-[-7%] w-[114%] -rotate-6" style={{ animation: "pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }} aria-hidden>
              <BlanketSvg className="h-auto w-full drop-shadow-[0_4px_3px_rgba(51,32,94,0.2)]" />
            </div>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute top-[0%] w-7"
                style={{ left: `${14 + i * 28}%` }}
                initial={{ y: 10, opacity: 0, scale: 0.4 }}
                animate={{ y: -55, opacity: [0, 1, 1, 0], scale: 1.1 }}
                transition={{ duration: 1.7, repeat: Infinity, delay: i * 0.4, repeatDelay: 0.5 }}
                aria-hidden
              >
                <HeartSvg className="h-auto w-full" />
              </motion.div>
            ))}
          </>
        )}
      </motion.div>

      {/* stool */}
      <div className="absolute bottom-[9%] end-[6%] z-[5] w-[24%]" aria-hidden>
        <div className="h-3.5 rounded-lg border-[3px] border-[#3B2E5A] bg-[#C98A4B]" />
        <div className="flex justify-between px-[10%]">
          <div className="h-14 w-2.5 border-x-[3px] border-[#3B2E5A] bg-[#A9713C]" />
          <div className="h-14 w-2.5 border-x-[3px] border-[#3B2E5A] bg-[#A9713C]" />
        </div>
      </div>

      {/* decoy: a pile of snow — piling cold on cold won't help */}
      <button
        type="button"
        onClick={tapSnow}
        aria-label={lang === "fa" ? "تپه برف" : "snow pile"}
        className="absolute bottom-[9%] left-[48%] z-[6] w-[18%] cursor-pointer"
      >
        <SnowPileSvg className="h-auto w-full" />
      </button>

      {/* draggable folded blanket */}
      <div
        ref={blanketRef}
        className="absolute z-20"
        style={{
          left: home.left,
          top: home.top,
          width: home.width,
          opacity: wrapped ? 0 : 1,
          transform: `translate(${drag.x}px, ${drag.y}px) rotate(${drag.dragging ? -4 : 0}deg) scale(${drag.dragging ? 1.12 : 1})`,
          transition: drag.dragging
            ? "none"
            : "transform 0.45s cubic-bezier(0.34,1.3,0.64,1), opacity 0.3s ease, left 0.35s ease, width 0.35s ease, top 0.35s ease",
        }}
      >
        <Pulse active={hintPulse > 0 && !wrapped && !done}>
          <div
            {...(wrapped || done || solved ? {} : drag.bind)}
            className="active:cursor-grabbing"
            role="button"
            aria-label={lang === "fa" ? "پتو" : "blanket"}
            style={{ touchAction: "none", cursor: wrapped || done || solved ? "default" : "grab" }}
          >
            <BlanketSvg folded={!unfolded} className="h-auto w-full drop-shadow-[0_4px_3px_rgba(51,32,94,0.2)]" />
          </div>
        </Pulse>
      </div>
    </Scene>
  );
}
