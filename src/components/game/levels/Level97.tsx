"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 97 — Set the table: stack the three plates in the right       */
/* order — big at the bottom, medium in the middle, small on top.      */
/* ------------------------------------------------------------------ */

type Size = "big" | "mid" | "small";
const STACK_ORDER: Size[] = ["big", "mid", "small"];
const LABEL: Record<Size, { fa: string; en: string }> = {
  big: { fa: "بزرگ", en: "big" },
  mid: { fa: "متوسط", en: "medium" },
  small: { fa: "کوچک", en: "small" },
};

function PlateSvg({ size, color }: { size: Size; color: string }) {
  const rx = size === "big" ? 80 : size === "mid" ? 62 : 46;
  return (
    <svg viewBox="0 0 170 46" className="h-auto w-full" aria-hidden>
      <ellipse cx="85" cy="30" rx={rx} ry="13" fill={color} stroke="#3B2E5A" strokeWidth="4.5" />
      <ellipse cx="85" cy="26" rx={rx - 12} ry="9" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="2.8" />
      <ellipse cx="85" cy="26" rx={rx - 26} ry="5.5" fill={color} opacity="0.5" />
    </svg>
  );
}

export default function Level97({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  /* stacked plates, bottom first */
  const [stack, setStack] = useState<Size[]>([]);
  const targetRef = useRef<HTMLDivElement>(null);
  const plateEls = useRef<Record<Size, HTMLDivElement | null>>({ big: null, mid: null, small: null });
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const makeEnd =
    (size: Size) =>
    (d: DragState, api: { reset: () => void }) => {
      if (solved) return;
      if (!d.everMoved) {
        sfx.click();
        api.reset();
        return;
      }
      const a = plateEls.current[size]?.getBoundingClientRect();
      const b = targetRef.current?.getBoundingClientRect();
      if (a && b) {
        const cx = a.left + a.width / 2;
        const cy = a.top + a.height / 2;
        const inside = cx >= b.left - 24 && cx <= b.right + 24 && cy >= b.top - 30 && cy <= b.bottom + 30;
        if (inside) {
          const cur = stack;
          const expected = STACK_ORDER[cur.length];
          if (expected === size) {
            const next = cur.slice();
            next.push(size);
            setStack(next);
            sfx.pop();
            api.reset();
            onProgress(next.length / 3);
            if (next.length === 3) {
              timers.current.push(setTimeout(() => sfx.sparkle(), 350));
              timers.current.push(setTimeout(() => sfx.cheer(), 750));
              timers.current.push(setTimeout(onSolved, 1700));
            }
            return;
          }
          api.reset();
          sfx.fail();
          onMistake({
            fa:
              cur.length === 0
                ? "اول بشقاب بزرگ را پایین بگذار!"
                : cur.length === 1
                  ? "حالا بشقاب متوسط را روی آن بگذار!"
                  : "در آخر بشقاب کوچک را روی همه بگذار!",
            en:
              cur.length === 0
                ? "Start with the big plate on the bottom!"
                : cur.length === 1
                  ? "Now put the medium plate on it!"
                  : "Finish with the small plate on top!",
          });
          return;
        }
      }
      api.reset();
    };

  const dragBig = useDragMove(makeEnd("big"));
  const dragMid = useDragMove(makeEnd("mid"));
  const dragSmall = useDragMove(makeEnd("small"));
  const drags: Record<Size, ReturnType<typeof useDragMove>> = { big: dragBig, mid: dragMid, small: dragSmall };
  const colors: Record<Size, string> = { big: "#FF6B81", mid: "#FFD154", small: "#1EC8CF" };
  const floorPos: Record<Size, string> = {
    big: "bottom-[6%] left-[8%] w-[34%]",
    mid: "bottom-[9%] left-[36%] w-[27%]",
    small: "bottom-[12%] right-[8%] w-[21%]",
  };
  const stackOffsets: Record<Size, string> = { big: "bottom-0", mid: "bottom-[13px]", small: "bottom-[24px]" };
  const stackWidths: Record<Size, string> = { big: "w-full", mid: "w-[80%]", small: "w-[62%]" };

  return (
    <Scene bg="linear-gradient(180deg,#FFF3E4 0%,#FAE7CF 55%,#EDD6B0 62%,#E0C89C 100%)">
      {/* table */}
      <div className="absolute left-1/2 top-[6%] w-[80%] -translate-x-1/2" aria-hidden>
        <div className="h-10 rounded-2xl border-[5px] border-[#3B2E5A] bg-[#C98A4B]" />
        <div className="mx-auto flex w-[70%] justify-between px-8">
          <div className="h-24 w-8 rounded-b-2xl bg-[#A96F35] border-[4px] border-[#3B2E5A] border-t-0" />
          <div className="h-24 w-8 rounded-b-2xl bg-[#A96F35] border-[4px] border-[#3B2E5A] border-t-0" />
        </div>
      </div>

      {/* drop zone on the table */}
      <div ref={targetRef} className="absolute left-1/2 top-[10%] w-[36%] -translate-x-1/2">
        <div
          className={`relative flex h-28 items-end justify-center rounded-xl border-[3px] border-dashed transition-colors ${
            stack.length === 3 ? "border-[#4CAF50] bg-[#DFF3E1]/70" : "border-[#c99a55] bg-[#FFF8EC]/50"
          }`}
        >
          {/* stacked plates */}
          {STACK_ORDER.map((s) =>
            stack.includes(s) ? (
              <div key={s} className={`absolute ${stackOffsets[s]} ${stackWidths[s]}`} style={{ animation: "pop-in 0.35s ease-out both" }}>
                <PlateSvg size={s} color={colors[s]} />
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* caption */}
      <div className="pointer-events-none absolute left-1/2 top-[52%] w-[86%] -translate-x-1/2 text-center text-sm font-bold text-[#3B2E5A] opacity-75">
        {lang === "fa" ? "پایین‌ترین: بزرگ ← متوسط ← بالای همه: کوچک" : "Bottom: big ← medium ← top: small"}
      </div>

      {/* plates on the floor */}
      {(["big", "mid", "small"] as Size[]).map((s) => {
        if (stack.includes(s)) return null;
        const d = drags[s];
        return (
          <div key={s} className={`absolute ${floorPos[s]}`}>
            <div
              ref={(el) => {
                plateEls.current[s] = el;
              }}
              {...d.bind}
              role="button"
              aria-label={`${LABEL[s].en} plate`}
              className="cursor-grab active:cursor-grabbing"
              style={{
                transform: `translate(${d.x}px, ${d.y}px)`,
                transition: d.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
                zIndex: 20,
              }}
            >
              <Pulse active={hintPulse > 0 && stack.length === (s === "big" ? 0 : s === "mid" ? 1 : 2)}>
                <PlateSvg size={s} color={colors[s]} />
              </Pulse>
            </div>
          </div>
        );
      })}
    </Scene>
  );
}
