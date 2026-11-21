"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 94 — Fit 3 books on the shelf: sort them big → medium →       */
/* small, left to right, so they all fit inside the case.              */
/* ------------------------------------------------------------------ */

type Size = "big" | "mid" | "small";
const ORDER: Size[] = ["big", "mid", "small"];
const LABEL: Record<Size, { fa: string; en: string }> = {
  big: { fa: "بزرگ", en: "big" },
  mid: { fa: "متوسط", en: "medium" },
  small: { fa: "کوچک", en: "small" },
};

function BookSvg({ size, color }: { size: Size; color: string }) {
  const w = size === "big" ? 54 : size === "mid" ? 44 : 34;
  const h = size === "big" ? 96 : size === "mid" ? 88 : 78;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" aria-hidden>
      <rect x="2" y="2" width={w - 4} height={h - 4} rx="7" fill={color} stroke="#3B2E5A" strokeWidth="4.5" />
      {/* spine bands */}
      <rect x="8" y="12" width={w - 16} height="8" rx="4" fill="#FAFAFA" opacity="0.85" />
      <rect x="8" y={h - 26} width={w - 16} height="8" rx="4" fill="#FAFAFA" opacity="0.85" />
      <circle cx={w / 2} cy={h / 2} r={size === "small" ? 7 : 9} fill="#FAFAFA" opacity="0.9" />
    </svg>
  );
}

export default function Level94({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  /* slot -> book size or null */
  const [slots, setSlots] = useState<Array<Size | null>>([null, null, null]);
  const [checked, setChecked] = useState(false);
  const slotRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const place = useCallback(
    (size: Size, slot: number) => {
      const cur = slots;
      if (cur[slot]) return false;
      const next = cur.slice();
      next[slot] = size;
      setSlots(next);
      sfx.pop();
      const placedCount = next.filter(Boolean).length;
      onProgress(placedCount / 3);
      if (placedCount === 3) {
        const ok = next[0] === "big" && next[1] === "mid" && next[2] === "small";
        setChecked(true);
        timers.current.push(
          setTimeout(() => {
            if (ok) {
              sfx.sparkle();
              timers.current.push(setTimeout(() => sfx.cheer(), 450));
              timers.current.push(setTimeout(onSolved, 1500));
            } else {
              sfx.fail();
              onMistake({
                fa: "کتاب‌ها جا نشدند! از بزرگ به کوچک مرتب کن: بزرگ، متوسط، کوچک.",
                en: "They don't fit! Sort big to small: big, medium, small.",
              });
              timers.current.push(
                setTimeout(() => {
                  setSlots([null, null, null]);
                  setChecked(false);
                }, 700)
              );
            }
          }, 500)
        );
      }
      return true;
    },
    [slots, onProgress, onMistake, onSolved]
  );

  /* generic factory so all three books share the same logic */
  const makeEnd =
    (size: Size) =>
    (d: DragState, api: { reset: () => void }) => {
      if (!d.everMoved) {
        sfx.click();
        api.reset();
        return;
      }
      const el = bookEls.current[size];
      for (let i = 0; i < 3; i++) {
        const target = slotRefs[i].current;
        const r = el?.getBoundingClientRect();
        const tr = target?.getBoundingClientRect();
        if (r && tr) {
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          if (cx >= tr.left - 20 && cx <= tr.right + 20 && cy >= tr.top - 26 && cy <= tr.bottom + 26) {
            if (place(size, i)) {
              api.reset();
              return;
            }
          }
        }
      }
      api.reset();
      sfx.fail();
      onMistake({
        fa: "کتاب را روی یکی از سه خانهٔ قفسه بگذار!",
        en: "Drop the book onto one of the three shelf slots!",
      });
    };

  const bookEls = useRef<Record<Size, HTMLDivElement | null>>({ big: null, mid: null, small: null });
  const dragBig = useDragMove(makeEnd("big"));
  const dragMid = useDragMove(makeEnd("mid"));
  const dragSmall = useDragMove(makeEnd("small"));
  const drags: Record<Size, ReturnType<typeof useDragMove>> = { big: dragBig, mid: dragMid, small: dragSmall };

  const colors: Record<Size, string> = { big: "#FF6B81", mid: "#FFD154", small: "#6C4AB6" };
  const floorPos: string[] = [
    "bottom-[8%] left-[8%] w-[24%]",
    "bottom-[6%] left-[38%] w-[20%]",
    "bottom-[10%] right-[10%] w-[17%]",
  ];

  return (
    <Scene bg="linear-gradient(180deg,#FFF6E3 0%,#FAE8C8 55%,#EFD9AE 100%)">
      {/* bookcase */}
      <div className="absolute left-1/2 top-[8%] w-[86%] -translate-x-1/2">
        <Pulse active={hintPulse > 0 && slots.filter(Boolean).length === 0}>
          <div className="rounded-2xl border-[6px] border-[#3B2E5A] bg-[#C98A4B] p-3 shadow-[0_10px_0_rgba(59,46,90,0.25)]">
            <div className="relative grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  ref={slotRefs[i]}
                  className={`flex h-28 items-end justify-center rounded-xl border-[3px] border-dashed ${
                    checked && slots[i]
                      ? "border-[#4CAF50] bg-[#DFF3E1]"
                      : "border-[#8a5a2b] bg-[#E7B57E]"
                  }`}
                >
                  {slots[i] && (
                    <div className="w-[52%]" style={{ animation: "pop-in 0.35s ease-out both" }}>
                      <BookSvg size={slots[i]!} color={colors[slots[i]!]} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* case bottom */}
            <div className="mt-2 h-4 rounded-lg bg-[#A96F35]" aria-hidden />
          </div>
        </Pulse>
        {/* legs */}
        <div className="mx-auto flex w-[80%] justify-between px-4" aria-hidden>
          <div className="h-6 w-5 rounded-b-lg bg-[#8a5a2b]" />
          <div className="h-6 w-5 rounded-b-lg bg-[#8a5a2b]" />
        </div>
      </div>

      {/* helper caption */}
      <div className="pointer-events-none absolute left-1/2 top-[58%] w-[80%] -translate-x-1/2 text-center text-sm font-bold text-[#3B2E5A] opacity-70">
        {lang === "fa" ? "کتاب‌ها را از بزرگ به کوچک بچین!" : "Sort the books from big to small!"}
      </div>

      {/* books on the floor */}
      {ORDER.map((size, i) => {
        const placed = slots.includes(size);
        if (placed) return null;
        const d = drags[size];
        return (
          <div key={size} className={`absolute ${floorPos[i]}`}>
            <div
              ref={(el) => {
                bookEls.current[size] = el;
              }}
              {...d.bind}
              role="button"
              aria-label={`${LABEL[size].en} book`}
              className="cursor-grab active:cursor-grabbing"
              style={{
                transform: `translate(${d.x}px, ${d.y}px)`,
                transition: d.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
                zIndex: 20,
              }}
            >
              <Pulse active={hintPulse > 0 && i === 0 && slots.filter(Boolean).length === 0}>
                <BookSvg size={size} color={colors[size]} />
              </Pulse>
            </div>
          </div>
        );
      })}
    </Scene>
  );
}
