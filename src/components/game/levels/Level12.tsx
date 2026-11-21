"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";
import { tr } from "@/lib/game/i18n";
import { num } from "@/lib/game/utils";

/* ------------------------------------------------------------------ */
/* Level 12 — The Balloon: hold to inflate, release in the green zone. */
/* ------------------------------------------------------------------ */

const SHARD_COLORS = ["#FF6B81", "#FFD154", "#1EC8CF", "#4CAF50", "#FF9F1C", "#6C4AB6"];
const GREEN_MIN = 55;
const GREEN_MAX = 85;
const POP_AT = 92;

interface Shard {
  id: number;
  dx: number;
  dy: number;
  rot: number;
  color: string;
}

type Phase = "idle" | "holding" | "popped" | "success";

function makeShards(): Shard[] {
  return Array.from({ length: 9 }, (_, i) => {
    const ang = (Math.PI * 2 * i) / 9 + (Math.random() - 0.5) * 0.5;
    const dist = 85 + Math.random() * 60;
    return {
      id: Date.now() + i,
      dx: Math.cos(ang) * dist,
      dy: Math.sin(ang) * dist,
      rot: Math.random() * 320 - 160,
      color: SHARD_COLORS[i % SHARD_COLORS.length],
    };
  });
}

function BalloonSvg({ happy, className, style }: { happy: boolean; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 118" className={className} style={style} aria-hidden>
      {/* body */}
      <path
        d="M50 6 C74 6 92 26 92 52 C92 80 72 100 50 100 C28 100 8 80 8 52 C8 26 26 6 50 6 Z"
        fill="#FF6B81"
        stroke="#3B2E5A"
        strokeWidth="5"
      />
      {/* shine */}
      <ellipse cx="33" cy="34" rx="9" ry="15" fill="#FFFFFF" opacity="0.5" transform="rotate(-20 33 34)" />
      <circle cx="66" cy="28" r="3" fill="#FFFFFF" opacity="0.7" />
      {/* knot (tied when happy) */}
      {happy ? (
        <path d="M40 100 L60 100 L52 110 L48 110 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      ) : (
        <path d="M43 100 L57 100 L50 110 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      )}
      {/* happy face */}
      {happy && (
        <>
          <circle cx="38" cy="52" r="6" fill="#3B2E5A" />
          <circle cx="62" cy="52" r="6" fill="#3B2E5A" />
          <circle cx="40" cy="50" r="2" fill="#FFFFFF" />
          <circle cx="64" cy="50" r="2" fill="#FFFFFF" />
          <path d="M40 66 Q50 76 60 66" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="27" cy="62" rx="5" ry="3" fill="#FFD154" opacity="0.8" />
          <ellipse cx="73" cy="62" rx="5" ry="3" fill="#FFD154" opacity="0.8" />
        </>
      )}
    </svg>
  );
}

function PumpSvg({ pumping }: { pumping: boolean }) {
  return (
    <svg viewBox="0 0 120 122" className="mx-auto w-[68%]" aria-hidden>
      {/* hose with subtle air-wiggle */}
      <motion.g
        animate={pumping ? { rotate: [0, 3, 0, -3, 0] } : { rotate: 0 }}
        transition={pumping ? { duration: 0.55, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
        style={{ transformBox: "fill-box", transformOrigin: "bottom left" }}
      >
        <path d="M88 74 C106 68 112 46 108 26" stroke="#33205E" strokeWidth="7" fill="none" strokeLinecap="round" />
        <rect x="100" y="12" width="13" height="15" rx="4" fill="#33205E" />
      </motion.g>
      {/* base */}
      <rect x="16" y="108" width="88" height="12" rx="6" fill="#33205E" />
      {/* body */}
      <rect x="28" y="58" width="60" height="52" rx="12" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="36" y="66" width="44" height="9" rx="4" fill="#FAFAFA" opacity="0.35" />
      {/* pumping handle */}
      <motion.g
        animate={pumping ? { y: [0, 13, 0] } : { y: 0 }}
        transition={pumping ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.12 }}
      >
        <rect x="52" y="24" width="12" height="36" rx="5" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="4" />
        <rect x="32" y="10" width="52" height="15" rx="7" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      </motion.g>
    </svg>
  );
}

/* wall confetti dots (deterministic) */
const DOTS: Array<{ l: string; t: string; c: string; s: number }> = [
  { l: "14%", t: "24%", c: "#FFD154", s: 8 },
  { l: "30%", t: "32%", c: "#1EC8CF", s: 6 },
  { l: "58%", t: "26%", c: "#FF6B81", s: 7 },
  { l: "76%", t: "34%", c: "#4CAF50", s: 6 },
  { l: "88%", t: "22%", c: "#FFD154", s: 8 },
  { l: "20%", t: "52%", c: "#FF9F1C", s: 6 },
  { l: "66%", t: "48%", c: "#6C4AB6", s: 7 },
  { l: "84%", t: "56%", c: "#1EC8CF", s: 6 },
  { l: "38%", t: "62%", c: "#FFD154", s: 6 },
  { l: "92%", t: "66%", c: "#FF6B81", s: 7 },
  { l: "8%", t: "72%", c: "#4CAF50", s: 6 },
  { l: "72%", t: "70%", c: "#E8A81C", s: 6 },
];

const FLAGS: Array<{ x: number; y: number; c: string }> = [
  { x: 45, y: 26, c: "#FF6B81" },
  { x: 95, y: 34, c: "#FFD154" },
  { x: 145, y: 30, c: "#1EC8CF" },
  { x: 195, y: 20, c: "#4CAF50" },
  { x: 245, y: 18, c: "#FFD154" },
  { x: 295, y: 22, c: "#FF9F1C" },
  { x: 345, y: 26, c: "#FF6B81" },
];

export default function Level12({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [size, setSize] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [wobbleKey, setWobbleKey] = useState(0);
  const [shards, setShards] = useState<Shard[]>([]);

  const sizeRef = useRef(0);
  const phaseRef = useRef<Phase>("idle");
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const holdSecRef = useRef(0);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const solvedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const showMsg = useCallback((text: string) => {
    setMsg(text);
    if (msgTimer.current) clearTimeout(msgTimer.current);
    msgTimer.current = setTimeout(() => setMsg(null), 1400);
  }, []);

  /* burst! */
  const popNow = useCallback(() => {
    stopLoop();
    goPhase("popped");
    sfx.boing();
    if (failTimer.current) clearTimeout(failTimer.current);
    failTimer.current = setTimeout(() => sfx.fail(), 140);
    setShards(makeShards());
    showMsg(tr(lang, "popped"));
    onMistake({ fa: "زیادی باد کردی!", en: "You over-inflated it!" });
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => {
      sizeRef.current = 0;
      setSize(0);
      setShards([]);
      goPhase("idle");
    }, 700);
  }, [stopLoop, goPhase, showMsg, lang, onMistake]);

  /* rAF inflation loop: ~14 units/sec, slightly accelerating */
  const tick = useCallback(
    (now: number) => {
      const dt = Math.min(0.05, (now - lastTsRef.current) / 1000);
      lastTsRef.current = now;
      holdSecRef.current += dt;
      const rate = 14 + 0.2 * Math.floor(holdSecRef.current);
      let s = sizeRef.current + rate * dt;
      if (s >= POP_AT) {
        s = POP_AT;
        sizeRef.current = s;
        setSize(s);
        onProgress(s / 100);
        popNow();
        return;
      }
      sizeRef.current = s;
      setSize(s);
      onProgress(s / 100);
      // eslint-disable-next-line react-hooks/immutability -- self-referencing rAF loop by design
      rafRef.current = requestAnimationFrame(tick);
    },
    [onProgress, popNow]
  );

  const startHold = useCallback(() => {
    if (solved || phaseRef.current !== "idle") return;
    goPhase("holding");
    lastTsRef.current = performance.now();
    holdSecRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
  }, [solved, goPhase, tick]);

  const stopHold = useCallback(() => {
    if (phaseRef.current !== "holding") return;
    stopLoop();
    const s = sizeRef.current;
    if (solved) {
      goPhase("idle");
      return;
    }
    if (s >= GREEN_MIN && s <= GREEN_MAX) {
      /* success: ties itself and floats up */
      goPhase("success");
      sfx.cheer();
      onProgress(1);
      if (solvedTimer.current) clearTimeout(solvedTimer.current);
      solvedTimer.current = setTimeout(onSolved, 800);
      return;
    }
    goPhase("idle");
    if (s < GREEN_MIN) {
      /* too small: sighs and deflates a bit */
      sizeRef.current = Math.max(0, s * 0.75);
      setSize(sizeRef.current);
      setWobbleKey((k) => k + 1);
      showMsg(lang === "fa" ? "کم باد شده!" : "Too small!");
      onMistake({ fa: "کم باد شده؛ بیشتر باد کن", en: "Too small; keep pumping" });
    } else {
      /* over-inflated but released just before the pop: scary full deflate */
      sizeRef.current = 0;
      setSize(0);
      setWobbleKey((k) => k + 1);
      showMsg(lang === "fa" ? "زیادی باد کردی!" : "You over-inflated it!");
      onMistake({ fa: "زیادی باد کردی!", en: "You over-inflated it!" });
    }
  }, [solved, stopLoop, goPhase, onProgress, onSolved, lang, showMsg, onMistake]);

  /* cleanup loops + timers */
  useEffect(() => {
    return () => {
      stopLoop();
      [msgTimer, resetTimer, failTimer, solvedTimer].forEach((t) => {
        if (t.current) clearTimeout(t.current);
      });
    };
  }, [stopLoop]);

  useEffect(() => {
    if (solved) stopLoop();
  }, [solved, stopLoop]);

  const holding = phase === "holding";
  const success = phase === "success";
  const w = 44 + size * 1.6;
  const wobbleAnim = success
    ? "bob 2.2s ease-in-out 0.7s infinite"
    : holding
      ? `wobble ${Math.max(0.45, 1.5 - size / 100).toFixed(2)}s ease-in-out infinite`
      : wobbleKey > 0
        ? "wobble 0.5s ease-in-out"
        : undefined;
  const pumpLabel = lang === "fa" ? "باد کن!" : "Pump!";

  return (
    <Scene bg="#FAFAFA">
      {/* wall confetti dots */}
      {DOTS.map((d, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full opacity-40"
          style={{ left: d.l, top: d.t, width: d.s, height: d.s, background: d.c }}
          aria-hidden
        />
      ))}

      {/* party bunting */}
      <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute left-0 top-0 w-full" style={{ height: "12%" }} aria-hidden>
        <path d="M0 10 Q100 42 200 14 T400 18" stroke="#3B2E5A" strokeWidth="4" fill="none" />
        {FLAGS.map((f, i) => (
          <path key={i} d={`M ${f.x - 11} ${f.y} L ${f.x + 11} ${f.y} L ${f.x} ${f.y + 20} Z`} fill={f.c} stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
        ))}
      </svg>

      {/* floor */}
      <div className="absolute bottom-0 left-0 h-[9%] w-full border-t-4 border-[#3B2E5A]" style={{ background: "rgba(232,168,28,0.35)" }} aria-hidden />

      {/* green zone gauge (the goal is readable here) */}
      <div className="absolute" style={{ left: "4%", top: "12%", height: "56%" }}>
        <Pulse active={hintPulse > 0 && !success} className="h-full rounded-[1.6rem]">
          <div className="relative h-full w-9 rounded-full border-[3px] border-[#3B2E5A] bg-white shadow-[0_4px_0_rgba(59,46,90,0.2)]">
            {/* safe band 55..85 */}
            <div
              className="absolute inset-x-[3px] rounded-lg"
              style={{ top: `${100 - GREEN_MAX}%`, height: `${GREEN_MAX - GREEN_MIN}%`, background: "#4CAF50", opacity: 0.9 }}
            />
            {/* size labels */}
            <span className="absolute left-full ml-1 text-[10px] font-black text-[#3B2E5A]" style={{ top: `${100 - GREEN_MAX - 2}%` }}>
              {num(GREEN_MAX, lang)}
            </span>
            <span className="absolute left-full ml-1 text-[10px] font-black text-[#3B2E5A]" style={{ top: `${100 - GREEN_MIN - 2}%` }}>
              {num(GREEN_MIN, lang)}
            </span>
            {/* moving marker */}
            <div className="absolute inset-x-0" style={{ bottom: `calc(${size}% - 5px)`, transition: "bottom 0.1s linear" }}>
              <div
                className="mx-auto h-2.5 w-2.5 rounded-full border-2 border-white"
                style={{ background: size > GREEN_MAX ? "#FF6B81" : size >= GREEN_MIN ? "#4CAF50" : "#33205E" }}
              />
            </div>
          </div>
        </Pulse>
      </div>

      {/* message bubble */}
      {msg && (
        <div className="absolute z-30" style={{ left: "24%", top: "16%" }}>
          <div
            className="relative whitespace-nowrap rounded-2xl border-[3px] border-[#3B2E5A] bg-white px-3.5 py-2 text-sm font-extrabold text-[#3B2E5A] shadow-[0_3px_0_rgba(59,46,90,0.25)]"
            style={{ animation: "pop-in 0.25s both" }}
            dir={lang === "fa" ? "rtl" : "ltr"}
            role="status"
          >
            {msg}
            <span
              className="absolute -bottom-[8px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-[#3B2E5A] bg-white"
              aria-hidden
            />
          </div>
        </div>
      )}

      {/* balloon anchor point (knot stays fixed, balloon grows upward) */}
      <div className="absolute z-10" style={{ left: "45%", bottom: "44%", width: 0, height: 0 }}>
        {/* string */}
        <svg viewBox="0 0 30 84" className="absolute left-0 top-0 w-[30px]" style={{ transform: "translateX(-50%)" }} aria-hidden>
          <path d="M15 0 C8 20 24 38 13 58 C9 66 17 74 14 84" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>

        {/* burst shards */}
        {shards.map((s) => (
          <motion.div
            key={s.id}
            className="absolute left-0"
            style={{ top: -w * 0.55 - 10 }}
            initial={{ x: -10, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: s.dx, y: s.dy, rotate: s.rot, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
              <path d="M12 2 L20 19 L4 19 Z" fill={s.color} stroke="#3B2E5A" strokeWidth="2" />
            </svg>
          </motion.div>
        ))}

        {/* burst flash */}
        {phase === "popped" && (
          <div
            className="absolute rounded-full border-4 border-[#FF9F1C] bg-white/70"
            style={{ left: -(w * 0.7) / 2, top: -w * 0.55 - (w * 0.7) / 2, width: w * 0.7, height: w * 0.7, animation: "pop-in 0.3s both" }}
            aria-hidden
          />
        )}

        {/* the balloon */}
        {phase !== "popped" && (
          <div className="absolute bottom-0 left-0" style={{ width: w, transform: "translateX(-50%)", transition: "width 0.3s ease" }}>
            <motion.div animate={success ? { y: -46 } : { y: 0 }} transition={{ type: "spring", stiffness: 110, damping: 13 }}>
              <div key={wobbleKey} style={{ animation: wobbleAnim, transformOrigin: "50% 100%" }}>
                <BalloonSvg happy={success} className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.2)]" />
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* hand pump = hold-to-inflate button */}
      <div className="absolute" style={{ left: "7%", bottom: "4%", width: "36%" }}>
        <button
          type="button"
          aria-label={pumpLabel}
          disabled={solved || phase === "popped" || phase === "success"}
          onPointerDown={startHold}
          onPointerUp={stopHold}
          onPointerCancel={stopHold}
          onPointerLeave={stopHold}
          onContextMenu={(e) => e.preventDefault()}
          className="btn-chunky w-full border-[3px] border-[#3B2E5A] bg-[#4CAF50] px-2 pb-2 pt-2"
        >
          <PumpSvg pumping={holding} />
          <span
            className="mt-1 block rounded-xl border-[3px] border-[#3B2E5A] bg-white px-1 py-1.5 text-center text-sm font-black text-[#3B2E5A]"
            dir={lang === "fa" ? "rtl" : "ltr"}
          >
            {pumpLabel}
          </span>
        </button>
      </div>
    </Scene>
  );
}
