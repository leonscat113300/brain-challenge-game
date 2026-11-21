"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 5 — Hunger: rub to peel the apple, then feed the boy.         */
/* ------------------------------------------------------------------ */

const PEEL_TARGET = 520;
const TICK_EVERY = 120;
const MISTAKE_MSG = { fa: "سیب پوست‌نخورده است! اول پوستش را بکن", en: "The apple is not peeled! Peel it first" };

const SHARDS = [
  { x: "28%", y: "22%", dx: -46, dy: 64, rot: -150 },
  { x: "54%", y: "46%", dx: 40, dy: 70, rot: 140 },
  { x: "44%", y: "6%", dx: 10, dy: 78, rot: -120 },
];

function AppleSvg({
  peeled,
  scuffs,
  className,
  style,
}: {
  peeled: boolean;
  scuffs: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 120 140" className={className} style={style} aria-hidden>
      {/* stem + leaf */}
      <path d="M60 34 C60 24 64 16 71 10" stroke="#8B5E3C" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M66 18 Q80 2 94 10 Q86 24 66 18 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
      {/* body */}
      <path
        d="M60 36 C42 22 14 32 13 62 C12 94 36 124 60 124 C84 124 108 94 107 62 C106 32 78 22 60 36 Z"
        fill={peeled ? "#FFE9AE" : "#FF6B81"}
        stroke="#3B2E5A"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* rub spots: flesh showing through as you scrub */}
      {!peeled && scuffs > 0 && <ellipse cx="44" cy="66" rx="8" ry="9" fill="#FFE9AE" opacity="0.75" />}
      {!peeled && scuffs > 1 && <ellipse cx="76" cy="58" rx="7" ry="8" fill="#FFE9AE" opacity="0.75" />}
      {!peeled && scuffs > 2 && <ellipse cx="58" cy="94" rx="9" ry="10" fill="#FFE9AE" opacity="0.75" />}
      {peeled ? (
        <>
          {/* subtle flesh shine */}
          <path d="M34 56 Q42 46 54 46" stroke="#F2D98C" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M30 78 Q34 92 46 100" stroke="#F2D98C" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
        </>
      ) : (
        <>
          {/* peel highlights */}
          <ellipse cx="40" cy="52" rx="9" ry="13" fill="#FAFAFA" opacity="0.5" transform="rotate(-16 40 52)" />
          <path d="M26 92 Q58 116 92 90" stroke="#C94A5E" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.7" />
        </>
      )}
    </svg>
  );
}

function BoySvg({
  happy,
  chewing,
  className,
  style,
}: {
  happy: boolean;
  chewing: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 180 170" className={className} style={style} aria-hidden>
      {/* ears */}
      <circle cx="36" cy="80" r="8" fill="#FFD9B3" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="144" cy="80" r="8" fill="#FFD9B3" stroke="#3B2E5A" strokeWidth="4" />
      {/* big head peeking over the table */}
      <circle cx="90" cy="76" r="54" fill="#FFD9B3" stroke="#3B2E5A" strokeWidth="5" />
      {/* hair */}
      <path
        d="M38 66 C36 30 62 18 90 18 C118 18 144 30 142 66 C132 50 118 44 90 44 C62 44 48 50 38 66 Z"
        fill="#8B5E3C"
        stroke="#3B2E5A"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      {/* eyes */}
      {happy ? (
        <>
          <path d="M58 74 Q66 64 74 74" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M106 74 Q114 64 122 74" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="66" cy="72" r="10" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
          <circle cx="114" cy="72" r="10" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
          <circle cx="68" cy="74" r="4.5" fill="#3B2E5A" />
          <circle cx="112" cy="74" r="4.5" fill="#3B2E5A" />
          {/* hungry brows */}
          <path d="M56 58 L76 62" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
          <path d="M124 58 L104 62" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      {/* mouth */}
      {happy ? (
        chewing ? (
          <path d="M72 108 Q90 116 108 108" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M70 104 Q90 122 110 104" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
        )
      ) : (
        <>
          {/* big open hungry mouth (drop target) */}
          <ellipse cx="90" cy="110" rx="17" ry="13" fill="#3B2E5A" />
          <ellipse cx="90" cy="117" rx="9" ry="4.5" fill="#FF6B81" />
          {/* drool */}
          <path d="M110 116 C110 116 106 124 106 128 a4.5 4.5 0 0 0 9 0 C115 124 110 116 110 116 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="2.5" />
        </>
      )}
    </svg>
  );
}

export default function Level5({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const appleRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const downRef = useRef(false);
  const lastPtRef = useRef<{ x: number; y: number } | null>(null);
  const rubRectRef = useRef<DOMRect | null>(null);
  const peelRef = useRef(0);
  const progRef = useRef(0);
  const [peelDist, setPeelDist] = useState(0);
  const [peeled, setPeeled] = useState(false);
  const [shards, setShards] = useState(false);
  const [squash, setSquash] = useState(false);
  const [fed, setFed] = useState(false);
  const [appleGone, setAppleGone] = useState(false);
  const [chew, setChew] = useState(false);
  const [bubble, setBubble] = useState(false);
  const frozen = fed || solved;

  const drag = useDragMove(
    useCallback(
      (d) => {
        downRef.current = false;
        lastPtRef.current = null;
        if (frozen) return;
        const moved = d.everMoved && (Math.abs(d.x) > 30 || Math.abs(d.y) > 30);
        const onMouth = overElement(appleRef, mouthRef, 24);
        if (peeled && onMouth) {
          // feed: glide the apple into the mouth
          const a = appleRef.current?.getBoundingClientRect();
          const m = mouthRef.current?.getBoundingClientRect();
          if (a && m) {
            // eslint-disable-next-line react-hooks/immutability -- setPos lives on the hook value declared below
            dragSetPos(d.x + (m.left + m.width / 2 - (a.left + a.width / 2)), d.y + (m.top + m.height / 2 - (a.top + a.height / 2)));
          }
          setFed(true);
          sfx.cheer();
          onProgress(1);
          window.setTimeout(() => setAppleGone(true), 650);
          window.setTimeout(onSolved, 800);
          return;
        }
        if (!peeled && (onMouth || moved)) {
          // raw apple: cannot be dragged or eaten
          onMistake(MISTAKE_MSG);
        }
        // eslint-disable-next-line react-hooks/immutability -- reset lives on the hook value declared below
        dragReset();
      },
      [frozen, peeled, onMistake, onProgress, onSolved]
    )
  );
  const dragReset = drag.reset;
  const dragSetPos = drag.setPos;

  /** Rub/scrub: accumulate pointer path while the pointer stays over the apple. */
  const handleRub = (e: React.PointerEvent) => {
    if (frozen || peeled || !downRef.current) return;
    const rect = rubRectRef.current ?? appleRef.current?.getBoundingClientRect() ?? null;
    if (!rect) return;
    const inside =
      e.clientX >= rect.left - 6 && e.clientX <= rect.right + 6 && e.clientY >= rect.top - 6 && e.clientY <= rect.bottom + 6;
    const last = lastPtRef.current;
    lastPtRef.current = { x: e.clientX, y: e.clientY };
    if (!last || !inside) return;
    const step = Math.hypot(e.clientX - last.x, e.clientY - last.y);
    if (step <= 0) return;
    const prev = peelRef.current;
    const next = prev + step;
    if (Math.floor(next / TICK_EVERY) > Math.floor(prev / TICK_EVERY)) {
      sfx.tick();
      setSquash(true);
      window.setTimeout(() => setSquash(false), 140);
    }
    peelRef.current = next;
    setPeelDist(next);
    const p = Math.min(0.5, next / 1040);
    if (p - progRef.current >= 0.06 || p >= 0.5) {
      progRef.current = p;
      onProgress(p);
    }
    if (next >= PEEL_TARGET) {
      setPeeled(true);
      setShards(true);
      sfx.pop();
      progRef.current = 0.5;
      onProgress(0.5);
      window.setTimeout(() => setShards(false), 1100);
    }
  };

  // chewing loop after being fed
  useEffect(() => {
    if (!fed) return;
    let n = 0;
    const t = window.setInterval(() => {
      n += 1;
      setChew((c) => !c);
      if (n >= 7) window.clearInterval(t);
    }, 170);
    return () => window.clearInterval(t);
  }, [fed]);

  const tapBoy = () => {
    if (frozen) return;
    sfx.pop();
    setBubble(true);
    window.setTimeout(() => setBubble(false), 1200);
  };

  const scuffs = Math.min(3, Math.floor(peelDist / 130));

  return (
    <Scene bg="linear-gradient(180deg,#FDF3E3 0%,#FAEBD4 55%,#F3E0C2 100%)">
      {/* kitchen window */}
      <div className="absolute top-[6%] start-[6%] aspect-[4/3] w-[22%] overflow-hidden rounded-2xl border-4 border-[#3B2E5A] bg-[#BEE9F5]">
        <div className="absolute inset-x-0 top-1/2 h-1 bg-[#3B2E5A]" />
        <div className="absolute inset-y-0 left-1/2 w-1 bg-[#3B2E5A]" />
      </div>

      {/* shelf with jars */}
      <div className="absolute top-[10%] end-[8%] w-[26%]">
        <div className="flex items-end justify-end gap-2 pb-1 pe-2">
          <div className="h-8 w-5 rounded-md border-[3px] border-[#3B2E5A] bg-[#1EC8CF] opacity-90" />
          <div className="h-10 w-5 rounded-md border-[3px] border-[#3B2E5A] bg-[#FF9F1C] opacity-90" />
        </div>
        <div className="h-2.5 rounded-md border-2 border-[#3B2E5A] bg-[#8B5E3C]" />
      </div>

      {/* hungry boy peeking over the table */}
      <div className="absolute bottom-[15%] end-[4%] z-10 w-[40%]" onClick={tapBoy}>
        <BoySvg happy={fed} chewing={chew} className="h-auto w-full" />
        {/* mouth drop target */}
        <div ref={mouthRef} className="absolute left-[36%] top-[54%] h-[20%] w-[28%]" aria-hidden />
        {bubble && (
          <div
            className="absolute -top-8 left-1/2 z-40 -translate-x-1/2 whitespace-nowrap rounded-2xl border-[3px] border-[#3B2E5A] bg-[#FAFAFA] px-3 py-1 font-extrabold text-[#3B2E5A]"
            style={{ animation: "pop-in 0.25s both" }}
            role="status"
          >
            {lang === "fa" ? "گشنمه!" : "I'm hungry!"}
          </div>
        )}
      </div>

      {/* table */}
      <div className="absolute bottom-0 left-0 z-20 h-[21%] w-full">
        <div className="h-[36%] w-full border-y-4 border-[#3B2E5A] bg-[#A9713F]" />
        <div className="h-[64%] w-full bg-[#8B5E3C]" />
      </div>

      {/* cutting board */}
      <div className="absolute bottom-[20%] start-[2%] z-[25] h-[5.5%] w-[30%] rounded-lg border-[3px] border-[#3B2E5A] bg-[#C89158]" />

      {/* the apple (rub to peel, then drag to the mouth) */}
      <div
        ref={appleRef}
        className={`absolute bottom-[21%] start-[5%] z-30 w-[24%] ${appleGone ? "pointer-events-none" : ""}`}
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px)`,
          transition: drag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.3,0.64,1)",
          filter: drag.dragging ? "drop-shadow(0 10px 8px rgba(59,46,90,0.3))" : undefined,
        }}
      >
        <Pulse active={hintPulse > 0 && !fed}>
          <div
            {...drag.bind}
            onPointerDown={(e) => {
              drag.bind.onPointerDown(e);
              downRef.current = true;
              lastPtRef.current = { x: e.clientX, y: e.clientY };
              rubRectRef.current = appleRef.current?.getBoundingClientRect() ?? null;
            }}
            onPointerMove={(e) => {
              drag.bind.onPointerMove(e);
              handleRub(e);
            }}
            onPointerUp={() => {
              drag.bind.onPointerUp();
              downRef.current = false;
            }}
            onPointerCancel={() => {
              drag.bind.onPointerCancel();
              downRef.current = false;
            }}
            className="cursor-grab active:cursor-grabbing"
          >
            <div
              style={{
                transform: appleGone ? "scale(0.3)" : `scale(${squash ? 0.86 : drag.dragging && !peeled ? 0.94 : 1})`,
                transition: "transform 0.14s ease, opacity 0.3s ease",
                opacity: appleGone ? 0 : 1,
              }}
            >
              <AppleSvg peeled={peeled} scuffs={scuffs} className="h-auto w-full" />
            </div>
          </div>
        </Pulse>
        {/* peel shards flying off */}
        {shards &&
          SHARDS.map((s, i) => (
            <motion.svg
              key={i}
              viewBox="0 0 40 40"
              className="pointer-events-none absolute h-8 w-8"
              style={{ left: s.x, top: s.y }}
              initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
              animate={{ opacity: 0, scale: 0.7, x: s.dx, y: s.dy, rotate: s.rot }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              aria-hidden
            >
              <path d="M6 30 Q4 12 20 8 Q34 5 34 16" stroke="#FF6B81" strokeWidth="7" fill="none" strokeLinecap="round" />
            </motion.svg>
          ))}
      </div>
    </Scene>
  );
}
