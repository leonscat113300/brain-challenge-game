"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 96 — A strange sound comes from the closet: push the three    */
/* garments aside to reveal the musical teddy toy, then tap it.        */
/* ------------------------------------------------------------------ */

function TeddySvg({ dancing }: { dancing: boolean }) {
  return (
    <svg viewBox="0 0 120 140" className="h-auto w-full" aria-hidden style={dancing ? { animation: "wobble 0.9s ease-in-out infinite", transformOrigin: "bottom center" } : undefined}>
      {/* ears */}
      <circle cx="34" cy="26" r="12" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="86" cy="26" r="12" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="34" cy="26" r="6" fill="#FFD154" />
      <circle cx="86" cy="26" r="6" fill="#FFD154" />
      {/* head */}
      <circle cx="60" cy="50" r="30" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* muzzle */}
      <ellipse cx="60" cy="62" rx="16" ry="12" fill="#E8B57E" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="60" cy="56" r="5" fill="#3B2E5A" />
      <path d="M60 61 L60 66 M56 68 Q60 71 64 68" fill="none" stroke="#3B2E5A" strokeWidth="2.6" strokeLinecap="round" />
      {/* eyes */}
      {dancing ? (
        <path d="M44 44 Q49 39 54 44 M66 44 Q71 39 76 44" fill="none" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="49" cy="44" r="5" fill="#3B2E5A" />
          <circle cx="71" cy="44" r="5" fill="#3B2E5A" />
          <circle cx="50.5" cy="42.5" r="1.6" fill="#FAFAFA" />
          <circle cx="72.5" cy="42.5" r="1.6" fill="#FAFAFA" />
        </>
      )}
      {/* body + drum/keys */}
      <ellipse cx="60" cy="106" rx="30" ry="26" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4.5" />
      <ellipse cx="60" cy="108" rx="18" ry="13" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.4" />
      <path d="M52 104 L68 104 M52 111 L68 111" stroke="#3B2E5A" strokeWidth="2.6" strokeLinecap="round" />
      {/* arms */}
      <ellipse cx="26" cy="98" rx="10" ry="16" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" transform={dancing ? "rotate(-28 26 98)" : undefined} />
      <ellipse cx="94" cy="98" rx="10" ry="16" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" transform={dancing ? "rotate(28 94 98)" : undefined} />
      {/* feet */}
      <ellipse cx="42" cy="130" rx="12" ry="8" fill="#E8B57E" stroke="#3B2E5A" strokeWidth="3.6" />
      <ellipse cx="78" cy="130" rx="12" ry="8" fill="#E8B57E" stroke="#3B2E5A" strokeWidth="3.6" />
    </svg>
  );
}

type ClothKind = 0 | 1 | 2;

function ClothSvg({ kind }: { kind: ClothKind }) {
  if (kind === 0)
    return (
      /* striped shirt */
      <svg viewBox="0 0 120 130" className="h-auto w-full" aria-hidden>
        <path d="M38 14 L20 30 L32 48 L40 42 L40 118 Q60 126 80 118 L80 42 L88 48 L100 30 L82 14 Q60 26 38 14 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M40 56 H80 M40 76 H80 M40 96 H80" stroke="#FAFAFA" strokeWidth="7" strokeLinecap="round" />
        <path d="M40 56 H80 M40 76 H80" stroke="#3B2E5A" strokeWidth="1.4" strokeDasharray="4 5" />
      </svg>
    );
  if (kind === 1)
    return (
      /* pink dress */
      <svg viewBox="0 0 120 130" className="h-auto w-full" aria-hidden>
        <path d="M44 12 L28 26 L38 44 L44 40 L30 116 Q60 128 90 116 L76 40 L82 44 L92 26 L76 12 Q60 22 44 12 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M38 74 Q60 84 82 74" fill="none" stroke="#FFD154" strokeWidth="6" strokeLinecap="round" />
        <circle cx="60" cy="94" r="7" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.4" />
      </svg>
    );
  return (
    /* purple hoodie */
    <svg viewBox="0 0 120 130" className="h-auto w-full" aria-hidden>
      <path d="M40 10 Q60 -4 80 10 L98 28 L86 46 L80 42 L80 118 Q60 126 40 118 L40 42 L34 46 L22 28 Z" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M46 10 Q60 22 74 10" fill="none" stroke="#33205E" strokeWidth="6" strokeLinecap="round" />
      <path d="M52 26 Q60 34 68 26" fill="none" stroke="#FFD154" strokeWidth="4" strokeLinecap="round" />
      <rect x="46" y="72" width="28" height="26" rx="8" fill="#33205E" stroke="#3B2E5A" strokeWidth="3" />
    </svg>
  );
}

const CLOTH_POS = [
  { cls: "left-[16%]", slide: "-160%" },
  { cls: "left-[41%]", slide: "150%" },
  { cls: "right-[16%]", slide: "160%" },
];

export default function Level96({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [moved, setMoved] = useState([false, false, false]);
  const [toyTap, setToyTap] = useState(false);
  const [dancing, setDancing] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const count = moved.filter(Boolean).length;
  const allMoved = count === 3;

  const tapCloth = useCallback(
    (i: ClothKind) => {
      if (solved || moved[i]) return;
      sfx.whoosh();
      const next = moved.slice();
      next[i] = true;
      setMoved(next);
      onProgress((next.filter(Boolean).length / 3) * 0.75);
      if (next.filter(Boolean).length === 3) {
        timers.current.push(setTimeout(() => sfx.sparkle(), 350));
      }
    },
    [solved, moved, onProgress]
  );

  const tapCloset = useCallback(() => {
    if (solved || allMoved) return;
    sfx.fail();
    onMistake({
      fa: "لباس‌ها را یکی‌یکی کنار بزن تا صدای عجیب پیدا شود!",
      en: "Push the garments aside one by one to find the sound!",
    });
  }, [solved, allMoved, onMistake]);

  const tapToy = useCallback(() => {
    if (solved || !allMoved || toyTap) return;
    setToyTap(true);
    setDancing(true);
    /* little toy melody */
    sfx.click();
    timers.current.push(setTimeout(() => sfx.coin(), 160));
    timers.current.push(setTimeout(() => sfx.sparkle(), 340));
    timers.current.push(setTimeout(() => sfx.coin(), 520));
    timers.current.push(setTimeout(() => sfx.pop(), 700));
    timers.current.push(setTimeout(() => sfx.sparkle(), 900));
    onProgress(1);
    timers.current.push(setTimeout(() => sfx.cheer(), 1200));
    timers.current.push(setTimeout(onSolved, 2100));
  }, [solved, allMoved, toyTap, onProgress, onSolved]);

  return (
    <Scene bg="linear-gradient(180deg,#F4EEFB 0%,#E6DCF5 60%,#D9CBEC 100%)">
      {/* floating mystery notes */}
      {!dancing &&
        [
          { l: "30%", t: "6%", d: 0 },
          { l: "52%", t: "3%", d: 0.4 },
          { l: "70%", t: "8%", d: 0.8 },
        ].map((p, i) => (
          <div key={i} className="pointer-events-none absolute w-[6%]" style={{ left: p.l, top: p.t, animation: `float-up 2s ${p.d}s ease-out infinite` }} aria-hidden>
            <svg viewBox="0 0 30 34">
              <circle cx="9" cy="26" r="6" fill="#3B2E5A" />
              <path d="M15 26 V6 Q22 8 24 14" fill="none" stroke="#3B2E5A" strokeWidth="3.4" strokeLinecap="round" />
            </svg>
          </div>
        ))}

      {/* closet */}
      <div className="absolute left-1/2 top-[10%] w-[88%] -translate-x-1/2">
        <Pulse active={hintPulse > 0 && count === 0}>
          <div className="rounded-2xl border-[6px] border-[#3B2E5A] bg-[#B98BD6] p-3 shadow-[0_10px_0_rgba(59,46,90,0.25)]">
            {/* hanging rail */}
            <div className="relative h-40 rounded-xl border-[3px] border-[#7d55a1] bg-[#E3D3F3]">
              <div className="absolute left-3 right-3 top-3 h-2.5 rounded-full bg-[#3B2E5A]" aria-hidden />
              {/* clothes */}
              {([0, 1, 2] as ClothKind[]).map((k) => (
                <div key={k} className={`absolute bottom-2 top-6 w-[26%] ${CLOTH_POS[k].cls}`}>
                  <button
                    type="button"
                    onClick={() => tapCloth(k)}
                    aria-label={lang === "fa" ? "لباس" : "garment"}
                    className="block h-full w-full cursor-pointer"
                    style={
                      moved[k]
                        ? { transform: `translateX(${CLOTH_POS[k].slide}) rotate(14deg)`, opacity: 0.35, transition: "transform 0.6s ease, opacity 0.6s ease", pointerEvents: "none" }
                        : { animation: "breathe 2.4s ease-in-out infinite", transition: "transform 0.6s ease" }
                    }
                  >
                    <ClothSvg kind={k} />
                  </button>
                </div>
              ))}
              {/* musical toy revealed behind */}
              {allMoved && (
                <div className="absolute bottom-1 left-1/2 w-[34%] -translate-x-1/2">
                  <button
                    type="button"
                    onClick={tapToy}
                    aria-label={lang === "fa" ? "اسباب‌بازی موزیکال" : "musical toy"}
                    className="block w-full cursor-pointer"
                    style={{ animation: "pop-in 0.5s ease-out both" }}
                  >
                    <Pulse active={hintPulse > 0 && !toyTap}>
                      <TeddySvg dancing={dancing} />
                    </Pulse>
                  </button>
                </div>
              )}
            </div>
            {/* closet bottom board */}
            <button type="button" onClick={tapCloset} aria-label={lang === "fa" ? "کمد" : "closet"} className="mt-2 block h-5 w-full cursor-pointer rounded-lg bg-[#7d55a1]" aria-hidden={allMoved} />
          </div>
        </Pulse>
      </div>

      {/* success notes */}
      {dancing &&
        [
          { l: "26%", t: "18%", d: 0 },
          { l: "64%", t: "12%", d: 0.3 },
          { l: "46%", t: "8%", d: 0.6 },
        ].map((p, i) => (
          <div key={i} className="pointer-events-none absolute w-[7%]" style={{ left: p.l, top: p.t, animation: `float-up 1.6s ${p.d}s ease-out infinite` }} aria-hidden>
            <svg viewBox="0 0 30 34">
              <circle cx="9" cy="26" r="6" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.4" />
              <path d="M15 26 V6 Q22 8 24 14" fill="none" stroke="#FF6B81" strokeWidth="3.4" strokeLinecap="round" />
            </svg>
          </div>
        ))}
    </Scene>
  );
}
