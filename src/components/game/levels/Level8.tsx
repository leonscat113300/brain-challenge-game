"use client";

import React, { useCallback, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { useShake, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 8 — Lights Off: shake the device (or tap the chunky button)   */
/* to charge the pendant lamps until the dark room lights up.          */
/* ------------------------------------------------------------------ */

const GOAL = 6;

function StarSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 40 40" className={className} style={style} aria-hidden>
      <path d="M20 3 L24 15 L36 16 L26 24 L30 36 L20 28 L10 36 L14 24 L4 16 L16 15 Z" fill="#FFD154" stroke="#E8A81C" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export default function Level8({ lang, solved, onSolved, onProgress, hintPulse }: LevelProps) {
  const [lit, setLit] = useState(false);
  const [swing, setSwing] = useState(0);
  /* iOS 13+ gates motion events behind a permission prompt (computed once) */
  const [needsPerm] = useState(() => {
    if (typeof window === "undefined") return false;
    const DM = window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    return !!DM && typeof DM.requestPermission === "function";
  });
  const [permGranted, setPermGranted] = useState(false);
  const roomRef = useRef<HTMLDivElement>(null);
  const bulbRefs = useRef<Array<HTMLDivElement | null>>([null, null]);
  const swingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* parallel shake counter (each shake event adds exactly 1) */
  const energyRef = useRef(0);

  const flickerBulbs = useCallback(() => {
    bulbRefs.current.forEach((b) => {
      b?.animate(
        [
          { opacity: "1", transform: "scale(1)" },
          { opacity: "0.45", transform: "scale(0.95)" },
          { opacity: "1", transform: "scale(1.04)" },
          { opacity: "0.6", transform: "scale(0.98)" },
          { opacity: "1", transform: "scale(1)" },
        ],
        { duration: 340, easing: "linear" }
      );
    });
  }, []);

  const handleShake = useCallback(() => {
    if (solved || lit) return;
    sfx.shake();
    roomRef.current?.animate(
      [
        { transform: "translate(0,0) rotate(0deg)" },
        { transform: "translate(-6px,2px) rotate(-1.3deg)" },
        { transform: "translate(6px,-2px) rotate(1.3deg)" },
        { transform: "translate(-4px,1px) rotate(-0.9deg)" },
        { transform: "translate(0,0) rotate(0deg)" },
      ],
      { duration: 400, easing: "ease-out" }
    );
    flickerBulbs();
    setSwing((s) => (s >= 0 ? -8 : 8));
    if (swingTimer.current) clearTimeout(swingTimer.current);
    swingTimer.current = setTimeout(() => setSwing(0), 430);

    /* report shake progress and light the room at full energy */
    energyRef.current += 1;
    const e = energyRef.current;
    onProgress(Math.min(1, e / GOAL));
    if (e >= GOAL) {
      setLit(true);
      sfx.sparkle();
      window.setTimeout(() => sfx.chime(), 320);
      onProgress(1);
      window.setTimeout(onSolved, 900);
    }
  }, [solved, lit, flickerBulbs, onProgress, onSolved]);

  const { energy, nudge, requestPermission } = useShake(handleShake, true);

  const enableMotion = () => {
    void requestPermission().then((ok) => setPermGranted(ok));
  };

  const lampX = ["27%", "63%"];

  return (
    <Scene bg="#1B1230">
      <div ref={roomRef} className="absolute inset-0 overflow-hidden">
        {/* dark room base */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#1B1230 0%,#2A2340 62%,#241A3F 63%,#1B1230 100%)" }} aria-hidden />
        {/* warm lit version of the room, fades in */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg,#F7E3BC 0%,#EFD08E 62%,#D9A05B 63%,#C98A4B 100%)", opacity: lit ? 1 : 0, transition: "opacity 0.8s ease" }}
          aria-hidden
        />

        {/* picture frame (silhouette / warm) */}
        <div
          className="absolute z-[2] grid place-items-center rounded-md border-4 overflow-hidden"
          style={{ left: "9%", top: "30%", width: "16%", height: "20%", background: lit ? "#FAFAFA" : "#241A3F", borderColor: lit ? "#8B5E3C" : "#3B2E5A", transition: "background 0.8s ease, border-color 0.8s ease" }}
          aria-hidden
        >
          <svg viewBox="0 0 40 28" className="w-[72%]">
            {lit ? (
              <>
                <circle cx="30" cy="8" r="5" fill="#FFD154" />
                <path d="M2 25 L13 11 L21 20 L27 14 L38 25 Z" fill="#4CAF50" />
              </>
            ) : (
              <path d="M2 25 L13 11 L21 20 L27 14 L38 25 Z" fill="#3B2E5A" />
            )}
          </svg>
        </div>

        {/* exit sign (silhouette / warm) */}
        <div
          className="absolute z-[2] grid place-items-center rounded-md border-[3px]"
          style={{ right: "9%", top: "24%", width: "14%", height: "10%", background: lit ? "#4CAF50" : "#241A3F", borderColor: "#3B2E5A", transition: "background 0.8s ease" }}
          aria-hidden
        >
          <svg viewBox="0 0 26 16" className="w-[58%]">
            <path d="M2 8 H17 M12 3 L18 8 L12 13" stroke={lit ? "#FAFAFA" : "#3B2E5A"} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* bench (silhouette / warm) */}
        <div className="absolute z-[2]" style={{ right: "7%", bottom: "12%", width: "32%", height: "16%" }} aria-hidden>
          <div className="absolute inset-x-0 top-0 h-[44%] rounded-lg border-[3px]" style={{ background: lit ? "#8B5E3C" : "#241A3F", borderColor: "#3B2E5A", transition: "background 0.8s ease" }} />
          <div className="absolute left-[12%] top-[40%] w-[9%] h-[60%] rounded-b border-x-[3px] border-b-[3px]" style={{ background: lit ? "#6E4526" : "#241A3F", borderColor: "#3B2E5A", transition: "background 0.8s ease" }} />
          <div className="absolute right-[12%] top-[40%] w-[9%] h-[60%] rounded-b border-x-[3px] border-b-[3px]" style={{ background: lit ? "#6E4526" : "#241A3F", borderColor: "#3B2E5A", transition: "background 0.8s ease" }} />
        </div>

        {/* small rug on the floor (silhouette / warm) */}
        <div
          className="absolute z-[2] rounded-[50%] border-[3px]"
          style={{ left: "12%", bottom: "6%", width: "26%", height: "9%", background: lit ? "#FF6B81" : "#241A3F", borderColor: "#3B2E5A", transition: "background 0.8s ease" }}
          aria-hidden
        />

        {/* warm light pools under the lamps */}
        {[0, 1].map((i) => (
          <div
            key={`pool-${i}`}
            className="absolute z-[6] pointer-events-none"
            style={{
              left: lampX[i],
              top: "24%",
              width: "60%",
              height: "52%",
              transform: `translateX(-50%) scale(${lit ? 1 : 0.3})`,
              opacity: lit ? 1 : Math.min(0.22, energy * 0.035),
              transition: "opacity 0.8s ease, transform 0.8s ease",
              background: "radial-gradient(ellipse at center, rgba(255,209,84,0.55) 0%, rgba(255,209,84,0.16) 45%, rgba(255,209,84,0) 72%)",
            }}
            aria-hidden
          />
        ))}

        {/* pendant lamps (swing on every shake) */}
        <div className="absolute inset-x-0 top-0 h-[30%] z-10 pointer-events-none">
          <Pulse active={hintPulse > 0 && !lit}>
            <div className="relative w-full h-full">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="absolute top-0 flex flex-col items-center"
                  style={{ left: lampX[i], transform: `translateX(-50%) rotate(${swing}deg)`, transformOrigin: "top center", transition: "transform 0.35s ease-in-out" }}
                >
                  <div className="w-[3px] h-[44px]" style={{ background: "#3B2E5A" }} />
                  <svg viewBox="0 0 64 34" className="w-[62px] h-[33px]" aria-hidden>
                    <path d="M24 0 L40 0 L62 30 L2 30 Z" fill="#3B2E5A" stroke="#241A3F" strokeWidth="3" strokeLinejoin="round" />
                    <rect x="0" y="29" width="64" height="5" rx="2.5" fill="#241A3F" />
                  </svg>
                  <div
                    ref={(el) => { bulbRefs.current[i] = el; }}
                    className="w-[26px] h-[30px] rounded-t-[6px] rounded-b-[13px] border-[3px] border-[#3B2E5A]"
                    style={{ background: lit ? "#FFD154" : "#4E4A5E", animation: lit ? "glow 1.6s ease-in-out infinite" : undefined, transition: "background 0.5s ease" }}
                  />
                </div>
              ))}
            </div>
          </Pulse>
        </div>

        {/* celebratory stars when lit */}
        {lit && (
          <>
            <StarSvg className="absolute z-[11] w-6 h-6" style={{ left: "36%", top: "17%", animation: "pop-in 0.4s 0.15s both" }} />
            <StarSvg className="absolute z-[11] w-5 h-5" style={{ left: "56%", top: "24%", animation: "pop-in 0.4s 0.3s both" }} />
            <StarSvg className="absolute z-[11] w-7 h-7" style={{ left: "70%", top: "12%", animation: "pop-in 0.4s 0.45s both" }} />
          </>
        )}
      </div>

      {/* controls (outside the jolt wrapper, never covering the lamps) */}
      <div className="absolute inset-x-0 bottom-[3%] z-30 flex flex-col items-center gap-2 px-4">
        <button
          type="button"
          onClick={nudge}
          disabled={lit || solved}
          aria-label={lang === "fa" ? "تکان بده" : "shake"}
          className="btn-chunky flex items-center justify-center gap-2 text-xl font-extrabold"
          style={{ minWidth: 216, minHeight: 56, background: "#FFD154", color: "#33205E", border: "4px solid #3B2E5A" }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
            <path d="M13 2 L4 14 h6 l-1 8 9-12 h-6 z" fill="#E8A81C" />
          </svg>
          {lang === "fa" ? "تکان بده!" : "Shake!"}
        </button>
        {needsPerm && !permGranted && !lit && (
          <button
            type="button"
            onClick={enableMotion}
            className="rounded-xl px-4 font-bold text-sm"
            style={{ minHeight: 44, background: "#FAFAFA", color: "#33205E", border: "3px solid #3B2E5A" }}
          >
            {lang === "fa" ? "فعال‌سازی سنسور لرزش" : "Enable motion sensor"}
          </button>
        )}
      </div>
    </Scene>
  );
}
