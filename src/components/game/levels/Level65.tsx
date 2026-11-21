"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 65 — The mouse stole the cheese! Follow the crumb trail and   */
/* open the drawer under the table — the mouse hides behind it.        */
/* ------------------------------------------------------------------ */

function MouseSvg({ caught }: { caught: boolean }) {
  return (
    <svg viewBox="0 0 130 120" className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.18)]" aria-hidden>
      {/* cheese */}
      <path d="M96 66 L126 74 L120 94 L92 88 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="106" cy="80" r="2.4" fill="#C98A4B" />
      <circle cx="115" cy="84" r="2.4" fill="#C98A4B" />
      {/* tail */}
      <path d="M24 92 Q4 88 10 68" stroke="#3B2E5A" strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* body */}
      <ellipse cx="52" cy="90" rx="30" ry="22" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* ears */}
      <circle cx="38" cy="66" r="12" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4" />
      <circle cx="62" cy="62" r="13" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="4" />
      {/* head */}
      <circle cx="52" cy="72" r="24" fill="#C9C4D8" stroke="#3B2E5A" strokeWidth="4.5" />
      {caught ? (
        <>
          <circle cx="44" cy="68" r="4.2" fill="#3B2E5A" />
          <circle cx="60" cy="68" r="4.2" fill="#3B2E5A" />
          <circle cx="45.4" cy="66.6" r="1.5" fill="#fff" />
          <circle cx="61.4" cy="66.6" r="1.5" fill="#fff" />
          <path d="M44 80 Q52 87 60 80" stroke="#3B2E5A" strokeWidth="2.8" fill="none" strokeLinecap="round" />
          <circle cx="52" cy="80" r="2.6" fill="#FF6B81" />
        </>
      ) : (
        <>
          <path d="M40 68 Q44 72 48 68 M56 68 Q60 72 64 68" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <ellipse cx="52" cy="80" rx="3" ry="2.2" fill="#FF6B81" />
        </>
      )}
      {/* whiskers */}
      <path d="M30 76 L20 74 M30 82 L20 84" stroke="#3B2E5A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function Level65({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [trail, setTrail] = useState(false);
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [nudge, setNudge] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const openDrawer = useCallback(() => {
    if (open || done || solved) return;
    if (!trail) {
      /* the drawer only gives way once the crumb trail has been followed */
      sfx.click();
      setNudge(true);
      timers.current.push(setTimeout(() => setNudge(false), 450));
      onMistake({
        fa: "اول رد پای پنیر را دنبال کن!",
        en: "Follow the cheese trail first!",
      });
      return;
    }
    setOpen(true);
    sfx.whoosh();
    timers.current.push(setTimeout(() => sfx.unlock(), 250));
    timers.current.push(setTimeout(() => sfx.sparkle(), 550));
    onProgress(1);
    setDone(true);
    timers.current.push(setTimeout(onSolved, 1500));
  }, [open, done, solved, trail, onMistake, onProgress, onSolved]);

  const drawerDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (open || done) return;
        if (!d.everMoved) {
          /* a tap only nudges the drawer — it must be pulled open */
          openDrawer();
          api.reset();
          return;
        }
        if (d.x <= 80) {
          /* needs a firm, deliberate pull */
          api.reset();
          return;
        }
        api.reset();
        openDrawer();
      },
      [open, done, openDrawer]
    )
  );

  const tapCrumbs = useCallback(() => {
    if (done || solved) return;
    if (!trail) {
      /* step 1: follow the trail (progress 1/2) */
      setTrail(true);
      sfx.whoosh();
      onProgress(0.5);
      return;
    }
    sfx.pop();
  }, [done, solved, trail, onProgress]);

  const tapCheese = useCallback(() => {
    if (done || solved) return;
    sfx.pop();
    onMistake({
      fa: "این پنیر فقط طعمه است؛ موش قایم شده!",
      en: "That cheese is just bait; the mouse is hiding!",
    });
  }, [done, solved, onMistake]);

  const tapHole = useCallback(() => {
    if (done || solved) return;
    sfx.boing();
    onMistake({
      fa: "این سوراخ خالی است؛ جای دیگری را بگرد!",
      en: "This hole is empty; look somewhere else!",
    });
  }, [done, solved, onMistake]);

  return (
    <Scene bg="linear-gradient(180deg,#FDF3E3 0%,#FAE8CC 52%,#EFD6AF 53%,#E3C79B 100%)">
      {/* wall tiles */}
      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(59,46,90,0.12) 0 3px, transparent 3px 44px), repeating-linear-gradient(90deg, rgba(59,46,90,0.12) 0 3px, transparent 3px 44px)" }} aria-hidden />

      {/* decoy: empty mouse hole on the skirting */}
      <button
        type="button"
        onClick={tapHole}
        aria-label={lang === "fa" ? "سوراخ موش" : "mouse hole"}
        className="absolute bottom-[43%] start-[3%] w-[12%] cursor-pointer transition-transform active:scale-90"
        aria-hidden={done}
      >
        <svg viewBox="0 0 90 64" className="h-auto w-full" aria-hidden>
          <rect x="0" y="44" width="90" height="20" rx="5" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="3.4" />
          <path d="M22 44 L22 30 Q45 8 68 30 L68 44 Z" fill="#33205E" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
        </svg>
      </button>

      {/* cheese crumb trail */}
      <button
        type="button"
        onClick={tapCrumbs}
        aria-label={lang === "fa" ? "رد پای پنیر" : "cheese crumbs"}
        className="absolute bottom-[10%] start-[4%] flex w-[34%] cursor-pointer items-end gap-2 border-0 bg-transparent p-0"
        aria-hidden={done}
      >
        {[16, 22, 18, 24].map((s, i) => (
          <svg key={i} viewBox="0 0 24 24" style={{ width: s, height: s, marginLeft: i * 6 }}>
            <path d="M4 10 L20 6 L22 18 L6 20 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="12" cy="13" r="1.8" fill="#C98A4B" />
          </svg>
        ))}
      </button>

      {/* mouse hidden behind drawer (pops up when open) */}
      <div
        className="absolute bottom-[34%] end-[10%] w-[30%]"
        style={{
          zIndex: open ? 12 : 8,
          pointerEvents: "none",
          transform: open ? "translateY(-6px)" : "translateY(4px)",
          opacity: open ? 1 : 0.0,
          transition: open ? "transform 0.45s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease 0.15s" : "opacity 0.2s ease",
          animation: open ? "bob 1s ease-in-out infinite" : undefined,
        }}
        aria-hidden={!open}
      >
        <MouseSvg caught />
      </div>

      {/* table with drawer */}
      <div className="absolute bottom-[8%] end-[4%] w-[58%]">
        <svg viewBox="0 0 240 150" className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.18)]" aria-hidden>
          {/* tabletop */}
          <rect x="4" y="18" width="232" height="26" rx="10" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4.5" />
          {/* legs */}
          <rect x="16" y="44" width="18" height="100" rx="6" fill="#A96F35" stroke="#3B2E5A" strokeWidth="4" />
          <rect x="206" y="44" width="18" height="100" rx="6" fill="#A96F35" stroke="#3B2E5A" strokeWidth="4" />
          {/* drawer cavity */}
          <rect x="44" y="52" width="152" height="46" rx="10" fill="#5E4A2E" stroke="#3B2E5A" strokeWidth="4" />
        </svg>

        {/* decoy: leftover cheese wedge on the tabletop */}
        <button
          type="button"
          onClick={tapCheese}
          aria-label={lang === "fa" ? "پنیر روی میز" : "cheese on the table"}
          className="absolute right-[5%] top-[-13%] w-[13%] cursor-pointer transition-transform active:scale-90"
          aria-hidden={done}
        >
          <svg viewBox="0 0 90 62" className="h-auto w-full drop-shadow-[0_3px_2px_rgba(59,46,90,0.18)]" aria-hidden>
            <path d="M6 54 L84 54 L84 16 Q45 -2 6 16 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
            <circle cx="52" cy="36" r="5" fill="#C98A4B" />
            <circle cx="66" cy="44" r="3.6" fill="#C98A4B" />
            <circle cx="38" cy="44" r="3" fill="#C98A4B" />
          </svg>
        </button>

        {/* drawer front (draggable) */}
        <div className="absolute left-[19%] top-[36%] h-[31%] w-[62%]">
          <Pulse active={hintPulse > 0 && !done} className="h-full w-full">
            <div
              {...(open ? {} : drawerDrag.bind)}
              role="button"
              aria-label={lang === "fa" ? "کشوی میز" : "table drawer"}
              className={open ? "" : "h-full w-full cursor-grab active:cursor-grabbing"}
              style={{
                transform: `translateX(${open ? "72%" : `${drawerDrag.x}px`})`,
                transition: drawerDrag.dragging ? "none" : "transform 0.5s cubic-bezier(0.5,0,0.3,1)",
                animation: nudge && !open ? "shake-hard 0.4s ease" : undefined,
              }}
            >
              <svg viewBox="0 0 150 46" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
                <rect x="2" y="2" width="146" height="42" rx="8" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4" />
                <rect x="56" y="16" width="38" height="12" rx="6" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
                <path d="M14 8 L14 38 M136 8 L136 38" stroke="#3B2E5A" strokeWidth="2.4" opacity="0.3" />
              </svg>
            </div>
          </Pulse>
        </div>
      </div>
    </Scene>
  );
}
