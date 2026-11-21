"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Pulse, Scene, sfx, useDragMove } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 27 — Apple shake: pull the branch DOWN and let it spring back */
/* three times; the apple drops and lands in the wicker basket.        */
/* Redrawn: lush layered canopy, tapered trunk with root flare, and an */
/* organic leafy branch that genuinely grows out of the trunk.         */
/* ------------------------------------------------------------------ */

function AppleSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 110 120" className={className} style={style} aria-hidden>
      <path d="M55 24 Q53 12 60 6" stroke="#8B5E3C" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M60 12 Q76 2 86 14 Q76 24 60 16 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M55 26 Q48 18 36 22 Q14 30 16 62 Q18 96 40 108 Q55 114 70 108 Q92 96 94 62 Q96 30 74 22 Q62 18 55 26 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M30 44 Q28 56 34 68" stroke="#FAFAFA" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* cute face */}
      <circle cx="42" cy="64" r="6" fill="#3B2E5A" />
      <circle cx="68" cy="64" r="6" fill="#3B2E5A" />
      <circle cx="44.3" cy="61.7" r="2.1" fill="#fff" />
      <circle cx="70.3" cy="61.7" r="2.1" fill="#fff" />
      <path d="M48 76 Q55 82 62 76" stroke="#3B2E5A" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="34" cy="72" rx="5.5" ry="4" fill="#FF9FB2" />
      <ellipse cx="76" cy="72" rx="5.5" ry="4" fill="#FF9FB2" />
    </svg>
  );
}

/* Organic branch: grows out of the trunk (its left cut face is hidden
   inside the trunk silhouette — fill body + open top/bottom outlines). */
function BranchSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 460 130" className={className} style={style} aria-hidden>
      {/* main woody branch — tapered, gentle S-curve, thick at the trunk side */}
      <path
        d="M0 40 Q70 30 140 38 Q220 46 300 54 Q360 60 402 66 L404 80 Q356 72 298 68 Q218 62 138 62 Q66 60 0 74 Z"
        fill="#8B5E3C"
      />
      {/* open outlines (top + bottom) so the root end melts into the trunk */}
      <path d="M0 40 Q70 30 140 38 Q220 46 300 54 Q360 60 402 66" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      <path d="M404 80 Q356 72 298 68 Q218 62 138 62 Q66 60 0 74" fill="none" stroke="#3B2E5A" strokeWidth="5" strokeLinecap="round" />
      {/* bark lines + knot */}
      <path d="M50 52 L104 48 M130 52 L188 53 M226 58 L278 60 M314 62 L354 65" stroke="#6E4526" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="150" cy="55" rx="8" ry="4.5" fill="#6E4526" stroke="#3B2E5A" strokeWidth="2.4" />

      {/* small upward twig near the root */}
      <path d="M116 40 Q110 26 96 18" stroke="#3B2E5A" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M116 40 Q110 26 96 18" stroke="#8B5E3C" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M96 20 Q82 12 88 0 Q102 4 100 18 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 22 Q116 10 126 22 Q114 32 100 26 Z" fill="#5DBB63" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />

      {/* leaf cluster A sitting on the branch (x ~ 110-170) */}
      <path d="M120 36 Q116 14 138 12 Q152 24 136 38 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M142 32 Q146 12 168 16 Q176 32 156 38 Z" fill="#5DBB63" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M108 42 Q94 32 100 18 Q116 22 118 38 Z" fill="#5DBB63" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />

      {/* upward sub-twig with leaf fan (x ~ 230-260) */}
      <path d="M232 46 Q244 30 260 22" stroke="#3B2E5A" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M232 46 Q244 30 260 22" stroke="#8B5E3C" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M258 24 Q254 4 276 2 Q290 14 274 28 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M250 22 Q242 2 222 6 Q216 20 238 26 Z" fill="#5DBB63" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M262 26 Q284 20 288 36 Q274 44 260 34 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />

      {/* hanging leaf pair (x ~ 330) */}
      <path d="M330 64 Q326 80 338 88 Q348 80 342 64 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M348 66 Q354 82 368 84 Q370 70 354 62 Z" fill="#5DBB63" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />

      {/* leaf veins */}
      <path d="M126 32 q6 -8 16 -14 M150 28 q8 -8 20 -8 M240 18 q8 -6 20 -8 M334 72 q2 8 10 14" stroke="#2E6B31" strokeWidth="2.4" fill="none" strokeLinecap="round" />

      {/* hanging twig that holds the apple — tip reaches down to the stem */}
      <path d="M396 66 Q412 82 406 106" stroke="#3B2E5A" strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M396 66 Q412 82 406 106" stroke="#8B5E3C" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <path d="M410 80 Q428 72 434 86 Q422 96 408 88 Z" fill="#57B257" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M402 92 Q388 92 384 104 Q396 110 404 100 Z" fill="#57B257" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

/* Tall tapered trunk with root flare and bark texture. */
function TrunkSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 320" preserveAspectRatio="none" className={className} style={style} aria-hidden>
      <path
        d="M24 320 Q22 302 8 292 Q0 286 12 281 Q26 275 33 252 Q29 160 37 64 Q42 22 50 16 Q59 22 64 66 Q72 160 68 252 Q75 275 89 281 Q101 286 93 292 Q79 302 77 320 Z"
        fill="#8B5E3C"
        stroke="#3B2E5A"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M40 90 Q38 150 41 210 M56 100 Q58 160 55 225 M47 130 Q46 180 48 245" stroke="#6E4526" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />
      <ellipse cx="52" cy="190" rx="5" ry="8" fill="#6E4526" opacity="0.65" />
    </svg>
  );
}

/* Lush layered canopy: dark back layer, mid-green mass, highlights, dots. */
function CanopySvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 460 300" className={className} style={style} aria-hidden>
      {/* back layer */}
      <path
        d="M60 190 Q8 150 40 96 Q30 40 110 34 Q150 -6 226 14 Q300 -4 340 48 Q416 44 434 108 Q466 160 420 200 Q436 252 366 258 Q318 296 250 272 Q180 300 128 264 Q66 268 60 190 Z"
        fill="#3E8E41"
        stroke="#3B2E5A"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* main layer */}
      <path
        d="M84 176 Q44 140 72 96 Q66 52 132 50 Q170 16 234 30 Q296 14 328 58 Q392 58 404 112 Q432 152 396 186 Q404 232 344 238 Q302 270 244 250 Q182 276 136 246 Q90 246 84 176 Z"
        fill="#4CAF50"
        stroke="#3B2E5A"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      {/* highlight clusters */}
      <path d="M150 92 Q160 68 190 74 Q206 84 196 102 Q178 114 150 92 Z" fill="#5DBB63" />
      <path d="M240 70 Q256 52 282 62 Q296 76 280 92 Q256 98 240 70 Z" fill="#5DBB63" />
      <path d="M310 120 Q330 106 348 122 Q352 138 334 142 Q314 140 310 120 Z" fill="#5DBB63" />
      <path d="M120 150 Q134 136 152 146 Q156 160 140 164 Q124 162 120 150 Z" fill="#5DBB63" />
      {/* texture dots */}
      <g fill="#2E6B31" opacity="0.55">
        <circle cx="200" cy="120" r="5" />
        <circle cx="256" cy="150" r="5" />
        <circle cx="170" cy="180" r="5" />
        <circle cx="300" cy="90" r="5" />
        <circle cx="350" cy="180" r="5" />
        <circle cx="230" cy="210" r="5" />
        <circle cx="130" cy="110" r="4.5" />
        <circle cx="380" cy="140" r="4.5" />
      </g>
    </svg>
  );
}

function BasketBackSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 180 80" className={className} style={style} aria-hidden>
      {/* dark inside of the basket */}
      <path d="M16 38 L164 38 L158 58 Q90 66 22 58 Z" fill="#5C3A22" />
      {/* back wall with faint weave */}
      <path d="M14 38 Q90 12 166 38 Q170 52 158 58 L22 58 Q10 52 14 38 Z" fill="#B47A3F" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M30 40 Q90 22 150 40 M26 46 Q90 30 154 46" stroke="#8B5E3C" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function BasketFrontSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 180 92" className={className} style={style} aria-hidden>
      {/* woven front wall */}
      <path d="M14 44 L166 44 Q162 92 90 92 Q18 92 14 44 Z" fill="#C98A4B" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
      {/* horizontal weave bands */}
      <path d="M19 58 Q90 70 161 58" stroke="#8B5E3C" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M24 72 Q90 84 156 72" stroke="#8B5E3C" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M33 84 Q90 92 147 84" stroke="#8B5E3C" strokeWidth="4.5" fill="none" strokeLinecap="round" />
      {/* vertical stakes */}
      <path d="M40 46 L43 88 M66 48 L68 91 M92 48 L92 91 M118 48 L117 90 M142 46 L140 86" stroke="#A96F35" strokeWidth="4" opacity="0.95" />
      {/* diagonal weave highlights */}
      <path d="M48 62 l8 6 M74 64 l8 6 M100 64 l8 6 M126 62 l8 6 M54 76 l8 6 M82 78 l8 6 M108 77 l8 6" stroke="#E0A860" strokeWidth="3" strokeLinecap="round" opacity="0.85" />
      {/* chunky rim band with highlight */}
      <path d="M12 36 Q90 14 168 36 L166 47 Q90 27 14 47 Z" fill="#E0A860" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M24 38 Q90 21 156 38" stroke="#F2C98A" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

function MissHandSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 90 110" className={className} style={style} aria-hidden>
      <path d="M30 64 L30 24 Q30 16 37 16 Q44 16 44 24 L44 54" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M44 54 L44 12 Q44 4 51 4 Q58 4 58 12 L58 54" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M58 54 L58 20 Q58 12 65 12 Q72 12 72 58" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M26 60 Q22 72 30 82 L66 82 Q74 72 72 60 Z" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
      <path d="M30 82 Q26 96 38 100 L60 100 Q70 96 66 84" fill="#FFE0B3" stroke="#3B2E5A" strokeWidth="4.5" strokeLinejoin="round" />
    </svg>
  );
}

function Star({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden>
      <path d="M12 2 L14.6 8.6 L21.5 9.2 L16.3 13.8 L17.9 20.6 L12 17 L6.1 20.6 L7.7 13.8 L2.5 9.2 L9.4 8.6 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function Level27({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [shakes, setShakes] = useState(0);
  const [falling, setFalling] = useState(false);
  const [landed, setLanded] = useState(false);
  const [done, setDone] = useState(false);
  const [miss, setMiss] = useState(0);
  const [hang, setHang] = useState<{ x: number; top: number } | null>(null);
  const shakesRef = useRef(0);
  const finishRef = useRef(false);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const twigTipRef = useRef<HTMLDivElement | null>(null);

  /* measure the twig tip inside the scene so the apple always hangs
     exactly from the branch — on any screen size / aspect ratio */
  useLayoutEffect(() => {
    const measure = () => {
      const scene = sceneRef.current;
      const tip = twigTipRef.current;
      if (!scene || !tip) return;
      const s = scene.getBoundingClientRect();
      const t = tip.getBoundingClientRect();
      if (s.width === 0 || s.height === 0) return;
      const x = ((t.left + t.width / 2 - s.left) / s.width) * 100;
      const tipY = ((t.top + t.height / 2 - s.top) / s.height) * 100;
      /* apple height = 13% of scene width * (120/110); put the twig tip
         right on the apple stem (11% below the apple's top edge) */
      const appleH = s.width * 0.13 * (120 / 110);
      const top = tipY - (appleH * 0.11 / s.height) * 100;
      setHang({ x, top });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (sceneRef.current) ro.observe(sceneRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const hangTop = hang ? `${hang.top}%` : "28%";
  const hangLeft = hang ? `${hang.x - 6.5}%` : "58.5%";

  const branchDrag = useDragMove(
    useCallback(
      (d, api) => {
        if (solved || done || falling) return;
        api.reset();
        if (d.y >= 35) {
          const n = Math.min(3, shakesRef.current + 1);
          shakesRef.current = n;
          setShakes(n);
          sfx.whoosh();
          onProgress(n === 3 ? 0.99 : 0.33 * n);
          if (n === 3) {
            setFalling(true);
            window.setTimeout(() => sfx.pop(), 640);
          }
        }
      },
      [solved, done, falling, onProgress]
    )
  );

  const tapApple = () => {
    if (solved || done || falling) return;
    setMiss((v) => v + 1);
    sfx.pop();
    onMistake({ fa: "دستت بهش نمی‌رسه! شاخه رو تکون بده", en: "You can't reach it! Shake the branch" });
  };

  const appleLanded = () => {
    if (done || finishRef.current) return;
    finishRef.current = true;
    setLanded(true);
    sfx.sparkle();
    setDone(true);
    sfx.cheer();
    onProgress(1);
    window.setTimeout(onSolved, 700);
  };

  return (
    <Scene bg="linear-gradient(180deg,#DFF3FA 0%,#EEF8E8 62%,#E3F2DC 100%)">
      <div ref={sceneRef} className="absolute inset-0">
        {/* sun */}
        <div className="absolute end-[5%] top-[6%] h-12 w-12 rounded-full border-4 border-[#3B2E5A] bg-[#FFD154]" style={{ animation: "breathe 3.4s ease-in-out infinite" }} aria-hidden />

        {/* trunk with root flare */}
        <TrunkSvg className="absolute bottom-0 left-[3%] top-[14%] w-[14%]" />

        {/* layered scalloped canopy */}
        <CanopySvg className="absolute -left-[10%] -top-[13%] w-[60%]" />

        {/* grass */}
        <div className="absolute inset-x-0 bottom-0 h-[16%] border-t-4 border-[#3B2E5A]" style={{ background: "linear-gradient(180deg,#5DBB63,#4CAF50)" }} aria-hidden />

        {/* little bush at the trunk base */}
        <svg viewBox="0 0 150 70" className="absolute bottom-[12%] left-[-2%] w-[24%]" aria-hidden>
          <path d="M12 66 Q-2 42 28 34 Q42 12 76 20 Q114 8 124 36 Q150 46 132 62 Q72 74 12 66 Z" fill="#5DBB63" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
        </svg>

        {/* shake meter */}
        <div className="absolute end-[4%] top-[3%] z-40 flex gap-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-4 w-4 rounded-full border-[3px] border-[#3B2E5A]"
              style={{
                background: i < shakes ? "#FFD154" : "rgba(250,250,250,0.65)",
                animation: i === shakes - 1 ? "pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both" : undefined,
              }}
            />
          ))}
        </div>

        {/* basket (back rim, then apple, then front wall) */}
        <div className="absolute bottom-[9%] left-[52%] w-[28%]" aria-hidden>
          <div className="relative">
            <div className="z-[10]">
              <BasketBackSvg className="h-auto w-full" />
            </div>
            <div className="absolute left-0 top-[38%] z-[30] w-full">
              <BasketFrontSvg className="h-auto w-full" />
            </div>
          </div>
        </div>

        {/* draggable branch: pull DOWN, release, repeat */}
        <div
          className="absolute left-[9.5%] top-[21%] z-[16] w-[64%]"
          style={{
            transform: `translate(0px, ${branchDrag.y}px)`,
            transition: branchDrag.dragging ? "none" : "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <Pulse active={hintPulse > 0 && !done && !falling}>
            <motion.div key={`rustle-${shakes}`} animate={shakes > 0 ? { rotate: [0, -2.5, 2.5, 0] } : { rotate: 0 }} transition={{ duration: 0.5 }}>
              <div
                {...(falling || done ? {} : branchDrag.bind)}
                role="button"
                aria-label={lang === "fa" ? "شاخه درخت" : "tree branch"}
                className={falling || done ? "" : "cursor-grab active:cursor-grabbing"}
              >
                <BranchSvg className="h-auto w-full" />
              </div>
            </motion.div>
          </Pulse>
          {/* invisible marker at the twig tip — used to align the hanging apple */}
          <div ref={twigTipRef} className="pointer-events-none absolute h-1 w-1" style={{ left: "88.26%", top: "81.5%" }} aria-hidden />
        </div>

        {/* the apple follows the branch, then drops into the basket */}
        <div
          className="pointer-events-none absolute inset-0 z-[18]"
          style={{
            transform: `translate(0px, ${falling ? 0 : branchDrag.y}px)`,
            transition: branchDrag.dragging && !falling ? "none" : "transform 0.45s cubic-bezier(0.34,1.56,0.64,1)",
          }}
        >
          <motion.div
            className="absolute w-[13%]"
            style={{ left: hangLeft, top: hangTop }}
            animate={
              falling
                ? landed
                  ? { top: "71%", rotate: 0 }
                  : { top: [hangTop, "72%", "63%", "71%"], rotate: [0, 24, -12, 0] }
                : { top: hangTop, rotate: 0 }
            }
            transition={falling ? { duration: 1.2, times: [0, 0.5, 0.76, 1], ease: ["easeIn", "easeOut", "easeInOut"] } : { duration: 0.3 }}
            onAnimationComplete={falling ? appleLanded : undefined}
          >
            <motion.div key={`wiggle-${shakes}`} animate={shakes > 0 ? { rotate: [0, 3 + shakes * 5, -(3 + shakes * 5), 0] } : { rotate: 0 }} transition={{ duration: 0.55 }}>
              <div onClick={tapApple} role="button" aria-label={lang === "fa" ? "سیب" : "apple"} className={`pointer-events-auto ${falling ? "" : "cursor-pointer"}`}>
                <AppleSvg className="h-auto w-full drop-shadow-[0_3px_2px_rgba(59,46,90,0.25)]" />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* failed hand reach after tapping the apple */}
        {miss > 0 && (
          <motion.div
            key={`miss-${miss}`}
            className="pointer-events-none absolute top-0 z-40 w-[11%]"
            style={{ left: hang ? `${hang.x - 5.5}%` : "58%" }}
            initial={{ top: "100%", opacity: 0 }}
            animate={{ top: ["100%", "46%", "100%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.1, times: [0, 0.45, 0.9, 1] }}
          >
            <MissHandSvg className="h-auto w-full" />
          </motion.div>
        )}

        {/* sparkles when the apple lands */}
        {landed &&
          [
            { l: "54%", t: "58%", d: "0s" },
            { l: "72%", t: "55%", d: "0.14s" },
            { l: "63%", t: "50%", d: "0.28s" },
          ].map((s, i) => (
            <span key={i} className="pointer-events-none absolute z-40" style={{ left: s.l, top: s.t, animation: `star-pop 0.8s ease ${s.d} both` }}>
              <Star className="h-7 w-7" />
            </span>
          ))}
      </div>
    </Scene>
  );
}
