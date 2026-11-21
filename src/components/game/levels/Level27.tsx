"use client";

import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { LevelProps } from "@/lib/game/types";
import { Pulse, Scene, sfx, useDragMove } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 27 — Apple shake: pull the branch DOWN and let it spring back */
/* three times; the apple drops and lands on the grass.                */
/* The trunk is planted in the ground: it is drawn ABOVE the grass so  */
/* its root flare visibly grips the lawn, with grass tufts around it.  */
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

/* Grass tufts that wrap around the trunk base so it visibly grows
   out of the lawn. */
function TuftSvg({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 220 60" className={className} style={style} aria-hidden>
      <path d="M6 58 Q4 34 18 28 Q14 44 20 58 Z" fill="#3E8E41" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M34 58 Q30 22 48 18 Q44 38 52 58 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M62 58 Q60 30 76 24 Q72 44 80 58 Z" fill="#3E8E41" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M140 58 Q142 28 158 22 Q154 42 162 58 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M172 58 Q174 20 192 16 Q188 38 196 58 Z" fill="#3E8E41" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M200 58 Q202 34 214 28 Q212 44 216 58 Z" fill="#4CAF50" stroke="#3B2E5A" strokeWidth="3" strokeLinejoin="round" />
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
  /* hang.x = twig tip x (scene %), hang.top = apple rest top while swinging,
     land = apple top when resting on the grass (computed, aspect-aware) */
  const [hang, setHang] = useState<{ x: number; top: number; land: number } | null>(null);
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
      /* grass strip is the bottom 16% of the scene (its top edge at 84%).
         Rest the apple so its bottom sits 2% into the lawn. */
      const appleHpct = (appleH / s.height) * 100;
      const land = 86 - appleHpct;
      setHang({ x, top, land });
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
  const landTop = hang ? `${hang.land}%` : "76%";
  const landBounceTop = hang ? `${hang.land - 6}%` : "70%";

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
        <div className="absolute right-[6%] top-[6%] h-12 w-12 rounded-full border-4 border-[#3B2E5A] bg-[#FFD154]" style={{ animation: "breathe 3.4s ease-in-out infinite" }} aria-hidden />

        {/* grass drawn first — the trunk stands ON TOP of it */}
        <div className="absolute inset-x-0 bottom-0 h-[16%] border-t-4 border-[#3B2E5A]" style={{ background: "linear-gradient(180deg,#5DBB63,#4CAF50)" }} aria-hidden />

        {/* trunk planted in the lawn: root flare grips the ground.
            NOTE: <svg> is a replaced element — top/bottom alone do NOT
            stretch it, so an explicit height is required. */}
        <TrunkSvg className="absolute bottom-0 left-[2%] top-[25%] h-[75%] w-[18%]" />

        {/* grass tufts hugging the trunk base */}
        <TuftSvg className="absolute bottom-[2%] left-[-2%] w-[22%]" />

        {/* big lush canopy — caps the trunk and shades the branch root */}
        <CanopySvg className="absolute -left-[18%] -top-[7%] z-[17] w-[86%]" />

        {/* little bush at the trunk base */}
        <svg viewBox="0 0 150 70" className="absolute bottom-[12%] left-[-2%] w-[24%]" aria-hidden>
          <path d="M12 66 Q-2 42 28 34 Q42 12 76 20 Q114 8 124 36 Q150 46 132 62 Q72 74 12 66 Z" fill="#5DBB63" stroke="#3B2E5A" strokeWidth="5" strokeLinejoin="round" />
        </svg>

        {/* shake meter */}
        <div className="absolute right-[4%] top-[3%] z-40 flex gap-2" aria-hidden>
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

        {/* draggable branch: pull DOWN, release, repeat */}
        <div
          className="absolute left-[9.5%] top-[27%] z-[16] w-[64%]"
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

        {/* the apple follows the branch, then drops and lands on the grass */}
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
                  ? { top: landTop, rotate: 0 }
                  : { top: [hangTop, landTop, landBounceTop, landTop], rotate: [0, 24, -12, 0] }
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

        {/* sparkles when the apple lands on the lawn */}
        {landed &&
          hang &&
          [
            { l: hang.x - 10, t: hang.land + 5, d: "0s" },
            { l: hang.x + 5, t: hang.land + 3, d: "0.14s" },
            { l: hang.x - 3, t: hang.land - 2, d: "0.28s" },
          ].map((s, i) => (
            <span key={i} className="pointer-events-none absolute z-40" style={{ left: `${s.l}%`, top: `${s.t}%`, animation: `star-pop 0.8s ease ${s.d} both` }}>
              <Star className="h-7 w-7" />
            </span>
          ))}
      </div>
    </Scene>
  );
}
