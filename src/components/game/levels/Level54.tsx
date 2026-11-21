"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { overElement, useDragMove, Scene, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 54 — Color sorting: drag each ball into the basket of the     */
/* same color. Wrong basket = bounce back; all three = solved.         */
/* ------------------------------------------------------------------ */

interface BallDef {
  key: "pink" | "yellow" | "cyan";
  color: string;
  light: string;
  left: string;
  top: string;
}

const BALLS: BallDef[] = [
  { key: "pink", color: "#FF6B81", light: "#FF9FB2", left: "9%", top: "13%" },
  { key: "yellow", color: "#FFD154", light: "#FFE59A", left: "42%", top: "9%" },
  { key: "cyan", color: "#1EC8CF", light: "#9FEBEE", left: "74%", top: "13%" },
];

const BASKETS: Array<{ key: BallDef["key"]; color: string; left: string }> = [
  { key: "pink", color: "#FF6B81", left: "7%" },
  { key: "yellow", color: "#FFD154", left: "39%" },
  { key: "cyan", color: "#1EC8CF", left: "71%" },
];

function BallSvg({ color, light }: { color: string; light: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.22)]" aria-hidden>
      <circle cx="50" cy="50" r="40" fill={color} stroke="#3B2E5A" strokeWidth="5" />
      <ellipse cx="36" cy="34" rx="11" ry="7.5" fill={light} transform="rotate(-28 36 34)" />
      <path d="M22 62 Q50 78 78 62" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

function BasketSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 140 120" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" aria-hidden>
      <path d="M30 14 Q70 40 110 14" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M20 34 L120 34 L107 104 Q105 112 96 112 L44 112 Q35 112 33 104 Z" fill={color} stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <rect x="16" y="26" width="108" height="16" rx="8" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="70" cy="72" r="14" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
      <circle cx="70" cy="72" r="7" fill={color} />
    </svg>
  );
}

function Ball({
  def,
  disabled,
  basketRef,
  onScored,
  onWrong,
  label,
}: {
  def: BallDef;
  disabled: boolean;
  basketRef: React.RefObject<HTMLDivElement | null>;
  onScored: () => void;
  onWrong: (api: { reset: () => void }) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scored, setScored] = useState(false);

  const drag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => {
        if (disabled || scored) return;
        const el = ref.current;
        const basket = basketRef.current;
        if (el && basket && overElement(ref, basketRef, 16)) {
          const a = el.getBoundingClientRect();
          const b = basket.getBoundingClientRect();
          api.setPos(
            d.x + (b.left + b.width / 2 - (a.left + a.width / 2)),
            d.y + (b.top + b.height / 2 - (a.top + a.height / 2))
          );
          setScored(true);
          sfx.coin();
          onScored();
          return;
        }
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        onWrong(api);
      },
      [disabled, scored, basketRef, onScored, onWrong]
    )
  );

  return (
    <div className="absolute w-[17%]" style={{ left: def.left, top: def.top }}>
      <div
        ref={ref}
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px)`,
          transition: drag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.4,0.64,1)",
          zIndex: drag.dragging ? 45 : scored ? 15 : 20,
        }}
      >
        <div
          {...(disabled || scored ? {} : drag.bind)}
          role="button"
          aria-label={label}
          className={disabled || scored ? "" : "cursor-grab active:cursor-grabbing"}
          style={{ animation: scored || drag.dragging ? undefined : "bob 2.4s ease-in-out infinite" }}
        >
          <BallSvg color={def.color} light={def.light} />
        </div>
      </div>
    </div>
  );
}

export default function Level54({ lang, solved, onSolved, onMistake, onProgress }: LevelProps) {
  const [inBasket, setInBasket] = useState(0);
  const [done, setDone] = useState(false);
  const basketRefs = useRef<Array<HTMLDivElement | null>>([null, null, null]);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);
  const doneRef = useRef(false);
  const countRef = useRef(0);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (inBasket >= 3 && !doneRef.current) {
      doneRef.current = true;
      setDone(true);
      onProgress(1);
      sfx.cheer();
      timers.current.push(setTimeout(onSolved, 900));
    }
  }, [inBasket, onProgress, onSolved]);

  const scoreOne = useCallback(() => {
    countRef.current = Math.min(3, countRef.current + 1);
    setInBasket(countRef.current);
    onProgress(countRef.current / 3);
  }, [onProgress]);

  const wrongDrop = useCallback(
    (api: { reset: () => void }) => {
      api.reset();
      onMistake({
        fa: "سبدِ هم‌رنگ خودش را پیدا کن!",
        en: "Find the basket with the same color!",
      });
    },
    [onMistake]
  );

  return (
    <Scene bg="linear-gradient(180deg,#EAF7FB 0%,#DFF3F7 62%,#DFF0D8 63%,#D5EBCC 100%)">
      {/* ground strip */}
      <div className="absolute inset-x-0 bottom-0 h-[14%] border-t-4 border-[#3B2E5A] bg-[#DFF0D8]" aria-hidden />

      {/* cheerful bunting */}
      <div className="absolute inset-x-0 top-0 flex justify-around" aria-hidden>
        {["#FF6B81", "#FFD154", "#1EC8CF", "#4CAF50", "#FF6B81", "#FFD154"].map((c, i) => (
          <svg key={i} viewBox="0 0 20 24" className="w-[5%]">
            <path d="M0 0 L20 0 L10 20 Z" fill={c} stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
          </svg>
        ))}
      </div>

      {/* baskets row */}
      {BASKETS.map((b, i) => (
        <div
          key={b.key}
          ref={(el) => {
            basketRefs.current[i] = el;
          }}
          className="absolute bottom-[8%] w-[26%]"
          style={{ left: b.left, zIndex: 10 }}
        >
          <BasketSvg color={b.color} />
        </div>
      ))}

      {/* balls */}
      {BALLS.map((def) => (
        <Ball
          key={def.key}
          def={def}
          disabled={solved || done}
          basketRef={{
            get current() {
              return basketRefs.current[BASKETS.findIndex((b) => b.key === def.key)];
            },
          }}
          onScored={scoreOne}
          onWrong={wrongDrop}
          label={lang === "fa" ? `توپ ${def.key === "pink" ? "صورتی" : def.key === "yellow" ? "زرد" : "آبی"}` : `${def.key} ball`}
        />
      ))}

      {/* celebration confetti dots */}
      {done &&
        [0, 1, 2, 3, 4, 5].map((i) => (
          <span
            key={`c-${i}`}
            className="absolute top-[30%] w-3 h-3 rounded-full"
            style={{
              left: `${14 + i * 13}%`,
              background: BALLS[i % 3].color,
              animation: `confetti-fall 1.4s ${i * 0.12}s ease-in both`,
            }}
            aria-hidden
          />
        ))}
    </Scene>
  );
}
