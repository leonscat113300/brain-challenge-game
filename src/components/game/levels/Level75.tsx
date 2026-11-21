"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { LevelProps } from "@/lib/game/types";
import { Scene, Pulse, sfx } from "./shared";

/* ------------------------------------------------------------------ */
/* Level 75 — Which photo frame belongs to the family? Compare each    */
/* frame with the family photo lying on the table, then tap it.        */
/* ------------------------------------------------------------------ */

interface MemberSpec {
  mustache?: boolean;
  bun?: boolean;
  cap?: boolean;
  pigtails?: boolean;
  straight?: boolean;
  gray?: boolean;
  shirt: string;
}

function Member({ m }: { m: MemberSpec }) {
  return (
    <svg viewBox="0 0 40 62" className="h-auto w-full" aria-hidden>
      {/* body */}
      <rect x="8" y="36" width="24" height="22" rx="9" fill={m.shirt} stroke="#3B2E5A" strokeWidth="3.4" />
      {/* head */}
      <circle cx="20" cy="20" r="12" fill="#FFD9B3" stroke="#3B2E5A" strokeWidth="3.4" />
      {/* hair */}
      {m.bun && <circle cx="20" cy="6" r="5" fill="#3B2E5A" stroke="#3B2E5A" strokeWidth="2" />}
      {m.cap && (
        <>
          <path d="M8 14 A12 12 0 0 1 32 14 Z" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="3" />
          <rect x="12" y="11" width="24" height="4.5" rx="2.2" fill="#FF6B81" stroke="#3B2E5A" strokeWidth="2.6" />
        </>
      )}
      {m.pigtails && (
        <>
          <circle cx="6" cy="22" r="5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.6" />
          <circle cx="34" cy="22" r="5" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.6" />
          <path d="M9 16 A12 12 0 0 1 31 16" fill="none" stroke="#3B2E5A" strokeWidth="3.2" />
          <path d="M10 16 Q20 6 30 16" fill="#FFD154" stroke="#3B2E5A" strokeWidth="2.6" />
        </>
      )}
      {m.straight && <path d="M8 22 Q8 8 20 8 Q32 8 32 22 L32 30 Q28 32 26 26 L26 18 L14 18 L14 26 Q12 32 8 30 Z" fill="#3B2E5A" />}
      {!m.bun && !m.cap && !m.pigtails && !m.straight && (
        <path d={m.gray ? "M9 15 A12 12 0 0 1 31 15" : "M9 17 A12 12 0 0 1 31 17"} fill="none" stroke={m.gray ? "#8FA6BD" : "#3B2E5A"} strokeWidth={m.gray ? 4.5 : 5} strokeLinecap="round" />
      )}
      {m.mustache && <rect x="13.5" y="27" width="13" height="4.4" rx="2.2" fill="#3B2E5A" />}
      {/* face */}
      <circle cx="15.5" cy="20" r="2.2" fill="#3B2E5A" />
      <circle cx="24.5" cy="20" r="2.2" fill="#3B2E5A" />
      <circle cx="16.3" cy="19.2" r="0.8" fill="#FAFAFA" />
      <circle cx="25.3" cy="19.2" r="0.8" fill="#FAFAFA" />
      {!m.mustache && <path d="M16 26.5 Q20 29.5 24 26.5" fill="none" stroke="#3B2E5A" strokeWidth="2.4" strokeLinecap="round" />}
      {m.mustache && <path d="M17 33 Q20 35 23 33" fill="none" stroke="#3B2E5A" strokeWidth="2.2" strokeLinecap="round" />}
    </svg>
  );
}

const DAD: MemberSpec = { mustache: true, shirt: "#1EC8CF" };
const MOM: MemberSpec = { bun: true, shirt: "#FF6B81" };
const BOY: MemberSpec = { cap: true, shirt: "#FFD154" };
const GIRL: MemberSpec = { pigtails: true, shirt: "#4CAF50" };
const GRANDPA: MemberSpec = { gray: true, mustache: true, shirt: "#33205E" };

/* reference family: dad(mustache) + mom(bun) + boy(cap) + girl(pigtails) */
const FAMILY: MemberSpec[] = [DAD, MOM, BOY, GIRL];

const FRAMES: Array<{ members: MemberSpec[]; msg: { fa: string; en: string }; correct: boolean }> = [
  {
    /* missing the boy */
    members: [DAD, MOM, GIRL],
    msg: { fa: "این قاب یکی از اعضای خانواده را ندارد؛ برادر کوچولو کجاست؟", en: "This frame is missing a family member; where is the little boy?" },
    correct: false,
  },
  {
    /* correct! */
    members: [DAD, MOM, BOY, GIRL],
    msg: { fa: "", en: "" },
    correct: true,
  },
  {
    /* features differ: no mustache, no bun */
    members: [
      { mustache: false, shirt: "#1EC8CF" },
      { straight: true, shirt: "#FF6B81" },
      BOY,
      GIRL,
    ],
    msg: { fa: "سبیل پدر و موهای مادر با عکس اصلی فرق دارند!", en: "Dad's mustache and mom's hair don't match the original photo!" },
    correct: false,
  },
  {
    /* extra grandpa */
    members: [DAD, MOM, BOY, GIRL, GRANDPA],
    msg: { fa: "این قاب یک نفر اضافه دارد؛ این خانوادهٔ عکس روی میز نیست!", en: "This frame has an extra person; that's not the family in the photo!" },
    correct: false,
  },
];

function FrameFamily({ members }: { members: MemberSpec[] }) {
  return (
    <div className="flex h-full w-full items-end justify-center gap-[4%] px-[8%] pb-[10%] pt-[16%]">
      {members.map((m, i) => (
        <div key={i} className="flex-1">
          <Member m={m} />
        </div>
      ))}
    </div>
  );
}

export default function Level75({ lang, solved, onSolved, onMistake, onProgress, hintPulse }: LevelProps) {
  const [wrong, setWrong] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const pick = useCallback(
    (idx: number) => {
      if (solved || winner !== null) return;
      const f = FRAMES[idx];
      if (f.correct) {
        setWinner(idx);
        sfx.chime();
        onProgress(1);
        timers.current.push(setTimeout(() => sfx.sparkle(), 250));
        timers.current.push(setTimeout(onSolved, 1400));
        return;
      }
      sfx.fail();
      setWrong(idx);
      timers.current.push(setTimeout(() => setWrong(null), 550));
      onMistake(f.msg);
    },
    [solved, winner, onMistake, onProgress, onSolved]
  );

  const framePos = [
    { left: "6%", top: "5%" },
    { left: "54%", top: "5%" },
    { left: "6%", top: "34%" },
    { left: "54%", top: "34%" },
  ];

  return (
    <Scene bg="linear-gradient(180deg,#FFF3E4 0%,#FBE6D0 55%,#EFD9B8 68%,#E3CFA4 70%,#D9BE8F 100%)">
      {/* wall pattern dots */}
      <div className="absolute inset-x-0 top-0 h-[68%] opacity-25" style={{ backgroundImage: "radial-gradient(rgba(59,46,90,0.25) 2.5px, transparent 2.5px)", backgroundSize: "34px 34px" }} aria-hidden />

      {/* four frames on the wall */}
      {FRAMES.map((f, i) => (
        <div key={i} className="absolute w-[40%]" style={{ ...framePos[i] }}>
          <button
            type="button"
            onClick={() => pick(i)}
            aria-label={lang === "fa" ? `قاب عکس ${i + 1}` : `photo frame ${i + 1}`}
            className="block w-full cursor-pointer rounded-xl border-[5px] border-[#C98A4B] bg-[#FAFAFA] shadow-[0_4px_0_rgba(59,46,90,0.25)] transition-transform active:scale-95"
            style={{
              animation: wrong === i ? "shake-hard 0.5s ease" : undefined,
              outline: winner === i ? "6px solid #4CAF50" : undefined,
              filter: winner === i ? "drop-shadow(0 0 14px rgba(76,175,80,0.8))" : undefined,
            }}
          >
            <div className="relative h-24 sm:h-28">
              <FrameFamily members={f.members} />
              {/* tag */}
              <div className="absolute -bottom-1 left-1/2 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-[#3B2E5A] bg-[#FFD154] text-[10px] font-black text-[#33205E]">
                {["الف", "ب", "پ", "ت"][i]}
              </div>
            </div>
          </button>
        </div>
      ))}

      {/* side table with the reference family photo */}
      <div className="absolute bottom-[4%] left-[18%] w-[64%]">
        <Pulse active={hintPulse > 0 && winner === null}>
          <div
            className="mx-auto w-[62%] -rotate-3 rounded-lg border-[5px] border-[#FAFAFA] bg-[#FAFAFA] shadow-[0_5px_0_rgba(59,46,90,0.3)]"
            style={{ outline: "3px solid #3B2E5A" }}
          >
            <div className="relative h-20 sm:h-24">
              <FrameFamily members={FAMILY} />
            </div>
            <div className="pb-1 text-center text-[10px] font-bold text-[#3B2E5A]">
              {lang === "fa" ? "عکس خانوادگی ما" : "our family photo"}
            </div>
          </div>
        </Pulse>
        {/* table */}
        <div className="mx-auto mt-1 h-3 w-[88%] rounded-xl border-4 border-[#3B2E5A] bg-[#C98A4B]" aria-hidden />
        <div className="mx-auto h-[30px] w-[18%] rounded-b-lg border-x-4 border-b-4 border-[#3B2E5A] bg-[#A96F35]" aria-hidden />
      </div>

      {/* hint ribbon */}
      <div className="absolute bottom-[2%] right-[2%] w-[16%] opacity-90" aria-hidden>
        <svg viewBox="0 0 70 60">
          <circle cx="35" cy="26" r="20" fill="#FFD154" stroke="#3B2E5A" strokeWidth="4" />
          <text x="35" y="33" textAnchor="middle" fontSize="20" fontWeight="900" fill="#33205E">؟</text>
        </svg>
      </div>
    </Scene>
  );
}
