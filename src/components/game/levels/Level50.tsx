"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 50 — Get the ball out of the box: the ball is tethered with a */
/* string, so first tap the knot to untie it, then flip the box over   */
/* with the big button, or physically tilt/flip the phone.             */
/* ------------------------------------------------------------------ */

type Stage = "closed" | "flipping" | "out";

function BoxSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 210 170" className={className} style={style} aria-hidden>
      {/* back flaps standing up */}
      <path d="M38 62 L18 14 L84 58 Z" fill="#C88B4A" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M172 62 L192 14 L126 58 Z" fill="#C88B4A" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      {/* dark opening */}
      <rect x="30" y="52" width="150" height="18" rx="4" fill="#8A5A33" stroke="#3B2E5A" strokeWidth="4.5" />
      {/* front face */}
      <rect x="30" y="66" width="150" height="86" rx="8" fill="#E8B46B" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="62" y="92" width="86" height="18" rx="5" fill="#F2E3C4" stroke="#3B2E5A" strokeWidth="3" />
      <circle cx="105" cy="101" r="5.5" fill="#FF6B81" />
      <path d="M30 122 H180" stroke="#C88B4A" strokeWidth="3" opacity="0.8" />
    </svg>
  );
}

function BallSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 80 80" className={className} style={style} aria-hidden>
      <circle cx="40" cy="40" r="33" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M12 40 A28 28 0 0 1 68 40" stroke="#E14B63" strokeWidth="6" fill="none" opacity="0.7" />
      <ellipse cx="27" cy="24" rx="7" ry="10" fill="#fff" opacity="0.45" transform="rotate(-24 27 24)" />
      <circle cx="31" cy="44" r="4.5" fill="#3B2E5A" />
      <circle cx="50" cy="44" r="4.5" fill="#3B2E5A" />
      <circle cx="32.5" cy="42.5" r="1.6" fill="#fff" />
      <circle cx="51.5" cy="42.5" r="1.6" fill="#fff" />
      <path d="M34 54 Q40 59 46 54" stroke="#3B2E5A" strokeWidth="3.5" fill="none" strokeLinecap="round" />
      <ellipse cx="24" cy="52" rx="4" ry="2.5" fill="#FF9FB2" />
      <ellipse cx="57" cy="52" rx="4" ry="2.5" fill="#FF9FB2" />
    </svg>
  );
}

function RopeSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 56 84" className={className} style={style} aria-hidden>
      <path d="M28 0 L28 72" stroke="#3B2E5A" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M28 0 L28 72" stroke="#FF6B81" strokeWidth="3" strokeLinecap="round" />
      <path d="M28 12 L16 3 L20 20 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 12 L40 3 L36 20 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="28" cy="12" r="4.5" fill="#FF9FB2" stroke="#3B2E5A" strokeWidth="2.5" />
    </svg>
  );
}

function ButterflySvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 80" className={className} style={style} aria-hidden>
      <motion.g
        animate={{ rotate: [-14, 10, -14] }}
        transition={{ duration: 0.24, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
      >
        <ellipse cx="34" cy="26" rx="17" ry="11" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" transform="rotate(-20 34 26)" />
        <ellipse cx="66" cy="26" rx="17" ry="11" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" transform="rotate(20 66 26)" />
        <ellipse cx="38" cy="50" rx="13" ry="9" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" transform="rotate(16 38 50)" />
        <ellipse cx="62" cy="50" rx="13" ry="9" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="4" transform="rotate(-16 62 50)" />
      </motion.g>
      <ellipse cx="50" cy="44" rx="6" ry="16" fill="#3B2E5A" />
      <circle cx="50" cy="26" r="6" fill="#3B2E5A" />
      <path d="M46 22 Q40 14 36 14 M54 22 Q60 14 64 14" stroke="#3B2E5A" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export default function Level50({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [stage, setStage] = useState<Stage>("closed");
  const [wig, setWig] = useState(0);
  const [tied, setTied] = useState(true);
  const [fly, setFly] = useState(0);
  const flipRef = useRef<() => void>(() => {});
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const untie = useCallback(() => {
    if (solved || stage !== "closed" || !tied) return;
    setTied(false);
    sfx.unlock();
    onProgress(0.34);
  }, [solved, stage, tied, onProgress]);

  const flipOnce = useCallback(() => {
    if (solved || stage !== "closed" || tied) return;
    setStage("flipping");
    sfx.boing();
    onProgress(0.67);
    timers.current.push(
      setTimeout(() => {
        setStage("out");
        sfx.cheer();
        onProgress(1);
        timers.current.push(setTimeout(onSolved, 1600));
      }, 950)
    );
  }, [solved, stage, tied, onProgress, onSolved]);

  useEffect(() => {
    flipRef.current = flipOnce;
  });

  /* physical flip: phone turned upside down */
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;
      if (Math.abs(beta) > 70 || Math.abs(gamma) > 70) flipRef.current();
    };
    window.addEventListener("deviceorientation", onOrient);
    return () => window.removeEventListener("deviceorientation", onOrient);
  }, []);

  const tapBall = () => {
    if (solved || stage !== "closed") return;
    setWig((k) => k + 1);
    if (tied) {
      onMistake({ fa: "توپ با نخ بسته شده؛ اول گره رو باز کن!", en: "The ball is tied down; untie the knot first!" });
    } else {
      onMistake({ fa: "جعبه رو وارونه کن!", en: "Flip the box over!" });
    }
  };

  const tapButterfly = () => {
    if (solved || stage !== "closed") return;
    setFly((k) => k + 1);
    sfx.pop();
    onMistake({ fa: "پروانه نمی‌تونه جعبه رو جابه‌جا کنه!", en: "A butterfly can't move the box!" });
  };

  const flipped = stage !== "closed";
  const out = stage === "out";

  return (
    <Scene bg="linear-gradient(180deg,#FDF3E3 0%,#FBEAD0 70%,#F3DDBB 100%)">
      {/* wooden floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[22%] border-t-4 border-[#3B2E5A]"
        style={{ background: "#D9A05B", backgroundImage: "repeating-linear-gradient(90deg, rgba(139,94,60,0.35) 0 3px, transparent 3px 52px)" }}
        aria-hidden
      />

      {/* decoy: a fluttering butterfly that can't carry the box */}
      <div className="absolute end-[5%] top-[6%] w-[14%]" style={{ zIndex: 5 }}>
        <motion.div animate={fly % 2 === 1 ? { x: -16, y: 10 } : { x: 0, y: 0 }} transition={{ type: "spring", stiffness: 240, damping: 12 }}>
          <button
            type="button"
            onClick={tapButterfly}
            aria-label={lang === "fa" ? "پروانه" : "butterfly"}
            className="block w-full cursor-pointer border-0 bg-transparent p-0"
            style={{ animation: "bob 2.6s ease-in-out infinite" }}
          >
            <ButterflySvg className="h-auto w-full drop-shadow-[0_3px_0_rgba(59,46,90,0.15)]" />
          </button>
        </motion.div>
      </div>

      {/* the cardboard box (rotates 180 on flip) */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "18%", width: "44%" }}>
        <motion.div animate={{ rotate: flipped ? 180 : 0 }} transition={{ duration: 0.9, ease: "backIn" }} style={{ transformOrigin: "50% 55%" }}>
          <BoxSvg className="h-auto w-full drop-shadow-[0_6px_0_rgba(59,46,90,0.15)]" />
          {/* ball peeking out of the opening (hides as soon as the flip starts) */}
          <div
            key={wig}
            className="absolute"
            style={{ left: "34%", top: "-24%", width: "32%", opacity: flipped ? 0 : 1, transition: "opacity 0.15s", animation: wig > 0 ? "wobble 0.5s ease-in-out" : undefined }}
          >
            <button
              type="button"
              onClick={tapBall}
              aria-label={lang === "fa" ? "توپ" : "ball"}
              className="block w-full cursor-pointer border-0 bg-transparent p-0"
            >
              <BallSvg className="h-auto w-full" />
            </button>
          </div>
          {/* tether string + knot: must be untapped (untied) before flipping works */}
          {tied && (
            <div className="absolute" style={{ left: "43%", top: "11%", width: "14%" }}>
              <Pulse active={hintPulse > 0 && !flipped}>
                <button
                  type="button"
                  onClick={untie}
                  aria-label={lang === "fa" ? "گرهٔ نخ" : "string knot"}
                  className="block w-full cursor-pointer border-0 bg-transparent p-0"
                >
                  <RopeSvg className="h-auto w-full" />
                </button>
              </Pulse>
            </div>
          )}
        </motion.div>
      </div>

      {/* ball falling out, bouncing twice, then rolling aside */}
      {out && (
        <div className="absolute z-20" style={{ left: "56%", bottom: "11%", width: "15%" }}>
          <motion.div
            initial={{ y: "-26vh", x: 0, rotate: 0 }}
            animate={{
              y: ["-26vh", "0vh", "-4.5vh", "0vh", "-1.8vh", "0vh"],
              x: [0, 10, 34, 40, 58, 64],
              rotate: [0, 140, 300, 380, 470, 520],
            }}
            transition={{ duration: 1.5, times: [0, 0.4, 0.58, 0.74, 0.88, 1], ease: "easeOut" }}
          >
            <BallSvg className="h-auto w-full drop-shadow-[0_4px_0_rgba(59,46,90,0.2)]" />
          </motion.div>
        </div>
      )}

      {/* big chunky flip button */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: "3.5%" }}>
        <Pulse active={hintPulse > 0 && !flipped && !tied}>
          <button
            type="button"
            onClick={() => {
              if (tied) {
                sfx.pop();
                onMistake({ fa: "اول نخِ دور توپ رو باز کن!", en: "Untie the string around the ball first!" });
                return;
              }
              flipRef.current();
            }}
            disabled={solved || flipped}
            aria-label={lang === "fa" ? "وارونه کن" : "Flip it"}
            className="flex min-h-[48px] items-center gap-2 rounded-full border-4 border-[#3B2E5A] bg-[#FFD154] px-7 py-2.5 font-black text-[#3B2E5A] shadow-[0_5px_0_#3B2E5A] transition-transform active:translate-y-[3px] active:shadow-[0_2px_0_#3B2E5A] disabled:opacity-70"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path d="M20 12 A8 8 0 1 1 12 4" fill="none" stroke="#3B2E5A" strokeWidth="3" strokeLinecap="round" />
              <path d="M11 0.8 L17.5 4 L11 7.6 Z" fill="#3B2E5A" />
            </svg>
            <span className="text-[1.05rem]" dir={lang === "fa" ? "rtl" : "ltr"}>
              {lang === "fa" ? "وارونه کن!" : "Flip it!"}
            </span>
          </button>
        </Pulse>
      </div>
    </Scene>
  );
}
