"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { animalSfx } from "@/lib/game/audio";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 61 — Tap each animal to hear its sound (1-3 volume bars).     */
/* After hearing at least two, tap the loudest one (the lion) to win.  */
/* ------------------------------------------------------------------ */

type AnimalId = "mouse" | "duck" | "lion";

const ANIMALS: Array<{ id: AnimalId; bars: number; sound: () => void; fa: string; en: string }> = [
  { id: "mouse", bars: 1, sound: () => animalSfx.mouse(), fa: "موش", en: "mouse" },
  { id: "duck", bars: 2, sound: () => animalSfx.duck(), fa: "اردک", en: "duck" },
  { id: "lion", bars: 3, sound: () => animalSfx.lion(), fa: "شیر", en: "lion" },
];

function MouseSvg() {
  return (
    <svg viewBox="0 0 120 110" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" aria-hidden>
      <path d="M22 88 Q2 84 8 64 Q14 74 26 76" fill="#A9A3B8" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="62" cy="52" r="14" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="48" cy="30" r="13" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="76" cy="30" r="13" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="62" cy="46" r="26" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="53" cy="42" r="4" fill="#3B2E5A" />
      <circle cx="71" cy="42" r="4" fill="#3B2E5A" />
      <circle cx="54.5" cy="40.5" r="1.4" fill="#fff" />
      <circle cx="72.5" cy="40.5" r="1.4" fill="#fff" />
      <circle cx="62" cy="54" r="3.4" fill="#FF6B81" />
      <path d="M56 62 Q62 67 68 62" stroke="#3B2E5A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="40" cy="84" rx="20" ry="14" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4.5" />
    </svg>
  );
}

function DuckSvg() {
  return (
    <svg viewBox="0 0 140 120" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" aria-hidden>
      <ellipse cx="70" cy="86" rx="44" ry="26" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      <path d="M40 96 L36 108 M52 100 L50 110" stroke="#FF6B81" strokeWidth="4" strokeLinecap="round" />
      <circle cx="92" cy="46" r="22" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="98" cy="40" r="3.6" fill="#3B2E5A" />
      <circle cx="99.5" cy="38.5" r="1.3" fill="#fff" />
      <path d="M112 46 L130 50 L112 56 Q108 51 112 46" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M36 66 Q58 56 80 66" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function LionSvg({ crowned }: { crowned: boolean }) {
  return (
    <svg viewBox="0 0 180 160" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.2)]" aria-hidden>
      {/* tail */}
      <path d="M124 128 Q158 122 154 96" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M124 128 Q158 122 154 96" stroke="#FFD154" strokeWidth="12" fill="none" strokeLinecap="round" />
      <circle cx="154" cy="90" r="7" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" />
      {/* body */}
      <ellipse cx="88" cy="126" rx="36" ry="22" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* front paws */}
      <ellipse cx="66" cy="146" rx="11" ry="7" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <ellipse cx="102" cy="146" rx="11" ry="7" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      {/* spiky mane */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 360) / 12;
        return (
          <path
            key={i}
            d="M-11 -46 L0 -62 L11 -46 Z"
            fill="#FF6B81"
            stroke="#3B2E5A"
            strokeWidth="3.5"
            strokeLinejoin="round"
            transform={`translate(90 76) rotate(${a})`}
          />
        );
      })}
      <circle cx="90" cy="76" r="42" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
      {/* ears */}
      <circle cx="60" cy="42" r="11" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="120" cy="42" r="11" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
      {/* head */}
      <circle cx="90" cy="76" r="36" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="76" cy="70" r="5" fill="#3B2E5A" />
      <circle cx="104" cy="70" r="5" fill="#3B2E5A" />
      <circle cx="78" cy="68" r="1.8" fill="#fff" />
      <circle cx="106" cy="68" r="1.8" fill="#fff" />
      <ellipse cx="90" cy="84" rx="6" ry="4.4" fill="#3B2E5A" />
      <path d="M80 94 Q90 102 100 94" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="66" cy="84" rx="6" ry="3.6" fill="#FF9FB2" />
      <ellipse cx="114" cy="84" rx="6" ry="3.6" fill="#FF9FB2" />
      {/* whisker dots */}
      <circle cx="72" cy="92" r="1.4" fill="#3B2E5A" />
      <circle cx="108" cy="92" r="1.4" fill="#3B2E5A" />
      {crowned && (
        <g transform="translate(90 10)" style={{ animation: "star-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <path d="M-22 12 L-22 -10 L-10 0 L0 -14 L10 0 L22 -10 L22 12 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" strokeLinejoin="round" />
          <circle cx="0" cy="-16" r="3" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

export default function Level61({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [heard, setHeard] = useState<AnimalId[]>([]);
  const [meter, setMeter] = useState<{ id: AnimalId; key: number } | null>(null);
  const [win, setWin] = useState(false);
  const [done, setDone] = useState(false);
  const meterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
      if (meterTimer.current) clearTimeout(meterTimer.current);
    };
  }, []);

  const tapAnimal = useCallback(
    (id: AnimalId) => {
      if (solved || done) return;
      const def = ANIMALS.find((a) => a.id === id)!;
      def.sound();

      if (id === "lion" && heard.length >= 2 && !win) {
        setWin(true);
        setDone(true);
        sfx.sparkle();
        onProgress(1);
        timers.current.push(setTimeout(onSolved, 900));
        return;
      }
      if (id === "lion" && heard.length < 2) {
        onMistake({
          fa: "اول صدای بقیه را هم بشنو!",
          en: "First listen to the others too!",
        });
        /* still show the lion's meter */
      }
      if (!heard.includes(id)) {
        const nh = [...heard, id];
        setHeard(nh);
        onProgress(Math.min(0.9, nh.length / 3));
      }
      setMeter({ id, key: Date.now() });
      if (meterTimer.current) clearTimeout(meterTimer.current);
      meterTimer.current = setTimeout(() => setMeter(null), 1400);
    },
    [solved, done, heard, win, onProgress, onMistake, onSolved]
  );

  const meterFor = (id: AnimalId) => meter?.id === id;
  const def = (id: AnimalId) => ANIMALS.find((a) => a.id === id)!;

  return (
    <Scene bg="linear-gradient(180deg,#EAF7FB 0%,#DFF3F7 52%,#DFF0D8 53%,#CFE8C6 100%)">
      {/* stage dots */}
      <div className="absolute top-[6%] left-1/2 flex -translate-x-1/2 gap-2" aria-hidden>
        <div className="h-3 w-3 rounded-full border-2 border-[#3B2E5A] bg-[#FFD154]" />
        <div className="h-3 w-3 rounded-full border-2 border-[#3B2E5A] bg-[#FF6B81]" />
        <div className="h-3 w-3 rounded-full border-2 border-[#3B2E5A] bg-[#1EC8CF]" />
      </div>

      {/* mouse */}
      <div className="absolute bottom-[14%] start-[6%] w-[20%]">
        <button
          type="button"
          onClick={() => tapAnimal("mouse")}
          aria-label={lang === "fa" ? "موش" : "mouse"}
          className="block w-full cursor-pointer border-0 bg-transparent p-0"
          style={{ animation: meterFor("mouse") ? "wobble 0.4s ease-in-out" : undefined }}
        >
          <MouseSvg />
        </button>
        {meterFor("mouse") && <VolumeBars bars={def("mouse").bars} />}
      </div>

      {/* duck */}
      <div className="absolute bottom-[13%] left-1/2 w-[26%] -translate-x-1/2">
        <button
          type="button"
          onClick={() => tapAnimal("duck")}
          aria-label={lang === "fa" ? "اردک" : "duck"}
          className="block w-full cursor-pointer border-0 bg-transparent p-0"
          style={{ animation: meterFor("duck") ? "wobble 0.4s ease-in-out" : undefined }}
        >
          <DuckSvg />
        </button>
        {meterFor("duck") && <VolumeBars bars={def("duck").bars} />}
      </div>

      {/* lion — the answer */}
      <div className="absolute bottom-[8%] end-[4%] w-[34%]">
        <Pulse active={hintPulse > 0 && heard.length >= 2 && !done}>
          <button
            type="button"
            onClick={() => tapAnimal("lion")}
            aria-label={lang === "fa" ? "شیر" : "lion"}
            className="block w-full cursor-pointer border-0 bg-transparent p-0"
            style={{ animation: meterFor("lion") || win ? "wobble 0.5s ease-in-out" : undefined }}
          >
            <LionSvg crowned={win} />
          </button>
        </Pulse>
        {meterFor("lion") && <VolumeBars bars={def("lion").bars} />}
      </div>

      {/* heard checklist */}
      <div className="absolute start-[5%] top-[7%] flex flex-col gap-1.5" aria-hidden>
        {ANIMALS.map((a) => (
          <div
            key={a.id}
            className="flex items-center gap-1.5 rounded-full border-2 border-[#3B2E5A] px-2 py-0.5"
            style={{ background: heard.includes(a.id) ? "#DFF3E1" : "#FAFAFA" }}
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5">
              <circle cx="8" cy="8" r="7" fill={heard.includes(a.id) ? "#4CAF50" : "#E0DAEE"} stroke="#3B2E5A" strokeWidth="1.6" />
              {heard.includes(a.id) && <path d="M4.5 8 L7 10.5 L11.5 5.5" stroke="#FAFAFA" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            </svg>
            <span className="text-[10px] font-bold text-[#3B2E5A]">{lang === "fa" ? a.fa : a.en}</span>
          </div>
        ))}
      </div>
    </Scene>
  );
}

function VolumeBars({ bars }: { bars: number }) {
  return (
    <div
      className="absolute -top-7 left-1/2 flex -translate-x-1/2 items-end gap-1.5 rounded-full border-[3px] border-[#3B2E5A] bg-[#FAFAFA] px-2 py-1.5"
      style={{ animation: "pop-in 0.25s ease both" }}
      aria-hidden
    >
      {[8, 15, 22].map((h, i) => (
        <div
          key={i}
          className="w-2.5 rounded-full"
          style={{
            height: h,
            background: i < bars ? ["#A9A3B8", "#FFD154", "#FF6B81"][i] : "#E0DAEE",
            boxShadow: i < bars ? "0 0 0 2px rgba(59,46,90,0.35)" : undefined,
          }}
        />
      ))}
    </div>
  );
}
