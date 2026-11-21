"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";
import type { DragState } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 100 — Open the secret door: find 3 hidden keys (behind the    */
/* picture frame, under the rug, inside the drawer), then tap the lock. */
/* ------------------------------------------------------------------ */

function KeySvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 70 34" className="h-auto w-full" aria-hidden>
      <circle cx="14" cy="17" r="10" fill="none" stroke={color} strokeWidth="7" />
      <circle cx="14" cy="17" r="10" fill="none" stroke="#3B2E5A" strokeWidth="2.4" />
      <path d="M24 17 H62 M52 17 V26 M60 17 V24" stroke={color} strokeWidth="6" strokeLinecap="round" />
      <path d="M24 17 H62 M52 17 V26 M60 17 V24" stroke="#3B2E5A" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

const KEY_COLORS = ["#FFD154", "#FF6B81", "#1EC8CF"];

export default function Level100({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [frameMoved, setFrameMoved] = useState(false);
  const [rugMoved, setRugMoved] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [keys, setKeys] = useState(0);
  const [unlocking, setUnlocking] = useState(false);
  const [doorOpen, setDoorOpen] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const rugRef = useRef<HTMLDivElement>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const collectKey = useCallback(
    (n: number) => {
      setKeys(n);
      sfx.coin();
      onProgress((n / 3) * 0.8);
    },
    [onProgress]
  );

  const frameDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || frameMoved) return;
        if (!d.everMoved) {
          sfx.click();
          api.reset();
          return;
        }
        api.reset();
        if (Math.abs(d.x) > 34 || Math.abs(d.y) > 34) {
          setFrameMoved(true);
          sfx.whoosh();
          timers.current.push(
            setTimeout(() => {
              collectKey(keys + 1);
            }, 300)
          );
          return;
        }
        sfx.fail();
        onMistake({
          fa: "قاب عکس را کامل کنار بکش تا کلید پیدا شود!",
          en: "Drag the picture frame fully aside to reveal the key!",
        });
      },
      [solved, frameMoved, keys, onMistake, collectKey]
    )
  );

  const rugDrag = useDragMove(
    useCallback(
      (d: DragState, api: { reset: () => void }) => {
        if (solved || rugMoved) return;
        if (!d.everMoved) {
          sfx.click();
          api.reset();
          return;
        }
        api.reset();
        if (Math.abs(d.x) > 34 || Math.abs(d.y) > 34) {
          setRugMoved(true);
          sfx.whoosh();
          timers.current.push(
            setTimeout(() => {
              collectKey(keys + 1);
            }, 300)
          );
          return;
        }
        sfx.fail();
        onMistake({
          fa: "فرش را کامل کنار بکش تا کلید پیدا شود!",
          en: "Drag the rug fully aside to reveal the key!",
        });
      },
      [solved, rugMoved, keys, onMistake, collectKey]
    )
  );

  const tapDrawer = useCallback(() => {
    if (solved || drawerOpen) return;
    setDrawerOpen(true);
    sfx.pop();
    timers.current.push(
      setTimeout(() => {
        collectKey(keys + 1);
      }, 350)
    );
  }, [solved, drawerOpen, keys, collectKey]);

  const tapLock = useCallback(() => {
    if (solved || unlocking || doorOpen) return;
    if (keys < 3) {
      sfx.fail();
      onMistake({
        fa: keys === 0 ? "سه کلید مخفی را پیدا کن!" : `فقط ${keys} کلید پیدا شده؛ یکی مانده!`,
        en: keys === 0 ? "Find the three hidden keys!" : `Only ${keys} keys found; one more to go!`,
      });
      return;
    }
    setUnlocking(true);
    timers.current.push(setTimeout(() => sfx.coin(), 150));
    timers.current.push(setTimeout(() => sfx.coin(), 450));
    timers.current.push(setTimeout(() => sfx.unlock(), 800));
    timers.current.push(
      setTimeout(() => {
        setDoorOpen(true);
        onProgress(1);
        timers.current.push(setTimeout(() => sfx.fanfare(), 500));
        timers.current.push(setTimeout(onSolved, 1700));
      }, 1100)
    );
  }, [solved, unlocking, doorOpen, keys, onMistake, onProgress, onSolved]);

  return (
    <Scene bg="linear-gradient(180deg,#F4EEFB 0%,#E7DDF3 55%,#E9DCC4 60%,#DBC9A2 100%)">
      {/* secret door */}
      <div className="absolute left-1/2 top-[6%] h-[76%] w-[46%] -translate-x-1/2">
        <Pulse active={hintPulse > 0 && keys === 3 && !doorOpen} className="h-full">
          <div className="relative h-full rounded-t-3xl border-[6px] border-[#3B2E5A] bg-[#9C7BD8] shadow-[0_10px_0_rgba(59,46,90,0.25)]">
            {/* door panels slide open */}
            <div className="absolute inset-1 overflow-hidden rounded-t-2xl">
              <div className="absolute inset-0 bg-[#7C5BC0] transition-transform duration-1000" style={{ transform: doorOpen ? "translateX(-105%)" : "translateX(0)", transformOrigin: "left" }} />
              <div className="absolute inset-0 bg-[#8B68CE] transition-transform duration-1000" style={{ transform: doorOpen ? "translateX(105%)" : "translateX(0)", transformOrigin: "right" }} />
              {!doorOpen && (
                <>
                  <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-[#3B2E5A]" aria-hidden />
                  {/* lock with 3 keyholes */}
                  <button
                    type="button"
                    onClick={tapLock}
                    aria-label={lang === "fa" ? "قفل در" : "door lock"}
                    className="absolute left-1/2 top-[42%] z-10 -translate-x-1/2 cursor-pointer"
                  >
                    <svg viewBox="0 0 90 110" className="w-16">
                      <rect x="8" y="34" width="74" height="60" rx="14" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" />
                      <path d="M24 34 V22 Q24 6 45 6 Q66 6 66 22 V34" fill="none" stroke="#3B2E5A" strokeWidth="7" />
                      {[34, 50, 66].map((y, i) => (
                        <g key={y}>
                          <circle cx="45" cy={y} r="7" fill={i < keys ? "#4CAF50" : "#FAFAFA"} stroke="#3B2E5A" strokeWidth="3" />
                          <rect x="43" y={y + 6} width="4" height="8" rx="2" fill={i < keys ? "#4CAF50" : "#FAFAFA"} stroke="#3B2E5A" strokeWidth="2" />
                        </g>
                      ))}
                      {keys === 3 && !doorOpen && <circle cx="45" cy="55" r="34" fill="none" stroke="#FF6B81" strokeWidth="3" opacity="0.7" style={{ animation: "pulse-ring 1.2s ease-in-out infinite" }} />}
                    </svg>
                  </button>
                </>
              )}
              {/* light beyond the door */}
              {doorOpen && (
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#FFE9A8 0%,#FFD154 100%)" }} aria-hidden>
                  <div className="absolute left-1/2 top-[30%] w-[60%] -translate-x-1/2" style={{ animation: "glow 1.2s ease-in-out infinite" }}>
                    <svg viewBox="0 0 80 50">
                      <path d="M10 40 Q20 18 40 18 Q60 18 70 40 Z" fill="#FAFAFA" stroke="#3B2E5A" strokeWidth="3" />
                      <circle cx="24" cy="30" r="4" fill="#FFD154" />
                      <circle cx="40" cy="26" r="5" fill="#FFD154" />
                      <circle cx="56" cy="31" r="4" fill="#FFD154" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
            {/* knob */}
            {!doorOpen && (
              <div className="absolute right-2 top-[46%] h-5 w-5 rounded-full border-[3px] border-[#3B2E5A] bg-[#FFD154]" aria-hidden />
            )}
          </div>
        </Pulse>
      </div>

      {/* picture frame (key 1 behind) */}
      {!frameMoved ? (
        <div className="absolute left-[4%] top-[10%] w-[26%]">
          <div
            ref={frameRef}
            {...frameDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "قاب عکس" : "picture frame"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${frameDrag.x}px, ${frameDrag.y}px)`,
              transition: frameDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && keys === 0}>
              <svg viewBox="0 0 110 90" className="h-auto w-full" aria-hidden>
                <rect x="4" y="4" width="102" height="82" rx="10" fill="#FF8C42" stroke="#3B2E5A" strokeWidth="4.5" />
                <rect x="16" y="16" width="78" height="58" rx="6" fill="#BFE9F2" stroke="#3B2E5A" strokeWidth="3" />
                <path d="M22 62 L44 36 L60 54 L70 44 L88 62" fill="none" stroke="#4CAF50" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="72" cy="28" r="7" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.4" />
              </svg>
            </Pulse>
          </div>
        </div>
      ) : (
        <>
          {/* frame moved aside */}
          <div className="absolute left-[2%] top-[12%] w-[20%] -rotate-12 opacity-90" style={{ animation: "slide-up 0.4s ease-out both" }}>
            <svg viewBox="0 0 110 90" className="h-auto w-full" aria-hidden>
              <rect x="4" y="4" width="102" height="82" rx="10" fill="#FF8C42" stroke="#3B2E5A" strokeWidth="4.5" />
              <rect x="16" y="16" width="78" height="58" rx="6" fill="#BFE9F2" stroke="#3B2E5A" strokeWidth="3" />
            </svg>
          </div>
          <div className="absolute left-[13%] top-[24%] w-[14%]" style={{ animation: "pop-in 0.5s 0.25s ease-out both" }} aria-hidden>
            <KeySvg color={KEY_COLORS[0]} />
          </div>
        </>
      )}

      {/* drawer cabinet (key 3 inside) */}
      <div className="absolute bottom-[16%] right-[4%] w-[28%]">
        <button
          type="button"
          onClick={tapDrawer}
          aria-label={lang === "fa" ? "کشو" : "drawer"}
          className="block w-full cursor-pointer transition-transform active:scale-95"
        >
          <Pulse active={hintPulse > 0 && keys >= 2 && !drawerOpen}>
            <svg viewBox="0 0 130 120" className="h-auto w-full" aria-hidden>
              <rect x="6" y="10" width="118" height="100" rx="12" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="4.5" />
              {/* drawer slides open */}
              <g style={{ transform: drawerOpen ? "translateY(34px)" : "translateY(0)", transition: "transform 0.45s ease" }}>
                <rect x="20" y="30" width="90" height="30" rx="8" fill="#E0A968" stroke="#3B2E5A" strokeWidth="4" />
                <circle cx="65" cy="45" r="6" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3" />
              </g>
              {drawerOpen && (
                <g style={{ animation: "pop-in 0.4s 0.3s ease-out both" }}>
                  <g transform="translate(40,76)">
                    <KeySvg color={KEY_COLORS[2]} />
                  </g>
                </g>
              )}
            </svg>
          </Pulse>
        </button>
      </div>

      {/* rug (key 2 under) */}
      {!rugMoved ? (
        <div className="absolute bottom-[6%] left-[24%] w-[36%]">
          <div
            ref={rugRef}
            {...rugDrag.bind}
            role="button"
            aria-label={lang === "fa" ? "فرش" : "rug"}
            className="cursor-grab active:cursor-grabbing"
            style={{
              transform: `translate(${rugDrag.x}px, ${rugDrag.y}px)`,
              transition: rugDrag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.4,0.64,1)",
              zIndex: 20,
            }}
          >
            <Pulse active={hintPulse > 0 && keys === 1}>
              <svg viewBox="0 0 170 70" className="h-auto w-full" aria-hidden>
                <rect x="4" y="8" width="162" height="54" rx="16" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" />
                <rect x="16" y="18" width="138" height="34" rx="10" fill="#FF8FA0" stroke="#3B2E5A" strokeWidth="2.6" />
                <ellipse cx="85" cy="35" rx="34" ry="11" fill="#FFD154" opacity="0.8" />
              </svg>
            </Pulse>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute bottom-[4%] left-[6%] w-[28%] -rotate-6 opacity-90" style={{ animation: "slide-up 0.4s ease-out both" }}>
            <svg viewBox="0 0 170 70" className="h-auto w-full" aria-hidden>
              <rect x="4" y="8" width="162" height="54" rx="16" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4.5" />
            </svg>
          </div>
          <div className="absolute bottom-[10%] left-[42%] w-[13%]" style={{ animation: "pop-in 0.5s 0.25s ease-out both" }} aria-hidden>
            <KeySvg color={KEY_COLORS[1]} />
          </div>
        </>
      )}

      {/* collected keys tray */}
      {keys > 0 && (
        <div className="absolute bottom-[1%] left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl border-4 border-[#3B2E5A] bg-[#FAFAFA] px-4 py-1.5" style={{ animation: "slide-up 0.4s ease-out both" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-10" style={{ animation: i < keys ? "pop-in 0.4s ease-out both" : "none", opacity: i < keys ? 1 : 0.25 }} aria-hidden>
              <KeySvg color={KEY_COLORS[i]} />
            </div>
          ))}
        </div>
      )}

      {/* unlocking: keys flying to door */}
      {unlocking &&
        !doorOpen &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            className="pointer-events-none absolute bottom-[20%] left-1/2 w-[10%]"
            style={{
              animation: `float-up 0.8s ${i * 0.3}s ease-out both`,
              marginLeft: `${(i - 1) * 30}px`,
            }}
            aria-hidden
          >
            <KeySvg color={KEY_COLORS[i]} />
          </div>
        ))}
    </Scene>
  );
}
