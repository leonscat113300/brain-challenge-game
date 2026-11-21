"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 84 — The door is code-locked: count the 7 books on the shelf  */
/* and enter the number on the keypad.                                 */
/* ------------------------------------------------------------------ */

const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const CORRECT = "7";

const BOOKS: Array<{ h: number; color: string; lean?: boolean }> = [
  { h: 62, color: "#FF6B81" },
  { h: 54, color: "#1EC8CF" },
  { h: 66, color: "#FFD154", lean: true },
  { h: 56, color: "#4CAF50" },
  { h: 64, color: "#6C4AB6" },
  { h: 52, color: "#FF8C42" },
  { h: 60, color: "#2FA898" },
];

function BookSvg({ b }: { b: { h: number; color: string; lean?: boolean } }) {
  return (
    <svg viewBox="0 0 34 90" className="h-auto w-full" style={{ transform: b.lean ? "rotate(-7deg)" : undefined }} aria-hidden>
      <rect x="5" y={90 - b.h} width="24" height={b.h} rx="4" fill={b.color} stroke="#3B2E5A" strokeWidth="3.6" />
      <rect x="10" y={92 - b.h} width="4" height={b.h - 8} rx="2" fill="#FAFAFA" opacity="0.7" />
      <circle cx="22" cy={104 - b.h} r="3" fill="#FAFAFA" opacity="0.85" />
    </svg>
  );
}

function DoorSvg({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 150 230" className="h-auto w-full" aria-hidden>
      {/* frame */}
      <rect x="6" y="6" width="138" height="218" rx="12" fill="#A96F35" stroke="#3B2E5A" strokeWidth="5" />
      {/* door slab */}
      <g style={{ transform: open ? "perspective(500px) rotateY(-64deg)" : "rotateY(0deg)", transformOrigin: "24px 115px", transition: "transform 1s cubic-bezier(0.5,0,0.3,1)" }}>
        <rect x="18" y="16" width="112" height="198" rx="9" fill="#FFB84D" stroke="#3B2E5A" strokeWidth="4.5" />
        <rect x="32" y="34" width="84" height="70" rx="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.4" />
        <rect x="32" y="120" width="84" height="76" rx="8" fill="#FFD154" stroke="#3B2E5A" strokeWidth="3.4" />
        <circle cx="122" cy="112" r="6.5" fill="#33205E" stroke="#3B2E5A" strokeWidth="3" />
      </g>
      {/* light inside when open */}
      {open && <rect x="30" y="24" width="96" height="182" rx="8" fill="#FFF3D6" />}
    </svg>
  );
}

function KeypadSvg() {
  return (
    <svg viewBox="0 0 90 70" className="h-auto w-full" aria-hidden>
      <rect x="4" y="4" width="82" height="62" rx="10" fill="#33205E" stroke="#3B2E5A" strokeWidth="4" />
      <rect x="14" y="12" width="62" height="18" rx="5" fill="#171034" stroke="#3B2E5A" strokeWidth="2.6" />
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <circle key={`${r}${c}`} cx={26 + c * 19} cy={42 + r * 8} r="3" fill="#FFD154" opacity="0.9" />
        ))
      )}
    </svg>
  );
}

export default function Level84({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [entered, setEntered] = useState("");
  const [open, setOpen] = useState(false);
  const [keyShake, setKeyShake] = useState(false);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const digit = useCallback(
    (n: number) => {
      if (solved || open) return;
      sfx.tick();
      if (entered.length === 0) onProgress(0.5);
      setEntered((e) => (e + String(n)).slice(0, 2));
    },
    [solved, open, entered, onProgress]
  );

  const clear = useCallback(() => {
    if (solved || open) return;
    sfx.click();
    setEntered("");
  }, [solved, open]);

  const submit = useCallback(() => {
    if (solved || open) return;
    if (entered === CORRECT) {
      setOpen(true);
      sfx.unlock();
      timers.current.push(setTimeout(() => sfx.sparkle(), 400));
      timers.current.push(setTimeout(() => sfx.cheer(), 800));
      onProgress(1);
      timers.current.push(setTimeout(onSolved, 1900));
    } else {
      sfx.fail();
      setKeyShake(true);
      timers.current.push(setTimeout(() => setKeyShake(false), 550));
      onMistake({
        fa: "رمز درست نیست؛ کتاب‌های قفسه را دوباره بشمار!",
        en: "Wrong code; count the shelf books again!",
      });
      setEntered("");
    }
  }, [solved, open, entered, onMistake, onProgress, onSolved]);

  const digits = lang === "fa" ? FA_DIGITS : ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const shown = entered
    .split("")
    .map((c) => (lang === "fa" ? FA_DIGITS[Number(c)] : c))
    .join(" ");

  return (
    <Scene bg="linear-gradient(180deg,#EFE9FB 0%,#E6DDF6 58%,#DCD0EE 66%,#E3CFA4 68%,#D9BE8F 100%)">
      {/* rug */}
      <div className="absolute bottom-[3%] left-[26%] w-[42%]" aria-hidden>
        <svg viewBox="0 0 180 50">
          <ellipse cx="90" cy="25" rx="84" ry="20" fill="#1EC8CF" stroke="#3B2E5A" strokeWidth="4" />
          <ellipse cx="90" cy="25" rx="56" ry="12" fill="#8FDCE0" stroke="#3B2E5A" strokeWidth="2.6" />
        </svg>
      </div>

      {/* bookshelf with exactly 7 books */}
      <div className="absolute bottom-[14%] left-[4%] w-[46%]">
        <Pulse active={hintPulse > 0 && !open}>
          <div className="relative rounded-xl border-[5px] border-[#3B2E5A] bg-[#C98A4B] p-2 shadow-[0_5px_0_rgba(59,46,90,0.25)]">
            {/* top shelf: 3 books */}
            <div className="flex items-end justify-center gap-[3%] border-b-4 border-[#3B2E5A] px-[4%] pb-1">
              {BOOKS.slice(0, 3).map((b, i) => (
                <div key={i} className="w-[26%]" style={{ height: 58 }}>
                  <BookSvg b={b} />
                </div>
              ))}
            </div>
            {/* bottom shelf: 4 books */}
            <div className="mt-2 flex items-end justify-center gap-[2%] px-[4%]">
              {BOOKS.slice(3).map((b, i) => (
                <div key={i} className="w-[21%]" style={{ height: 52 }}>
                  <BookSvg b={b} />
                </div>
              ))}
            </div>
          </div>
        </Pulse>
        <div className="mx-auto mt-1 h-3 w-[80%] rounded-xl border-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />
      </div>

      {/* door + keypad */}
      <div className="absolute bottom-[12%] right-[10%] w-[34%]">
        <div className="relative">
          <DoorSvg open={open} />
          {/* keypad overlay on the slab */}
          {!open && (
            <div className="absolute bottom-[6%] left-1/2 w-[56%] -translate-x-1/2">
              <div className={keyShake ? "rounded-xl" : "rounded-xl"} style={{ animation: keyShake ? "shake-hard 0.5s ease" : undefined }}>
                <div className="mb-1 rounded-lg border-[3px] border-[#3B2E5A] bg-[#171034] px-1 py-0.5 text-center text-[13px] font-black tracking-[0.2em] text-[#FFD154]" style={{ minHeight: 24 }}>
                  {shown || "—"}
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => digit(n)}
                      aria-label={lang === "fa" ? `عدد ${FA_DIGITS[n]}` : `digit ${n}`}
                      className="cursor-pointer rounded-md border-2 border-[#3B2E5A] bg-[#FAFAFA] py-0.5 text-[12px] font-black text-[#33205E] transition-transform active:scale-90"
                    >
                      {digits[n]}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clear}
                    aria-label={lang === "fa" ? "پاک کردن" : "clear"}
                    className="col-span-1 cursor-pointer rounded-md border-2 border-[#3B2E5A] bg-[#FF6B81] py-0.5 text-[11px] font-black text-[#FAFAFA] transition-transform active:scale-90"
                  >
                    C
                  </button>
                  <button
                    type="button"
                    onClick={() => digit(0)}
                    aria-label={lang === "fa" ? "عدد صفر" : "digit 0"}
                    className="cursor-pointer rounded-md border-2 border-[#3B2E5A] bg-[#FAFAFA] py-0.5 text-[12px] font-black text-[#33205E] transition-transform active:scale-90"
                  >
                    {digits[0]}
                  </button>
                  <button
                    type="button"
                    onClick={submit}
                    aria-label={lang === "fa" ? "تأیید رمز" : "submit code"}
                    className="cursor-pointer rounded-md border-2 border-[#3B2E5A] bg-[#4CAF50] py-0.5 text-[11px] font-black text-[#FAFAFA] transition-transform active:scale-90"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="absolute -right-1 top-1/2 w-[12%]">
            <KeypadSvg />
          </div>
        </div>
      </div>

      {/* open-door sparkles */}
      {open && (
        <>
          {[
            { l: "60%", t: "30%" },
            { l: "82%", t: "44%" },
          ].map((p, i) => (
            <div key={i} className="pointer-events-none absolute" style={{ left: p.l, top: p.t, animation: `star-pop 0.7s ${i * 0.2}s ease both` }} aria-hidden>
              <svg viewBox="0 0 40 40" className="w-8">
                <path d="M20 2 L24 14 L36 14 L26 22 L30 34 L20 26 L10 34 L14 22 L4 14 L16 14 Z" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.5" />
              </svg>
            </div>
          ))}
        </>
      )}
    </Scene>
  );
}
