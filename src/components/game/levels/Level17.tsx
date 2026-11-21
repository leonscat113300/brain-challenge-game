"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { useDragMove, Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 17 — Find the red ball: shove the book, mug, hat and gift     */
/* aside; the ball hides under the hat (a cookie hides under the book).*/
/* ------------------------------------------------------------------ */

function BookSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 160 110" className={className} style={style} aria-hidden>
      <rect x="16" y="12" width="128" height="88" rx="10" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="16" y="12" width="22" height="88" rx="10" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="48" y="34" width="82" height="20" rx="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
      <path d="M52 70 H118" stroke="#FAFAFA" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
      <path d="M52 80 H104" stroke="#FAFAFA" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function MugSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 120 104" className={className} style={style} aria-hidden>
      <path d="M92 44 Q116 48 110 64 Q104 78 86 72" fill="none" stroke="#3B2E5A" strokeWidth="12" strokeLinecap="round" />
      <path d="M92 44 Q116 48 110 64 Q104 78 86 72" fill="none" stroke="#1EC8CF" strokeWidth="5" strokeLinecap="round" />
      <path d="M18 30 L24 88 Q26 98 38 98 L74 98 Q86 98 88 88 L94 30 Z" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <ellipse cx="56" cy="30" rx="38" ry="10" fill="#7FE3E8" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M34 48 L38 84" stroke="#FAFAFA" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function HatSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 130" className={className} style={style} aria-hidden>
      <path d="M40 92 Q40 22 100 22 Q160 22 160 92 Z" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <ellipse cx="100" cy="96" rx="86" ry="18" fill="#6C4AB6" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M42 88 Q100 106 158 88 L158 98 Q100 116 42 98 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
    </svg>
  );
}

function GiftSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 140 130" className={className} style={style} aria-hidden>
      <rect x="18" y="46" width="104" height="72" rx="10" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="10" y="34" width="120" height="26" rx="10" fill="#FF8FA3" stroke="#3B2E5A" strokeWidth="5" />
      <rect x="60" y="34" width="20" height="84" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
      <circle cx="52" cy="24" r="12" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
      <circle cx="88" cy="24" r="12" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.5" />
      <circle cx="70" cy="28" r="7" fill="#E8A81C" stroke="#3B2E5A" strokeWidth="3" />
    </svg>
  );
}

function BallSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <circle cx="50" cy="50" r="42" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" />
      <path d="M30 26 Q40 18 52 22" stroke="#FAFAFA" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M50 38 L55 48 L66 49 L58 57 L61 68 L50 62 L39 68 L42 57 L34 49 L45 48 Z" fill="#FFD154" stroke="#E8A81C" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

function CookieSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <circle cx="50" cy="50" r="42" fill="#E3B65A" stroke="#3B2E5A" strokeWidth="5" />
      <circle cx="36" cy="38" r="6" fill="#6E4526" />
      <circle cx="62" cy="34" r="5" fill="#6E4526" />
      <circle cx="56" cy="60" r="6" fill="#6E4526" />
      <circle cx="34" cy="62" r="4.5" fill="#6E4526" />
      <circle cx="72" cy="52" r="4" fill="#6E4526" />
    </svg>
  );
}

export default function Level17({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [bookMoved, setBookMoved] = useState(false);
  const [mugMoved, setMugMoved] = useState(false);
  const [hatMoved, setHatMoved] = useState(false);
  const [giftMoved, setGiftMoved] = useState(false);
  const [ballFound, setBallFound] = useState(false);
  const [cookieWiggle, setCookieWiggle] = useState(0);
  const [done, setDone] = useState(false);
  const floorTapsRef = useRef(0);

  const reportProgress = useCallback(
    (movedCount: number) => {
      onProgress(Math.min(0.75, 0.25 * movedCount));
    },
    [onProgress]
  );

  const bookDrag = useDragMove(useCallback((d, api) => {
    if (solved || done || bookMoved) return;
    if (Math.hypot(d.x, d.y) >= 60) {
      setBookMoved(true);
      sfx.whoosh();
      /* keep the object ON the ground: keep the dragged x, drop y back to the floor */
      api.setPos(d.x, 0);
      reportProgress(1 + [mugMoved, hatMoved, giftMoved].filter(Boolean).length);
    } else { api.reset(); }
  }, [solved, done, bookMoved, mugMoved, hatMoved, giftMoved, reportProgress]));

  const mugDrag = useDragMove(useCallback((d, api) => {
    if (solved || done || mugMoved) return;
    if (Math.hypot(d.x, d.y) >= 60) {
      setMugMoved(true);
      sfx.whoosh();
      api.setPos(d.x, 0);
      reportProgress(1 + [bookMoved, hatMoved, giftMoved].filter(Boolean).length);
    } else { api.reset(); }
  }, [solved, done, mugMoved, bookMoved, hatMoved, giftMoved, reportProgress]));

  const hatDrag = useDragMove(useCallback((d, api) => {
    if (solved || done || hatMoved) return;
    if (Math.hypot(d.x, d.y) >= 60) {
      setHatMoved(true);
      sfx.whoosh();
      api.setPos(d.x, 0);
      reportProgress(1 + [bookMoved, mugMoved, giftMoved].filter(Boolean).length);
    } else { api.reset(); }
  }, [solved, done, hatMoved, bookMoved, mugMoved, giftMoved, reportProgress]));

  const giftDrag = useDragMove(useCallback((d, api) => {
    if (solved || done || giftMoved) return;
    if (Math.hypot(d.x, d.y) >= 60) {
      setGiftMoved(true);
      sfx.whoosh();
      api.setPos(d.x, 0);
      reportProgress(1 + [bookMoved, mugMoved, hatMoved].filter(Boolean).length);
    } else { api.reset(); }
  }, [solved, done, giftMoved, bookMoved, mugMoved, hatMoved, reportProgress]));

  const tapBall = () => {
    if (solved || done || !hatMoved || ballFound) return;
    setBallFound(true);
    setDone(true);
    sfx.pop();
    window.setTimeout(() => sfx.cheer(), 280);
    window.setTimeout(() => sfx.sparkle(), 420);
    onProgress(1);
    window.setTimeout(onSolved, 950);
  };

  const tapCookie = () => {
    if (solved || done) return;
    sfx.pop();
    setCookieWiggle((w) => w + 1);
  };

  const tapFloor = () => {
    if (solved || done) return;
    sfx.tick();
    floorTapsRef.current += 1;
    if (floorTapsRef.current > 2) onMistake({ fa: "زیر این‌ها بگرد!", en: "Search under the things!" });
  };

  const asideStyle = (drag: { x: number; y: number; dragging: boolean }) => ({
    transform: `translate(${drag.x}px, ${drag.y}px)${drag.dragging ? " scale(1.05) rotate(-2deg)" : ""}`,
    transition: drag.dragging ? "none" : "transform 0.4s cubic-bezier(0.34,1.3,0.64,1)",
  });

  return (
    <Scene bg="linear-gradient(180deg,#F9E9D6 0%,#F2DCC0 100%)">
      {/* wall dots + wooden floor */}
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(rgba(108,74,182,0.14) 3px, transparent 3.5px)", backgroundSize: "46px 46px" }} aria-hidden />
      <div className="absolute inset-x-0 bottom-0 h-[42%] border-t-4 border-[#3B2E5A]" style={{ background: "#D9A05B", backgroundImage: "repeating-linear-gradient(0deg, rgba(139,94,60,0.3) 0 3px, transparent 3px 44px)" }} aria-hidden />

      {/* potted plant in the corner */}
      <svg viewBox="0 0 90 120" className="absolute bottom-[8%] end-[3%] z-[8] w-[13%]" aria-hidden>
        <path d="M45 62 Q28 40 34 16" stroke="#4CAF50" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M45 62 Q62 44 58 20" stroke="#4CAF50" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M45 62 Q45 34 45 14" stroke="#7ED491" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M26 62 L64 62 L58 104 Q57 112 48 112 L42 112 Q33 112 32 104 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      </svg>

      {/* empty-floor tap zone (gentle nudge after 2 taps) */}
      <button type="button" aria-label={lang === "fa" ? "کف اتاق" : "room floor"} onClick={tapFloor} className="absolute inset-x-0 bottom-0 z-[6] h-[46%] cursor-default" />

      {/* red ball hidden under the hat */}
      <div className="absolute z-[12]" style={{ left: "45%", top: "52%", width: "12%", visibility: hatMoved ? "visible" : "hidden" }}>
        <Pulse active={hintPulse > 0 && hatMoved && !done}>
          <button
            type="button"
            aria-label={lang === "fa" ? "توپ قرمز" : "red ball"}
            onClick={tapBall}
            className="relative block w-full"
            style={{ animation: ballFound ? "star-pop 0.55s ease both" : hatMoved ? "pop-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both" : undefined }}
          >
            <BallSvg className="h-auto w-full drop-shadow-[0_4px_3px_rgba(59,46,90,0.28)]" />
            {ballFound &&
              [0, 1, 2].map((s) => (
                <svg key={s} viewBox="0 0 40 40" className="absolute h-6 w-6" style={{ left: `${[-26, 66, 36][s]}%`, top: `${[-18, -6, 74][s]}%`, animation: `pop-in 0.4s ${0.15 + s * 0.12}s both` }} aria-hidden>
                  <path d="M20 3 L24 15 L36 16 L26 24 L30 36 L20 28 L10 36 L14 24 L4 16 L16 15 Z" fill="#FFD154" stroke="#E8A81C" strokeWidth="2.5" strokeLinejoin="round" />
                </svg>
              ))}
          </button>
        </Pulse>
      </div>

      {/* cookie decoy hidden under the book */}
      <div className="absolute z-[12]" style={{ left: "28%", top: "70%", width: "12%", visibility: bookMoved ? "visible" : "hidden" }}>
        <button
          type="button"
          aria-label={lang === "fa" ? "کلوچه" : "cookie"}
          onClick={tapCookie}
          className="block w-full"
          style={{ animation: cookieWiggle > 0 ? "wobble 0.6s ease-in-out" : bookMoved ? "pop-in 0.45s cubic-bezier(0.34,1.56,0.64,1) both" : undefined }}
        >
          <CookieSvg className="h-auto w-full" />
        </button>
      </div>

      {/* the pile: each object can be dragged aside and stays put */}
      <div className="absolute z-[24]" style={{ left: "24%", top: "56%", width: "24%", ...asideStyle(bookDrag) }}>
        <Pulse active={hintPulse > 0 && !bookMoved && !done}>
          <div {...(bookMoved ? {} : bookDrag.bind)} className={bookMoved ? "" : "cursor-grab active:cursor-grabbing"}>
            <BookSvg className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.22)]" />
          </div>
        </Pulse>
      </div>
      <div className="absolute z-[24]" style={{ left: "52%", top: "62%", width: "16%", ...asideStyle(mugDrag) }}>
        <Pulse active={hintPulse > 0 && !mugMoved && !done}>
          <div {...(mugMoved ? {} : mugDrag.bind)} className={mugMoved ? "" : "cursor-grab active:cursor-grabbing"}>
            <MugSvg className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.22)]" />
          </div>
        </Pulse>
      </div>
      <div className="absolute z-[24]" style={{ left: "57%", top: "45%", width: "19%", ...asideStyle(giftDrag) }}>
        <Pulse active={hintPulse > 0 && !giftMoved && !done}>
          <div {...(giftMoved ? {} : giftDrag.bind)} className={giftMoved ? "" : "cursor-grab active:cursor-grabbing"}>
            <GiftSvg className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.22)]" />
          </div>
        </Pulse>
      </div>
      <div className="absolute z-[30]" style={{ left: "34%", top: "44%", width: "30%", ...asideStyle(hatDrag) }}>
        <Pulse active={hintPulse > 0 && !hatMoved && !done}>
          <div {...(hatMoved ? {} : hatDrag.bind)} className={hatMoved ? "" : "cursor-grab active:cursor-grabbing"}>
            <HatSvg className="h-auto w-full drop-shadow-[0_5px_4px_rgba(59,46,90,0.25)]" />
          </div>
        </Pulse>
      </div>

      {/* dust poof when the hat is lifted */}
      {hatMoved &&
        [0, 1, 2].map((p) => (
          <motion.div key={p} className="pointer-events-none absolute z-[26] aspect-square h-[5%] rounded-full bg-[#D8D2E4]" style={{ left: `${45 + p * 7}%`, top: "55%" }} initial={{ scale: 0, opacity: 0.85 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.55, delay: p * 0.09, ease: "easeOut" }} />
        ))}
    </Scene>
  );
}
