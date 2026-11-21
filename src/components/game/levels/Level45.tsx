"use client";

import React, { useState } from "react";
import type { Lang, LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";
import { num } from "@/lib/game/utils";

/* ------------------------------------------------------------------ */
/* Level 45 — Open the code lock: tap the numbered tags in ascending   */
/* order (1, 2, 3, 4) to crack the chest.                              */
/* ------------------------------------------------------------------ */

function SunSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 80" className={className} style={style} aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line key={i} x1={40 + Math.cos(a) * 26} y1={40 + Math.sin(a) * 26} x2={40 + Math.cos(a) * 35} y2={40 + Math.sin(a) * 35} stroke="#E8A81C" strokeWidth="4.5" strokeLinecap="round" />
        );
      })}
      <circle cx="40" cy="40" r="21" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="33" cy="36" r="3" fill="#3B2E5A" />
      <circle cx="47" cy="36" r="3" fill="#3B2E5A" />
      <circle cx="34.5" cy="34.5" r="1" fill="#FAFAFA" />
      <circle cx="48.5" cy="34.5" r="1" fill="#FAFAFA" />
      <path d="M34 46 Q40 51 46 46" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function BallSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 80" className={className} style={style} aria-hidden>
      <circle cx="40" cy="40" r="30" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M10 40 A30 30 0 0 1 70 40" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M40 10 Q30 26 40 40 Q50 54 40 70" stroke="#3B2E5A" strokeWidth="3.5" fill="none" />
      <circle cx="40" cy="40" r="5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
    </svg>
  );
}

function HatSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 90" className={className} style={style} aria-hidden>
      <ellipse cx="45" cy="70" rx="36" ry="10" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
      <path d="M28 68 Q28 30 45 24 Q62 30 62 68 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M28 56 Q45 62 62 56" stroke="#12A3A9" strokeWidth="4" fill="none" />
      <circle cx="45" cy="22" r="6" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
    </svg>
  );
}

function CupSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 80" className={className} style={style} aria-hidden>
      <path d="M20 22 L68 22 L62 64 Q60 70 54 70 L34 70 Q28 70 26 64 Z" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M66 30 Q82 30 80 42 Q78 52 62 52" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="44" cy="22" rx="24" ry="6" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
      <path d="M30 36 Q40 41 50 36" stroke="#B9A6E0" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function StarBurst({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden>
      <path d="M20 2 L24 14 L36 14 L26 22 L30 34 L20 27 L10 34 L14 22 L4 14 L16 14 Z" fill="#FFD154" stroke="#E8A81C" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

/* a toy with its numbered tag badge */
function TaggedObject({
  n, lang, used, hintActive, anim, pos, label, onPick, children,
}: {
  n: number;
  lang: Lang;
  used: boolean;
  hintActive: boolean;
  anim: string;
  pos: string;
  label: string;
  onPick: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className={`absolute ${pos}`}>
      <Pulse active={hintActive} className="relative">
        <button
          type="button"
          aria-label={label}
          onClick={onPick}
          className={`relative block w-full ${used ? "opacity-40" : "cursor-pointer hover:scale-105"} transition-transform`}
          style={{ animation: used ? undefined : anim }}
        >
          {children}
          <span className="absolute -top-2 -end-2 w-9 h-9 grid place-items-center rounded-full bg-[#FFD154] border-[3px] border-[#3B2E5A] font-extrabold text-[#3B2E5A] text-lg shadow-[0_2px_0_rgba(59,46,90,0.3)]">
            {num(n, lang)}
          </span>
        </button>
      </Pulse>
    </div>
  );
}

const CONFETTI = ["#FFD154", "#FF6B81", "#1EC8CF", "#4CAF50", "#6C4AB6"];

export default function Level45({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [entered, setEntered] = useState<number[]>([]);
  const [flash, setFlash] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  const tapTag = (n: number) => {
    if (solved || done) return;
    const expected = entered.length + 1;
    if (n !== expected) {
      setEntered([]);
      setFlash(true);
      setShakeKey((k) => k + 1);
      sfx.shake();
      onMistake({ fa: "از کوچک به بزرگ مرتب کن!", en: "Order them small to big!" });
      window.setTimeout(() => setFlash(false), 700);
      return;
    }
    const next = [...entered, n];
    setEntered(next);
    sfx.pop();
    onProgress(0.25 * next.length);
    if (next.length === 4) {
      setDone(true);
      onProgress(1);
      window.setTimeout(() => {
        setOpen(true);
        sfx.unlock();
        sfx.sparkle();
      }, 300);
      window.setTimeout(() => sfx.cheer(), 650);
      window.setTimeout(onSolved, 1100);
    }
  };

  const slots = [1, 2, 3, 4].map((i) => entered[i - 1] ?? null);
  const hintFor = (step: number) => hintPulse > 0 && !done && entered.length === step;

  return (
    <Scene bg="linear-gradient(180deg,#F5EEFB 0%,#EFE6F6 55%,#E9DDF0 100%)">
      {/* soft floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[22%] border-t-4 border-[#3B2E5A]"
        style={{ background: "#D9C8EC", backgroundImage: "repeating-linear-gradient(90deg, rgba(108,74,182,0.12) 0 3px, transparent 3px 54px)" }}
        aria-hidden
      />

      {/* tagged toys scattered around (sun=3, ball=1, hat=4, cup=2) */}
      <TaggedObject n={3} lang={lang} used={entered.includes(3)} hintActive={hintFor(2)} anim="bob 3s ease-in-out infinite" pos="top-[5%] start-[6%] w-[19%]" label={lang === "fa" ? "خورشید، عدد ۳" : "sun, number 3"} onPick={() => tapTag(3)}>
        <SunSvg className="w-full h-auto" />
      </TaggedObject>
      <TaggedObject n={1} lang={lang} used={entered.includes(1)} hintActive={hintFor(0)} anim="wobble 3.4s ease-in-out infinite" pos="top-[6%] end-[7%] w-[19%]" label={lang === "fa" ? "توپ، عدد ۱" : "ball, number 1"} onPick={() => tapTag(1)}>
        <BallSvg className="w-full h-auto" />
      </TaggedObject>
      <TaggedObject n={4} lang={lang} used={entered.includes(4)} hintActive={hintFor(3)} anim="breathe 3.2s ease-in-out infinite" pos="top-[38%] start-[10%] w-[19%]" label={lang === "fa" ? "کلاه، عدد ۴" : "hat, number 4"} onPick={() => tapTag(4)}>
        <HatSvg className="w-full h-auto" />
      </TaggedObject>
      <TaggedObject n={2} lang={lang} used={entered.includes(2)} hintActive={hintFor(1)} anim="bob 2.8s ease-in-out infinite" pos="top-[40%] end-[9%] w-[20%]" label={lang === "fa" ? "لیوان، عدد ۲" : "cup, number 2"} onPick={() => tapTag(2)}>
        <CupSvg className="w-full h-auto" />
      </TaggedObject>

      {/* the chest with the code lock */}
      <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[58%]" style={{ perspective: 900 }}>
        {/* lid */}
        <div
          className="relative h-[54px] rounded-t-2xl border-4 border-[#3B2E5A] bg-[#8B5E3C]"
          style={{
            transformOrigin: "top center",
            transform: open ? "rotateX(-74deg)" : "rotateX(0deg)",
            transition: "transform 0.8s cubic-bezier(0.34,1.3,0.64,1)",
            backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.14) 0 3px, transparent 3px 26px)",
          }}
        >
          <div className="absolute left-1/2 top-2 -translate-x-1/2 w-[16%] h-3 rounded-full bg-[#FFD154] border-2 border-[#3B2E5A]" />
        </div>
        {/* base + lock panel */}
        <div className="relative rounded-b-2xl rounded-t-lg border-4 border-[#3B2E5A] bg-[#C9986A] px-[8%] py-[5%]">
          <div
            key={shakeKey}
            className="mx-auto w-[74%] rounded-xl border-4 bg-[#33205E] p-[4%]"
            style={{
              animation: shakeKey > 0 && !open ? "shake-hard 0.5s ease" : undefined,
              borderColor: flash ? "#FF6B81" : "#3B2E5A",
              transition: "border-color 0.2s",
            }}
          >
            <div className="flex justify-center gap-[6%]">
              {slots.map((v, i) => (
                <div
                  key={i}
                  className="grid aspect-square w-[18%] min-w-[34px] place-items-center rounded-lg border-[3px] bg-[#1D1338] text-2xl font-extrabold text-[#FFD154]"
                  style={{
                    animation: v !== null ? "pop-in 0.3s cubic-bezier(0.34,1.56,0.64,1) both" : undefined,
                    borderColor: flash ? "#FF6B81" : "#6C4AB6",
                    transition: "border-color 0.2s",
                  }}
                >
                  {v !== null ? num(v, lang) : ""}
                </div>
              ))}
            </div>
          </div>
          {/* treasure glow when open */}
          {open && (
            <div className="pointer-events-none absolute inset-x-[6%] top-[-46px] h-[46px]" aria-hidden>
              <div className="absolute inset-x-0 bottom-0 h-full" style={{ background: "radial-gradient(ellipse at bottom, rgba(255,209,84,0.85), transparent 70%)", animation: "glow 1.4s ease-in-out infinite" }} />
              <StarBurst className="absolute start-[18%] top-1 w-7 h-7" style={{ animation: "star-pop 0.5s 0.1s both" }} />
              <StarBurst className="absolute start-[46%] top-0 w-8 h-8" style={{ animation: "star-pop 0.5s 0.25s both" }} />
              <StarBurst className="absolute end-[18%] top-1 w-6 h-6" style={{ animation: "star-pop 0.5s 0.4s both" }} />
            </div>
          )}
        </div>
      </div>

      {/* confetti on unlock */}
      {open && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-30" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute top-0 w-[2.5%] aspect-[1/2] rounded-sm"
              style={{
                left: `${(i * 8 + 5) % 94}%`,
                background: CONFETTI[i % CONFETTI.length],
                animation: `confetti-fall ${1.2 + (i % 4) * 0.2}s linear ${(i % 5) * 0.08}s both`,
              }}
            />
          ))}
        </div>
      )}
    </Scene>
  );
}
