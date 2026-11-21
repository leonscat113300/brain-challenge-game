"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, overElement, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 10 — The Exit Door: drag the rug away, tap the hidden key,    */
/* then drag the key onto the lock to swing the door open.             */
/* ------------------------------------------------------------------ */

function KeySvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 64" className={className} style={style} aria-hidden>
      {/* bow */}
      <circle cx="24" cy="30" r="19" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="24" cy="30" r="7.5" fill="#3B2E5A" />
      {/* shaft */}
      <rect x="40" y="23" width="50" height="14" rx="6" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="4" />
      {/* teeth */}
      <rect x="66" y="34" width="9" height="16" rx="3" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="3.5" />
      <rect x="82" y="34" width="9" height="12" rx="3" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="3.5" />
      {/* shine */}
      <path d="M14 20 q6 -6 14 -4" stroke="#FAFAFA" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

export default function Level10({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [rugMoved, setRugMoved] = useState(false);
  const [keyTaken, setKeyTaken] = useState(false);
  const [keyLocked, setKeyLocked] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const [done, setDone] = useState(false);
  const keyRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef<HTMLButtonElement>(null);
  /* bridges so the drag callbacks can call reset without a
     use-before-declaration access (the reset fn exists only after
     the hook returns) */
  const rugResetRef = useRef<() => void>(() => {});
  const keyResetRef = useRef<() => void>(() => {});

  /* stage 1: drag the rug aside */
  const rugDrag = useDragMove(
    useCallback(
      (d: DragState) => {
        if (solved || done || rugMoved) return;
        if (Math.abs(d.x) > 55 || Math.abs(d.y) > 40) {
          setRugMoved(true);
          sfx.whoosh();
          onProgress(0.34);
        } else {
          rugResetRef.current();
        }
      },
      [solved, done, rugMoved, onProgress]
    )
  );
  useEffect(() => {
    rugResetRef.current = rugDrag.reset;
  }, [rugDrag]);

  /* stage 2 (tap key to pick up) + stage 3 (drop key on the lock) */
  const keyDrag = useDragMove(
    useCallback(
      (d: DragState) => {
        if (solved || done || keyLocked || doorOpen) return;
        const dist = Math.hypot(d.x, d.y);
        if (dist < 8) {
          /* barely moved: treat as a tap (pickup) */
          if (rugMoved && !keyTaken) {
            setKeyTaken(true);
            sfx.coin();
            onProgress(0.67);
          }
          return;
        }
        /* real drop: check the lock */
        if (keyTaken && overElement(keyRef, lockRef, 24)) {
          setKeyLocked(true);
          setDone(true);
          keyResetRef.current();
          sfx.unlock();
          onProgress(1);
          window.setTimeout(() => {
            setDoorOpen(true);
            sfx.cheer();
          }, 380);
          window.setTimeout(onSolved, 900);
        } else {
          keyResetRef.current();
        }
      },
      [solved, done, rugMoved, keyTaken, keyLocked, doorOpen, onProgress, onSolved]
    )
  );
  useEffect(() => {
    keyResetRef.current = keyDrag.reset;
  }, [keyDrag]);

  const tapLock = () => {
    if (solved || done || keyTaken) return;
    sfx.fail();
    onMistake({ fa: "کلید لازم داری!", en: "You need a key!" });
  };

  const tapRug = () => {
    if (solved || done) return;
    if (rugMoved) sfx.boing();
  };

  /* the key's home slot depends on the stage */
  const keyHome = keyLocked
    ? { left: "79.5%", top: "37%", width: "12%" }
    : keyTaken
      ? { left: "3%", top: "2.5%", width: "11%" }
      : { left: "32%", top: "79%", width: "13%" };

  /* once the key is in the lock it must snap into place instantly
     (animating left/top from the pocket would fly it across the room) */
  const keyTransition = keyDrag.dragging
    ? "none"
    : keyLocked
      ? "opacity 0.5s ease"
      : "transform 0.35s ease, left 0.45s ease, top 0.45s ease, opacity 0.5s ease";

  return (
    <Scene bg="#EFE9F8">
      {/* striped wallpaper */}
      <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.055) 0 22px, transparent 22px 46px)" }} aria-hidden />
      {/* wooden floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[24%] border-t-4 border-[#3B2E5A]"
        style={{ background: "#D9A05B", backgroundImage: "repeating-linear-gradient(90deg, rgba(139,94,60,0.35) 0 3px, transparent 3px 52px)" }}
        aria-hidden
      />

      {/* wall picture for coziness */}
      <div className="absolute z-[2] rounded-md border-4 border-[#8B5E3C] bg-[#FAFAFA] overflow-hidden" style={{ left: "8%", top: "26%", width: "16%", height: "18%" }} aria-hidden>
        <svg viewBox="0 0 40 30" className="w-full h-full">
          <circle cx="30" cy="9" r="5" fill="#FFD154" />
          <path d="M2 26 L14 12 L22 21 L28 15 L38 26 Z" fill="#4CAF50" />
        </svg>
      </div>

      {/* warm light spilling out of the open door */}
      <div
        className="absolute pointer-events-none z-[4]"
        style={{ left: "54%", top: "72%", width: "48%", height: "18%", background: "radial-gradient(ellipse at center, rgba(255,209,84,0.5), transparent 70%)", opacity: doorOpen ? 1 : 0, transition: "opacity 0.9s ease 0.3s" }}
        aria-hidden
      />

      {/* the door */}
      <div className="absolute z-[5]" style={{ left: "64%", top: "8%", width: "30%", height: "70%" }}>
        {/* frame */}
        <div className="absolute inset-0 rounded-t-[22px] border-4 border-[#3B2E5A] bg-[#6E4526]" />
        {/* dark opening with warm light behind the panel */}
        <div className="absolute rounded-t-[16px] overflow-hidden" style={{ left: "4%", right: "4%", top: "3%", bottom: "3%" }} aria-hidden>
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 75%, rgba(255,209,84,0.95) 0%, rgba(232,168,28,0.55) 45%, #1E1430 85%)" }} />
        </div>
        {/* door panel (swings open around the left hinge) */}
        <div
          className="absolute rounded-t-[16px] overflow-hidden border-4 border-[#3B2E5A]"
          style={{
            left: "4%",
            right: "4%",
            top: "3%",
            bottom: "3%",
            background: "#8B5E3C",
            backgroundImage: "repeating-linear-gradient(90deg, rgba(59,46,90,0.18) 0 3px, transparent 3px 24px)",
            transformOrigin: "left center",
            transform: doorOpen ? "perspective(700px) rotateY(-78deg)" : "rotateY(0deg)",
            transition: "transform 0.9s ease-in-out",
          }}
        >
          <div className="absolute left-[8%] right-[8%] top-[30%] h-[3px] rounded bg-[#5C3A22]" />
          <div className="absolute left-[8%] right-[8%] top-[62%] h-[3px] rounded bg-[#5C3A22]" />
          {/* gold lock plate with keyhole */}
          <Pulse active={hintPulse > 0 && keyTaken && !keyLocked && !doorOpen} className="absolute left-[52%] top-[38%] w-[34%]">
            <button
              ref={lockRef}
              type="button"
              aria-label={lang === "fa" ? "قفل در" : "door lock"}
              onClick={tapLock}
              className="grid aspect-square w-full place-items-center rounded-full"
              style={{ minWidth: 44, minHeight: 44, background: "#E8A81C", border: "4px solid #3B2E5A" }}
            >
              <svg viewBox="0 0 20 28" className="w-[36%]" aria-hidden>
                <circle cx="10" cy="9" r="5.5" fill="#3B2E5A" />
                <path d="M7.5 13 L6 24 L14 24 L12.5 13 Z" fill="#3B2E5A" />
              </svg>
            </button>
          </Pulse>
        </div>
      </div>

      {/* inventory slot (top corner) */}
      <div
        className="absolute left-[2.5%] top-[2.5%] w-[13%] aspect-square max-w-[56px] rounded-full border-[3px] border-dashed border-[#3B2E5A] bg-[#FAFAFA]/40 z-10 grid place-items-center"
        aria-hidden
      >
        {!keyTaken && <KeySvg className="w-[62%] opacity-20" />}
      </div>

      {/* patterned rug covering the key (stage 1) */}
      <div
        className="absolute z-[15]"
        style={{
          left: "6%",
          top: "77%",
          width: "34%",
          height: "16%",
          transform: `translate(${rugDrag.x}px, ${rugDrag.y}px)`,
          transition: rugDrag.dragging ? "none" : "transform 0.45s cubic-bezier(0.34,1.3,0.64,1)",
        }}
      >
        <Pulse active={hintPulse > 0 && !rugMoved} className="h-full">
          <div
            {...(rugMoved ? {} : rugDrag.bind)}
            onClick={tapRug}
            className={`h-full w-full ${rugMoved ? "cursor-default" : "cursor-grab active:cursor-grabbing"}`}
          >
            <div className="relative h-full w-full rounded-2xl bg-[#FF6B81] border-4 border-[#3B2E5A] overflow-hidden">
              <div className="absolute inset-x-[7%] top-[20%] h-[14%] rounded-full bg-[#FFD154]" />
              <div className="absolute inset-x-[7%] bottom-[20%] h-[14%] rounded-full bg-[#FFD154]" />
              <div className="absolute left-[12%] top-[46%] w-[8%] aspect-square rounded-full bg-[#FFD154]" />
              <div className="absolute right-[12%] top-[46%] w-[8%] aspect-square rounded-full bg-[#FFD154]" />
            </div>
          </div>
        </Pulse>
      </div>

      {/* the golden key: hidden under the rug, then pocket, then lock */}
      <div
        ref={keyRef}
        className="absolute z-[12]"
        style={{
          left: keyHome.left,
          top: keyHome.top,
          width: keyHome.width,
          transform: `translate(${keyDrag.x}px, ${keyDrag.y}px)${keyDrag.dragging ? " scale(1.15)" : ""}${keyLocked ? " rotate(75deg)" : ""}`,
          transition: keyTransition,
          opacity: doorOpen ? 0 : 1,
        }}
      >
        <Pulse active={hintPulse > 0 && rugMoved && !keyTaken && !keyLocked && !doorOpen}>
          <div
            {...(rugMoved && !keyLocked && !doorOpen ? keyDrag.bind : {})}
            className="grid min-w-[44px] min-h-[44px] place-items-center cursor-grab active:cursor-grabbing"
          >
            <div
              className="w-full"
              style={{ animation: keyTaken ? "pop-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both" : undefined }}
            >
              <KeySvg className="w-full h-auto drop-shadow-[0_2px_2px_rgba(59,46,90,0.35)]" />
            </div>
          </div>
        </Pulse>
      </div>
    </Scene>
  );
}
