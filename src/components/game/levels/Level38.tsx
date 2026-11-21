"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { num } from "@/lib/game/utils";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 38 — Which key opens the lock? Match the guide silhouette.    */
/* ------------------------------------------------------------------ */

type KeyVariant = 1 | 2 | 3;

interface Home {
  left: string;
  top: string;
  width: string;
}

interface Bump {
  v: KeyVariant;
  n: number;
}

const MATCH: KeyVariant = 2;
const WRONG_MSG = { fa: "دندانه‌هاش جور نمیشه!", en: "The teeth don't match!" };
const HOMES: Record<KeyVariant, Home> = {
  1: { left: "4%", top: "82%", width: "26%" },
  2: { left: "38%", top: "84%", width: "24%" },
  3: { left: "71%", top: "82%", width: "26%" },
};
const LOCKED_HOME: Home = { left: "40%", top: "48%", width: "20%" };

function teethFor(v: KeyVariant, ghost: boolean): React.ReactNode {
  const tooth = (x: number, w: number, h: number) => (
    <rect key={x} x={x} y="36" width={w} height={h} rx="3" fill={ghost ? "none" : "#E8A81C"} stroke="#3B2E5A" strokeWidth="3.5" strokeDasharray={ghost ? "5 4" : undefined} />
  );
  if (v === 1) return (<>{tooth(44, 9, 16)}{tooth(58, 9, 12)}</>);
  if (v === 2) return (<>{tooth(86, 9, 16)}{tooth(101, 9, 11)}</>);
  return (<>{tooth(80, 8, 12)}{tooth(93, 8, 10)}{tooth(106, 8, 8)}</>);
}

function KeySvg({ variant, ghost = false, className, style }: { variant: KeyVariant; ghost?: boolean; className?: string; style?: React.CSSProperties }) {
  const fill = ghost ? "none" : "#E8A81C";
  return (
    <svg viewBox="0 0 122 62" className={className} style={style} aria-hidden>
      <circle cx="22" cy="30" r="17" fill={fill} stroke="#3B2E5A" strokeWidth={ghost ? 3.5 : 5} strokeDasharray={ghost ? "7 6" : undefined} />
      {!ghost && <circle cx="22" cy="30" r="7" fill="#3B2E5A" />}
      <rect x="36" y="23" width="80" height="14" rx="7" fill={fill} stroke="#3B2E5A" strokeWidth={ghost ? 3.5 : 4.5} strokeDasharray={ghost ? "7 6" : undefined} />
      {teethFor(variant, ghost)}
      {!ghost && <path d="M12 21 q6 -7 15 -6" stroke="#FAFAFA" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85" />}
    </svg>
  );
}

function BushSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 50" className={className} style={style} aria-hidden>
      <circle cx="26" cy="30" r="18" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="52" cy="26" r="14" fill="#5FBF63" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="40" cy="38" r="12" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" />
    </svg>
  );
}

interface KeyPieceProps {
  variant: KeyVariant;
  home: Home;
  locked: boolean;
  frozen: boolean;
  dimmed: boolean;
  bump: Bump;
  label: string;
  targetRef: React.RefObject<HTMLDivElement | null>;
  onAttempt: (v: KeyVariant) => boolean;
}

function KeyPiece({ variant, home, locked, frozen, dimmed, bump, label, targetRef, onAttempt }: KeyPieceProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shaking = bump.v === variant;
  const drag = useDragMove(
    useCallback(
      (d, api) => {
        api.reset();
        if (frozen || !d.everMoved) return;
        if (overElement(ref, targetRef, 30)) onAttempt(variant);
      },
      [frozen, onAttempt, targetRef, variant]
    )
  );
  return (
    <div
      className="absolute"
      style={{
        left: home.left,
        top: home.top,
        width: home.width,
        zIndex: locked ? 40 : 20,
        opacity: dimmed ? 0.45 : 1,
        transition: "opacity 0.4s ease, left 0.55s cubic-bezier(0.34,1.2,0.64,1), top 0.55s cubic-bezier(0.34,1.2,0.64,1)",
      }}
    >
      <div key={shaking ? bump.n : 0} style={{ animation: shaking ? "shake-hard 0.5s ease-in-out" : undefined }}>
        <div
          ref={ref}
          {...(frozen || locked ? {} : drag.bind)}
          className="active:cursor-grabbing"
          role="button"
          aria-label={label}
          style={{
            touchAction: "none",
            cursor: frozen || locked ? "default" : "grab",
            transform: `translate(${drag.x}px, ${drag.y}px) rotate(${locked ? 90 : drag.dragging ? -5 : 0}deg) scale(${drag.dragging ? 1.12 : locked ? 0.92 : 1})`,
            transition: drag.dragging ? "none" : "transform 0.45s cubic-bezier(0.34,1.3,0.64,1)",
          }}
        >
          <KeySvg variant={variant} className="h-auto w-full drop-shadow-[0_3px_2px_rgba(59,46,90,0.28)]" />
        </div>
      </div>
    </div>
  );
}

export default function Level38({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [matched, setMatched] = useState<KeyVariant | null>(null);
  const [doorOpen, setDoorOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState(false);
  const [bump, setBump] = useState<Bump>({ v: 1, n: 0 });
  const attempts = useRef(0);
  const timers = useRef<number[]>([]);
  const keyholeRef = useRef<HTMLDivElement>(null);

  const t = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const onAttempt = useCallback(
    (v: KeyVariant): boolean => {
      if (solved || done || matched !== null) return false;
      if (attempts.current === 0) onProgress(0.4);
      attempts.current += 1;
      if (v === MATCH) {
        setMatched(v);
        sfx.unlock();
        t(() => setDoorOpen(true), 550);
        t(() => {
          setDone(true);
          sfx.cheer();
          onProgress(1);
          t(onSolved, 700);
        }, 1150);
        return true;
      }
      sfx.click();
      setFlash(true);
      setBump((b) => ({ v, n: b.n + 1 }));
      t(() => setFlash(false), 450);
      onMistake(WRONG_MSG);
      return false;
    },
    [solved, done, matched, onProgress, onSolved, onMistake, t]
  );

  const tapDoor = () => {
    if (solved || done) return;
    sfx.pop();
  };

  return (
    <Scene bg="linear-gradient(180deg,#F1ECFA 0%,#E7DFF5 58%,#DCD2EE 100%)">
      {/* faint wallpaper stripes */}
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.05) 0 20px, transparent 20px 42px)" }} aria-hidden />
      {/* floor */}
      <div className="absolute inset-x-0 bottom-0 h-[13%] border-t-4 border-[#3B2E5A] bg-[#C9BCE4]" aria-hidden />

      <BushSvg className="absolute bottom-[13%] start-[2%] w-[13%]" />
      <BushSvg className="absolute bottom-[13%] end-[2%] w-[13%]" />

      {/* guide silhouette panel (matches key 2) */}
      <div className="absolute left-1/2 top-[2%] z-[12] w-[46%] -translate-x-1/2">
        <Pulse active={hintPulse > 0 && !done} className="rounded-2xl">
          <div className="rounded-2xl border-4 border-[#3B2E5A] bg-[#FAFAFA] px-2 py-1 shadow-[0_4px_0_rgba(59,46,90,0.15)]">
            <KeySvg variant={MATCH} ghost className="mx-auto h-auto w-[66%]" />
          </div>
        </Pulse>
      </div>

      {/* wooden door with big keyhole */}
      <div className="absolute left-[30%] top-[23%] z-[6] h-[62%] w-[40%]">
        <div className="absolute inset-0 rounded-t-2xl border-4 border-[#3B2E5A] bg-[#6E4526]" />
        <div className="absolute overflow-hidden rounded-t-xl" style={{ inset: "3%" }} aria-hidden>
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 72%, rgba(255,209,84,0.95) 0%, rgba(232,168,28,0.5) 48%, #1E1430 88%)", opacity: doorOpen ? 1 : 0, transition: "opacity 0.8s ease" }}
          />
        </div>
        <div
          onClick={tapDoor}
          role="button"
          aria-label={lang === "fa" ? "در چوبی" : "wooden door"}
          className="absolute cursor-pointer overflow-hidden rounded-t-xl border-4 border-[#3B2E5A]"
          style={{
            inset: "3%",
            background: "#8B5E3C",
            backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.16) 0 3px, transparent 3px 26px)",
            transformOrigin: "left center",
            transform: doorOpen ? "perspective(700px) rotateY(-78deg)" : "rotateY(0deg)",
            transition: "transform 0.9s ease-in-out",
          }}
        >
          <div className="absolute inset-x-[10%] top-[24%] h-[3px] rounded bg-[#5C3A22]" aria-hidden />
          <div className="absolute inset-x-[10%] top-[64%] h-[3px] rounded bg-[#5C3A22]" aria-hidden />
          {/* keyhole plate = drop target; flashes red on a wrong key */}
          <div
            ref={keyholeRef}
            className="absolute left-1/2 top-[31%] grid aspect-square w-[54%] -translate-x-1/2 place-items-center rounded-full"
            style={{ background: flash ? "#FF6B81" : "#E8A81C", border: "4px solid #3B2E5A", transition: "background 0.18s ease" }}
          >
            <svg viewBox="0 0 20 28" className="w-[36%]" aria-hidden>
              <circle cx="10" cy="9" r="5.5" fill="#3B2E5A" />
              <path d="M7.5 13 L6 24 L14 24 L12.5 13 Z" fill="#3B2E5A" />
            </svg>
          </div>
        </div>
      </div>

      {/* three draggable keys on a ring */}
      {([1, 2, 3] as KeyVariant[]).map((v) => (
        <KeyPiece
          key={v}
          variant={v}
          home={v === matched ? LOCKED_HOME : HOMES[v]}
          locked={v === matched}
          frozen={solved || done || matched !== null}
          dimmed={matched !== null && v !== matched}
          bump={bump}
          label={lang === "fa" ? `کلید ${num(v, lang)}` : `key ${num(v, lang)}`}
          targetRef={keyholeRef}
          onAttempt={onAttempt}
        />
      ))}
    </Scene>
  );
}
