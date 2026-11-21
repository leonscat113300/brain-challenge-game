"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 62 — Open the secret gate: drag the moon, star and sun into   */
/* the three slots in the exact order shown on the sign.               */
/* Wrong order = the gate shakes and everything resets.                */
/* ------------------------------------------------------------------ */

type GlyphId = "moon" | "star" | "sun";
const TARGET: GlyphId[] = ["moon", "star", "sun"];

/* Raw glyph shapes drawn in a 40x40 space — reusable inside any svg group. */
function GlyphShape({ id }: { id: GlyphId }) {
  if (id === "moon") {
    return (
      <g>
        <path d="M26 4 Q12 8 12 20 Q12 32 26 36 Q10 34 6 20 Q10 6 26 4 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
        <path d="M26 4 Q16 9 16 20 Q16 31 26 36" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="27" cy="14" r="1.6" fill="#3B2E5A" />
      </g>
    );
  }
  if (id === "star") {
    return (
      <g>
        <path d="M20 3 L24.7 14.5 L37 15.4 L27.6 23.4 L30.6 35.4 L20 28.6 L9.4 35.4 L12.4 23.4 L3 15.4 L15.3 14.5 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
        <circle cx="17" cy="18" r="1.6" fill="#3B2E5A" />
        <circle cx="23" cy="18" r="1.6" fill="#3B2E5A" />
        <path d="M17.5 23 Q20 25.4 22.5 23" stroke="#3B2E5A" strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1="20" y1="2" x2="20" y2="8" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" transform={`rotate(${a} 20 20)`} />
      ))}
      <circle cx="20" cy="20" r="11" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="16" cy="18" r="1.8" fill="#3B2E5A" />
      <circle cx="24" cy="18" r="1.8" fill="#3B2E5A" />
      <path d="M16.5 23 Q20 26 23.5 23" stroke="#3B2E5A" strokeWidth="2" fill="none" strokeLinecap="round" />
    </g>
  );
}

function GlyphSvg({ id, className }: { id: GlyphId; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <GlyphShape id={id} />
    </svg>
  );
}

const GLYPH_FA: Record<GlyphId, string> = { moon: "ماه", star: "ستاره", sun: "خورشید" };
const GLYPH_EN: Record<GlyphId, string> = { moon: "moon", star: "star", sun: "sun" };

function Token({
  id,
  getSlots,
  occupied,
  locked,
  onPlace,
  onBadDrop,
}: {
  id: GlyphId;
  getSlots: () => Array<HTMLDivElement | null>;
  occupied: boolean[];
  locked: boolean;
  onPlace: (id: GlyphId, slot: number) => void;
  onBadDrop: (reason: "full" | "none", api: { reset: () => void }) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [placedIn, setPlacedIn] = useState<number | null>(null);

  const drag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void; setPos: (x: number, y: number) => void }) => {
        if (locked || placedIn !== null) return;
        const el = ref.current;
        if (!el) return;
        const slots = getSlots();
        const a = el.getBoundingClientRect();
        const cx = a.left + a.width / 2;
        const cy = a.top + a.height / 2;
        let hit = -1;
        slots.forEach((s, i) => {
          if (!s) return;
          const b = s.getBoundingClientRect();
          if (cx >= b.left - 24 && cx <= b.right + 24 && cy >= b.top - 24 && cy <= b.bottom + 24) hit = i;
        });
        if (hit >= 0 && occupied[hit]) {
          onBadDrop("full", api);
          return;
        }
        if (hit >= 0) {
          const b = slots[hit]!.getBoundingClientRect();
          api.setPos(
            d.x + (b.left + b.width / 2 - cx),
            d.y + (b.top + b.height / 2 - cy)
          );
          setPlacedIn(hit);
          sfx.click();
          onPlace(id, hit);
          return;
        }
        if (!d.everMoved) {
          sfx.click();
          return;
        }
        onBadDrop("none", api);
      },
      [locked, placedIn, getSlots, occupied, onPlace, onBadDrop, id]
    )
  );

  return (
    <div
      ref={ref}
      className="absolute bottom-[4%] w-[17%]"
      style={{
        left: id === "moon" ? "10%" : id === "star" ? "41.5%" : "73%",
        transform: `translate(${drag.x}px, ${drag.y}px)`,
        transition: drag.dragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.4,0.64,1)",
        zIndex: drag.dragging ? 45 : placedIn !== null ? 22 : 20,
        opacity: locked || placedIn !== null ? 1 : 1,
      }}
    >
      <div
        {...(locked || placedIn !== null ? {} : drag.bind)}
        role="button"
        aria-label={GLYPH_FA[id]}
        className={locked || placedIn !== null ? "" : "cursor-grab active:cursor-grabbing"}
        style={{ animation: locked || placedIn !== null ? undefined : "bob 2.6s ease-in-out infinite" }}
      >
        <div className="rounded-xl border-[3px] border-[#3B2E5A] bg-[#FAFAFA] p-1.5 shadow-[0_4px_0_rgba(59,46,90,0.25)]">
          <GlyphSvg id={id} className="h-auto w-full" />
        </div>
      </div>
    </div>
  );
}

export default function Level62({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [placed, setPlaced] = useState<(GlyphId | null)[]>([null, null, null]);
  const [placedKinds, setPlacedKinds] = useState<GlyphId[]>([]);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [shakeGate, setShakeGate] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const slotRefs = useRef<Array<HTMLDivElement | null>>([null, null, null]);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const count = placed.filter(Boolean).length;
  useEffect(() => {
    if (count > 0 && count < 3) onProgress(count / 3);
  }, [count, onProgress]);

  /* judge once all three slots are filled */
  useEffect(() => {
    if (count < 3 || done) return;
    const t = setTimeout(() => {
      const ok = TARGET.every((g, i) => placed[i] === g);
      if (ok) {
        setOpen(true);
        setDone(true);
        sfx.unlock();
        timers.current.push(setTimeout(() => sfx.cheer(), 350));
        onProgress(1);
        timers.current.push(setTimeout(onSolved, 1200));
      } else {
        setShakeGate(true);
        timers.current.push(setTimeout(() => setShakeGate(false), 550));
        onMistake({
          fa: "ترتیب را با تابلو مقایسه کن!",
          en: "Compare the order with the sign!",
        });
        timers.current.push(
          setTimeout(() => {
            setPlaced([null, null, null]);
            setPlacedKinds([]);
            setResetKey((k) => k + 1);
          }, 600)
        );
      }
    }, 550);
    timers.current.push(t);
    return () => clearTimeout(t);
  }, [count]);

  const placeOne = useCallback(
    (id: GlyphId, slot: number) => {
      setPlaced((prev) => {
        const next = [...prev];
        next[slot] = id;
        return next;
      });
      setPlacedKinds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    },
    []
  );

  const badDrop = useCallback(
    (reason: "full" | "none", api: { reset: () => void }) => {
      api.reset();
      if (reason === "full") {
        onMistake({
          fa: "این خانه پر است!",
          en: "That slot is full!",
        });
      }
    },
    [onMistake]
  );

  const gateShaking = shakeGate && !done;

  return (
    <Scene bg="linear-gradient(180deg,#DCD6EA 0%,#C9C1E0 55%,#B7ABDA 56%,#A99CC9 100%)">
      {/* stone bricks pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(59,46,90,0.16) 0 3px, transparent 3px 46px), repeating-linear-gradient(90deg, rgba(59,46,90,0.14) 0 3px, transparent 3px 64px)",
        }}
        aria-hidden
      />

      {/* the gate */}
      <div
        className="absolute bottom-[14%] left-1/2 h-[58%] w-[58%] -translate-x-1/2 rounded-t-[42px] border-[6px] border-[#3B2E5A] bg-[#8B7FB8] shadow-[0_8px_0_rgba(59,46,90,0.3)]"
        style={{ animation: gateShaking ? "shake-hard 0.5s ease-in-out" : undefined }}
      >
        {/* light beam behind the doors (revealed on open) */}
        <div
          className="absolute inset-x-[6%] top-[8%] bottom-[6%] rounded-t-[36px] transition-opacity duration-500"
          style={{
            opacity: open ? 1 : 0,
            background: "radial-gradient(ellipse at 50% 20%, #FFF3D6 0%, #FFD154 55%, rgba(255,209,84,0) 100%)",
          }}
          aria-hidden
        />

        {/* left door */}
        <div
          className="absolute left-0 top-0 h-full w-1/2 overflow-hidden rounded-tl-[36px] border-r-4 border-[#3B2E5A] bg-[#6C4AB6]"
          style={{ transform: open ? "translateX(-88%)" : "translateX(0)", transition: "transform 0.9s cubic-bezier(0.5,0,0.3,1)" }}
        >
          <div className="absolute inset-3 rounded-tl-[30px] border-4 border-[#4A2E88]" aria-hidden />
          <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#FFD154] shadow-[0_2px_0_rgba(59,46,90,0.4)]" aria-hidden />
        </div>
        {/* right door */}
        <div
          className="absolute right-0 top-0 h-full w-1/2 overflow-hidden rounded-tr-[36px] border-l-4 border-[#3B2E5A] bg-[#6C4AB6]"
          style={{ transform: open ? "translateX(88%)" : "translateX(0)", transition: "transform 0.9s cubic-bezier(0.5,0,0.3,1)" }}
        >
          <div className="absolute inset-3 rounded-tr-[30px] border-4 border-[#4A2E88]" aria-hidden />
          <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#FFD154] shadow-[0_2px_0_rgba(59,46,90,0.4)]" aria-hidden />
        </div>

        {/* three slots on the doors */}
        <div className="absolute inset-x-0 top-[24%] flex justify-center gap-[6%] px-[8%]">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              ref={(el) => {
                slotRefs.current[i] = el;
              }}
              className="relative aspect-square w-[24%] rounded-xl border-[3px] bg-[#FAFAFA]"
              style={{ borderStyle: placed[i] ? "solid" : "dashed", borderColor: "#3B2E5A" }}
            >
              {placed[i] && (
                <div className="absolute inset-1" style={{ animation: "pop-in 0.3s ease both" }}>
                  <GlyphSvg id={placed[i]!} className="h-full w-full" />
                </div>
              )}
              {!placed[i] && (
                <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-[#B7ABDA]" aria-hidden>
                  {i + 1}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* hint ring on slots */}
        {hintPulse > 0 && !done && (
          <div className="pointer-events-none absolute inset-x-[10%] top-[16%] h-[42%] animate-pulse-ring rounded-2xl" style={{ border: "4px dashed #FFD154" }} />
        )}
      </div>

      {/* the sign with the target order */}
      <div className="absolute end-[2%] top-[3%] w-[30%]">
        <svg viewBox="0 0 160 120" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.2)]" aria-hidden>
          <rect x="70" y="34" width="10" height="82" rx="4" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
          <rect x="4" y="4" width="152" height="52" rx="10" fill="#E8D9C3" stroke="#3B2E5A" strokeWidth="4.5" />
          <rect x="12" y="12" width="136" height="36" rx="6" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
          {/* target order glyphs (drawn in-place, no nested svg) */}
          <g transform="translate(20 18) scale(0.6)">
            <GlyphShape id="moon" />
          </g>
          <path d="M50 30 L62 30 M58 26 L62 30 L58 34" stroke="#3B2E5A" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <g transform="translate(64 18) scale(0.6)">
            <GlyphShape id="star" />
          </g>
          <path d="M94 30 L106 30 M102 26 L106 30 L102 34" stroke="#3B2E5A" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <g transform="translate(108 18) scale(0.6)">
            <GlyphShape id="sun" />
          </g>
        </svg>
        <div className="mt-0.5 text-center text-[10px] font-bold text-[#33205E]" aria-hidden>
          {lang === "fa" ? "به همین ترتیب" : "in this order"}
        </div>
      </div>

      {/* draggable tokens (remount on reset) */}
      <div key={resetKey} className="absolute inset-0">
        {(["moon", "star", "sun"] as GlyphId[]).map((g) => (
          <Token
            key={g}
            id={g}
            getSlots={() => slotRefs.current}
            occupied={placed.map((p) => p !== null)}
            locked={solved || done || placedKinds.includes(g)}
            onPlace={placeOne}
            onBadDrop={badDrop}
          />
        ))}
      </div>

      {/* solved sparkles */}
      {open &&
        [0, 1, 2, 3].map((i) => (
          <span
            key={`sp-${i}`}
            className="absolute z-30"
            style={{
              left: `${26 + i * 16}%`,
              top: `${28 + (i % 2) * 14}%`,
              width: 22,
              height: 22,
              animation: `star-pop 0.5s ${i * 0.15}s both`,
            }}
            aria-hidden
          >
            <svg viewBox="0 0 20 20" className="h-full w-full">
              <path d="M10 0 L12.4 7.6 L20 10 L12.4 12.4 L10 20 L7.6 12.4 L0 10 L7.6 7.6 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.5" />
            </svg>
          </span>
        ))}
    </Scene>
  );
}
