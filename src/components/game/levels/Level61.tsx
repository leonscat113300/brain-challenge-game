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
    <svg viewBox="0 0 150 110" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" aria-hidden>
      {/* long thin tail curling behind */}
      <path d="M24 88 Q0 80 8 58 Q16 40 34 46" fill="none" stroke="#FFB3C6" strokeWidth="6" strokeLinecap="round" />
      <path d="M24 88 Q0 80 8 58 Q16 40 34 46" fill="none" stroke="#3B2E5A" strokeWidth="2" strokeLinecap="round" opacity="0.35" />
      {/* back haunch */}
      <ellipse cx="52" cy="80" rx="34" ry="26" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* body */}
      <ellipse cx="88" cy="74" rx="40" ry="28" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* head */}
      <circle cx="114" cy="54" r="23" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* ears */}
      <circle cx="128" cy="36" r="10" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="128" cy="36" r="4.5" fill="#FF9FB2" />
      <circle cx="104" cy="32" r="13" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="104" cy="32" r="6.5" fill="#FF9FB2" />
      {/* face */}
      <circle cx="120" cy="52" r="4.4" fill="#3B2E5A" />
      <circle cx="121.6" cy="50.4" r="1.5" fill="#FAFAFA" />
      <circle cx="136" cy="58" r="4" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2" />
      {/* whiskers */}
      <path d="M130 60 L148 56 M130 64 L147 66" stroke="#3B2E5A" strokeWidth="2" strokeLinecap="round" />
      {/* blush */}
      <ellipse cx="126" cy="62" rx="4.6" ry="3" fill="#FF9FB2" opacity="0.85" />
      {/* paws */}
      <ellipse cx="106" cy="101" rx="10" ry="5" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="3.4" />
      <ellipse cx="74" cy="103" rx="10" ry="5" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="3.4" />
    </svg>
  );
}

function DuckSvg() {
  return (
    <svg viewBox="0 0 150 120" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" aria-hidden>
      {/* tail feathers */}
      <path d="M30 64 Q14 54 18 40 Q32 48 42 54 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      {/* body */}
      <ellipse cx="72" cy="74" rx="42" ry="30" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* wing */}
      <path d="M50 72 Q66 56 94 64 Q86 86 60 86 Q50 82 50 72 Z" fill="#FFC93C" stroke="#3B2E5A" strokeWidth="3.6" strokeLinejoin="round" />
      <path d="M62 72 Q76 66 88 70" stroke="#E8A81C" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* neck + head */}
      <path d="M98 58 Q106 44 102 28" fill="none" stroke="#FFD154" strokeWidth="16" strokeLinecap="round" />
      <circle cx="103" cy="25" r="15" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* bill */}
      <path d="M113 22 L136 27 L113 34 Q109 28 113 22" fill="#FF8A3C" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M115 28 L133 28" stroke="#3B2E5A" strokeWidth="1.6" opacity="0.5" />
      {/* eye */}
      <circle cx="106" cy="21" r="3.6" fill="#3B2E5A" />
      <circle cx="107.3" cy="19.7" r="1.2" fill="#FAFAFA" />
      {/* feet */}
      <path d="M62 103 L58 112 M64 112 L50 112 M82 102 L80 112 M84 112 L70 112" stroke="#FF8A3C" strokeWidth="4" strokeLinecap="round" />
      {/* water line */}
      <path d="M14 114 Q36 108 58 114 Q82 120 104 114 Q124 109 142 112" stroke="#1EC8CF" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.85" />
    </svg>
  );
}

function LionSvg({ crowned }: { crowned: boolean }) {
  const maneAngles = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
  return (
    <svg viewBox="0 0 180 170" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.2)]" aria-hidden>
      {/* tail */}
      <path d="M126 132 Q160 126 156 98" stroke="#3B2E5A" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M126 132 Q160 126 156 98" stroke="#FFD154" strokeWidth="11" fill="none" strokeLinecap="round" />
      <circle cx="156" cy="92" r="7" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" />
      {/* back paws */}
      <ellipse cx="62" cy="150" rx="12" ry="8" fill="#FFC93C" stroke="#3B2E5A" strokeWidth="3.6" />
      <ellipse cx="114" cy="150" rx="12" ry="8" fill="#FFC93C" stroke="#3B2E5A" strokeWidth="3.6" />
      {/* body */}
      <ellipse cx="90" cy="128" rx="40" ry="26" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* scalloped mane: overlapping circles around the head */}
      {maneAngles.map((a) => {
        const r = (a * Math.PI) / 180;
        return <circle key={a} cx={92 + Math.cos(r) * 33} cy={70 + Math.sin(r) * 33} r="14" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3.4" />;
      })}
      <circle cx="92" cy="70" r="33" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" />
      {/* ears */}
      <circle cx="66" cy="40" r="10" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.6" />
      <circle cx="118" cy="40" r="10" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.6" />
      {/* face */}
      <circle cx="92" cy="72" r="28" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
      <circle cx="82" cy="66" r="4.6" fill="#3B2E5A" />
      <circle cx="102" cy="66" r="4.6" fill="#3B2E5A" />
      <circle cx="83.6" cy="64.4" r="1.6" fill="#FAFAFA" />
      <circle cx="103.6" cy="64.4" r="1.6" fill="#FAFAFA" />
      <ellipse cx="92" cy="77" rx="5.5" ry="4" fill="#3B2E5A" />
      <path d="M84 88 Q92 94 100 88" stroke="#3B2E5A" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      {/* muzzle dots */}
      <circle cx="83" cy="81" r="1.3" fill="#3B2E5A" />
      <circle cx="101" cy="81" r="1.3" fill="#3B2E5A" />
      {/* blush */}
      <ellipse cx="72" cy="76" rx="5" ry="3.4" fill="#FF9FB2" opacity="0.8" />
      <ellipse cx="112" cy="76" rx="5" ry="3.4" fill="#FF9FB2" opacity="0.8" />
      {crowned && (
        <g transform="translate(92 6)" style={{ animation: "star-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
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
