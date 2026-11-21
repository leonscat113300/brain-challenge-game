"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { overElement, useDragMove, Scene, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 57 — Fix the broken glass in two steps:                       */
/* 1) drag the three shards onto the dashed outline (they snap),       */
/* 2) then drag the glue tube over the cup -> seams heal, water fills. */
/* ------------------------------------------------------------------ */

type ShardId = "left" | "bottom" | "right";

function LeftShardSvg() {
  return (
    <svg viewBox="0 0 44 130" className="h-auto w-full" aria-hidden>
      <path d="M6 6 L34 6 L34 96 Q34 112 20 122 L6 112 Z" fill="#BFEFF2" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M14 18 L26 30 M14 44 L26 56" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function RightShardSvg() {
  return (
    <svg viewBox="0 0 44 130" className="h-auto w-full" aria-hidden>
      <path d="M38 6 L10 6 L10 96 Q10 112 24 122 L38 112 Z" fill="#BFEFF2" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M30 18 L18 30 M30 44 L18 56" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function BottomShardSvg() {
  return (
    <svg viewBox="0 0 120 34" className="h-auto w-full" aria-hidden>
      <path d="M6 4 L114 4 L110 16 Q108 28 94 28 L26 28 Q12 28 10 16 Z" fill="#BFEFF2" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M30 12 L44 20 M60 10 L74 18" stroke="#3B2E5A" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function GlueSvg() {
  return (
    <svg viewBox="0 0 80 120" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.2)]" aria-hidden>
      <path d="M32 4 L48 4 L48 18 L58 26 Q64 30 64 38 L64 106 Q64 114 56 114 L24 114 Q16 114 16 106 L16 38 Q16 30 22 26 L32 18 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <rect x="24" y="52" width="32" height="40" rx="6" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3.5" />
      <text x="40" y="78" textAnchor="middle" fontSize="17" fontWeight="800" fill="#3B2E5A">
        +
      </text>
      <path d="M24 40 Q28 36 34 34" stroke="#FAFAFA" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function Shard({
  id,
  svg,
  home,
  slotRef,
  locked,
  onSnap,
  onMiss,
  label,
}: {
  id: ShardId;
  svg: React.ReactNode;
  home: { left: string; top: string; w: string };
  slotRef: React.RefObject<HTMLDivElement | null>;
  locked: boolean;
  onSnap: (id: ShardId) => void;
  onMiss: (api: { reset: () => void }) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [placed, setPlaced] = useState(false);

  const drag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => {
        if (locked || placed) return;
        const el = ref.current;
        const slot = slotRef.current;
        if (el && slot && overElement(ref, slotRef, 26)) {
          const a = el.getBoundingClientRect();
          const b = slot.getBoundingClientRect();
          api.setPos(
            d.x + (b.left + b.width / 2 - (a.left + a.width / 2)),
            d.y + (b.top + b.height / 2 - (a.top + a.height / 2))
          );
          setPlaced(true);
          sfx.click();
          onSnap(id);
          return;
        }
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        onMiss(api);
      },
      [locked, placed, slotRef, onSnap, onMiss, id]
    )
  );

  return (
    <div className="absolute" style={{ left: home.left, top: home.top, width: home.w }}>
      <div
        ref={ref}
        style={{
          transform: `translate(${drag.x}px, ${drag.y}px) rotate(${placed ? 0 : homeRotate(id)}deg)`,
          transition: drag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.4,0.64,1)",
          zIndex: drag.dragging ? 45 : placed ? 26 : 20,
          opacity: placed ? 0.96 : 1,
        }}
      >
        <div
          {...(locked || placed ? {} : drag.bind)}
          role="button"
          aria-label={label}
          className={locked || placed ? "" : "cursor-grab active:cursor-grabbing"}
        >
          {svg}
        </div>
      </div>
    </div>
  );
}

function homeRotate(id: ShardId) {
  return id === "left" ? -14 : id === "right" ? 16 : 8;
}

export default function Level57({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [snapped, setSnapped] = useState<ShardId[]>([]);
  const [fixed, setFixed] = useState(false);
  const [done, setDone] = useState(false);
  const slotRefs = useRef<Record<ShardId, HTMLDivElement | null>>({ left: null, bottom: null, right: null });
  const cupZoneRef = useRef<HTMLDivElement>(null);
  const glueRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const allPlaced = snapped.length === 3;

  useEffect(() => {
    if (allPlaced) onProgress(0.55);
  }, [allPlaced, onProgress]);

  const snapOne = useCallback(
    (id: ShardId) => {
      setSnapped((prev) => {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      });
    },
    []
  );

  const missShard = useCallback(
    (api: { reset: () => void }) => {
      api.reset();
    },
    []
  );

  /* glue step */
  const glueDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => {
        if (solved || done || fixed) return;
        const cup = cupZoneRef.current;
        if (cup && overElement(glueRef, cupZoneRef, 46)) {
          if (!allPlaced) {
            api.reset();
            onMistake({
              fa: "اول تکه‌ها را سر جایشان بگذار، بعد چسب!",
              en: "First place the pieces, then the glue!",
            });
            return;
          }
          api.reset();
          setFixed(true);
          setDone(true);
          sfx.sparkle();
          timers.current.push(setTimeout(() => sfx.cheer(), 300));
          onProgress(1);
          timers.current.push(setTimeout(onSolved, 1100));
          return;
        }
        if (!d.everMoved) {
          if (!allPlaced) {
            onMistake({
              fa: "اول تکه‌ها را سر جایشان بگذار، بعد چسب!",
              en: "First place the pieces, then the glue!",
            });
          } else {
            sfx.click();
          }
          return;
        }
        api.reset();
      },
      [solved, done, fixed, allPlaced, onMistake, onProgress, onSolved]
    )
  );

  return (
    <Scene bg="linear-gradient(180deg,#EAF7FB 0%,#F6F1E7 55%,#EFE7D8 56%,#E8D9C3 100%)">
      {/* table top */}
      <div
        className="absolute inset-x-0 bottom-0 h-[22%] border-t-4 border-[#3B2E5A]"
        style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(139,94,60,0.22) 0 4px, transparent 4px 60px)" }}
        aria-hidden
      />

      {/* the cup zone: dashed outline + slots */}
      <div ref={cupZoneRef} className="absolute left-1/2 top-[16%] h-[62%] w-[34%] -translate-x-1/2">
        <svg viewBox="0 0 200 240" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
          {/* water appears after fixing */}
          {fixed && (
            <g>
              <path d="M46 90 L46 196 Q46 220 78 220 L122 220 Q154 220 154 196 L154 90 Z" fill="#1EC8CF" opacity="0.85" />
              <path d="M46 108 Q75 96 100 108 Q125 120 154 108 L154 130 Q125 142 100 130 Q75 118 46 130 Z" fill="#FAFAFA" opacity="0.35" />
            </g>
          )}
          {/* solid glass after fixing (seams fade) */}
          <g opacity={fixed ? 1 : 0} style={{ transition: "opacity 0.5s ease" }}>
            <path d="M46 78 L46 196 Q46 220 78 220 L122 220 Q154 220 154 196 L154 78" fill="#DCF7F8" opacity="0.55" stroke="none" />
            <path d="M46 78 L46 196 Q46 220 78 220 L122 220 Q154 220 154 196 L154 78" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
            <ellipse cx="100" cy="76" rx="54" ry="12" fill="#DCF7F8" stroke="#3B2E5A" strokeWidth="5" />
            <path d="M62 100 Q58 150 64 190" stroke="#FAFAFA" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.6" />
          </g>
          {/* dashed broken outline before fixing */}
          <g opacity={fixed ? 0 : 1} style={{ transition: "opacity 0.3s ease" }}>
            <path d="M46 78 L46 196 Q46 220 78 220 L122 220 Q154 220 154 196 L154 78" fill="none" stroke="#3B2E5A" strokeWidth="4" strokeDasharray="10 10" strokeLinecap="round" opacity="0.6" />
            <ellipse cx="100" cy="76" rx="54" ry="12" fill="none" stroke="#3B2E5A" strokeWidth="4" strokeDasharray="10 10" opacity="0.6" />
          </g>
        </svg>

        {/* invisible slot markers */}
        <div
          ref={(el) => {
            slotRefs.current.left = el;
          }}
          className="absolute"
          style={{ left: "6%", top: "26%", width: "22%", height: "48%" }}
          aria-hidden
        />
        <div
          ref={(el) => {
            slotRefs.current.bottom = el;
          }}
          className="absolute"
          style={{ left: "24%", top: "76%", width: "52%", height: "16%" }}
          aria-hidden
        />
        <div
          ref={(el) => {
            slotRefs.current.right = el;
          }}
          className="absolute"
          style={{ right: "6%", top: "26%", width: "22%", height: "48%" }}
          aria-hidden
        />

        {/* sparkle on fix */}
        {fixed &&
          [0, 1, 2, 3].map((i) => (
            <span
              key={`sp-${i}`}
              className="absolute z-30"
              style={{
                left: `${12 + i * 24}%`,
                top: `${12 + (i % 2) * 22}%`,
                width: 16,
                height: 16,
                animation: `star-pop 0.5s ${i * 0.14}s both`,
              }}
              aria-hidden
            >
              <svg viewBox="0 0 20 20" className="h-full w-full">
                <path d="M10 0 L12.4 7.6 L20 10 L12.4 12.4 L10 20 L7.6 12.4 L0 10 L7.6 7.6 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.5" />
              </svg>
            </span>
          ))}
      </div>

      {/* shards scattered around */}
      <Shard
        id="left"
        svg={<LeftShardSvg />}
        home={{ left: "6%", top: "18%", w: "13%" }}
        slotRef={{
          get current() {
            return slotRefs.current.left;
          },
        }}
        locked={solved || done || fixed}
        onSnap={snapOne}
        onMiss={missShard}
        label={lang === "fa" ? "تکهٔ چپ لیوان" : "left glass shard"}
      />
      <Shard
        id="bottom"
        svg={<BottomShardSvg />}
        home={{ left: "42%", top: "76%", w: "19%" }}
        slotRef={{
          get current() {
            return slotRefs.current.bottom;
          },
        }}
        locked={solved || done || fixed}
        onSnap={snapOne}
        onMiss={missShard}
        label={lang === "fa" ? "تکهٔ کف لیوان" : "bottom glass shard"}
      />
      <Shard
        id="right"
        svg={<RightShardSvg />}
        home={{ left: "80%", top: "16%", w: "13%" }}
        slotRef={{
          get current() {
            return slotRefs.current.right;
          },
        }}
        locked={solved || done || fixed}
        onSnap={snapOne}
        onMiss={missShard}
        label={lang === "fa" ? "تکهٔ راست لیوان" : "right glass shard"}
      />

      {/* glue tube */}
      <div className="absolute bottom-[5%] start-[8%] w-[15%]">
        <div
          ref={glueRef}
          style={{
            transform: `translate(${glueDrag.x}px, ${glueDrag.y}px)`,
            transition: glueDrag.dragging ? "none" : "transform 0.35s ease",
            zIndex: glueDrag.dragging ? 45 : 22,
            opacity: fixed ? 0 : allPlaced ? 1 : 0.85,
          }}
        >
          <div
            {...(solved || done || fixed ? {} : glueDrag.bind)}
            role="button"
            aria-label={lang === "fa" ? "چسب" : "glue"}
            className={solved || done || fixed ? "" : "cursor-grab active:cursor-grabbing"}
            style={{ animation: allPlaced && hintPulse > 0 && !done ? "breathe 1s ease-in-out infinite" : undefined }}
          >
            <GlueSvg />
          </div>
        </div>
      </div>
    </Scene>
  );
}
