"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 67 — Which switch lights the room lamp? Follow each wire:     */
/* red ends at a fan, yellow at a radio, only GREEN reaches the lamp.  */
/* ------------------------------------------------------------------ */

type WireId = "red" | "yellow" | "green";

const WIRES: Record<WireId, { d: string; color: string; device: "fan" | "radio" | "lamp"; fa: string; en: string }> = {
  red: {
    d: "M60 236 C 130 236, 120 90, 322 62",
    color: "#FF6B81",
    device: "fan",
    fa: "قرمز",
    en: "red",
  },
  yellow: {
    d: "M60 276 C 150 300, 240 270, 330 238",
    color: "#FFD154",
    device: "radio",
    fa: "زرد",
    en: "yellow",
  },
  green: {
    d: "M60 316 C 110 250, 40 120, 150 64 L 236 46",
    color: "#4CAF50",
    device: "lamp",
    fa: "سبز",
    en: "green",
  },
};

function FanSvg({ spinning }: { spinning: boolean }) {
  return (
    <svg viewBox="0 0 90 100" className="h-auto w-full" aria-hidden>
      <rect x="38" y="58" width="14" height="30" rx="5" fill="#7FA8B8" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="26" y="86" width="38" height="10" rx="5" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4" />
      <g style={{ transformOrigin: "45px 36px", animation: spinning ? "spin 0.9s linear 2" : undefined }}>
        {[0, 120, 240].map((a) => (
          <ellipse key={a} cx="45" cy="20" rx="9" ry="15" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="3.5" transform={`rotate(${a} 45 36)`} />
        ))}
      </g>
      <circle cx="45" cy="36" r="8" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  );
}

function RadioSvg({ playing }: { playing: boolean }) {
  return (
    <svg viewBox="0 0 110 80" className="h-auto w-full" aria-hidden>
      <rect x="6" y="14" width="98" height="58" rx="12" fill="#FF9B77" stroke="#3B2E5A" strokeWidth="4.5" />
      <rect x="16" y="24" width="46" height="36" rx="6" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="80" cy="34" r="9" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
      <circle cx="80" cy="56" r="7" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="3" />
      <line x1="84" y1="16" x2="102" y2="0" stroke="#3B2E5A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="102" cy="0" r="3.5" fill="#3B2E5A" />
      {playing && (
        <g style={{ animation: "pop-in 0.3s ease both" }}>
          <path d="M2 10 Q-4 20 2 30 M8 6 Q0 20 8 34" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
        </g>
      )}
    </svg>
  );
}

function LampSvg({ lit }: { lit: boolean }) {
  return (
    <svg viewBox="0 0 120 110" className="h-auto w-full" aria-hidden>
      {/* cord from ceiling */}
      <line x1="60" y1="0" x2="60" y2="26" stroke="#3B2E5A" strokeWidth="4" />
      {/* shade */}
      <path d="M28 56 L60 22 L92 56 Z" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      {/* bulb */}
      <circle cx="60" cy="66" r="18" fill={lit ? "#FFD154" : "#E7E2F2"} stroke="#3B2E5A" strokeWidth="4.5" />
      {lit && (
        <>
          <path d="M52 66 Q56 62 60 66 Q64 70 68 66" stroke="#3B2E5A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="54" cy="60" r="2.2" fill="#3B2E5A" />
          <circle cx="66" cy="60" r="2.2" fill="#3B2E5A" />
        </>
      )}
      {lit && (
        <g aria-hidden>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1="60" y1="94" x2="60" y2="102" stroke="#FFD154" strokeWidth="4" strokeLinecap="round" transform={`rotate(${a} 60 66)`} />
          ))}
        </g>
      )}
    </svg>
  );
}

export default function Level67({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [litWire, setLitWire] = useState<WireId | null>(null);
  const [lampOn, setLampOn] = useState(false);
  const [done, setDone] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tapSwitch = useCallback(
    (id: WireId) => {
      if (solved || done) return;
      if (id === "green") {
        setLitWire("green");
        sfx.click();
        setLampOn(true);
        setDone(true);
        timers.current.push(setTimeout(() => sfx.chime(), 300));
        onProgress(0.6);
        timers.current.push(setTimeout(() => onProgress(1), 700));
        timers.current.push(setTimeout(onSolved, 1600));
        return;
      }
      /* wrong wire — trace it to its dead-end device */
      setLitWire(id);
      sfx.fail();
      onMistake({
        fa: `سیم ${WIRES[id].fa} به چراغ نمی‌رسد! مسیر سیم‌ها را دنبال کن.`,
        en: `The ${WIRES[id].en} wire goes somewhere else! Follow the wires.`,
      });
      timers.current.push(setTimeout(() => setLitWire((w) => (w === id ? null : w)), 1300));
    },
    [solved, done, onProgress, onSolved, onMistake]
  );

  const tapLamp = useCallback(() => {
    if (done) return;
    sfx.laugh();
    onMistake({
      fa: "لامپ را باید با کلید روشن کنی!",
      en: "You turn the lamp on with its switch!",
    });
  }, [done, onMistake]);

  const deviceLit = (dev: "fan" | "radio" | "lamp") => !!litWire && WIRES[litWire].device === dev;

  return (
    <Scene bg="linear-gradient(180deg,#DCD6EA 0%,#C9C1E0 60%,#B7ABDA 100%)">
      {/* wall pattern */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(59,46,90,0.12) 0 3px, transparent 3px 48px)" }} aria-hidden />

      {/* wires svg overlay */}
      <svg viewBox="0 0 400 340" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
        {(Object.keys(WIRES) as WireId[]).map((id) => {
          const w = WIRES[id];
          const active = litWire === id;
          return (
            <g key={id}>
              <path d={w.d} fill="none" stroke="#3B2E5A" strokeWidth={active ? 9 : 7} opacity="0.9" strokeLinecap="round" />
              <path d={w.d} fill="none" stroke={w.color} strokeWidth={active ? 7 : 5} strokeLinecap="round" style={active ? { filter: "drop-shadow(0 0 6px rgba(255,209,84,0.9))" } : undefined} />
            </g>
          );
        })}
      </svg>

      {/* lamp (correct target) */}
      <button type="button" onClick={tapLamp} aria-label={lang === "fa" ? "چراغ" : "lamp"} className="absolute left-[36%] top-[2%] w-[26%] cursor-pointer border-0 bg-transparent p-0">
        <LampSvg lit={lampOn} />
      </button>

      {/* fan — red wire dead end */}
      <div className="absolute end-[2%] top-[6%] w-[22%]" style={{ animation: deviceLit("fan") ? "bob 0.5s ease-in-out infinite" : undefined }}>
        <FanSvg spinning={deviceLit("fan")} />
      </div>

      {/* radio — yellow wire dead end */}
      <div className="absolute bottom-[16%] end-[1%] w-[27%]" style={{ animation: deviceLit("radio") ? "wobble 0.4s ease-in-out" : undefined }}>
        <RadioSvg playing={deviceLit("radio")} />
      </div>

      {/* switch panel */}
      <div className="absolute bottom-[4%] start-[2%] w-[26%] rounded-2xl border-[5px] border-[#3B2E5A] bg-[#FAFAFA] p-2 shadow-[0_4px_0_rgba(59,46,90,0.25)]">
        <div className="flex flex-col items-stretch gap-2">
          {(["red", "yellow", "green"] as WireId[]).map((id) => (
            <Pulse key={id} active={hintPulse > 0 && !done && id === "green"}>
              <button
                type="button"
                onClick={() => tapSwitch(id)}
                aria-label={lang === "fa" ? `کلید ${WIRES[id].fa}` : `${WIRES[id].en} switch`}
                className="flex w-full cursor-pointer items-center gap-2 rounded-xl border-4 border-[#3B2E5A] bg-[#E7DDF4] px-2 py-1.5 transition-transform active:scale-95"
              >
                <span className="h-4 w-8 rounded-full border-[3px] border-[#3B2E5A]" style={{ background: litWire === id ? "#4CAF50" : "#C9C4D8" }} aria-hidden />
                <span className="h-3.5 w-3.5 rounded-full" style={{ background: WIRES[id].color, border: "2.5px solid #3B2E5A" }} aria-hidden />
                <span className="text-[10px] font-bold text-[#3B2E5A]">{lang === "fa" ? WIRES[id].fa : WIRES[id].en}</span>
              </button>
            </Pulse>
          ))}
        </div>
      </div>

      {/* lamp glow */}
      {lampOn && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 49% 22%, rgba(255,209,84,0.5) 0%, rgba(255,209,84,0.15) 40%, rgba(255,209,84,0) 70%)" }}
          aria-hidden
        />
      )}
    </Scene>
  );
}
