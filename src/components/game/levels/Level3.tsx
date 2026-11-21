"use client";

import React, { useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 3 — Strange Clock: rotate both hands to 12 (multi-touch).     */
/* ------------------------------------------------------------------ */

const NUM_COLORS = ["#FF6B81", "#1EC8CF", "#4CAF50", "#E8A81C", "#6C4AB6", "#FF9F1C"];

const BURST = [
  { x: "-6%", y: "8%", d: 0, c: "#FFD154" },
  { x: "94%", y: "2%", d: 0.08, c: "#FF6B81" },
  { x: "-10%", y: "60%", d: 0.16, c: "#1EC8CF" },
  { x: "96%", y: "56%", d: 0.12, c: "#4CAF50" },
  { x: "22%", y: "-9%", d: 0.2, c: "#FF9F1C" },
  { x: "62%", y: "-11%", d: 0.24, c: "#6C4AB6" },
];

function ClockFaceSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const ticks = Array.from({ length: 60 }, (_, i) => i);
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} aria-hidden>
      {/* yellow rim + white face */}
      <circle cx="100" cy="100" r="95" fill="#FFD154" stroke="#3B2E5A" strokeWidth="6" />
      <circle cx="100" cy="100" r="79" fill="#FAFAFA" stroke="#E8A81C" strokeWidth="4" />
      {/* tick marks */}
      {ticks.map((i) => {
        const a = ((i * 6 - 90) * Math.PI) / 180;
        const major = i % 5 === 0;
        const r1 = major ? 66 : 71;
        return (
          <line
            key={i}
            x1={100 + Math.cos(a) * r1}
            y1={100 + Math.sin(a) * r1}
            x2={100 + Math.cos(a) * 76}
            y2={100 + Math.sin(a) * 76}
            stroke="#3B2E5A"
            strokeWidth={major ? 4 : 1.6}
            strokeLinecap="round"
            opacity={major ? 0.85 : 0.4}
          />
        );
      })}
      {/* 12 colorful bold numbers */}
      {Array.from({ length: 12 }, (_, k) => {
        const n = k + 1;
        const a = ((n * 30 - 90) * Math.PI) / 180;
        return (
          <text
            key={n}
            x={100 + Math.cos(a) * 55}
            y={100 + Math.sin(a) * 55}
            fill={NUM_COLORS[k % NUM_COLORS.length]}
            fontSize="17"
            fontWeight="800"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {n}
          </text>
        );
      })}
    </svg>
  );
}

/** One rotatable hand: an absolutely-positioned pivot anchored at the clock center. */
function HandPivot(props: {
  angle: number;
  length: string;
  color: string;
  thickness: number;
  dragging: boolean;
  hint: boolean;
  onGrab: (e: React.PointerEvent) => void;
  onDrag: (e: React.PointerEvent) => void;
  onDrop: (e: React.PointerEvent) => void;
}) {
  return (
    <div
      className="absolute z-20"
      style={{
        left: "50%",
        bottom: "50%",
        width: 44,
        height: props.length,
        marginLeft: -22,
        transform: `rotate(${props.angle}deg)`,
        transformOrigin: "50% 100%",
        touchAction: "none",
        transition: props.dragging ? "none" : "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)",
        cursor: "grab",
      }}
      onPointerDown={props.onGrab}
      onPointerMove={props.onDrag}
      onPointerUp={props.onDrop}
      onPointerCancel={props.onDrop}
    >
      <Pulse active={props.hint} color={props.color} className="h-full">
        <div className="relative h-full w-full">
          {/* the hand bar */}
          <div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: props.thickness, height: "84%", background: props.color, border: "3px solid #3B2E5A" }}
          />
          {/* grab knob at the tip */}
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{ top: -6, width: 16, height: 16, background: props.color, border: "3px solid #3B2E5A" }}
          />
        </div>
      </Pulse>
    </div>
  );
}

export default function Level3({ solved, onSolved, onProgress, hintPulse }: LevelProps) {
  const clockRef = useRef<HTMLDivElement>(null);
  const hourPtr = useRef<number | null>(null);
  const minPtr = useRef<number | null>(null);
  const doneRef = useRef(false);
  const [hourAngle, setHourAngle] = useState(240); // starts pointing at 8
  const [minAngle, setMinAngle] = useState(90); // starts pointing at 3
  const [hourDrag, setHourDrag] = useState(false);
  const [minDrag, setMinDrag] = useState(false);
  const [hourOk, setHourOk] = useState(false);
  const [minOk, setMinOk] = useState(false);
  const [done, setDone] = useState(false);
  const frozen = done || solved;

  /** 0deg = pointing up at 12, measured clockwise. */
  const angleOf = (e: React.PointerEvent): number => {
    const rect = clockRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
    return (deg + 360) % 360;
  };

  const angDiff = (d: number) => Math.min(Math.abs(d), 360 - Math.abs(d));

  const afterSnap = (h: boolean, m: boolean) => {
    if (h && m) {
      if (doneRef.current) return;
      doneRef.current = true;
      setDone(true);
      sfx.chime();
      onProgress(1);
      window.setTimeout(onSolved, 700);
    } else {
      onProgress(0.5);
    }
  };

  const grabHand = (hour: boolean) => (e: React.PointerEvent) => {
    if (frozen) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    if (hour) {
      hourPtr.current = e.pointerId;
      setHourDrag(true);
      setHourOk(false);
    } else {
      minPtr.current = e.pointerId;
      setMinDrag(true);
      setMinOk(false);
    }
  };

  const dragHand = (hour: boolean) => (e: React.PointerEvent) => {
    const ptr = hour ? hourPtr : minPtr;
    if (ptr.current !== e.pointerId || frozen) return;
    const a = angleOf(e);
    if (hour) setHourAngle(a);
    else setMinAngle(a);
  };

  const dropHand = (hour: boolean) => (e: React.PointerEvent) => {
    const ptr = hour ? hourPtr : minPtr;
    if (ptr.current !== e.pointerId) return;
    ptr.current = null;
    if (hour) setHourDrag(false);
    else setMinDrag(false);
    if (frozen) return;
    const a = angleOf(e);
    if (angDiff(a) <= 10) {
      sfx.tick();
      if (hour) {
        setHourAngle(0);
        setHourOk(true);
        afterSnap(true, minOk);
      } else {
        setMinAngle(0);
        setMinOk(true);
        afterSnap(hourOk, true);
      }
    } else if (hour) {
      setHourAngle(a);
    } else {
      setMinAngle(a);
    }
  };

  return (
    <Scene bg="linear-gradient(180deg,#EFE9F8 0%,#E7DFF6 55%,#DCD2EF 100%)">
      {/* bedroom wall picture */}
      <div className="absolute top-[6%] start-[3%] aspect-square w-[15%] overflow-hidden rounded-xl border-4 border-[#3B2E5A] bg-[#FAFAFA] shadow-[0_4px_0_rgba(59,46,90,0.2)]">
        <svg viewBox="0 0 60 60" className="h-full w-full" aria-hidden>
          <rect width="60" height="60" fill="#FFEFC9" />
          <circle cx="44" cy="16" r="8" fill="#FF9F1C" />
          <path d="M0 46 L16 28 L28 40 L40 26 L60 46 L60 60 L0 60 Z" fill="#4CAF50" />
        </svg>
      </div>

      {/* the clock */}
      <div ref={clockRef} className="absolute left-1/2 top-[9%] aspect-square w-[62%] -translate-x-1/2">
        <ClockFaceSvg className="absolute inset-0 h-full w-full" />
        <HandPivot
          angle={minAngle}
          length="37%"
          color="#FF6B81"
          thickness={9}
          dragging={minDrag}
          hint={hintPulse > 0 && !frozen}
          onGrab={grabHand(false)}
          onDrag={dragHand(false)}
          onDrop={dropHand(false)}
        />
        <HandPivot
          angle={hourAngle}
          length="26%"
          color="#1EC8CF"
          thickness={13}
          dragging={hourDrag}
          hint={hintPulse > 0 && !frozen}
          onGrab={grabHand(true)}
          onDrag={dragHand(true)}
          onDrop={dropHand(true)}
        />
        {/* center cap */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#3B2E5A] bg-[#FFD154]" />
        {/* star burst on solve */}
        {done &&
          BURST.map((s, i) => (
            <svg
              key={i}
              viewBox="0 0 40 40"
              className="pointer-events-none absolute h-7 w-7"
              style={{ left: s.x, top: s.y, animation: `pop-in 0.5s ${s.d}s both` }}
              aria-hidden
            >
              <path d="M20 2 L24.5 15.5 L38 20 L24.5 24.5 L20 38 L15.5 24.5 L2 20 L15.5 15.5 Z" fill={s.c} stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
            </svg>
          ))}
      </div>

      {/* shelf with books + plant */}
      <div className="absolute bottom-[8%] start-[6%] w-[36%]">
        <div className="flex items-end gap-1.5 pb-1 ps-1">
          <div className="h-9 w-3.5 rounded-sm border-2 border-[#3B2E5A] bg-[#FF6B81]" />
          <div className="h-11 w-3.5 rounded-sm border-2 border-[#3B2E5A] bg-[#1EC8CF]" />
          <div className="h-8 w-3.5 rounded-sm border-2 border-[#3B2E5A] bg-[#FFD154]" />
          <div className="h-10 w-3.5 rounded-sm border-2 border-[#3B2E5A] bg-[#6C4AB6]" />
          <svg viewBox="0 0 40 44" className="h-10 w-9" aria-hidden>
            <path d="M20 30 C10 30 6 22 8 14 C16 16 20 20 20 30 Z" fill="#4CAF50" />
            <path d="M20 30 C30 30 34 22 32 14 C24 16 20 20 20 30 Z" fill="#4CAF50" />
            <path d="M20 14 L20 30" stroke="#3B8C3F" strokeWidth="3" strokeLinecap="round" />
            <path d="M10 30 L30 30 L27 42 L13 42 Z" fill="#FF9F1C" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="h-2.5 rounded-md border-2 border-[#3B2E5A] bg-[#8B5E3C]" />
      </div>

      {/* little rug */}
      <div className="absolute bottom-[6%] end-[6%] w-[26%]">
        <div className="h-4 rounded-[50%] border-[3px] border-[#3B2E5A] bg-[#FFD154] opacity-80" />
      </div>
    </Scene>
  );
}
